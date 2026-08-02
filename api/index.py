import sys
import os

# Ensure the project root is on the path so backend modules resolve correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.calendar import router as calendar_router

app = FastAPI(
    title="Visites Calendar API",
    description="API for converting patient visit Excel files to ICS calendars.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calendar_router, prefix="/api", tags=["calendar"])

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
