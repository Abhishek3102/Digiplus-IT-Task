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

def run_agent(ticket_id: str, description: str):
    import asyncio
    # Run the graph
    inputs = {"ticket_id": ticket_id, "description": description}
    # Since agent is async, we should run it in an event loop if background task isn't async directly
    # FastAPI background tasks can be async
    
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
    
    result = await db.tickets.insert_one(ticket_dict)
    ticket_id = str(result.inserted_id)
    
    # Trigger background agent
    background_tasks.add_task(run_agent_async, ticket_id, ticket.description)
    
    # Invalidate cache
    from db.redis import get_redis
    redis = get_redis()
    # Simple cache invalidation (in reality you'd want to match specific filters)
    # We will just wipe all ticket lists for this user
    await redis.delete(f"tickets:{user_id}")
    
    return {"ticket_id": ticket_id, "status": "pending_analysis"}

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
        t["_id"] = str(t["_id"])
        
    await redis.setex(cache_key, 60, json.dumps(tickets))
    return tickets

@router.get("/department/{dept}")
async def get_department_tickets(dept: str, request: Request):
    user_id = await verify_token(request)
    db = get_db()
    cursor = db.tickets.find({"department": dept})
    tickets = await cursor.to_list(length=100)
    for t in tickets:
        t["_id"] = str(t["_id"])
    return tickets

@router.get("/{ticket_id}")
async def get_ticket(ticket_id: str, request: Request):
    user_id = await verify_token(request)
    db = get_db()
    from bson import ObjectId
    ticket = await db.tickets.find_one({"_id": ObjectId(ticket_id), "user_id": user_id})
    if ticket:
        ticket["_id"] = str(ticket["_id"])
        return ticket
    return {"error": "Not found"}
