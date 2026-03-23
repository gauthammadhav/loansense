from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from typing import Optional
from backend.models.user import UserRole

# 1. Registration Schema
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

# 2. Login Schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# 3. Response Schema (No password included)
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# 4. Token Schema (For successful login)
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# 5. Token Identification Data (Used internally for JWT decoding)
class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None
