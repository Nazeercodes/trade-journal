# AI Trade Journal

Log your trades, track P&L, and get AI-powered insights.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS (planned)
- **Backend**: Python + FastAPI
- **Database**: SQLite (Local) / PostgreSQL (Production)
- **AI**: Google Gemini (gemini-2.0-flash)
- **Auth**: JWT (OAuth2 with Password Flow)

## Features

- **Trade Logging**: Record entry/exit prices, symbols, and emotions.
- **AI Analysis**: Get instant feedback on individual trades.
- **Portfolio Insights**: Analyze patterns across your last 20 trades.
- **Dashboard**: Track total P&L, win rate, and recent activity.

## Getting Started

### Backend
```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env # Add your GEMINI_API_KEY
uvicorn app.main:app --reload
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Deployment

- **Backend**: Railway (Add environment variables from `.env`)
- **Frontend**: Vercel (Set `VITE_API_URL` to your backend URL)
