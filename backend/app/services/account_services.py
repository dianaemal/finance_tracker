from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.models.account import Account
from app.schemas.account import AccountResponse, AccountCreate, AccountUpdate
from app.core.config import settings
from fastapi import HTTPException, Depends, status

def create_account_service(
    account: AccountCreate,
    db: Session,
    current_user: int
): 
    """
    Create a new account for the authenticated user.

    The account is automatically associated with the current user
    via the user_id foreign key.
    """
    db_account = Account(
        user_id = current_user,
        name = account.name,
        balance = account.balance
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account


def list_accounts_service(
    db: Session,
    current_user: int
):
    """
    List all accounts for the authenticated user.

    Users can only see their own tasks - the query filters by user_id.
    """
    accounts = db.query(Account).filter(Account.user_id == current_user).all()
    return accounts

def get_account_service(
    account_id: int,
    db: Session,
    current_user: int
):
    """
    Get a specific account (if owned by current user).
    Note the double filter: by account_id AND user_id.
    """
    account = db.query(Account).filter(
        Account.user_id == current_user,
        Account.id == account_id
    ).first()

    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

def update_account_service(
    account_id: int,
    db: Session,
    account_update: AccountUpdate,
    current_user: int
):
    """
    Update an account (if owned by current user).
    """
    account = db.query(Account).filter(
        Account.user_id == current_user,
        Account.id == account_id
    ).first()

    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")

    update_data = account_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account, field, value)

    db.commit()
    db.refresh(account)

    return account

def delete_account_service(
    account_id: int,
    db: Session,
    current_user: int
):
    """
    Delete an account (if owned by current user).
    """


    account = db.query(Account).filter(
        Account.user_id == current_user,
        Account.id == account_id
    ).first()

    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")

    db.delete(account)
    db.commit()

    return {"message": "Account deleted successfully."}




    
 





