from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse, TransactionListResponse
from app.services.transaction_services import (
    get_transaction_service,
    create_transaction_service,
    update_transaction_service,
    list_transactions,
    delete_transaction_service,
    income_expense

)
from app.core.dependencies import get_current_active_user
from app.models.user import User
from datetime import date
router = APIRouter(prefix="/transactions", tags=["Transaction"])

@router.post("/", response_model=TransactionResponse, status_code=201)
def create_transaction(
    data: TransactionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):

    return create_transaction_service(data, current_user.id, db)

@router.get("/", response_model=TransactionListResponse)
def get_all_transactions(
    type: str | None = None,
    account_id: int | None = None,
    category_id: int | None = None,
    description: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    page: int = 1,
    page_size: int = 10,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return list_transactions(
        current_user.id,
        db,
        type=type,
        account_id=account_id,
        category_id=category_id,
        description=description,
        date_from=date_from,
        date_to=date_to,
        page=page,
        page_size=page_size,
    )

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

@router.get("/income/stats/")
def get_spending(
    month: int,
    year: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):

    return income_expense(month, year, current_user.id, db)
    
   
    