from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Trade Schemas ---
class DirectionEnum(str, Enum):
    LONG = "LONG"
    SHORT = "SHORT"

class TradeCreate(BaseModel):
    symbol: str
    direction: DirectionEnum
    entry_price: float
    exit_price: float
    quantity: float
    notes: Optional[str] = ""
    emotion: Optional[str] = "Neutral"
    trade_date: str

class TradeUpdate(BaseModel):
    symbol: Optional[str] = None
    direction: Optional[DirectionEnum] = None
    entry_price: Optional[float] = None
    exit_price: Optional[float] = None
    quantity: Optional[float] = None
    notes: Optional[str] = None
    emotion: Optional[str] = None
    trade_date: Optional[str] = None

class TradeOut(BaseModel):
    id: int
    user_id: int
    symbol: str
    direction: str
    entry_price: float
    exit_price: float
    quantity: float
    pnl: float
    notes: str
    emotion: str
    trade_date: str
    ai_analysis: str
    created_at: str

    class Config:
        from_attributes = True
