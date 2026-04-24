from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, RefreshRequest, TokenResponse, LogoutRequest
from app.services import auth_services
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserResponse, status_code=201)
def register_user(data: RegisterRequest, db: Session = Depends(get_db)):

    try:
        user = auth_services.register_user(data, db)
        
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

   
    user = auth_services.authenticate_user(data, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
            )
    tokens = auth_services.create_tokens(user, db)
    return tokens





@router.post("/refresh", response_model=TokenResponse)
def refersh(data: RefreshRequest, db: Session = Depends(get_db)):
    if not data.refresh_token:
        raise HTTPException(status_code=401, detail="No refersh token.")
    try:
        tokens = auth_services.refresh_access_token(data.refresh_token, db)
        return tokens
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/logout")
def logout(data: LogoutRequest, db: Session = Depends(get_db)):
    if data.refresh_token:
        auth_services.logout_user(data.refresh_token, db)
    return {"message": "Logged out successfully"}



    






