from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserResponse, UserUpdate, PasswordUpdate
from app.services.user_services import (
    update_user_service,
    get_user_info,
    delete_user_service,
    update_password_service
)
from app.core.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/user", tags=["user"])

@router.put("/", response_model=UserResponse)
def update_user(
    data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return update_user_service(current_user.id, data, db)

@router.put("/password")
def update_password(
    data: PasswordUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return update_password_service(current_user.id, data, db)


@router.delete("/delete", status_code=204)
def delete_user(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return delete_user_service(current_user.id, db)

@router.get("/me", response_model=UserResponse)
def get_user(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_user_info(current_user.id, db)