from upstash_redis.asyncio import Redis
from core.config import settings

redis_client = Redis(
    url=settings.UPSTASH_REDIS_REST_URL,
    token=settings.UPSTASH_REDIS_REST_TOKEN
)

def get_redis():
    return redis_client
