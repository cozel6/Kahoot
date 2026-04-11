from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title= "Kahoot Clone API",
    version= "0.1.0",
   description= "Backend pentru jocul Kahoot Clone (proiect Rețele de calculatoare).",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins= settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router)
