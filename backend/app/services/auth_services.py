from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import hashlib

from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.schemas.user import UserResponse
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token
)
from app.core.config import settings

def register_user(user: RegisterRequest, db : Session):
    """"
    Register a new user.

    The password is hashed before storage - we never store plain passwords.

    Args:
        user: Email and password for registration

    Returns:
        The created user (without password)
    Raises:
         
        ValueError: If email is already registered


    """

    #Check for existing user:
    existing_user = db.query(User).filter(User.email ==user.email ).first()
    if existing_user:
        raise ValueError("Email already registered.")
    
    # create user with hashed password
    db_user = User(
        email= user.email,
        hashed_password = hash_password(user.password)
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def authenticate_user(db : Session, data: LoginRequest):

    """
    Authenticate user.

    expects form data with:
    - email: The user's email
    - password: The user's password

    Returns:
        authenticated user if credentials valid else none.
    """

    # check if the email exits:

    user = db.query(User).filter(User.email == data.email).first()
    if not user_email or not verify_password(data.password, user.hashed_password):
        return None
        
    return user

def create_tokens(db: Session, user: User):

    expire = datetime.now(timezone.utc) + timedelta(days = settings.REFRESH_TOKEN_EXPIRE_DAYS)
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email}, expire)

    # hash th erefresh token using hashlib before storing it in db
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

    refersh_token = RefreashToken(
        user_id = user.id,
        hash_token = token_hash,
        expires_at = expire

    )
    db.add(refresh_token)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


def refresh_access_token(db : Session, refersh_token: str):

    # hash the refresh token to compare to db
    hashed = hashlib.sha256(refresh_token.encode()).hexdigest()

    r_token = db.query(RefreashToken).filter(RefreashToken.hash_token == hashed).first()

    if not r_token:
        raise ValueError("Invalid refresh token.")
    
    if r_token.expires_at < datetime.utcnow():

        

    









