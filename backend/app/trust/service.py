from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models import User, GitHubProfile, TrustScore

EXPERIENCE_WEIGHTS = {"junior": 0.3, "mid": 0.6, "senior": 1.0}


async def calculate_trust_score(user_id: int, db: AsyncSession) -> TrustScore:
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one()

    gh_result = await db.execute(select(GitHubProfile).where(GitHubProfile.user_id == user_id))
    gh = gh_result.scalar_one_or_none()

    github_score = 0.0
    if gh:
        repo_score = min(10.0, gh.repo_count / 5)
        activity_score = gh.commit_activity
        github_score = (repo_score * 0.5 + activity_score * 0.5)

    completeness = sum([
        bool(user.name),
        bool(user.email),
        bool(user.github_username),
        bool(user.experience_level),
    ]) / 4 * 10

    raw_score = github_score * 0.7 + completeness * 0.3
    score = round(min(10.0, raw_score), 2)
    confidence = "High" if score >= 7 else "Medium" if score >= 4 else "Low"

    ts_result = await db.execute(select(TrustScore).where(TrustScore.user_id == user_id))
    ts = ts_result.scalar_one_or_none()
    if ts:
        ts.score = score
        ts.confidence_level = confidence
    else:
        ts = TrustScore(user_id=user_id, score=score, confidence_level=confidence)
        db.add(ts)

    await db.commit()
    await db.refresh(ts)
    return ts
