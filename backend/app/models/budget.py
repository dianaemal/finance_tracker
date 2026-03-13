from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Budget(Base):
    """
    Budget table let's the users to set a monthly or per category budgets.
    """
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    # if category_id is set to null then it is a monthly budget.
    category_id = Column(Integer, ForeignKey("categories.id"), nullable = True)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    ammount = Column(Float, nullable=False)

    #Relationship: Budget -> User (many-to-one)
    user = relationship("User", back_populates="budgets")
    #Relationship: Budget -> Category (many-to-one)
    category = relationship("Category", back_populates="budgets")