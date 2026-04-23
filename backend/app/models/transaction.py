from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime
class Transaction(Base):
    """
    Attributes:
        user_id: Is a foreign key that links to users table
        category_id: Is a foreign key that links to categories table
        type: type of transaction which is either expense or income.
        ammount: ammount of transaction.
        date: date of transaction
    """
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    type = Column(String(50), nullable=False)  
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    #Relationship: Transaction -> User (many-to-one)
    user = relationship("User", back_populates="transactions")
    #Relationship: Transaction -> Category (many-to-one)
    category = relationship("Category", back_populates="transactions")
    #Relationship: Transaction -> Account (many-to-one)
    account = relationship("Account", back_populates="transactions")
