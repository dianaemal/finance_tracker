from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse
from app.services.budget_services import (
    get_budget_service,
    create_budget_service,
    list_budgets,
    update_budget_service,
    delete_budget_service
)
from app.core.dependencies import get_current_active_user
from app.models.user import User
router = APIRouter(prefix="/budgets", tags=["Budget"])

@router.post("/", response_model=BudgetResponse, status_code=201)
def create_budget(
    data: BudgetCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):

    return create_budget_service(data, current_user.id, db)

@router.get("/", response_model=list[BudgetResponse])
def get_all_budgets(
    current_user: User = Depends(get_current_active_user),
    month: int | None = None,
    year: int | None = None,
    db: Session = Depends(get_db)
):

    return list_budgets(current_user.id, db, month, year)

@router.get("/{budget_id}", response_model=BudgetResponse)
def get_category(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return get_budget_service(budget_id, current_user.id, db)

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    data: BudgetUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return update_budget_service(budget_id, data, current_user.id, db)

@router.delete("/{budget_id}", status_code=204)
def delete_budget(
    budget_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):

    return delete_budget_service(budget_id, current_user.id, db)