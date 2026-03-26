from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from backend.config import settings
from backend.schemas.auth import TokenData

# 1. Password Compression & Hashing Configuration
# sha256 is more compatible and robust in this environment than bcrypt
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


# 2. JWT Configuration
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

def hash_password(password: str) -> str:
    """Returns a hashed version of the provided plain-text password."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if a plain-text password matches a previously hashed version."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """
    Generates a secure JSON Web Token (JWT) with an expiration timestamp.
    Defaults to 24 hours (1440 minutes).
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> TokenData:
    """
    Decodes and validates a provided JWT.
    Raises a 401 Unauthorized exception if the token is invalid or expired.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Strip quotes in case the user copy-pasted them from a JSON response
    token = token.strip('"').strip("'")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        
        if email is None or role is None:
            raise credentials_exception
            
        token_data = TokenData(email=email, role=role)
        return token_data
        
    except JWTError:
        raise credentials_exception
