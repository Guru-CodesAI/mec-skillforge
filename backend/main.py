from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.database.db import init_db
from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.github_verification.router import router as github_router
from app.trust.router import router as trust_router
from app.matching.router import router as matching_router
from app.admin.router import router as admin_router

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="SkillForge API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(github_router, prefix="/api")
app.include_router(trust_router, prefix="/api")
app.include_router(matching_router, prefix="/api")
app.include_router(admin_router, prefix="/api")


@app.on_event("startup")
async def startup():
    await init_db()


@app.get("/api/health")
async def health():
    return {"status": "ok"}
