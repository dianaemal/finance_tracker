
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional

class UserUpdate(BaseModel):
    """
    Schema for updating the user
    """
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    profile: Optional[str] = None


class UserResponse(BaseModel):
    """
    Schema for user responses.
    model_config enables reading from SQLAlchemy model instances.

    """

    model_config = ConfigDict(from_attributes=True)
    id: int 
    email: str 
    username: str
    is_active: bool

class PasswordUpdate(BaseModel):
    """
    to update password, we must have both current password and new one.
    """
    current_password: str
    new_password: str
