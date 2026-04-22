from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.account import AccountCreate, AccountUpdate, AccountResponse
from app.services.account_services import (
    create_account_service,
    list_accounts,
    get_account_service,
    update_account_service,
    delete_account_service,
    total_balance
)
from app.core.dependencies import get_current_active_user
from app.models.user import User
router = APIRouter(prefix="/accounts", tags=["Account"])

@router.get("/balance/total/")
def get_total(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):

    total = total_balance(current_user.id, db)
    if total is None:
        raise HTTPException(status_code=404, detail="Total not found.")
    return total


@router.post("/", response_model=AccountResponse, status_code=201)
def create_account(
    data: AccountCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):

    return create_account_service(data, current_user.id, db)

@router.get("/", response_model=list[AccountResponse])
def get_all_accounts(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):

    return list_accounts(current_user.id, db)

@router.get("/{account_id}", response_model=AccountResponse)
def get_account(
    account_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return get_account_service(account_id, current_user.id, db)

@router.put("/{account_id}", response_model=AccountResponse)

def update_account(
    account_id: int,
    data: AccountUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return update_account_service(account_id, data, current_user.id, db)

@router.delete("/{account_id}", status_code=204)
def delete_account(
    account_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):

    return delete_account_service(account_id, current_user.id, db)