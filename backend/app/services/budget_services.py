from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta, timezone
from app.models.budget import Budget
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse
from app.core.config import settings
from fastapi import HTTPException, Depends, status

def get_budget_service(
    budget_id: int,
    current_user: int,
    db: Session
):
    budget = db.query(Budget)\
    .filter(
        Budget.user_id == current_user,
        Budget.id == budget_id
    ).first()
    if budget is None:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    return budget

def create_budget_service(
    data: BudgetCreate,
    current_user: int,
    db: Session
):
    db_budget = Budget(
        user_id = current_user,
        category_id = data.category_id,
        month = data.month,
        year = data.year,
        amount = data.amount
    )

    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

def update_budget_service(
    budget_id: int,
    data: BudgetUpdate,
    current_user: int,
    db: Session
):

    budget = get_budget_service(budget_id, current_user, db)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget, field, value)

    db.commit()
    db.refresh(budget)
    return budget


def list_budgets(
    current_user: int,
    db: Session
):

    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == current_user)
        .all()
    )
    return budgets

def delete_budget_service(
    budget_id: int,
    current_user: int,
    db: Session
):

    budget = get_budget_service(budget_id, current_user, db)
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully."}


    

