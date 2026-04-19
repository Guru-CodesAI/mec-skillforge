from fastapi import APIRouter, Depends, HTTPException, Response, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database.db import get_db
from app.database.models import User, UserRole
from app.auth.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.auth.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    github_username: str | None = None
    experience_level: str = "junior"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    is_prod = settings.ENVIRONMENT == "production"
    response.set_cookie(
        "access_token", access_token,
        httponly=True,
        samesite="none" if is_prod else "lax",
        secure=is_prod,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    response.set_cookie(
        "refresh_token", refresh_token,
        httponly=True,
        samesite="none" if is_prod else "lax",
        secure=is_prod,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
    )


@router.post("/register", status_code=201)
@limiter.limit("5/minute")
async def register(request: Request, body: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
        github_username=body.github_username,
        experience_level=body.experience_level,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    set_auth_cookies(response, create_access_token(user.id, user.role), create_refresh_token(user.id))
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}


@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    set_auth_cookies(response, create_access_token(user.id, user.role), create_refresh_token(user.id))
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}


@router.post("/refresh")
async def refresh(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token")
    result = await db.execute(select(User).where(User.id == int(payload["sub"])))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    set_auth_cookies(response, create_access_token(user.id, user.role), create_refresh_token(user.id))
    return {"message": "Tokens refreshed"}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "experience_level": current_user.experience_level,
        "github_username": current_user.github_username,
        "created_at": current_user.created_at,
    }

