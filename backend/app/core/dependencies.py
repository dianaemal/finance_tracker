from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Optional
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

# OAuth2PasswordBearer extracts the token from the Authorization header
# tokenUrl is the endpoint where clients get tokens (for Swagger UI)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def decode_token(token: str) -> Optional[str]:

    """
    Decode and validate a JWT token.

    Args:
        token: The JWT string to decode

    Returns:
        The id (subject) from the token, or None if invalid
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        return user_id

    # JWTError catches both invalid and expired token
    except JWTError:
        return None

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency to get the current authenticated user.

    This dependency:
    1. Extracts the JWT from the Authorization header
    2. Decodes and validates the token
    3. Looks up the user in the database
    4. Returns the user object or raises 401 Unauthorized

    Usage:
        @app.get("/protected")
        def protected_route(user: models.User = Depends(get_current_user)):
            return {"message": f"Hello, {user.email}"}
    """

    # Decode token from Authorization header (Bearer <token>)
    user_id = decode_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    
    # extract user from the database:
    current_user = db.query(User).filter(User.id == user_id).first()
    if current_user is None:
         raise HTTPException(status_code=401, detail="User not found")

    return current_user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:

    """
    Dependency that also checks if the user is active.
    """
    if not current_user.is_active:
        raise HTTPException(403, "Inactive user")

    return current_user