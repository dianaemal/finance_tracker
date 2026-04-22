from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
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
    tokens =  auth_services.create_tokens(user, db)
    response = JSONResponse(content={"message": "Login successful"})
    response.set_cookie(
        key="access_token",
        value=tokens.access_token,
        httponly=True,
        secure=False,      # True in production
        samesite="lax",
        max_age=30 * 6
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        httponly=True,
        secure=False,     
        samesite="lax",
        
    )
    return response





@router.post("/refresh")
def refersh(request: Request, db: Session = Depends(get_db)):

    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refersh token.")
    try:
        tokens = auth_services.refresh_access_token(refresh_token, db)
        response = JSONResponse(content={"message": "refreshed"})
        response.set_cookie(
            key="access_token",
            value=tokens.access_token,
            httponly=True,
            secure=False,      # True in production
            samesite="lax",
            max_age=30 * 6
        )
        response.set_cookie(
            key="refresh_token",
            value=tokens.refresh_token,
            httponly=True,
            secure=False,     
            samesite="lax",
            
        )
        return response

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail= str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/logout")
def logout(request: Request, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")

    if refresh_token:
        auth_services.logout_user(refresh_token, db)

    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return response



    






