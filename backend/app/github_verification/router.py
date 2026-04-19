from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database.db import get_db
from app.database.models import User, GitHubProfile, Skill
from app.auth.dependencies import get_current_user
from app.github_verification.service import fetch_github_data, compute_skill_scores
from app.trust.service import calculate_trust_score

router = APIRouter(prefix="/github", tags=["github"])


@router.post("/verify")
async def verify_github(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.github_username:
        raise HTTPException(status_code=400, detail="No GitHub username set")

    data = await fetch_github_data(current_user.github_username)
    if not data:
        raise HTTPException(status_code=404, detail="GitHub user not found")

    result = await db.execute(select(GitHubProfile).where(GitHubProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if profile:
        profile.repo_count = data["repo_count"]
        profile.languages = data["languages"]
        profile.commit_activity = data["commit_activity"]
        profile.last_active = data["last_active"]
    else:
        profile = GitHubProfile(user_id=current_user.id, **data)
        db.add(profile)

    await db.execute(delete(Skill).where(Skill.user_id == current_user.id))
    skill_scores = compute_skill_scores(data["languages"], data["repo_count"])
    for s in skill_scores:
        db.add(Skill(user_id=current_user.id, **s))

    await db.commit()
    await calculate_trust_score(current_user.id, db)

    return {"message": "GitHub verified", "repo_count": data["repo_count"], "languages": data["languages"]}


@router.get("/profile")
async def get_github_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(GitHubProfile).where(GitHubProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="GitHub not verified yet")
    return profile
