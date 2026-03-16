from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.category import CategoryResponse
from app.schemas.account import AccountResponse

class TransactionBase(BaseModel):

    category_id: int
    aacount_id: int
    type: str
    ammount: int
    date: datetime
    description: Optional[str] = None


class TransactionCreate(TransactionBase):
    """Schema for creating a new transactiont."""
    pass

class TransactionUpdate(BaseModel):
    """Schema for updating an existing transaction."""
    category_id: Optional[int] = None
    aacount_id: Optional[int] = None
    type: Optional[str] = None
    ammount: Optional[int] = None
    date: Optional[datetime] = None
    description: Optional[str] = None

class TransactionResponse(TransactionBase):
    """
    Schema for transaction responses.

    model_config enables reading from SQLAlchemy model instances.
    """
    model_config = ConfigDict(from_attributes=True)
    id: int
    category: CategoryResponse
    account: AccountResponse



