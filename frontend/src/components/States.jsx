import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, SearchX } from 'lucide-react'

export function ErrorBox({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="alert alert-error" role="alert">
      <AlertCircle size={18} />
      <span className="alert-text">{message}</span>
      {onRetry && <button className="btn btn-small btn-ghost" onClick={onRetry}>Try again</button>}
    </div>
  )
}

export function SuccessBox({ message }) {
  if (!message) return null
  return <div className="alert alert-success" role="status"><CheckCircle2 size={18} /><span className="alert-text">{message}</span></div>
}

export function EmptyState({ title, text, action, to, icon: Icon = SearchX }) {
  return (
    <div className="empty">
      <span className="empty-icon"><Icon size={28} /></span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && to && <Link className="btn btn-primary" to={to}>{action}</Link>}
    </div>
  )
}
