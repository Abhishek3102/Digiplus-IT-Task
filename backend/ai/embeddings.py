from google import genai
from core.config import settings

# Initialize the Gemini client using the SDK
client = genai.Client(api_key=settings.GEMINI_API_KEY)

def get_embedding(text: str) -> list[float]:
    """
    Get embeddings using Gemini 2 model.
    """
    result = client.models.embed_content(
        model="gemini-embedding-2",
        contents=text
    )
    return result.embeddings[0].values

async def aget_embedding(text: str) -> list[float]:
    """
    Async wrapper for embedding if needed. The current genai SDK might be synchronous,
    so we wrap it in a thread or just call it directly if it doesn't block too long.
    """
    import asyncio
    return await asyncio.to_thread(get_embedding, text)
