from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database.db import get_db
from app.database.models import User, ExperienceLevel
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


class ProfileUpdate(BaseModel):
    name: str | None = None
    github_username: str | None = None
    experience_level: ExperienceLevel | None = None


@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.refresh(current_user, ["github_profile", "skills", "trust_score"])
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "experience_level": current_user.experience_level,
        "github_username": current_user.github_username,
        "created_at": current_user.created_at,
        "github_profile": current_user.github_profile,
        "skills": current_user.skills,
        "trust_score": current_user.trust_score,
    }


@router.patch("/profile")
async def update_profile(
    body: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    await db.commit()
    await db.refresh(current_user)
    return {"message": "Profile updated"}
