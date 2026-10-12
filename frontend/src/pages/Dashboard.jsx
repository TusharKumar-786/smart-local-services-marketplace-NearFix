import { Link } from 'react-router-dom'
import { AlertTriangle, BadgeCheck, CalendarCheck, CalendarClock, CheckCircle2, Clock, IndianRupee, Inbox, MessageSquareWarning, Search as SearchIcon, Settings, Siren, Star, TrendingUp, Users, Wallet, Wrench } from 'lucide-react'
import Avatar from '../components/Avatar'
import { useAuth } from '../auth/AuthContext'
import { bookingApi, providerApi } from '../api/endpoints'
import api from '../api/client'
import useApi from '../hooks/useApi'
import BookingRow from '../components/BookingRow'
import Spinner from '../components/Spinner'
import { EmptyState, ErrorBox } from '../components/States'
import { money, STATUS_LABELS } from '../utils/format'

function Stat({ label, value, to, icon: Icon = TrendingUp, tone = 'indigo' }) {
  const body = <><span className={`icon-tile tone-${tone}`}><Icon size={20} /></span><span className="stat-value">{value}</span><span className="muted small">{label}</span></>
  return to ? <Link to={to} className="card stat">{body}</Link> : <div className="card stat">{body}</div>
}

function CustomerDashboard() {
  const upcoming = useApi(() => bookingApi.list({ status: 'pending,accepted,in_progress' }), [])
  const all = useApi(() => bookingApi.list({}), [])
  const list = upcoming.data?.results || []
  return (
    <>
      <div className="stats">
        <Stat label="Active bookings" value={upcoming.data?.count ?? '…'} to="/bookings" icon={CalendarClock} />
        <Stat label="Total bookings" value={all.data?.count ?? '…'} to="/bookings" icon={CalendarCheck} tone="violet" />
        <Stat label="Book a trusted pro" value="Find a service" to="/search" icon={SearchIcon} tone="green" />
        <Stat label="Fastest available help" value="Emergency" to="/emergency" icon={Siren} tone="pink" />
      </div>
      <div className="section-head" style={{ marginBottom: '1rem' }}><h2 style={{ margin: 0 }}>Active bookings</h2><Link to="/bookings" className="btn btn-ghost btn-small">View all</Link></div>
      <ErrorBox message={upcoming.error} onRetry={upcoming.reload} />
      {upcoming.loading ? <Spinner /> : list.length === 0
        ? <EmptyState title="No active bookings" text="Book a trusted provider in a few clicks." action="Find services" to="/search" />
        : <div className="stack">{list.map((b) => <BookingRow key={b.id} booking={b} />)}</div>}
    </>
  )
}

function ProviderDashboard() {
  const stats = useApi(() => providerApi.dashboard(), [])
  const pending = useApi(() => bookingApi.list({ status: 'pending' }), [])
  const s = stats.data
  return (
    <>
      <ErrorBox message={stats.error} onRetry={stats.reload} />
      {s && s.verification_status !== 'verified' && (
        <div className="alert alert-warn"><AlertTriangle size={18} /><span className="alert-text">Your profile is <b>{s.verification_status}</b>. Customers will see you once an admin verifies it. <Link to="/provider/settings">Complete your profile</Link></span></div>
      )}
      {stats.loading ? <Spinner /> : s && (
        <div className="stats">
          <Stat label="New requests" value={s.pending_requests} to="/provider/bookings" icon={Inbox} tone="orange" />
          <Stat label="Upcoming jobs" value={s.upcoming} to="/provider/bookings" icon={CalendarClock} />
          <Stat label="Completed jobs" value={s.completed} icon={CheckCircle2} tone="green" />
          <Stat label="Earnings this month" value={money(s.earnings_this_month)} icon={TrendingUp} tone="violet" />
          <Stat label="Total earnings" value={money(s.total_earnings)} icon={Wallet} tone="cyan" />
          <Stat label={`Rating (${s.review_count} reviews)`} value={Number(s.average_rating).toFixed(1)} icon={Star} tone="amber" />
        </div>
      )}
      <div className="section-head" style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>New requests</h2>
        <Link to="/provider/settings" className="btn btn-ghost btn-small"><Settings size={15} />Profile & availability</Link>
      </div>
      {pending.loading ? <Spinner /> : pending.data?.results.length === 0
        ? <EmptyState title="No new requests" text="New bookings will appear here." />
        : <div className="stack">{pending.data?.results.map((b) => <BookingRow key={b.id} booking={b} viewer="provider" />)}</div>}
    </>
  )
}

function AdminDashboard() {
  const stats = useApi(() => api.get('/admin/stats/'), [])
  const s = stats.data
  return (
    <>
      <p className="muted">Manage users, verify providers, resolve complaints and edit categories in <a href="/admin/" target="_blank" rel="noreferrer">Django Admin</a>.</p>
      <ErrorBox message={stats.error} onRetry={stats.reload} />
      {stats.loading ? <Spinner /> : s && (
        <>
          <div className="stats">
            <Stat label="Customers" value={s.users.customers} icon={Users} />
            <Stat label="Providers" value={s.users.providers} icon={Wrench} tone="violet" />
            <Stat label="Awaiting verification" value={s.providers_pending_verification} icon={BadgeCheck} tone="orange" />
            <Stat label="Open complaints" value={s.open_complaints} icon={MessageSquareWarning} tone="pink" />
            <Stat label="Emergency bookings" value={s.emergency_bookings} icon={Siren} tone="amber" />
            <Stat label="Mock revenue (paid)" value={money(s.mock_revenue_paid)} icon={IndianRupee} tone="green" />
          </div>
          <div className="grid-2">
            <div className="card"><h3>Bookings by status</h3>
              <table className="table compact"><tbody>{Object.entries(s.bookings_by_status).map(([k, v]) => <tr key={k}><td>{STATUS_LABELS[k] || k}</td><td>{v}</td></tr>)}</tbody></table>
            </div>
            <div className="card"><h3>Top categories</h3>
              <table className="table compact"><tbody>{s.top_categories.map((c) => <tr key={c.name}><td>{c.name}</td><td>{c.n}</td></tr>)}</tbody></table>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  return (
    <div className="container page">
      <div className="page-banner welcome">
        <div className="row" style={{ position: 'relative', zIndex: 1 }}>
          <Avatar name={`${user.first_name} ${user.last_name}`.trim() || user.email} id={user.id} size={56} />
          <div>
            <h1 style={{ margin: 0 }}>Hi {user.first_name || user.email.split('@')[0]}</h1>
            <p><Clock size={14} style={{ verticalAlign: '-2px' }} /> {user.role === 'provider' ? 'Here is how your service business is doing.' : user.role === 'customer' ? 'Track your bookings or find a new pro.' : 'Platform overview.'}</p>
          </div>
        </div>
      </div>
      {user.role === 'provider' ? <ProviderDashboard /> : user.role === 'admin' || user.is_staff ? <AdminDashboard /> : <CustomerDashboard />}
    </div>
  )
}
