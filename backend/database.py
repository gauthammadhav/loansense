from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# 1. Database URL Configuration
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# 2. Engine Creation
# connect_args={"check_same_thread": False} is required only for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# 3. Session Maker Configuration
# autocommit=False and autoflush=False are best practices for session control
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

# 4. Declarative Base for Database Models
# All ORM models will inherit from this Base class
Base = declarative_base()

def get_db():
    """
    Dependency generator for creating and closing database sessions.
    The session is yielded to the request-processing function and 
    guaranteed to be closed in the finally block.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
