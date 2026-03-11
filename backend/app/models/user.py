from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime, timedelta
from app.db.base_class import Base
from sqlalchemy.orm import relationship
from app.models.refresh_token import RefreshToken

class User(Base):
    """
    User model for authentication.

    Attributes:
        id: Primary key
        email: Unique email address (used as username)
        username: user's name
        hashed_password: Password hash (never store plain passwords!)
        is_active: Whether the user account is active
        profile: user profile picture
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key = True, index = True)
    email = Column(String(255), unique = True, index = True, nullable = False)
    username = Column(String(300), index = True, nullable = False)
    hashed_password = Column(String(255), nullable = False)
    profile = Column(String)
    is_active = Column(Boolean, default =True)
    created_at = Column(DateTime(timezone=True), default = datetime.utcnow)

    # Relationship: User -> RefreashToken (one-to-many)
    # back_populates links to the 'user' attribute on Task
    #cascade: delete all the refersh tokens when the parent (user) instance gets deleted.
    refresh_tokens = relationship(RefreshToken, back_populates="user", cascade="all, delete-orphan")


    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"






