import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config.settings import DATABASE_URL

def get_engine():
    try:
        eng = create_engine(DATABASE_URL)
        with eng.connect() as conn:
            pass
        return eng
    except Exception as e:
        print(f"Warning: Could not connect to PostgreSQL at {DATABASE_URL}. Using SQLite fallback.")
        sqlite_url = "sqlite:///./sarathi.db"
        return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = get_engine()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()