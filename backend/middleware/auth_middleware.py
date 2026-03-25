from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User, UserRole
from backend.services.auth_service import decode_token

# 1. OAuth2 Bearer configuration
# The Frontend will send the JWT in the 'Authorization: Bearer <token>' header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    Core dependency for extracting and validating a user from a JWT.
    Used for general authenticated routes.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode token using our auth service
    token_data = decode_token(token)
    
    # Fetch user from database
    user = db.query(User).filter(User.email == token_data.email).first()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user account"
        )
        
    return user

def get_current_applicant(current_user: User = Depends(get_current_user)) -> User:
    """
    Middleware dependency that restricts access to applicants only.
    """
    if current_user.role != UserRole.applicant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Applicants only"
        )
    return current_user

def get_current_officer(current_user: User = Depends(get_current_user)) -> User:
    """
    Middleware dependency that restricts access to bank officers only.
    """
    if current_user.role != UserRole.officer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Officers only"
        )
    return current_user
