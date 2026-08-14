import os
import httpx
from dotenv import load_dotenv

load_dotenv("../.env")
load_dotenv(".env")
load_dotenv("../client/.env.local")

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
if not CLERK_SECRET_KEY:
    exit(1)

headers = {
    "Authorization": f"Bearer {CLERK_SECRET_KEY}",
    "Content-Type": "application/json"
}

new_password = "SecureDigiplus2026!"

async def update():
    async with httpx.AsyncClient() as client:
        # Get all users
        resp = await client.get("https://api.clerk.com/v1/users?limit=100", headers=headers)
        users = resp.json()
        
        for u in users:
            email = u["email_addresses"][0]["email_address"]
            user_id = u["id"]
            
            payload = {
                "password": new_password,
                "skip_password_checks": True
            }
            patch_resp = await client.patch(f"https://api.clerk.com/v1/users/{user_id}", headers=headers, json=payload)
            if patch_resp.status_code == 200:
                print(f"Updated {email}")
            else:
                print(f"Failed {email}: {patch_resp.text}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(update())
