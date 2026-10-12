import { BadgeCheck, CalendarCheck, ShieldCheck, Sparkles } from 'lucide-react'

const POINTS = [
  [Sparkles, 'Providers ranked by a transparent score out of 100'],
  [BadgeCheck, 'Only admin-verified professionals appear in search'],
  [CalendarCheck, 'Book a free hour, with double-booking blocked'],
  [ShieldCheck, 'Secure JWT login with automatic session refresh'],
]

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <span className="eyebrow" style={{ color: '#c7d2fe' }}>NearFix</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <ul>{POINTS.map(([Icon, text]) => <li key={text}><Icon size={20} />{text}</li>)}</ul>
      </aside>
      <div className="auth-main">{children}</div>
    </div>
  )
}
