import asyncio
from db.mongodb import connect_to_mongo, get_db
from datetime import datetime, timezone

async def main():
    await connect_to_mongo()
    db = get_db()
    
    # Add created_at to all tickets that don't have it
    now = datetime.now(timezone.utc).isoformat()
    await db.tickets.update_many(
        {"created_at": {"$exists": False}},
        {"$set": {"created_at": now}}
    )
    print("Updated all tickets with created_at")

if __name__ == "__main__":
    asyncio.run(main())
