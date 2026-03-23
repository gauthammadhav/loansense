import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from backend.database import Base


class UserRole(str, enum.Enum):
    """
    Role-based classification for application security and access.
    Applicants self-register; Officers are pre-allocated.
    """
    applicant = "applicant"
    officer = "officer"

class User(Base):
    """
    Core User model storing authentication and identification details.
    Shared by both applicants and bank officers.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    
    # role determined by Enum with default as 'applicant'
    role = Column(
        Enum(UserRole), 
        nullable=False, 
        default=UserRole.applicant, 
        server_default=UserRole.applicant.value
    )
    
    # is_active column for soft-disable functionality
    is_active = Column(Boolean, nullable=False, default=True, server_default="1")
    
    # Registration and access log timestamps
    created_at = Column(
        DateTime(timezone=True), 
        nullable=False, 
        server_default=func.now()
    )
    last_login = Column(
        DateTime(timezone=True), 
        nullable=True, 
        server_default=func.now()
    )

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
