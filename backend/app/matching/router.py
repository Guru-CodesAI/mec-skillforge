from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.db import get_db
from app.database.models import User, GitHubProfile, Skill, TrustScore
from app.auth.dependencies import get_current_user
from app.ai_engine.matcher import compute_matches

router = APIRouter(prefix="/matching", tags=["matching"])


async def build_user_data(user: User, db: AsyncSession) -> dict:
    gh = (await db.execute(select(GitHubProfile).where(GitHubProfile.user_id == user.id))).scalar_one_or_none()
    skills = (await db.execute(select(Skill).where(Skill.user_id == user.id))).scalars().all()
    ts = (await db.execute(select(TrustScore).where(TrustScore.user_id == user.id))).scalar_one_or_none()
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "experience_level": user.experience_level,
        "github_username": user.github_username,
        "commit_activity": gh.commit_activity if gh else 0,
        "trust_score": ts.score if ts else 0,
        "skills": [{"skill_name": s.skill_name, "score": s.score} for s in skills],
    }


@router.get("/recommendations")
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    all_users = (await db.execute(select(User).where(User.id != current_user.id))).scalars().all()
    current_data = await build_user_data(current_user, db)
    candidates = [await build_user_data(u, db) for u in all_users]
    matches = compute_matches(current_data, candidates)
    return {"matches": matches[:10]}
