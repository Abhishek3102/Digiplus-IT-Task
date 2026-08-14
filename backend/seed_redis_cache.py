import asyncio
from db.redis import get_redis

async def seed_cache():
    redis = get_redis()
    
    faqs = {
        "how to reset password?": "You can reset your password by going to the IT portal at auth.digiplus.it/reset and using your employee ID to request an SMS token.",
        "vpn is not connecting": "If the VPN is stuck on 'Connecting', please ensure you are disconnected from any other proxies, then restart the Cisco AnyConnect client. If it persists, reinstall the client from self-service.",
        "how to request software?": "Software requests must be submitted through the 'Business Apps' catalog in the company portal. It requires manager approval.",
    }
    
    for q, a in faqs.items():
        key = f"faq:{q.lower().strip()}"
        await redis.set(key, a)
        print(f"Seeded FAQ: {q}")
        
    print("Redis cache seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_cache())
