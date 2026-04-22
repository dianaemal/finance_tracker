from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta, timezone
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse
from app.core.config import settings
from fastapi import HTTPException, Depends, status
from sqlalchemy import func, extract

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
    # see if a budget with the same month, year and category exists
    budget = db.query(Budget).filter(
        Budget.user_id == current_user,
        Budget.category_id == data.category_id,
        Budget.month == data.month,
        Budget.year == data.year
    ).first()
    if budget is not None:
        budget.amount = data.amount
        db.commit()
        db.refresh(budget)
        return budget


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
    db: Session,
    month: int | None = None,
    year: int | None = None
   
):

    budgets = db.query(Budget).filter(Budget.user_id == current_user, Budget.category_id != 0)
    if month is not None:
        budgets = budgets.filter(Budget.month == month)
    if year is not None:
        budgets = budgets.filter(Budget.year == year)
        

    budgets = budgets.all()

    # 🔍 DEBUG PRINTS
    print("\n===== DEBUG: LIST BUDGETS =====")
    for b in budgets:
        print({
            "id": b.id,
            "category_id": b.category_id,
            "category_obj": b.category,
            "category_name": b.category.name if b.category else None,
            "amount": float(b.amount),
            "month": b.month,
            "year": b.year
        })
    print("===== END DEBUG =====\n")

    return budgets


def get_monthly_budget(
    month: int,
    year: int,
    current_user : int,
    db: Session

):
    monthly_budget = db.query(Budget).filter(
        Budget.user_id == current_user,
        Budget.category_id == 0,
        Budget.month == month,
        Budget.year == year
    ).first()

    return monthly_budget 

def delete_budget_service(
    budget_id: int,
    current_user: int,
    db: Session
):

    budget = get_budget_service(budget_id, current_user, db)
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted successfully."}


def get_spending_by_category(
    month: int,
    year: int,
    current_user: int,
    db: Session
):

    results = (
        db.query(
            Category.id,
            Category.name,
            func.sum(Transaction.amount).label("total")
        ).join(Transaction)
        .filter(
            Transaction.user_id == current_user,
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
            Transaction.type == "Expense"
        ).group_by(
            Category.id
        ).all()
    )

    return {
        r.id : {
            "name": r.name,
            "spent": float(r.total)
        }
        
        for r in results
    }



    
def budget_sum(
    month: int,
    year: int,
    current_user: int,
    db: Session
):
    total = (
        db.query(func.sum(Budget.amount)).filter(
            Budget.user_id == current_user,
            Budget.category_id != 0,
            Budget.month == month,
            Budget.year == year
        ).scalar()
    )
    print(total)
    return  {"total_budget": total or 0}


def get_summary(month: int, year: int, current_user: int, db: Session):

    spending_map = get_spending_by_category(month, year, current_user, db)
    budgets = list_budgets(current_user, db, month, year)

    summary = {}

    for b in budgets:
       

        spending_entry = spending_map.get(b.category_id, {"name": b.category.name, "spent": 0})
        spent = spending_entry["spent"]

        summary[b.category_id] = {
            "category_id": b.category_id,
            "category": b.category.name,
            "spent": spent,
            "budget": float(b.amount),
            "remaining": float(b.amount) - spent
        }

    for category_id, entry in spending_map.items():

        if category_id not in summary:
            summary[category_id] = {
                "category_id": category_id,
                "category": entry["name"],
                "spent": entry["spent"],
                "budget": 0,
                "remaining": -entry["spent"]
            }

    return list(summary.values())