from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.core.config import settings
from fastapi import HTTPException, Depends, status

def get_transaction_service(
    transaction_id: int,
    current_user: int,
    db: Session
):
    transaction = db.query(Transaction).filter( 
        Transaction.user_id == current_user,
        Transaction.id == transaction_id
    ).first()
    if transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return transaction

def create_transaction_service(
    data: TransactionCreate,
    current_user: int,
    db: Session
):
    db_transaction = Transaction(
        user_id = current_user,
        category_id = data.category_id,
        account_id = data.account_id,
        amount= data.amount,
        type = data.type,
        date = data.date,
        description = data.description
        
    )

    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def update_transaction_service(
    transaction_id: int,
    data: TransactionUpdate,
    current_user: int,
    db: Session
):

    transaction = get_transaction_service(transaction_id, current_user, db)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)
    return transaction


def list_transactions(
    current_user: int,
    db: Session
):

    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user)
        .all()
    )
    return transactions

def delete_transaction_service(
    transaction_id: int,
    current_user: int,
    db: Session
):

    transaction = get_transaction_service(transaction_id, current_user, db)
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully."}


    

