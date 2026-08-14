import asyncio
from db.mongodb import connect_to_mongo, get_db
from bson import ObjectId

async def main():
    await connect_to_mongo()
    db = get_db()
    obj_id = ObjectId("6a7effac19033607acc70a07")
    ticket = await db.tickets.find_one({"_id": obj_id})
    print(ticket)

if __name__ == "__main__":
    asyncio.run(main())
