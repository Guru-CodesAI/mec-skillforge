interface Props { label: string; value: number; max?: number }

export default function SkillBar({ label, value, max = 10 }: Props) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface)' }}>{label}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--cyan)', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700 }}>{value.toFixed(1)}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
