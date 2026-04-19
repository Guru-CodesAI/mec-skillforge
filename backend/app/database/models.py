import enum
from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, Enum, JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.db import Base


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


class ExperienceLevel(str, enum.Enum):
    junior = "junior"
    mid = "mid"
    senior = "senior"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.user)
    experience_level: Mapped[ExperienceLevel] = mapped_column(
        Enum(ExperienceLevel), default=ExperienceLevel.junior
    )
    github_username: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    github_profile: Mapped["GitHubProfile | None"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    skills: Mapped[list["Skill"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    trust_score: Mapped["TrustScore | None"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class GitHubProfile(Base):
    __tablename__ = "github_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    repo_count: Mapped[int] = mapped_column(Integer, default=0)
    languages: Mapped[dict] = mapped_column(JSON, default=dict)
    commit_activity: Mapped[float] = mapped_column(Float, default=0.0)
    last_active: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship(back_populates="github_profile")


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    skill_name: Mapped[str] = mapped_column(String(100))
    score: Mapped[float] = mapped_column(Float, default=0.0)

    user: Mapped["User"] = relationship(back_populates="skills")


class TrustScore(Base):
    __tablename__ = "trust_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    score: Mapped[float] = mapped_column(Float, default=0.0)
    confidence_level: Mapped[str] = mapped_column(String(20), default="Low")

    user: Mapped["User"] = relationship(back_populates="trust_score")
