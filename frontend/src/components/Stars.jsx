import { Star } from 'lucide-react'

export default function Stars({ value = 0, count, size = 15 }) {
  const v = Number(value)
  return (
    <span className="stars" aria-label={`Rated ${v.toFixed(1)} out of 5`}>
      <span className="stars-icons" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} size={size} className={n <= Math.round(v) ? 'on' : ''} fill={n <= Math.round(v) ? 'currentColor' : 'none'} />
        ))}
      </span>
      <strong>{v.toFixed(1)}</strong>
      {count !== undefined && <span className="muted">({count})</span>}
    </span>
  )
}
