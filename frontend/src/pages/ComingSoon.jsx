import { Link } from 'react-router-dom'
import { Home, Clock } from 'lucide-react'

// Placeholder for pages that are built in a later week of the project.
export default function ComingSoon({ title = 'This page' }) {
  return (
    <div className="container not-found">
      <div className="big"><Clock size={64} /></div>
      <h1>{title} is coming soon</h1>
      <p className="muted">This feature is part of a later week of the NearFix project.</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary"><Home size={17} />Go home</Link>
      </div>
    </div>
  )
}
