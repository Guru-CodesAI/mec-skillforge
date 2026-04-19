interface Props { score: number; size?: number }

export default function TrustGauge({ score, size = 160 }: Props) {
  const r = 45
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 10) * circ

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
        <circle cx={size/2} cy={size/2} r={r} fill="transparent"
          stroke="url(#tg)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          filter="url(#glow)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: size * 0.28, fontWeight: 800, color: '#00f0ff', lineHeight: 1, textShadow: '0 0 20px rgba(0,240,255,0.6)' }}>
          {score.toFixed(1)}
        </div>
        <div style={{ fontSize: '0.6rem', color: 'var(--on-surface-dim)', marginTop: 4, fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: '0.08em' }}>/ 10.0</div>
      </div>
    </div>
  )
}
