import os
import httpx
import json
from dotenv import load_dotenv

load_dotenv("../.env")  # Load root .env
load_dotenv(".env")     # Load backend .env
load_dotenv("../client/.env.local") # Load client keys

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

if not CLERK_SECRET_KEY:
    print("Error: CLERK_SECRET_KEY not found in environment variables.")
    exit(1)

CLERK_API_URL = "https://api.clerk.com/v1/users"

headers = {
    "Authorization": f"Bearer {CLERK_SECRET_KEY}",
    "Content-Type": "application/json"
}

users_to_create = [
    {
        "email": "admin@digiplus.it",
        "role": "admin",
        "department": None
    },
    {
        "email": "identity1@digiplus.it",
        "role": "worker",
        "department": "identity"
    },
    {
        "email": "identity2@digiplus.it",
        "role": "worker",
        "department": "identity"
    },
    {
        "email": "network1@digiplus.it",
        "role": "worker",
        "department": "network"
    },
    {
        "email": "network2@digiplus.it",
        "role": "worker",
        "department": "network"
    },
    {
        "email": "endpoint1@digiplus.it",
        "role": "worker",
        "department": "endpoint"
    },
    {
        "email": "endpoint2@digiplus.it",
        "role": "worker",
        "department": "endpoint"
    },
    {
        "email": "business_apps1@digiplus.it",
        "role": "worker",
        "department": "business-apps"
    },
    {
        "email": "business_apps2@digiplus.it",
        "role": "worker",
        "department": "business-apps"
    }
]

default_password = "Password123!"

async def create_users():
    async with httpx.AsyncClient() as client:
        for u in users_to_create:
            payload = {
                "email_address": [u["email"]],
                "password": default_password,
                "public_metadata": {
                    "role": u["role"],
                    "department": u["department"]
                },
                "skip_password_checks": True
            }
            
            print(f"Creating user {u['email']}...")
            resp = await client.post(CLERK_API_URL, headers=headers, json=payload)
            
            if resp.status_code in [200, 201]:
                print(f"Successfully created {u['email']}")
            else:
                try:
                    err = resp.json()
                    # Check if already exists
                    if "errors" in err and any(e.get("code") == "form_identifier_exists" for e in err["errors"]):
                        print(f"User {u['email']} already exists. Skipping.")
                    else:
                        print(f"Failed to create {u['email']}: {err}")
                except:
                    print(f"Failed to create {u['email']}. Status: {resp.status_code}, Response: {resp.text}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(create_users())
