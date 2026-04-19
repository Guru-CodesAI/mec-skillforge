import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface Props {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { user, loading } = useAuth()

  // Render nothing (invisible) while auth check is in flight — no spinner flash
  if (loading) return <AppShell />

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

// Blank shell that matches the app background — prevents white flash
function AppShell() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--surface)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: '2px solid var(--primary-container)',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'sf-spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes sf-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
