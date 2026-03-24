from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class Account(Base):
    """
    account table specifies the type of account (checking, saving, credit, etc)

    """
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    balance = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    #Relationship: Account -> User (many-to-one)
    user = relationship("User", back_populates="accounts")

    #Relationship: Account -> Transaction (one-to-many)
    transactions = relationship("Transaction", back_populates="account")
