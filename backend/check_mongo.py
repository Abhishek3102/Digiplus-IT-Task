import asyncio
from db.mongodb import get_db, connect_to_mongo

async def main():
    await connect_to_mongo()
    db = get_db()
    cursor = db.tickets.find({})
    tickets = await cursor.to_list(length=10)
    for t in tickets:
        print(t.keys())
        print(t)

asyncio.run(main())
