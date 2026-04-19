from datetime import datetime, timezone
import httpx
from app.config import settings

GITHUB_API = "https://api.github.com"
HEADERS = {"Authorization": f"token {settings.GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}


async def fetch_github_data(username: str) -> dict:
    async with httpx.AsyncClient(timeout=15) as client:
        user_resp = await client.get(f"{GITHUB_API}/users/{username}", headers=HEADERS)
        if user_resp.status_code == 404:
            return {}
        user_data = user_resp.json()

        repos_resp = await client.get(
            f"{GITHUB_API}/users/{username}/repos",
            headers=HEADERS,
            params={"per_page": 100, "sort": "pushed"},
        )
        repos = repos_resp.json() if repos_resp.status_code == 200 else []

    languages: dict[str, int] = {}
    commit_activity = 0.0

    for repo in repos:
        if isinstance(repo, dict) and repo.get("language"):
            lang = repo["language"]
            languages[lang] = languages.get(lang, 0) + 1

    total_repos = len(repos)
    pushed_at = user_data.get("updated_at")
    last_active = datetime.fromisoformat(pushed_at.replace("Z", "+00:00")) if pushed_at else None

    if last_active:
        days_since = (datetime.now(timezone.utc) - last_active).days
        commit_activity = max(0.0, 10.0 - (days_since / 30))

    return {
        "repo_count": total_repos,
        "languages": languages,
        "commit_activity": round(commit_activity, 2),
        "last_active": last_active,
    }


def compute_skill_scores(languages: dict[str, int], total_repos: int) -> list[dict]:
    if not languages or total_repos == 0:
        return []
    return [
        {"skill_name": lang, "score": round(min(10.0, (count / total_repos) * 10), 2)}
        for lang, count in sorted(languages.items(), key=lambda x: x[1], reverse=True)
    ]
