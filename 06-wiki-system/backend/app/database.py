import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Detect if testing or if postgres is unavailable
is_testing = os.getenv("TESTING", "0") == "1"
db_url = settings.TEST_DATABASE_URL if is_testing else settings.DATABASE_URL

# For SQLite, set check_same_thread=False
connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
