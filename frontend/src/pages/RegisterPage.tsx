import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/skillforge'
import styles from './Auth.module.css'

const LEVELS = ['junior', 'mid', 'senior']

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', github_username: '', experience_level: 'junior' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.register(form)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className={styles.page}>
      <div className="bg-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div className={styles.logo}>
            <span className="material-symbols-outlined" style={{ color: 'var(--cyan)', fontSize: 28 }}>hub</span>
            <span className={`font-display ${styles.logoText}`}>SkillForge</span>
          </div>
          <h1 className={`font-display ${styles.heroTitle}`}>
            Build Your<br />
            <span className="gradient-text">Dream Team</span>
          </h1>
          <p className={styles.heroSub}>Join thousands of developers finding their perfect hackathon teammates through AI.</p>
          <div className={styles.featureList}>
            {['GitHub skill verification', 'AI compatibility matching', 'Trust score system', 'Instant team contact'].map(f => (
              <div key={f} className={styles.featureItem}>
                <span className="material-symbols-outlined" style={{fontSize:16, color:'var(--cyan)'}}>check_circle</span>
                <span>{f}</span>
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
              Join the Network
            </p>
            <h2 className={`font-display ${styles.cardTitle}`}>Create Account</h2>
            <p className={styles.cardSub}>Start finding your perfect teammates</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Full Name</label>
                <input className="input-field" type="text" placeholder="Jane Doe"
                  value={form.name} onChange={set('name')} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>GitHub Username</label>
                <input className="input-field" type="text" placeholder="janedoe"
                  value={form.github_username} onChange={set('github_username')} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input className="input-field" type="email" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input className="input-field" type="password" placeholder="Min. 8 characters"
                value={form.password} onChange={set('password')} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Experience Level</label>
              <select className="input-field" value={form.experience_level} onChange={set('experience_level')} style={{cursor:'pointer'}}>
                {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>

            {error && <div className={styles.error}><span className="material-symbols-outlined" style={{fontSize:16}}>error</span>{error}</div>}

            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : <>
                <span>Create Account</span>
                <span className="material-symbols-outlined" style={{fontSize:18}}>arrow_forward</span>
              </>}
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account? <Link to="/login" className={styles.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
