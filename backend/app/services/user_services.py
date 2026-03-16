from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.models.user import User
from app.schemas.user import UserUpdate, PasswordUpdate
from app.core.config import settings
from fastapi import HTTPException, Depends, status
from app.core.security import hash_password, verify_password
   


def update_user_service(
    user_id: int,
    user_update: UserUpdate,
    db: Session
):

    """
    Update user email, username or profile
    """
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    
    db.commit()
    db.refresh(user)
    return user

def get_user_info(
    user_id: int,
    db: Session
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user

def delete_user_service(
    user_id: int,
    db: Session
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return None

def update_password_service(
    user_id: int,
    data: PasswordUpdate,
    db: Session
):

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password.")
    
    user.hashed_password = hash_password(data.new_password)
    db.commit()

    return {"message": "Password updated."}



