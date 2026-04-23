from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone, date
from app.models.transaction import Transaction
from app.models.account import Account
from app.models.category import Category
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.core.config import settings
from fastapi import HTTPException, Depends, status
from sqlalchemy import func, extract
from app.services.budget_services import get_monthly_budget
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

    # update account balance
    account = db.query(Account).filter(
        Account.user_id == current_user,
        Account.id == data.account_id
    ).first()

    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    if data.type == "Expense":
        account.balance -= data.amount
    elif data.type == "Income":
        account.balance += data.amount
    else:
        raise ValueError("Invalid transaction type")
    


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

    # 1. Store old account BEFORE update
    old_account = db.query(Account).filter(
        Account.user_id == current_user,
        Account.id == transaction.account_id
    ).first()

    if old_account is None:
        raise HTTPException(status_code=404, detail="Account not found")

    # 2. Reverse old transaction
    if transaction.type == "Expense":
        old_account.balance += transaction.amount
    elif transaction.type == "Income":
        old_account.balance -= transaction.amount

    # 3. Apply updates
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transaction, field, value)

    # 4. Get NEW account AFTER update
    new_account = db.query(Account).filter(
        Account.user_id == current_user,
        Account.id == transaction.account_id
    ).first()

    if new_account is None:
        raise HTTPException(status_code=404, detail="New account not found")

    # 5. Apply new transaction
    if transaction.type == "Expense":
        new_account.balance -= transaction.amount
    elif transaction.type == "Income":
        new_account.balance += transaction.amount

   

    db.commit()
    db.refresh(transaction)

    return transaction

    
from sqlalchemy import extract

def list_transactions(
    current_user: int,
    db: Session,
    type: str | None = None,
    account_id: int | None = None,
    category_id: int | None = None,
    description: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    page: int = 1,
    page_size: int = 10,
):

    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user
    )
    if type is not None and type.strip():
        transactions = transactions.filter(func.lower(Transaction.type) == type.strip().lower())
    if account_id is not None:
        transactions = transactions.filter(Transaction.account_id == account_id)
    if category_id is not None:
        transactions = transactions.filter(Transaction.category_id == category_id)
    if description is not None and description.strip():
        transactions = transactions.filter(Transaction.description.ilike(f"%{description.strip()}%"))
    if date_from is not None:
        transactions = transactions.filter(Transaction.date >= date_from)
    if date_to is not None:
        transactions = transactions.filter(Transaction.date <= date_to)

    total = transactions.count()
    # make sure that page is always one or greater than one
    safe_page = max(page, 1)
    # limit per page is 1 to 100
    safe_page_size = max(min(page_size, 100), 1)
    # add limit - 1 to round up correctly
    total_pages = (total + safe_page_size - 1) // safe_page_size if total > 0 else 1
    offset = (safe_page - 1) * safe_page_size
    items = (
        transactions
        .order_by(Transaction.date.desc(), Transaction.id.desc())
        .offset(offset)
        .limit(safe_page_size)
        .all()
    )
    return {
        "items": items,
        "total": total,
        "page": safe_page,
        "page_size": safe_page_size,
        "total_pages": total_pages,
    }


def delete_transaction_service(
    transaction_id: int,
    current_user: int,
    db: Session
):



    transaction = get_transaction_service(transaction_id, current_user, db)
     # update account balance
    account = db.query(Account).filter(
        Account.user_id == current_user,
        Account.id == transaction.account_id
    ).first()

    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    if transaction.type == "Expense":
        account.balance += transaction.amount
    elif transaction.type == "Income":
        account.balance -= transaction.amount
    else:
        raise ValueError("Invalid transaction type")
    
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully."}


    


def income_expense(month, year, current_user, db: Session):

    monthly_budget = get_monthly_budget(month, year, current_user, db)
    results = db.query(
        Transaction.type,
        func.sum(Transaction.amount)
    ).filter(
        Transaction.user_id == current_user,
        extract("month", Transaction.date) == month,
        extract("year", Transaction.date) == year
    ).group_by(Transaction.type).all()

    # default values
    income = 0
    expense = 0

    for t_type, total in results:
        if t_type == "Income":
            income = total or 0
        elif t_type == "Expense":
            expense = total or 0

    monthly_amount = float(monthly_budget.amount) if monthly_budget else 0

    return {
        "income": float(income),
        "expense": float(expense),
        "net": float(income - expense),
        "monthly_budget": monthly_amount,
        "remaining": float(monthly_amount - expense)
        
    }

    

    