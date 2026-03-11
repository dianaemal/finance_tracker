from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# CryptContext handles password hashing with bcrypt
# bcrypt is designed to be slow, making brute-force attacks impractical
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")



def hash_password(password: str) -> str:

    """
    Hash a password for storage.

    Args:
        password: Plain text password

    Returns:
        Secure hash string suitable for database storage
    """
    return pwd_context.hash(password.encode('utf-8'))



def verify_password(plain_password: str, hashed_password: str) -> bool:


    """
    Verify a plain password against a hash.

    Args:
        plain_password: The password to verify
        hashed_password: The stored hash to check against

    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)



def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: Data to encode in the token (e.g., {"sub": "user@example.com"})
        expires_delta: Custom expiration time (optional)

    Returns:
        Encoded JWT string

    Note:
        - 'sub' (subject) is a standard JWT claim for the user identifier
        - 'exp' (expiration) is automatically enforced by jwt.decode()
    """

    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta

    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm = settings.ALGORITHM)

    return encoded_jwt

def create_refresh_token(data: dict, expire: Optional[datetime] = None):
    """
    Create a JWT refresh token.

    Args:
        data: Data to encode in the token (e.g., {"sub": "user@example.com"})

    Returns:
        Encoded JWT string

    """

    to_encode = data.copy()
    if not expire:
        expire = datetime.now(timezone.utc) + timedelta(days = settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm = settings.ALGORITHM)

    return encoded_jwt

