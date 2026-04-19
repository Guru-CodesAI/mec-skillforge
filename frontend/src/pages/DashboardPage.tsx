import { useEffect, useState } from 'react'
import { userService, githubService } from '../services/skillforge'
import type { UserProfile } from '../types'
import TrustGauge from '../components/TrustGauge'
import SkillBar from '../components/SkillBar'
import Navbar from '../components/Navbar'
import styles from './Dashboard.module.css'

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyMsg, setVerifyMsg] = useState('')
  const [verifyErr, setVerifyErr] = useState('')

  useEffect(() => { userService.getProfile().then(r => setProfile(r.data)) }, [])

  const handleVerify = async () => {
    setVerifying(true); setVerifyMsg(''); setVerifyErr('')
    try {
      await githubService.verify()
      const r = await userService.getProfile()
      setProfile(r.data)
      setVerifyMsg('GitHub synced successfully!')
    } catch (err: any) {
      setVerifyErr(err.response?.data?.detail || 'Verification failed')
    } finally { setVerifying(false) }
  }

  if (!profile) return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingSpinner} />
      <p className={styles.loadingText}>Loading your profile...</p>
    </div>
  )

  const trust = profile.trust_score?.score ?? 0
  const trustLabel = profile.trust_score?.confidence_level ?? 'Low'
  const topSkills = profile.skills.slice(0, 6)

  return (
    <>
      <Navbar />
      <div className="bg-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}><span className={styles.dot} />System Online</p>
            <h1 className={`font-display ${styles.pageTitle}`}>
              Welcome back, <span className="gradient-text">{profile.name.split(' ')[0]}</span>
            </h1>
            <p className={styles.pageSub}>Your developer intelligence dashboard</p>
          </div>
          <div className={styles.statusBadge}>
            <span className={styles.statusDot} style={{ background: trustLabel === 'High' ? 'var(--success)' : trustLabel === 'Medium' ? 'var(--gold)' : 'var(--error)' }} />
            <span>Trust: <strong>{trustLabel}</strong></span>
          </div>
        </div>

        <div className={styles.bento}>
          {/* Trust Score */}
          <div className={`glass scan-card ${styles.trustCard} animate-fade-up`}>
            <div className={styles.cardLabel}>Neural Trust Score</div>
            <div className={styles.trustInner}>
              <TrustGauge score={trust} size={180} />
              <div className={styles.trustMeta}>
                <div className={styles.trustStat}>
                  <span className={styles.metaLabel}>Confidence</span>
                  <span className={`font-display ${styles.metaVal}`} style={{
                    color: trustLabel === 'High' ? 'var(--success)' : trustLabel === 'Medium' ? 'var(--gold)' : 'var(--error)'
                  }}>{trustLabel}</span>
                </div>
                <div className={styles.trustStat}>
                  <span className={styles.metaLabel}>Repositories</span>
                  <span className={`font-display ${styles.metaVal}`}>{profile.github_profile?.repo_count ?? 0}</span>
                </div>
                <div className={styles.trustStat}>
                  <span className={styles.metaLabel}>Activity Score</span>
                  <span className={`font-display ${styles.metaVal}`}>{profile.github_profile?.commit_activity.toFixed(1) ?? '0.0'}/10</span>
                </div>
                <p className={styles.trustNote}>
                  {profile.github_profile
                    ? 'GitHub verified. Trust score reflects your activity and profile completeness.'
                    : 'Verify your GitHub to unlock your full trust score.'}
                </p>
              </div>
            </div>
          </div>

          {/* GitHub Card */}
          <div className={`scan-card ${styles.githubCard} animate-fade-up delay-1`}>
            <div className={styles.githubGlow} />
            <div className={styles.githubTop}>
              <span className={`chip ${profile.github_profile ? styles.verifiedChip : ''}`}>
                {profile.github_profile ? '✓ Verified' : 'Unverified'}
              </span>
              <span className="material-symbols-outlined" style={{ color: 'var(--cyan)', fontSize: 20 }}>radar</span>
            </div>
            <h3 className={`font-display ${styles.githubTitle}`}>
              {profile.github_username ? `@${profile.github_username}` : 'GitHub Uplink'}
            </h3>
            <p className={styles.githubDesc}>
              {profile.github_profile
                ? `${profile.github_profile.repo_count} repos · ${Object.keys(profile.github_profile.languages).length} languages detected`
                : 'Connect GitHub to verify skills and boost your trust score.'}
            </p>
            {profile.github_username && (
              <button onClick={handleVerify} disabled={verifying} className={`btn-primary ${styles.verifyBtn}`}>
                {verifying ? <><span className={styles.btnSpinner} />Syncing...</> : profile.github_profile ? 'Re-sync GitHub' : 'Verify GitHub'}
              </button>
            )}
            {verifyMsg && <p className={styles.successMsg}><span className="material-symbols-outlined" style={{fontSize:14}}>check_circle</span>{verifyMsg}</p>}
            {verifyErr && <p className={styles.errorMsg}><span className="material-symbols-outlined" style={{fontSize:14}}>error</span>{verifyErr}</p>}
          </div>

          {/* Skills */}
          <div className={`glass scan-card ${styles.skillsCard} animate-fade-up delay-2`}>
            <div className={styles.skillsHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--cyan)', fontSize: 18 }}>terminal</span>
              <span className={styles.cardLabel} style={{marginBottom:0}}>GitHub-Synced Skills</span>
            </div>
            {topSkills.length > 0 ? (
              <div className={styles.skillsGrid}>
                {topSkills.map(s => <SkillBar key={s.id} label={s.skill_name} value={s.score} />)}
              </div>
            ) : (
              <div className={styles.emptySkills}>
                <span className="material-symbols-outlined" style={{fontSize:32, color:'var(--on-surface-dim)'}}>code</span>
                <p>Verify GitHub to populate your skill matrix</p>
              </div>
            )}
          </div>

          {/* Identity */}
          <div className={`glass scan-card ${styles.identityCard} animate-fade-up delay-3`}>
            <div className={styles.cardLabel}>Identity Matrix</div>
            <div className={styles.identityGrid}>
              {[
                { label: 'Name', value: profile.name, icon: 'person' },
                { label: 'Email', value: profile.email, icon: 'mail' },
                { label: 'Experience', value: profile.experience_level, icon: 'trending_up' },
                { label: 'Role', value: profile.role, icon: 'shield' },
              ].map(({ label, value, icon }) => (
                <div key={label} className={styles.identityItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--cyan)' }}>{icon}</span>
                  <div>
                    <span className={styles.metaLabel}>{label}</span>
                    <span className={styles.identityVal}>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
