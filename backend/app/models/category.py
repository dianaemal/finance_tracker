from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Category(Base):
    """
    categories table defines the category of a transaction (utility, clothing, gas, etc.)
    - user_id is a FK which lets each user to define their cutom categories.
    """
    __tablename__ = "categories"
    id = Column(Integer, primary_key = True, index=True)
    # Foreign key: links to users.id
    user_id = Column(Integer, ForeignKey("users.id") )
    name = Column(String(300), nullable=False )

    #Relationship: Category -> User (many-to-one)
    user = relationship("User", back_populates="categories")
    #Relationship: Category -> Budget (one-to-many)
    budgets = relationship("Budget", back_populates="category", cascade="all, delete-orphan")
    #Relationship: Category -> Transaction (one-to-many)
    transactions = relationship("Transaction", back_populates="category")