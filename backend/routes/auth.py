from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.orm import Session
from datetime import datetime, timezone

from backend.database import get_db
from backend.models.user import User, UserRole
from backend.schemas.auth import UserRegister, UserResponse, TokenResponse, UserLogin
from backend.services.auth_service import hash_password, create_access_token, verify_password
from backend.middleware.auth_middleware import get_current_user

# 1. API Route Configuration
router = APIRouter(prefix="/auth", tags=["Authentication"])


# ---------------- REGISTER ----------------
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """
    Public endpoint for self-registration as an applicant.
    """
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user record
    new_user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=UserRole.applicant,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


# ---------------- LOGIN (JSON BODY) ----------------
@router.post("/login", response_model=TokenResponse)
def login(body: UserLogin, db: Session = Depends(get_db)):
    """
    Public endpoint for authenticating and receiving a JWT.
    Accepts JSON body: {"email": "...", "password": "..."}.
    """

    # Fetch user by email
    user = db.query(User).filter(User.email == body.email).first()
    
    # Validate credentials
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Update audit timestamps
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    
    # Generate and return secure token
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


# ---------------- SWAGGER TOKEN (FORM DATA) ----------------
@router.post("/token", response_model=TokenResponse)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Dedicated endpoint for Swagger UI 'Authorize' button.
    Accepts form-data (username/password) as per OAuth2 spec.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


# ---------------- ME ----------------
@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Protected endpoint to retrieve the currently logged-in user's profile.
    """
    return current_user