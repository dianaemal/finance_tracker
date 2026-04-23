from pydantic import BaseModel, ConfigDict
from typing import Optional
# import date as DateType to not get confused with the date filed in the transaction model
from datetime import date as DateType
from app.schemas.category import CategoryResponse
from app.schemas.account import AccountResponse

class TransactionBase(BaseModel):

    category_id: int
    account_id: int
    type: str
    amount: float
    date: DateType
    description: Optional[str] = None


class TransactionCreate(TransactionBase):
    """Schema for creating a new transactiont."""
    pass

class TransactionUpdate(BaseModel):
    """Schema for updating an existing transaction."""
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    type: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[DateType] = None
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



class TransactionListResponse(BaseModel):
    items: list[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int