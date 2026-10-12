import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { parseError } from '../api/client'
import Field from '../components/Field'
import { ErrorBox } from '../components/States'
import AuthLayout from '../components/AuthLayout'
import { LogIn } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(form.email, form.password)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err) {
      setError(parseError(err, 'Login failed.'))
    } finally {
      setBusy(false)
    }
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <AuthLayout title="Fix it faster with the right pro." subtitle="Log in to book services, track jobs and manage your bookings.">
      <form className="auth-card form fade-in" onSubmit={submit} noValidate>
        <h1>Welcome back</h1>
        <p className="muted">Log in to book and manage services.</p>
        <ErrorBox message={error?.message} />
        <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} error={error?.fields.email} required />
        <Field label="Password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={onChange} error={error?.fields.password} required />
        <button className="btn btn-primary btn-block" disabled={busy}><LogIn size={17} />{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="muted center">New to NearFix? <Link to="/register">Create an account</Link></p>
        <div className="demo-creds">
          <b>Demo accounts</b> (after running seed_nearfix), password <code>Nearfix@123</code>
          <div>
            {[['Customer', 'customer@nearfix.dev'], ['Provider', 'raj@nearfix.dev']].map(([label, email]) => (
              <button type="button" key={email} className="btn btn-ghost btn-small" onClick={() => setForm({ email, password: 'Nearfix@123' })}>Use {label.toLowerCase()} demo</button>
            ))}
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}
