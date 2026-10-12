import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container not-found">
      <div className="big">404</div>
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for does not exist or has moved.</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary"><Home size={17} />Go home</Link>
      </div>
    </div>
  )
}
