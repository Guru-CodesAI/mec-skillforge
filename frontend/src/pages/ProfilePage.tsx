import { useEffect, useState } from 'react'
import { userService } from '../services/skillforge'
import type { UserProfile } from '../types'
import Navbar from '../components/Navbar'
import styles from './ProfilePage.module.css'

const LEVELS = ['junior', 'mid', 'senior']

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', github_username: '', experience_level: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    userService.getProfile().then(r => {
      setProfile(r.data)
      setForm({ name: r.data.name, github_username: r.data.github_username ?? '', experience_level: r.data.experience_level })
    })
  }, [])

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      await userService.updateProfile(form)
      const r = await userService.getProfile()
      setProfile(r.data); setEditing(false); setMsg('Profile updated successfully.')
    } catch { setMsg('Update failed.') }
    finally { setSaving(false) }
  }

  if (!profile) return <div className={styles.loading}><div className={styles.spinner} /></div>

  return (
    <>
      <Navbar />
      <div className="bg-grid" /><div className="orb orb-1" /><div className="orb orb-2" />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <p className={styles.eyebrow}><span className={styles.dot} />Your Profile</p>
          <h2 className={`font-display ${styles.title}`}>Identity Matrix</h2>
          <p className={styles.sub}>Manage your developer credentials and skills</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Profile Details</span>
              <button onClick={() => setEditing(!editing)} className={`btn-ghost ${styles.editBtn}`}>{editing ? 'Cancel' : 'Edit Profile'}</button>
            </div>
            {editing ? (
              <div className={styles.form}>
                {[{k:'name',l:'Full Name',t:'text'},{k:'github_username',l:'GitHub Username',t:'text'}].map(({k,l,t}) => (
                  <div key={k} className={styles.field}>
                    <label className={styles.label}>{l}</label>
                    <input className="input-field" type={t} value={(form as any)[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} />
                  </div>
                ))}
                <div className={styles.field}>
                  <label className={styles.label}>Experience Level</label>
                  <select className="input-field" value={form.experience_level} onChange={e => setForm(f => ({...f,experience_level:e.target.value}))}>
                    {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
                  </select>
                </div>
                <button onClick={handleSave} disabled={saving} className={`btn-primary ${styles.saveBtn}`}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {msg && <p className={styles.msg}><span className="material-symbols-outlined" style={{fontSize:14}}>check_circle</span>{msg}</p>}
              </div>
            ) : (
              <div className={styles.profileGrid}>
                {[{l:'Name',v:profile.name},{l:'Email',v:profile.email},{l:'Experience',v:profile.experience_level},{l:'Role',v:profile.role},{l:'GitHub',v:profile.github_username??'Not set'},{l:'Joined',v:new Date(profile.created_at).toLocaleDateString()}].map(({l,v}) => (
                  <div key={l} className={styles.profileItem}>
                    <span className={styles.label}>{l}</span>
                    <span className={styles.profileVal}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}><span className={styles.cardTitle}>Trust Score</span></div>
            {profile.trust_score ? (
              <div className={styles.trustDisplay}>
                <div className={styles.trustNum}>
                  <span className={styles.trustBig}>{profile.trust_score.score.toFixed(1)}</span>
                  <span className={styles.trustDenom}>/10</span>
                </div>
                <span className="chip" style={{
                  background: profile.trust_score.confidence_level==='High' ? 'rgba(0,240,160,0.1)' : 'rgba(245,158,11,0.1)',
                  borderColor: profile.trust_score.confidence_level==='High' ? 'rgba(0,240,160,0.3)' : 'rgba(245,158,11,0.3)',
                  color: profile.trust_score.confidence_level==='High' ? 'var(--success)' : 'var(--gold)',
                }}>
                  {profile.trust_score.confidence_level} Confidence
                </span>
              </div>
            ) : <p className={styles.empty}>Verify GitHub to generate trust score.</p>}
          </div>

          {profile.skills.length > 0 && (
            <div className={`${styles.card} ${styles.skillsCard}`}>
              <div className={styles.cardHeader}><span className={styles.cardTitle}>Skill Matrix</span></div>
              <div className={styles.skillsList}>
                {profile.skills.map(s => (
                  <div key={s.id} className={styles.skillRow}>
                    <span className={styles.skillName}>{s.skill_name}</span>
                    <div className={styles.skillBarWrap}>
                      <div className="progress-bar" style={{flex:1}}><div className="progress-fill" style={{width:`${(s.score/10)*100}%`}} /></div>
                      <span className={styles.skillScore}>{s.score.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
