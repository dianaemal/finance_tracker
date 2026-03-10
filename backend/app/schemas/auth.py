
from pydantic import BaseModel, ConfigDict, Field, EmailStr

class RegisterRequest(BaseModel):
     """
    Schema for user registration.
    EmailStr validates that the email format is correct.
    Password minimum length is enforced via Field constraints.
    """
    email : EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")

class LoginRequest(BaseModel):

    """
    Schema for JSON-based login.

    Used by the /login endpoint as an alternative to the OAuth2
    form-based /token endpoint.
    """
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

class TokenResponse(BaseModel):
    """
    Schema for JWT token response.

    OAuth2 specification requires 'access_token' and 'token_type' fields.
    """
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

