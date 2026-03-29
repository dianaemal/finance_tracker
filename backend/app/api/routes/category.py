from fastapi import APIRouter, Depends,  HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.category_services import (
    get_category_service,
    update_category_service,
    list_categories,
    create_category_service,
    delete_category_service
    
)
from app.core.dependencies import get_current_active_user
from app.models.user import User
router = APIRouter(prefix="/categories", tags=["Category"])

@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category(
    data: CategoryCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):

    return create_category_service(data, current_user.id, db)

@router.get("/", response_model=list[CategoryResponse])
def get_all_categories(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):

    return list_categories(current_user.id, db)

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return get_category_service(category_id, current_user.id, db)

@router.put("/{category_id}", response_model=CategoryResponse)

def update_category(
    category_id: int,
    data: CategoryUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return update_category_service(category_id, data, current_user.id, db)

@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):

    return delete_category_service(category_id, current_user.id, db)