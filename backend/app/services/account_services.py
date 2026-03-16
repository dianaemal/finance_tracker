from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.models.account import Account
from app.schemas.account import AccountResponse, AccountCreate, AccountUpdate
from app.core.config import settings
from fastapi import HTTPException, Depends, status


def get_account_service(
    account_id: int,
    current_user: int,
    db: Session
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

def create_account_service(
    account: AccountCreate,
    current_user: int,
    db: Session
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


def list_accounts(
    current_user: int,
    db: Session
):
    """
    List all accounts for the authenticated user.

    Users can only see their own tasks - the query filters by user_id.
    """
    accounts = db.query(Account).filter(Account.user_id == current_user).all()
    return accounts



def update_account_service(
    account_id: int,
    data: AccountUpdate,
    current_user: int,
    db: Session
):
    """
    Update an account (if owned by current user).
    """
    account = get_account_service(account_id, current_user, db)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account, field, value)

    db.commit()
    db.refresh(account)

    return account

def delete_account_service(
    account_id: int,
    current_user: int,
    db: Session
):
    """
    Delete an account (if owned by current user).
    """


    account = get_account_service(account_id, current_user, db)

    db.delete(account)
    db.commit()

    return {"message": "Account deleted successfully."}




    
 





