from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse
from app.services.transaction_services import (
    get_transaction_service,
    create_transaction_service,
    update_transaction_service,
    list_transactions,
    delete_transaction_service
)
from app.core.dependencies import get_current_active_user
from app.models.user import User
router = APIRouter(prefix="/transactions", tags=["Transaction"])

@router.post("/", response_model=TransactionResponse, status_code=201)
def create_transaction(
    data: TransactionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):

    return create_transaction_service(data, current_user.id, db)

@router.get("/", response_model=list[TransactionResponse])
def get_all_transactions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):

    return list_transactions(current_user.id, db)

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return get_transaction_service(transaction_id, current_user.id, db)

@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    data: TransactionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return update_transaction_service(transaction_id, data, current_user.id, db)

@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):

    return delete_transaction_service(transaction_id, current_user.id, db)