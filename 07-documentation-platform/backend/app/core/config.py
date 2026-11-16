import os


class Settings:
    PROJECT_NAME: str = "Pixlo Documentation Platform"
    API_V1_STR: str = "/api/v1"
    PORT: int = int(os.getenv("PORT", "4007"))
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://pixlo_docs_user:pixlo_docs_password@localhost:5437/pixlo_docs_db"
    )
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6387/0")
    BUILD_OUTPUT_DIR: str = os.getenv("BUILD_OUTPUT_DIR", "./dist")
    TEMPLATES_DIR: str = os.getenv("TEMPLATES_DIR", "../templates")


settings = Settings()
