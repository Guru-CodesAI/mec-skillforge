import { useEffect, useState } from 'react'
import { matchingService } from '../services/skillforge'
import type { Match } from '../types'
import MatchCard from '../components/MatchCard'
import Navbar from '../components/Navbar'
import styles from './MatchPage.module.css'

export default function MatchPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const r = await matchingService.getRecommendations()
      setMatches(r.data.matches)
    } catch {
      setError('Failed to load. Ensure your GitHub is verified first.')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const [top, ...rest] = matches

  return (
    <>
      <Navbar />
      <div className="bg-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}><span className={styles.dot} />AI Engine Active</p>
            <h1 className={`font-display ${styles.title}`}>
              Synergy <span className="gradient-text">Matches</span>
            </h1>
            <p className={styles.sub}>Multidimensional compatibility analysis · Skill overlap · Trust alignment · Activity score</p>
          </div>
          <div className={styles.controls}>
            <div className={styles.countBox}>
              <span className={styles.countLabel}>Candidates</span>
              <span className={`font-display ${styles.countVal}`}>{matches.length}</span>
            </div>
            <button onClick={load} className={`btn-ghost ${styles.refreshBtn}`} title="Refresh">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
            </button>
          </div>
        </div>

        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.loadingRing} />
            <p>Running AI compatibility analysis...</p>
          </div>
        )}

        {error && <div className={styles.errorBox}><span className="material-symbols-outlined" style={{fontSize:18}}>error</span>{error}</div>}

        {!loading && !error && matches.length === 0 && (
          <div className={styles.emptyState}>
            <span className="material-symbols-outlined" style={{fontSize:48, color:'var(--on-surface-dim)'}}>group_off</span>
            <p>No candidates yet. More developers need to join the network.</p>
          </div>
        )}

        {!loading && matches.length > 0 && (
          <div className={styles.grid}>
            {top && <div className={styles.featured}><MatchCard match={top} featured /></div>}
            <div className={styles.list}>
              {rest.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
