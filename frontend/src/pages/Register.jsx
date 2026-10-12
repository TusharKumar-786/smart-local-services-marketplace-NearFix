import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { parseError } from '../api/client'
import useCatalog from '../hooks/useCatalog'
import Field from '../components/Field'
import { ErrorBox } from '../components/States'
import AuthLayout from '../components/AuthLayout'
import { Briefcase, Home as HomeIcon, UserPlus } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const { areas } = useCatalog()
  const navigate = useNavigate()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', confirm: '', role: 'customer', area: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError({ message: 'Please fix the highlighted fields.', fields: { confirm: 'Passwords do not match.' } })
      return
    }
    setBusy(true)
    setError(null)
    try {
      // eslint-disable-next-line no-unused-vars
      const { confirm, ...payload } = form
      const user = await register({ ...payload, area: payload.area || null })
      navigate(user.role === 'provider' ? '/provider/settings' : '/dashboard', { replace: true })
    } catch (err) {
      setError(parseError(err, 'Registration failed.'))
    } finally {
      setBusy(false)
    }
  }

  const f = error?.fields || {}
  return (
    <AuthLayout title="Join the smarter local services network." subtitle="Customers find the best-matched pro in seconds. Providers get jobs from nearby customers.">
      <form className="auth-card form fade-in" style={{ width: 'min(520px, 100%)' }} onSubmit={submit} noValidate>
        <h1>Create your account</h1>
        <p className="muted" style={{ marginTop: '-.5rem' }}>Choose how you want to use NearFix.</p>
        <div className="role-switch" role="radiogroup" aria-label="Account type">
          {[['customer', 'I need a service', HomeIcon], ['provider', 'I provide services', Briefcase]].map(([value, label, Icon]) => (
            <label key={value} className={form.role === value ? 'active' : ''}>
              <input type="radio" name="role" value={value} checked={form.role === value} onChange={onChange} /><Icon size={18} /> {label}
            </label>
          ))}
        </div>
        <ErrorBox message={error?.message} />
        <div className="grid-2">
          <Field label="First name" name="first_name" value={form.first_name} onChange={onChange} error={f.first_name} required />
          <Field label="Last name" name="last_name" value={form.last_name} onChange={onChange} error={f.last_name} />
        </div>
        <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} error={f.email} required />
        <div className="grid-2">
          <Field label="Phone" name="phone" value={form.phone} onChange={onChange} error={f.phone} placeholder="10-digit mobile" />
          <Field label={form.role === 'provider' ? 'Base area' : 'Your area'} as="select" name="area" value={form.area} onChange={onChange} error={f.area}>
            <option value="">Select area</option>
            {areas.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
          </Field>
        </div>
        <div className="grid-2">
          <Field label="Password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={onChange} error={f.password} hint="At least 8 characters, not too common." required />
          <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={onChange} error={f.confirm} required />
        </div>
        {form.role === 'provider' && <p className="hint">Provider accounts are reviewed by an admin before appearing in search.</p>}
        <button className="btn btn-primary btn-block" disabled={busy}><UserPlus size={17} />{busy ? 'Creating account…' : 'Create account'}</button>
        <p className="muted center">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </AuthLayout>
  )
}
