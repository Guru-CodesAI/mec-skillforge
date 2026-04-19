@echo off
echo Starting SkillForge Backend...
cd backend
if not exist .env (
    copy .env.example .env
    echo Created .env from .env.example - please update GITHUB_TOKEN
)
if not exist venv (
    python -m venv venv
    echo Created virtual environment
)
call venv\Scripts\activate
pip install -r requirements.txt -q
uvicorn main:app --reload --port 8000
