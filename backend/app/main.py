from fastapi import FastAPI
from app.api.routes import auth
from app.db.session import engine
from app.db.base import Base
from app.api.routes import account
from app.api.routes import user

app = FastAPI()

# create database tables
Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(account.router)
app.include_router(user.router)