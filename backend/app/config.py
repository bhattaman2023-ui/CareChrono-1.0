import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Resolve .env relative to THIS file's location (backend/app/config.py → backend/.env)
_ENV_FILE = Path(__file__).parent.parent / ".env"

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./carechrono.db"
    JWT_SECRET: str = "supersecretkeyforcarechronodevelopment123!"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # AI Layer config
    AI_PROVIDER: str = "gemini"   # "ollama", "gemini", or "mock"
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"
    GEMINI_API_KEY: str = ""

    model_config = {"env_file": str(_ENV_FILE), "env_file_encoding": "utf-8"}

settings = Settings()

