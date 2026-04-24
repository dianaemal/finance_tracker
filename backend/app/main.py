from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth
from app.db.session import engine
from app.db.base import Base
from app.api.routes import account
from app.api.routes import user
from app.api.routes import category
from app.api.routes import budget 
from app.api.routes import transaction
from app.services.category_services import seed_categories
from app.db.session import SessionLocal
app = FastAPI()

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_categories(db)
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://finance-tracker-black-xi.vercel.app"], 
    allow_credentials=True,  
    allow_methods=["POST", "PUT", "GET", "DELETE"],     
    allow_headers=["Content-Type"],
)
# create database tables
#Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(account.router)
app.include_router(user.router)
app.include_router(category.router)
app.include_router(budget.router)
app.include_router(transaction.router)