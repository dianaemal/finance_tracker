from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.account import AccountCreate, AccountUpdate, AccountResponse
from app.services.account_services import (
    create_account_service,
    list_accounts_service,
    get_account_service,
    update_account_service,
    delete_account_service
)
from app.core.dependencies import get_current_active_user
from app.models.user import User
router = APIRouter(prefix="/accounts", tags=["Account"])

@router.post("/", response_model=AccountResponse, status_code=201)
def create_account(
    data: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):

    return create_account_service(data, db, current_user.id)

@router.get("/", response_model=list[AccountResponse])
def get_all_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):

    return list_accounts_service(db, current_user.id)

@router.get("/{account_id}", response_model=AccountResponse)
def get_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return get_account_service(account_id, db, current_user.id)

@router.put("/{account_id}", response_model=AccountResponse)

def update_account(
    account_id: int,
    data: AccountUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return update_account_service(account_id, db, data, current_user.id)

@router.delete("/{account_id}", status_code=204)
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):

    return delete_account_service(account_id, db, current_user.id)