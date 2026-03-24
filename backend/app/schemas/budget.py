from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.category import CategoryResponse
class BudgetBase(BaseModel):

    category_id: Optional[int] = None
    month: int
    year: int
    amount: float

class BudgetCreate(BudgetBase):
    """Schema for creating a new budget."""
    pass

class BudgetUpdate(BaseModel):
    """Schema for updating an existing budget."""
    category_id: Optional[int] = None
    month: Optional[int] = None
    year: Optional[int] = None
    amount: Optional[float] = None

class BudgetResponse(BudgetBase):
    """
    Schema for budget responses.

    model_config enables reading from SQLAlchemy model instances.
    """
    model_config = ConfigDict(from_attributes=True)
    id: int
    category: CategoryResponse





