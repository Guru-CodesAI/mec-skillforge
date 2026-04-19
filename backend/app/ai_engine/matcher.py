import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

EXPERIENCE_MAP = {"junior": 0.25, "mid": 0.5, "senior": 1.0}


def build_skill_text(skills: list[dict]) -> str:
    return " ".join(
        f"{s['skill_name']} " * max(1, int(s["score"]))
        for s in skills
    )


def compute_matches(current_user_data: dict, candidates: list[dict]) -> list[dict]:
    if not candidates:
        return []

    all_texts = [build_skill_text(current_user_data.get("skills", []))] + [
        build_skill_text(c.get("skills", [])) for c in candidates
    ]

    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        skill_sims = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    except ValueError:
        skill_sims = np.zeros(len(candidates))

    current_activity = current_user_data.get("commit_activity", 0) / 10
    current_trust = current_user_data.get("trust_score", 0) / 10
    current_exp = EXPERIENCE_MAP.get(current_user_data.get("experience_level", "junior"), 0.25)

    results = []
    for i, candidate in enumerate(candidates):
        cand_activity = candidate.get("commit_activity", 0) / 10
        cand_trust = candidate.get("trust_score", 0) / 10
        cand_exp = EXPERIENCE_MAP.get(candidate.get("experience_level", "junior"), 0.25)

        activity_sim = 1 - abs(current_activity - cand_activity)
        trust_sim = 1 - abs(current_trust - cand_trust)
        exp_sim = 1 - abs(current_exp - cand_exp)

        score = (
            0.40 * float(skill_sims[i])
            + 0.25 * activity_sim
            + 0.20 * trust_sim
            + 0.15 * exp_sim
        )

        top_skills = sorted(candidate.get("skills", []), key=lambda x: x["score"], reverse=True)[:3]
        explanation = (
            f"Skill overlap: {skill_sims[i]:.0%}, "
            f"Activity match: {activity_sim:.0%}, "
            f"Trust alignment: {trust_sim:.0%}"
        )

        results.append({
            **candidate,
            "compatibility_score": round(score * 100, 1),
            "explanation": explanation,
            "top_skills": [s["skill_name"] for s in top_skills],
        })

    return sorted(results, key=lambda x: x["compatibility_score"], reverse=True)
