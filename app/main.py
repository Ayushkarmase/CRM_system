import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import tickets, ai

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DeskFlow API",
    description="Production-ready REST API for DeskFlow Customer Support Operations CRM.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [
    frontend_url.rstrip("/"),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

# If ALLOW_ALL_CORS is true, allow all origins
if os.getenv("ALLOW_ALL_CORS", "true").lower() == "true":
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets.router)
app.include_router(ai.router)


@app.get("/", tags=["Health"])
def read_root():
    return {
        "name": "DeskFlow API",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
