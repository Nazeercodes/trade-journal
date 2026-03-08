from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/trades", tags=["Trades"])

def calculate_pnl(direction: str, entry: float, exit_price: float, qty: float) -> float:
    if direction == "LONG":
        return round((exit_price - entry) * qty, 2)
    else:
        return round((entry - exit_price) * qty, 2)

@router.post("/", status_code=201)
def create_trade(
    trade: schemas.TradeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    pnl = calculate_pnl(trade.direction, trade.entry_price, trade.exit_price, trade.quantity)
    db_trade = models.Trade(
        user_id=current_user.id,
        symbol=trade.symbol.upper(),
        direction=trade.direction,
        entry_price=trade.entry_price,
        exit_price=trade.exit_price,
        quantity=trade.quantity,
        pnl=pnl,
        notes=trade.notes or "",
        emotion=trade.emotion or "Neutral",
        trade_date=trade.trade_date,
        ai_analysis=""
    )
    db.add(db_trade)
    db.commit()
    db.refresh(db_trade)
    return db_trade

@router.get("/", response_model=List[dict])
def get_trades(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    trades = db.query(models.Trade).filter(
        models.Trade.user_id == current_user.id
    ).order_by(models.Trade.trade_date.desc()).all()
    
    result = []
    for t in trades:
        result.append({
            "id": t.id,
            "user_id": t.user_id,
            "symbol": t.symbol,
            "direction": t.direction.value if hasattr(t.direction, 'value') else t.direction,
            "entry_price": t.entry_price,
            "exit_price": t.exit_price,
            "quantity": t.quantity,
            "pnl": t.pnl,
            "notes": t.notes,
            "emotion": t.emotion,
            "trade_date": t.trade_date,
            "ai_analysis": t.ai_analysis,
            "created_at": str(t.created_at)
        })
    return result

@router.get("/{trade_id}")
def get_trade(
    trade_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    trade = db.query(models.Trade).filter(
        models.Trade.id == trade_id,
        models.Trade.user_id == current_user.id
    ).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade

@router.put("/{trade_id}")
def update_trade(
    trade_id: int,
    trade_update: schemas.TradeUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    trade = db.query(models.Trade).filter(
        models.Trade.id == trade_id,
        models.Trade.user_id == current_user.id
    ).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    update_data = trade_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(trade, key, value)
    
    # Recalculate P&L if price fields changed
    pnl = calculate_pnl(
        trade.direction.value if hasattr(trade.direction, 'value') else trade.direction,
        trade.entry_price,
        trade.exit_price,
        trade.quantity
    )
    trade.pnl = pnl
    
    db.commit()
    db.refresh(trade)
    return trade

@router.delete("/{trade_id}", status_code=204)
def delete_trade(
    trade_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    trade = db.query(models.Trade).filter(
        models.Trade.id == trade_id,
        models.Trade.user_id == current_user.id
    ).first()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    db.delete(trade)
    db.commit()
