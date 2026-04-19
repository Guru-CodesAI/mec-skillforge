export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  experience_level: 'junior' | 'mid' | 'senior'
  github_username: string | null
  created_at: string
}

export interface GitHubProfile {
  repo_count: number
  languages: Record<string, number>
  commit_activity: number
  last_active: string | null
}

export interface Skill {
  id: number
  skill_name: string
  score: number
}

export interface TrustScore {
  score: number
  confidence_level: 'High' | 'Medium' | 'Low'
}

export interface UserProfile extends User {
  github_profile: GitHubProfile | null
  skills: Skill[]
  trust_score: TrustScore | null
}

export interface Match {
  id: number
  name: string
  email: string
  experience_level: string
  github_username: string | null
  commit_activity: number
  trust_score: number
  skills: Skill[]
  compatibility_score: number
  explanation: string
  top_skills: string[]
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  experience_level: string
  github_username: string | null
  created_at: string
  trust_score: number | null
  trust_confidence: string | null
  github_verified: boolean
  repo_count: number
}
