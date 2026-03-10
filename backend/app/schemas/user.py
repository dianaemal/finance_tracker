
from pydantic import BaseModel, ConfigDict

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


