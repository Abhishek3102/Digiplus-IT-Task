from fastapi import APIRouter, Request, BackgroundTasks
from pydantic import BaseModel
from db.mongodb import get_db
from ai.agent import ticket_agent
from core.security import verify_token
import uuid
import json

router = APIRouter()

class TicketCreate(BaseModel):
    title: str
    description: str
    department: str = None

def run_agent(ticket_id: str, description: str):
    import asyncio
    
async def run_agent_async(ticket_id: str, description: str):
    inputs = {"ticket_id": ticket_id, "description": description}
    try:
        await ticket_agent.ainvoke(inputs)
    except Exception as e:
        print(f"Error running agent: {e}")

@router.post("/")
async def create_ticket(ticket: TicketCreate, request: Request, background_tasks: BackgroundTasks):
    user_id = await verify_token(request)
    
    db = get_db()
    ticket_dict = ticket.dict()
    ticket_dict["status"] = "pending_analysis"
    ticket_dict["user_id"] = user_id
    
    from datetime import datetime, timezone
    ticket_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    department = ticket.department
    if not department:
        # Auto-classify
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import StrOutputParser
        
        classifier_prompt = ChatPromptTemplate.from_messages([
            ("system", "Classify the IT issue into one of these departments: 'network', 'identity', 'endpoint', 'business apps'. Output only the department name."),
            ("human", "{issue}")
        ])
        classifier_chain = classifier_prompt | ChatGoogleGenerativeAI(model="gemini-flash-lite-latest", temperature=0) | StrOutputParser()
        dept = await classifier_chain.ainvoke({"issue": ticket.description})
        dept = dept.strip().lower()
        if dept not in ['network', 'identity', 'endpoint', 'business apps']:
            dept = 'endpoint'
        department = dept
        ticket_dict["department"] = department
        
    result = await db.tickets.insert_one(ticket_dict)
    ticket_id = str(result.inserted_id)
    
    # Trigger background agent
    background_tasks.add_task(run_agent_async, ticket_id, ticket.description)
    
    # Invalidate cache
    from db.redis import get_redis
    redis = get_redis()
    await redis.delete(f"tickets:{user_id}")
    
    return {"ticket_id": ticket_id, "status": "pending_analysis", "department": department}

@router.get("/")
async def get_tickets(request: Request):
    user_id = await verify_token(request)
    
    from db.redis import get_redis
    redis = get_redis()
    cache_key = f"tickets:{user_id}"
    cached = await redis.get(cache_key)
    
    if cached:
        return json.loads(cached)
        
    db = get_db()
    cursor = db.tickets.find({"user_id": user_id})
    tickets = await cursor.to_list(length=100)
    
    # Format ObjectId to string
    for t in tickets:
        t["id"] = str(t.pop("_id"))
        
    await redis.setex(cache_key, 60, json.dumps(tickets))
    return tickets

@router.get("/department/{dept}")
async def get_department_tickets(dept: str, request: Request):
    user_id = await verify_token(request)
    db = get_db()
    cursor = db.tickets.find({"department": dept})
    tickets = await cursor.to_list(length=100)
    for t in tickets:
        t["id"] = str(t.pop("_id"))
    return tickets

@router.get("/{ticket_id}")
async def get_ticket(ticket_id: str, request: Request):
    user_id = await verify_token(request)
    db = get_db()
    from bson import ObjectId
    from bson.errors import InvalidId
    
    try:
        obj_id = ObjectId(ticket_id)
    except InvalidId:
        with open("ticket_debug.log", "a") as f:
            f.write(f"InvalidId for {ticket_id}\n")
        return {"error": "Invalid ticket ID"}
        
    # Using find_one without user_id restriction if they are a worker, or keep it strict
    ticket = await db.tickets.find_one({"_id": obj_id})
    with open("ticket_debug.log", "a") as f:
        f.write(f"Found ticket for {ticket_id}: {ticket is not None}\n")
    if ticket:
        ticket["id"] = str(ticket.pop("_id"))
        return ticket
    return {"error": "Not found"}


@router.post("/{ticket_id}/accept")
async def accept_ticket(ticket_id: str, request: Request):
    user_id = await verify_token(request)
    
    db = get_db()
    from bson import ObjectId
    from bson.errors import InvalidId
    
    try:
        obj_id = ObjectId(ticket_id)
    except InvalidId:
        return {"error": "Invalid ticket ID"}
        
    ticket = await db.tickets.find_one({"_id": obj_id})
    if not ticket:
        return {"error": "Not found"}
        
    # Get user email
    import httpx
    from core.config import settings
    # We could fetch user details from Clerk, but let's assume user_id works or fetch it here.
    # Actually, we can fetch email from Clerk API using user_id
    clerk_url = f"https://api.clerk.com/v1/users/{user_id}"
    headers = {"Authorization": f"Bearer {settings.CLERK_SECRET_KEY}"}
    
    user_email = "worker@digiplus.it" # default fallback
    try:
        async with httpx.AsyncClient() as http_client:
            clerk_res = await http_client.get(clerk_url, headers=headers)
            if clerk_res.status_code == 200:
                user_data = clerk_res.json()
                if user_data.get("email_addresses") and len(user_data["email_addresses"]) > 0:
                    user_email = user_data["email_addresses"][0]["email_address"]
    except Exception as e:
        print(f"Failed to fetch Clerk user: {e}")

    # Create Jira Issue
    jira_url = f"{settings.JIRA_DOMAIN.rstrip('/')}/rest/api/3/issue"
    auth = (settings.JIRA_USER_EMAIL, settings.JIRA_API_TOKEN)
    
    analysis = ticket.get("analysis", {})
    category = analysis.get("category", "Issue")
    desc = ticket.get("description", "")
    
    payload = {
        "fields": {
            "project": {"key": settings.JIRA_PROJECT_KEY},
            "summary": f"[{category}] {desc[:50]}...",
            "description": {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": desc}]
                    }
                ]
            },
            "issuetype": {"name": "Task"},
        }
    }
    
    jira_key = None
    async with httpx.AsyncClient() as http_client:
        try:
            response = await http_client.post(jira_url, json=payload, auth=auth)
            if response.status_code in (200, 201):
                data = response.json()
                jira_key = data.get("key")
        except Exception as e:
            print(f"Jira creation failed: {e}")

    # Update ticket in MongoDB
    update_data = {
        "status": "in_progress",
        "assignee_email": user_email,
    }
    if jira_key:
        update_data["jira_issue_key"] = jira_key
        
    await db.tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": update_data}
    )
    
    return {"status": "success", "assignee_email": user_email, "jira_issue_key": jira_key}
