from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.routers import auth, trades, ai

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Trade Journal API",
    description="Log your trades, track P&L, and get AI-powered insights.",
    version="1.0.0"
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(trades.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {"message": "AI Trade Journal API is running 🚀"}
