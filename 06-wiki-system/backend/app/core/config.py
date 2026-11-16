import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "Pixlo Wiki System"
    PORT: int = 4006
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:3006"
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://pixlo_user:pixlo_password@localhost:5436/pixlo_wiki_db"
    )
    TEST_DATABASE_URL: str = os.getenv("TEST_DATABASE_URL", "sqlite:///./wiki_test.db")
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecret-pixlo-wiki-system-jwt-key-2026")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "../storage/uploads")
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB

settings = Settings()
