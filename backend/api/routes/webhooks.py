from fastapi import APIRouter, Request
from db.mongodb import get_db

router = APIRouter()

@router.post("/jira")
async def jira_webhook(request: Request):
    # Depending on setup, verify signature if possible
    payload = await request.json()
    
    # Jira webhook payload typically has 'issue' dictionary with 'key' and 'fields'
    issue = payload.get("issue", {})
    issue_key = issue.get("key")
    
    if not issue_key:
        return {"status": "ignored"}
        
    status_name = issue.get("fields", {}).get("status", {}).get("name", "").lower()
    
    db = get_db()
    
    # Map Jira status to our app status
    mapped_status = "open"
    if status_name in ["done", "resolved", "closed"]:
        mapped_status = "resolved"
    elif status_name in ["in progress"]:
        mapped_status = "in_progress"
        
    await db.tickets.update_one(
        {"jira_issue_key": issue_key},
        {"$set": {"status": mapped_status}}
    )
    
    return {"status": "success"}
