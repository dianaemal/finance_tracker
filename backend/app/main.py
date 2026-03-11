from fastapi import FastAPI
from app.api.routes import auth
from app.db.session import engine
from app.db.base import Base

app = FastAPI()

# create database tables
Base.metadata.create_all(bind=engine)

app.include_router(auth.router)