import asyncio
import os
import httpx
from qdrant_client import AsyncQdrantClient
from dotenv import load_dotenv
from pathlib import Path

# Load env
ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=ROOT_DIR / ".env")

async def test_qdrant():
    url = os.getenv("QDRANT_URL")
    api_key = os.getenv("QDRANT_API_KEY")
    print(f"URL: {url}")
    print(f"Key preview: {api_key[:10]}...")
    
    # 1. Test raw httpx GET without auth (should return 401 or 403)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            print(f"Raw HTTP GET status: {resp.status_code}")
    except Exception as e:
        print(f"Raw HTTP GET failed: {e}")
        
    # 2. Test qdrant client
    print("Testing qdrant client...")
    try:
        q_client = AsyncQdrantClient(
            url=url, 
            port=443,
            api_key=api_key, 
            timeout=20.0,
            prefer_grpc=False,
        )
        collections = await q_client.get_collections()
        print(f"Qdrant Client Success! Collections: {collections}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Qdrant Client failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_qdrant())
