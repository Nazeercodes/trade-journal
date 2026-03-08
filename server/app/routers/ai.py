from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models
from app.database import get_db
from app.auth import get_current_user
from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI"])

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your-gemini-api-key-here":
        raise HTTPException(status_code=503, detail="Gemini API key not configured. Add GEMINI_API_KEY to your .env file.")
    return genai.Client(api_key=api_key)

@router.post("/analyze/{trade_id}")
def analyze_trade(
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

    client = get_gemini_client()
    direction = trade.direction.value if hasattr(trade.direction, 'value') else trade.direction
    outcome = "profit" if trade.pnl > 0 else "loss"

    prompt = f"""You are an expert trading coach. Analyze this trade and provide concise, actionable feedback.

Trade Details:
- Symbol: {trade.symbol}
- Direction: {direction}
- Entry Price: {trade.entry_price}
- Exit Price: {trade.exit_price}
- Quantity: {trade.quantity}
- P&L: ${trade.pnl} ({outcome})
- Trader's Emotion: {trade.emotion}
- Trader's Notes: "{trade.notes or 'No notes provided'}"
- Date: {trade.trade_date}

Provide a structured analysis with:
1. What went well (if anything)
2. What went wrong or could be improved
3. Psychological/emotional assessment
4. One specific tip for similar trades in the future

Keep your response concise (under 200 words) and practical."""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        analysis = response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    trade.ai_analysis = analysis
    db.commit()

    return {"analysis": analysis}

@router.get("/insights")
def get_portfolio_insights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    trades = db.query(models.Trade).filter(
        models.Trade.user_id == current_user.id
    ).order_by(models.Trade.trade_date.desc()).limit(20).all()

    if not trades:
        raise HTTPException(status_code=404, detail="No trades found to analyze")

    client = get_gemini_client()
    total_pnl = sum(t.pnl for t in trades)
    wins = [t for t in trades if t.pnl > 0]
    losses = [t for t in trades if t.pnl <= 0]
    win_rate = round(len(wins) / len(trades) * 100, 1)

    trade_summary = "\n".join([
        f"- {t.symbol} {t.direction.value if hasattr(t.direction, 'value') else t.direction}: P&L ${t.pnl}, Emotion: {t.emotion}"
        for t in trades
    ])

    prompt = f"""You are an expert trading psychologist and performance coach. Analyze this trader's recent performance.

Summary Stats:
- Total Trades Analyzed: {len(trades)}
- Total P&L: ${total_pnl:.2f}
- Win Rate: {win_rate}%
- Winning Trades: {len(wins)}
- Losing Trades: {len(losses)}

Recent Trades:
{trade_summary}

Provide a behavioral and performance analysis with:
1. Key patterns you notice (good or bad)
2. Emotional patterns affecting performance
3. Specific strengths to build on
4. Top 2 areas to improve immediately

Keep it under 250 words, be direct and actionable."""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        insights = response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI insights failed: {str(e)}")

    return {
        "insights": insights,
        "stats": {
            "total_trades": len(trades),
            "total_pnl": total_pnl,
            "win_rate": win_rate,
            "wins": len(wins),
            "losses": len(losses)
        }
    }
