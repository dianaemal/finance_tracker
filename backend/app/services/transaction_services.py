from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
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

    print("\n===== UPDATE TRANSACTION START =====")

    transaction = get_transaction_service(transaction_id, current_user, db)

    print("Original transaction:", {
        "id": transaction.id,
        "type": transaction.type,
        "amount": float(transaction.amount),
        "account_id": transaction.account_id
    })

    update_data = data.model_dump(exclude_unset=True)
    print("Incoming update data:", update_data)

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

    print("Final transaction saved:", {
        "id": transaction.id,
        "type": transaction.type,
        "amount": float(transaction.amount)
    })

    print("===== UPDATE TRANSACTION END =====\n")

    return transaction

    
from sqlalchemy import extract

def list_transactions(
    current_user: int,
    db: Session,
    offset: int,
    limit: int,
    month: int | None = None,
    year: int | None = None,
    account: int | None = None,
    category: int | None = None,
    type: str | None = None,
    description: str | None = None,
):

    query = db.query(Transaction).filter(
        Transaction.user_id == current_user
    )


    if month is not None:
        query = query.filter(extract("month", Transaction.date) == month)

    if year is not None:
        query = query.filter(extract("year", Transaction.date) == year)


    if account is not None:
        query = query.filter(Transaction.account_id == account)

    if category is not None:
        query = query.filter(Transaction.category_id == category)

    if type is not None:
        query = query.filter(Transaction.type == type)

    if description is not None:
        query = query.filter(Transaction.description.ilike(f"%{description}%"))

    return query.order_by(Transaction.date.desc()).offset(offset).limit(limit).all()

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

    

    