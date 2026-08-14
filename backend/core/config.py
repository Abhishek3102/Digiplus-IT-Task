from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os
from pathlib import Path
from dotenv import load_dotenv

# Calculate absolute path to the backend .env file
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BACKEND_DIR / ".env"

# Explicitly load .env so pydantic-settings reads it from os.environ
load_dotenv(dotenv_path=ENV_PATH)

class Settings(BaseSettings):
    # Clerk
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_SECRET_KEY: str = ""
    
    # Gemini
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-flash-lite-latest"
    
    # Qdrant
    QDRANT_URL: str
    QDRANT_API_KEY: str
    
    # MongoDB
    MONGODB_URI: str
    MONGODB_DB_NAME: str = "service_desk"
    
    # Upstash Redis
    UPSTASH_REDIS_REST_URL: str
    UPSTASH_REDIS_REST_TOKEN: str
    
    # Jira
    JIRA_API_TOKEN: str
    JIRA_USER_EMAIL: str
    JIRA_DOMAIN: str
    JIRA_PROJECT_KEY: str

    model_config = SettingsConfigDict(env_file=str(ENV_PATH), extra="ignore")

settings = Settings()
