import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set!")

# Supabase uses postgres:// but SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,       # Test connection before using it (handles Supabase idle timeouts)
    pool_size=5,               # Max 5 persistent connections
    max_overflow=10,           # Allow 10 extra connections under load
    pool_recycle=300,          # Recycle connections every 5 min (prevents stale connections)
    connect_args={
        "connect_timeout": 10  # Fail fast if Supabase is unreachable
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()