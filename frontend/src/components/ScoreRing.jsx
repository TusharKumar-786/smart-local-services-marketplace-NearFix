// Circular progress ring showing the match score out of 100.
export default function ScoreRing({ score, size = 72 }) {
  const stroke = 7
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const value = Math.max(0, Math.min(100, Number(score)))
  const tone = value >= 85 ? 'great' : value >= 70 ? 'good' : 'ok'
  return (
    <div className={`score-ring ring-${tone}`} style={{ width: size, height: size }} title="Match score out of 100">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-value" strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-label"><strong>{value.toFixed(0)}</strong><span>match</span></div>
    </div>
  )
}
