from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class RefreshToken(Base):
     """
    RefreshToken model for secuerly storing refresh tokens.
    Each token belongs to exactly one user.
    
    """
    __tablename__ = "refersh_tokens"
    id = Column(Integer, primary_key = True, index=True)
    #Foreign key: links to users.id
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hash_token = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    #Relationship: RefreshToken -> User (many-to-one)
    user = Relationship("User", back_populates="refresh_tokens")
