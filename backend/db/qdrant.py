from qdrant_client import AsyncQdrantClient
from core.config import settings

qdrant_host = settings.QDRANT_URL.replace("https://", "").replace("http://", "").split(":")[0]

qdrant_client = AsyncQdrantClient(
    host=qdrant_host,
    port=443,
    https=True,
    api_key=settings.QDRANT_API_KEY,
    timeout=60.0,
    prefer_grpc=False,
)

async def init_qdrant():
    collections = await qdrant_client.get_collections()
    collection_names = [c.name for c in collections.collections]
    
    # 768 is the default dimension for Gemini embeddings models
    if "ticket_embeddings" not in collection_names:
        from qdrant_client.models import VectorParams, Distance
        await qdrant_client.create_collection(
            collection_name="ticket_embeddings",
            vectors_config=VectorParams(size=768, distance=Distance.COSINE),
        )
    if "kb_embeddings" not in collection_names:
        from qdrant_client.models import VectorParams, Distance
        await qdrant_client.create_collection(
            collection_name="kb_embeddings",
            vectors_config=VectorParams(size=768, distance=Distance.COSINE),
        )
    print("Qdrant collections ready")
