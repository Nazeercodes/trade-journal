from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class DirectionEnum(str, enum.Enum):
    LONG = "LONG"
    SHORT = "SHORT"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    trades = relationship("Trade", back_populates="owner", cascade="all, delete")

class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symbol = Column(String, nullable=False)
    direction = Column(Enum(DirectionEnum), nullable=False)
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    pnl = Column(Float, nullable=False)
    notes = Column(Text, default="")
    emotion = Column(String, default="Neutral")
    trade_date = Column(String, nullable=False)
    ai_analysis = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="trades")
