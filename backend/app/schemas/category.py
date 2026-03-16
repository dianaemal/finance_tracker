from pydantic import BaseModel, ConfigDict
from typing import Optional


class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    """Schema for creating a new category."""
    pass

class CategoryUpdate(BaseModel):
    """Schema for updating an existing category"""
    name: Optional[str] = None

class CategoryResponse(CategoryBase):
    """
    Schema for category responses.
    model_config enables reading from SQLAlchemy model instances.
    """
    model_config = ConfigDict(from_attributes=True)
    id: int
    



