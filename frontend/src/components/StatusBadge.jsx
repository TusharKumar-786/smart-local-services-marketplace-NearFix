import { CheckCircle2, Circle, Clock, Loader, XCircle } from 'lucide-react'
import { STATUS_LABELS } from '../utils/format'

const ICONS = { pending: Clock, accepted: Circle, in_progress: Loader, completed: CheckCircle2, cancelled: XCircle, rejected: XCircle }

export default function StatusBadge({ status }) {
  const Icon = ICONS[status] || Circle
  return <span className={`badge status-${status}`}><Icon size={13} strokeWidth={2.5} />{STATUS_LABELS[status] || status}</span>
}
