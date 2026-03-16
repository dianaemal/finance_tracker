from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.core.config import settings
from fastapi import HTTPException, Depends, status

def get_category_service(
    category_id: int,
    current_user: int,
    db: Session
):
    category = db.query(Category).filter(
        Category.user_id == current_user,
        Category.id == category_id
    ).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return category

def create_category_service(
    data: CategoryCreate,
    current_user: int,
    db: Session
):
    db_category = Category(
        user_id = current_user,
        name = data.name
    )

    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category_service(
    category_id: int,
    data: CategoryUpdate,
    current_user: int,
    db: Session
):

    category = get_category_service(category_id, current_user, db)
    category.name = data.name
    db.commit()
    db.refresh(category)
    return category


def list_categories(
    current_user: int,
    db: Session
):

    categories = db.query(Category).filter(
        Category.user_id == current_user,
    ).all()
    return categories

def delete_category_service(
    category_id: int,
    current_user: int,
    db: Session
):

    category = get_category_service(category_id, current_user, db)
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully."}


    

