import json
import os
from google import genai
from core.config import settings
from db.redis import get_redis
from db.mongodb import get_db
from qdrant_client import AsyncQdrantClient
from langchain_qdrant import QdrantVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda
import asyncio
from bson import ObjectId

# For Google API
if "GOOGLE_API_KEY" not in os.environ and "GEMINI_API_KEY" in os.environ:
    os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

qdrant_url = os.environ.get("QDRANT_URL")
qdrant_api_key = os.environ.get("QDRANT_API_KEY")

async_qdrant = AsyncQdrantClient(
    url=qdrant_url,
    api_key=qdrant_api_key,
)

embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2")
llm = ChatGoogleGenerativeAI(model=settings.GEMINI_MODEL, temperature=0, streaming=True)

qdrant_host = qdrant_url.replace("https://", "").replace("http://", "").split(":")[0]

# Using Qdrant with threshold
vectorstore = QdrantVectorStore.from_existing_collection(
    collection_name="kb_embeddings",
    embedding=embeddings,
    url=f"https://{qdrant_host}:443",
    api_key=qdrant_api_key,
)

retriever = vectorstore.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.7, "k": 4}
)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an AI IT Support agent. Answer the user's question based ONLY on the following context. If you cannot answer from the context, say exactly 'I do not know'.\n\nContext:\n{context}"),
    ("human", "Question: {question}")
])

def format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)

async def append_chat_message(user_id: str, role: str, content: str):
    redis = get_redis()
    key = f"chat:{user_id}"
    await redis.rpush(key, json.dumps({"role": role, "content": content}))
    await redis.ltrim(key, -20, -1)
    await redis.expire(key, 1800) # 30 min

async def route_to_department(msg: str, user_id: str):
    # Quick LLM call to classify department
    classifier_prompt = ChatPromptTemplate.from_messages([
        ("system", "Classify the IT issue into one of these departments: 'network', 'identity', 'endpoint', 'business-apps'. Output only the department name."),
        ("human", "{issue}")
    ])
    classifier_chain = classifier_prompt | ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0) | StrOutputParser()
    dept = await classifier_chain.ainvoke({"issue": msg})
    dept = dept.strip().lower()
    if dept not in ['network', 'identity', 'endpoint', 'business-apps']:
        dept = 'endpoint'
        
    db = get_db()
    if db is not None:
        await db.tickets.insert_one({
            "user_id": user_id,
            "issue": msg,
            "department": dept,
            "status": "open"
        })
    return dept

async def chat_endpoint_logic(msg: str, user_id: str):
    redis = get_redis()
    
    # 1. Check Redis Cache
    cache_key = f"faq:{msg.lower().strip()}"
    cached_answer = await redis.get(cache_key)
    
    if cached_answer:
        async def stream_cache():
            await append_chat_message(user_id, "user", msg)
            await append_chat_message(user_id, "assistant", cached_answer)
            yield cached_answer
        return stream_cache()
    
    # 2. RAG Retrieval
    docs = await retriever.ainvoke(msg)
    
    if not docs:
        # 3. Fallback to Department Routing
        dept = await route_to_department(msg, user_id)
        fallback_msg = f"I could not find an automated solution for this. I have created a ticket and routed it to the '{dept}' department for human assistance."
        async def stream_fallback():
            await append_chat_message(user_id, "user", msg)
            await append_chat_message(user_id, "assistant", fallback_msg)
            yield fallback_msg
        return stream_fallback()

    # 4. LLM Generation
    chain = (
        {"context": lambda x: format_docs(docs), "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    async def stream_generator():
        full_response = ""
        async for chunk in chain.astream(msg):
            full_response += chunk
            yield chunk
            await asyncio.sleep(0.01)
            
        await append_chat_message(user_id, "user", msg)
        await append_chat_message(user_id, "assistant", full_response)
        
    return stream_generator()
