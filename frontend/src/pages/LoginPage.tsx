import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Auth.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className="bg-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div className={styles.logo}>
            <span className="material-symbols-outlined" style={{ color: 'var(--cyan)', fontSize: 28 }}>hub</span>
            <span className={`font-display ${styles.logoText}`}>SkillForge</span>
          </div>
          <h1 className={`font-display ${styles.heroTitle}`}>
            Find Your<br />
            <span className="gradient-text">Perfect Team</span>
          </h1>
          <p className={styles.heroSub}>AI-powered hackathon teammate matching. Verified skills. Real trust scores.</p>
          <div className={styles.stats}>
            {[['AI Matching', 'TF-IDF Engine'], ['Trust Scores', 'GitHub Verified'], ['Zero Noise', 'Pure Signal']].map(([v, l]) => (
              <div key={v} className={styles.statItem}>
                <span className={`font-display ${styles.statVal}`}>{v}</span>
                <span className={styles.statLabel}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={`glass-bright ${styles.card} animate-fade-up`}>
          <div className={styles.cardGlow} />
          <div className={styles.cardHeader}>
            <p className={styles.eyebrow}>
              <span className={styles.dot} />
              Secure Access
            </p>
            <h2 className={`font-display ${styles.cardTitle}`}>Welcome Back</h2>
            <p className={styles.cardSub}>Sign in to your developer network</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input className="input-field" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input className="input-field" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {error && <div className={styles.error}><span className="material-symbols-outlined" style={{fontSize:16}}>error</span>{error}</div>}

            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : <>
                <span>Sign In</span>
                <span className="material-symbols-outlined" style={{fontSize:18}}>arrow_forward</span>
              </>}
            </button>
          </form>

          <p className={styles.switchText}>
            No account? <Link to="/register" className={styles.switchLink}>Create one free</Link>
          </p>

        </div>
      </div>
    </div>
  )
}
