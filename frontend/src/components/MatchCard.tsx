import type { Match } from '../types'
import SkillBar from './SkillBar'
import styles from './MatchCard.module.css'

interface Props { match: Match; featured?: boolean }

export default function MatchCard({ match, featured = false }: Props) {
  const initials = match.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const score = match.compatibility_score
  const scoreColor = score >= 85 ? 'var(--success)' : score >= 65 ? 'var(--cyan)' : score >= 45 ? 'var(--gold)' : 'var(--on-surface-dim)'

  return (
    <div className={`${styles.card} ${featured ? styles.featured : ''} scan-card`}>
      {featured && <div className={styles.featuredGlow} />}

      <div className={styles.header}>
        <div className={styles.avatarRing} style={{ background: featured ? 'linear-gradient(135deg,var(--cyan),var(--violet-bright))' : 'rgba(0,240,255,0.1)' }}>
          <div className={styles.avatar}>{initials}</div>
        </div>
        <div className={styles.info}>
          <h3 className={`font-display ${styles.name}`}>{match.name}</h3>
          <span className={styles.level}>{match.experience_level}</span>
          {match.github_username && (
            <span className={styles.github}>@{match.github_username}</span>
          )}
        </div>
        <div className={styles.scoreWrap}>
          <span className={`font-display ${styles.score}`} style={{ color: scoreColor }}>{score}%</span>
          <span className={styles.scoreLabel}>match</span>
        </div>
      </div>

      <div className={styles.chips}>
        {match.top_skills.map(s => <span key={s} className="chip">{s}</span>)}
      </div>

      {featured && match.skills.slice(0, 3).map(s => (
        <SkillBar key={s.skill_name} label={s.skill_name} value={s.score} />
      ))}

      <p className={styles.explanation}>{match.explanation}</p>

      <a href={`mailto:${match.email}`} className={`${featured ? 'btn-primary' : 'btn-ghost'} ${styles.contactBtn}`}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
        Contact Teammate
      </a>
    </div>
  )
}
