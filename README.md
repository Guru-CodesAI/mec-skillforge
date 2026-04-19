# SkillForge — AI Hackathon Teammate Finder

AI-powered platform to find hackathon teammates using GitHub skill verification, trust scoring, and TF-IDF compatibility matching.

## Stack
- **Frontend:** React + TypeScript + Vite
- **Backend:** FastAPI (Python)
- **AI:** scikit-learn TF-IDF + cosine similarity
- **DB:** SQLite (dev) / PostgreSQL (prod)

## Local Development

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # add your GITHUB_TOKEN
uvicorn main:app --reload --port 8001
```

### Frontend
```bash
cd frontend
npm install
npm run dev -- --port 3001
```

## Deploy
- Frontend → Vercel (root: `frontend`, build: `npm run build`, output: `dist`)
- Backend → Railway / Render (root: `backend`, start: `uvicorn main:app --host 0.0.0.0 --port $PORT`)
