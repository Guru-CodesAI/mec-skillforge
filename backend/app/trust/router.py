from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.db import get_db
from app.database.models import TrustScore
from app.auth.dependencies import get_current_user
from app.database.models import User
from app.trust.service import calculate_trust_score

router = APIRouter(prefix="/trust", tags=["trust"])


@router.get("/score")
async def get_trust_score(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TrustScore).where(TrustScore.user_id == current_user.id))
    ts = result.scalar_one_or_none()
    if not ts:
        ts = await calculate_trust_score(current_user.id, db)
    return {"score": ts.score, "confidence_level": ts.confidence_level}
