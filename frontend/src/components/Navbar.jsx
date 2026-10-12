import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { CalendarCheck, Briefcase, LayoutDashboard, LogOut, Menu, Search, Shield, Siren, Wrench, X } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import Avatar from './Avatar'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  const handleLogout = async () => {
    await logout()
    close()
    navigate('/')
  }

  const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : ''

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark"><Wrench size={18} strokeWidth={2.5} /></span> NearFix
        </Link>
        <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={`nav-links ${open ? 'open' : ''}`} onClick={close}>
          <NavLink to="/search"><Search size={16} />Find services</NavLink>
          <NavLink to="/emergency" className="nav-emergency"><Siren size={16} />Emergency</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard"><LayoutDashboard size={16} />Dashboard</NavLink>
              {user.role === 'customer' && <NavLink to="/bookings"><CalendarCheck size={16} />My bookings</NavLink>}
              {user.role === 'provider' && <NavLink to="/provider/bookings"><Briefcase size={16} />Jobs</NavLink>}
              {user.role === 'admin' && <a href="/admin/" target="_blank" rel="noreferrer"><Shield size={16} />Django Admin</a>}
              <span className="nav-sep" />
              <NavLink to="/profile" className="nav-user" title="Profile"><Avatar name={fullName} id={user.id} size={30} />{user.first_name || 'Profile'}</NavLink>
              <button className="btn btn-small btn-ghost" onClick={handleLogout}><LogOut size={15} />Log out</button>
            </>
          ) : (
            <>
              <span className="nav-sep" />
              <NavLink to="/login">Log in</NavLink>
              <Link to="/register" className="btn btn-small btn-primary">Get started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
