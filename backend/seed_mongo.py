import asyncio
import os
from dotenv import load_dotenv
from db.mongodb import get_db, connect_to_mongo

load_dotenv()
load_dotenv(".env")
load_dotenv("../.env")

async def seed():
    await connect_to_mongo()
    db = get_db()
    
    # We will seed some dummy tickets for the specific seeded users or just random user_ids
    # But for the department workers to see them, they just need the 'department' field to match.
    
    dummy_tickets = [
        # Network tickets
        {
            "title": "Cannot connect to VPN from home",
            "description": "I've been trying to connect to the corporate VPN using Cisco AnyConnect but it keeps failing with error 412.",
            "status": "open",
            "department": "network",
            "user_id": "dummy_user_1",
            "analysis": {
                "priority": "high",
                "affected_system": "VPN",
                "tags": ["vpn", "connection"]
            }
        },
        {
            "title": "Office Wi-Fi is very slow",
            "description": "The DigiPlus-Guest and DigiPlus-Corp networks are extremely slow on the 3rd floor.",
            "status": "resolved",
            "department": "network",
            "user_id": "dummy_user_2",
            "analysis": {
                "priority": "medium",
                "affected_system": "Wi-Fi",
                "tags": ["wifi", "performance"]
            }
        },
        # Identity tickets
        {
            "title": "Need access to AWS Production",
            "description": "Please grant my user role access to the AWS production environment for the new deployment.",
            "status": "open",
            "department": "identity",
            "user_id": "dummy_user_1",
            "analysis": {
                "priority": "medium",
                "affected_system": "AWS IAM",
                "tags": ["access", "aws", "production"]
            }
        },
        # Endpoint tickets
        {
            "title": "Laptop battery draining fast",
            "description": "My Dell XPS 15 is losing battery within 1 hour even when just browsing.",
            "status": "open",
            "department": "endpoint",
            "user_id": "dummy_user_3",
            "analysis": {
                "priority": "low",
                "affected_system": "Hardware",
                "tags": ["battery", "laptop", "hardware"]
            }
        },
        # Business Apps
        {
            "title": "Salesforce login SSO failing",
            "description": "When clicking login with SSO on Salesforce, it redirects to a blank page.",
            "status": "open",
            "department": "business apps",
            "user_id": "dummy_user_4",
            "analysis": {
                "priority": "critical",
                "affected_system": "Salesforce",
                "tags": ["sso", "salesforce", "login"]
            }
        }
    ]
    
    # Check if they exist
    existing = await db.tickets.count_documents({"user_id": {"$regex": "^dummy_user"}})
    if existing == 0:
        await db.tickets.insert_many(dummy_tickets)
        print("Successfully seeded MongoDB with dummy tickets!")
    else:
        print("Tickets already seeded.")

if __name__ == "__main__":
    asyncio.run(seed())
