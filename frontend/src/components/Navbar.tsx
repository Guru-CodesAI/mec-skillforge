import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Navbar.module.css'

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: 'dashboard' },
  { to: '/match', label: 'AI Match', icon: 'radar' },
  { to: '/profile', label: 'Profile', icon: 'person' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/dashboard" className={styles.brand}>
          <span className="material-symbols-outlined" style={{ color: 'var(--cyan)', fontSize: 22 }}>hub</span>
          <span className={`font-display ${styles.brandName}`}>SkillForge</span>
        </Link>

        <nav className={styles.nav}>
          {NAV.map(({ to, label, icon }) => (
            <Link key={to} to={to} className={`${styles.link} ${pathname === to ? styles.active : ''}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`${styles.link} ${styles.adminLink} ${pathname === '/admin' ? styles.active : ''}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>shield</span>
              Admin
            </Link>
          )}
        </nav>

        <div className={styles.right}>
          <div className={styles.userBadge}>
            <div className={styles.avatar}>{user?.name?.slice(0, 2).toUpperCase()}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userRole}>{user?.role}</span>
            </div>
          </div>
          <button onClick={async () => { await logout(); navigate('/login') }} className={styles.logoutBtn} title="Sign out">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
