export const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export const dateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '-'

export const timeOnly = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })

export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const STATUS_LABELS = {
  pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected', in_progress: 'In progress',
  completed: 'Completed', cancelled: 'Cancelled',
}

export const FACTOR_LABELS = {
  skill: 'Skill match', distance: 'Distance', availability: 'Availability', rating: 'Rating', price: 'Price fit', urgency: 'Urgency',
}

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const ACTION_LABELS = { accept: 'Accept', reject: 'Reject', start: 'Start job', complete: 'Mark completed', cancel: 'Cancel' }
