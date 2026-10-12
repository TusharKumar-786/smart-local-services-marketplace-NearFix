export default function Spinner({ label = 'Loading' }) {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  )
}

export function SkeletonCards({ count = 3 }) {
  return (
    <div className="stack" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card skeleton-card">
          <span className="skeleton skeleton-avatar" />
          <div className="skeleton-lines"><span className="skeleton w-40" /><span className="skeleton w-70" /><span className="skeleton w-55" /></div>
        </div>
      ))}
    </div>
  )
}
