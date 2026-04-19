from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database.db import get_db
from app.database.models import User, GitHubProfile, TrustScore
from app.auth.dependencies import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    users = (await db.execute(select(User))).scalars().all()
    result = []
    for u in users:
        ts = (await db.execute(select(TrustScore).where(TrustScore.user_id == u.id))).scalar_one_or_none()
        gh = (await db.execute(select(GitHubProfile).where(GitHubProfile.user_id == u.id))).scalar_one_or_none()
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "experience_level": u.experience_level,
            "github_username": u.github_username,
            "created_at": u.created_at,
            "trust_score": ts.score if ts else None,
            "trust_confidence": ts.confidence_level if ts else None,
            "github_verified": gh is not None,
            "repo_count": gh.repo_count if gh else 0,
        })
    return result


@router.delete("/users/{user_id}")
async def remove_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()
    return {"message": "User removed"}
