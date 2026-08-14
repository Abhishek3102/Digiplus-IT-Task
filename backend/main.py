from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db.mongodb import connect_to_mongo, close_mongo_connection
from db.qdrant import init_qdrant

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    await init_qdrant()
    yield
    await close_mongo_connection()

app = FastAPI(title="AI-Powered Service Desk", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.routes import tickets, chat, webhooks

app.include_router(tickets.router, prefix="/tickets", tags=["tickets"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])

@app.get("/")
async def root():
    return {"message": "Service Desk API is running"}
