from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
import hashlib
import pytz
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, LogoutRequest
from app.schemas.user import UserResponse
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token
)
from app.core.dependencies import decode_token
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
        hashed_password = hash_password(user.password),
        username= user.username,
        profile = user.profile
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def authenticate_user(data: LoginRequest, db : Session):

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
    if not user or not verify_password(data.password, user.hashed_password):
        return None
        
    return user
def authenticate_user_swagger(email: str, password: str, db : Session):

   

    # check if the email exits:

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
        
    return user

def save_token(db: Session, user_id: int, refresh_token: str, expire: datetime, session_start: datetime):

    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

    refresh_token_db = RefreshToken(
        user_id=user_id,
        hash_token=token_hash,
        expires_at=expire,
        session_start=session_start
    )

    db.add(refresh_token_db)
    db.commit()

    return refresh_token_db


def create_tokens(user: User, db: Session):

    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    # start of the session will be set to the login time:
    now = datetime.now(timezone.utc)

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    refresh_token = create_refresh_token(
        data={"sub": str(user.id)},
        expire=expire
    )

    save_token(db, user.id, refresh_token, expire, now)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )

def refresh_access_token(refresh_token: str, db: Session):

    user = decode_token(refresh_token)
    print(user)
    if user is None:
        raise ValueError("Expired or invalid refersh token.")

    hashed = hashlib.sha256(refresh_token.encode()).hexdigest()

    r_token = db.query(RefreshToken).filter(
        RefreshToken.hash_token == hashed
    ).first()

    if not r_token:
        raise ValueError("Invalid refresh token")
    # after 7 days, the session should end and refersh token will be deleted
    MAX_SESSION_DAYS = 7
    print( r_token.session_start.replace(tzinfo=pytz.utc))
    print(datetime.now(timezone.utc) - timedelta(minutes=MAX_SESSION_DAYS))
    if r_token.session_start.replace(tzinfo=pytz.utc) < datetime.now(timezone.utc) - timedelta(days=MAX_SESSION_DAYS):
        db.delete(r_token)
        db.commit()
        raise ValueError("Refresh token expired")
    user_id = r_token.user_id
    session_start = r_token.session_start
    print(session_start)

    # token rotation
    db.delete(r_token)
    db.commit()

    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    new_refresh_token = create_refresh_token(
        data={"sub": str(user_id)},
        expire=expire
    )

    save_token(db, user_id, new_refresh_token, expire, session_start)

    access_token = create_access_token(
        data={"sub": str(user_id)}
    )
    print(access_token)
    print(refresh_token)
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token
    )


   
    
def logout_user(refresh_token: str, db: Session):
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

    token_record = db.query(RefreshToken).filter(
        RefreshToken.hash_token == token_hash
    ).first()

    if token_record:
        db.delete(token_record)
        db.commit()