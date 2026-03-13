from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
class AccountBase(BaseModel):
   
    name: str
    balance: float

class AccountCreate(AccountBase):
    """Schema for creating a new account."""
    pass

class AccountUpdate(BaseModel):
    """Schema for updating an existing account."""
    name: Optional[str] = None
    balance: Optional[float] = None

class Account(AccountBase):
     """
    Schema for account responses.

    Now includes user_id to show account ownership.
    model_config enables reading from SQLAlchemy model instances.
    """
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    user_id: int



