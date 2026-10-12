import { Link } from 'react-router-dom'
import { CalendarClock, MapPin, Siren, User } from 'lucide-react'
import CategoryIcon from './CategoryIcon'
import StatusBadge from './StatusBadge'
import { dateTime, money } from '../utils/format'

export default function BookingRow({ booking, viewer = 'customer', children }) {
  const other = viewer === 'customer' ? booking.provider : booking.customer
  return (
    <article className="card booking-row fade-in">
      <CategoryIcon slug={booking.category.slug} />
      <div style={{ minWidth: 0 }}>
        <h3><Link to={`/bookings/${booking.id}`}>{booking.category.name}</Link> <span className="muted small">#{booking.id}</span></h3>
        <div className="chips">
          <span className="chip"><User size={13} />{other.name}</span>
          <span className="chip"><CalendarClock size={13} />{dateTime(booking.scheduled_at)}</span>
          {booking.urgency !== 'normal' && <span className="chip chip-red"><Siren size={13} />{booking.urgency}</span>}
        </div>
        {viewer === 'provider' && <p className="small muted" style={{ margin: '.5rem 0 0' }}><MapPin size={13} style={{ verticalAlign: '-2px' }} /> {booking.address}{booking.description ? ` · ${booking.description}` : ''}</p>}
      </div>
      <div className="row-actions" style={{ alignItems: 'center' }}>
        <StatusBadge status={booking.status} />
        <b className="price-tag" style={{ fontSize: '1rem' }}>{money(booking.quoted_price)}</b>
        {children}
      </div>
    </article>
  )
}
