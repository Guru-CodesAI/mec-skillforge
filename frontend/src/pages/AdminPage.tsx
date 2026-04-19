import { useEffect, useState } from 'react'
import { adminService } from '../services/skillforge'
import type { AdminUser } from '../types'
import Navbar from '../components/Navbar'
import styles from './AdminPage.module.css'

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<number | null>(null)

  useEffect(() => {
    adminService.getUsers().then(r => setUsers(r.data)).finally(() => setLoading(false))
  }, [])

  const handleRemove = async (id: number) => {
    if (!confirm('Remove this user from the network?')) return
    setRemoving(id)
    try { await adminService.removeUser(id); setUsers(u => u.filter(x => x.id !== id)) }
    finally { setRemoving(null) }
  }

  const trustColor = (l: string | null) => l === 'High' ? 'var(--success)' : l === 'Medium' ? 'var(--gold)' : 'var(--on-surface-dim)'

  return (
    <>
      <Navbar />
      <div className="bg-grid" /><div className="orb orb-1" /><div className="orb orb-2" />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}><span className={styles.dot} />Admin Access</p>
            <h2 className={`font-display ${styles.title}`}>Control Panel</h2>
            <p className={styles.sub}>Network moderation and user oversight</p>
          </div>
          <div className={styles.statsRow}>
            {[
              { label: 'Total Users', val: users.length, color: 'var(--cyan)' },
              { label: 'Verified', val: users.filter(u => u.github_verified).length, color: 'var(--success)' },
              { label: 'Admins', val: users.filter(u => u.role === 'admin').length, color: 'var(--gold)' },
            ].map(({ label, val, color }) => (
              <div key={label} className={styles.statCard}>
                <span className={styles.statLabel}>{label}</span>
                <span className={`font-display ${styles.statVal}`} style={{ color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}><div className={styles.spinner} /></div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>{['User', 'Role', 'Level', 'GitHub', 'Trust', 'Repos', 'Joined', ''].map(h => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.userCell}>
                        <div className={styles.avatar} style={{ background: u.role === 'admin' ? 'linear-gradient(135deg,var(--gold),#ff6b35)' : 'linear-gradient(135deg,var(--cyan),var(--violet-bright))' }}>
                          {u.name.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.userName}>{u.name}</div>
                          <div className={styles.userEmail}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className="chip" style={u.role==='admin' ? {background:'rgba(245,158,11,0.1)',borderColor:'rgba(245,158,11,0.3)',color:'var(--gold)'} : {}}>
                        {u.role}
                      </span>
                    </td>
                    <td className={styles.td}><span className={styles.dimText}>{u.experience_level}</span></td>
                    <td className={styles.td}>
                      <span style={{ fontSize:'0.8rem', color: u.github_verified ? 'var(--success)' : 'var(--on-surface-dim)', fontFamily:"'Space Grotesk',sans-serif" }}>
                        {u.github_verified ? u.github_username ?? '✓' : '—'}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {u.trust_score !== null ? (
                        <div className={styles.trustCell}>
                          <span className={`font-display ${styles.trustNum}`} style={{ color: trustColor(u.trust_confidence) }}>{u.trust_score.toFixed(1)}</span>
                          <span className={styles.trustConf}>{u.trust_confidence}</span>
                        </div>
                      ) : <span className={styles.dimText}>—</span>}
                    </td>
                    <td className={styles.td}><span className={styles.dimText}>{u.repo_count}</span></td>
                    <td className={styles.td}><span className={styles.dimText}>{new Date(u.created_at).toLocaleDateString()}</span></td>
                    <td className={styles.td}>
                      {u.role !== 'admin' && (
                        <button onClick={() => handleRemove(u.id)} disabled={removing === u.id} className={styles.removeBtn}>
                          {removing === u.id ? '...' : 'Remove'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
