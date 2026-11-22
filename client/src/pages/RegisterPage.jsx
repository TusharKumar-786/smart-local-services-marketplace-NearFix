import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, ArrowRight, Briefcase } from 'lucide-react';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'customer';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [neighbourhood, setNeighbourhood] = useState('Phase 7, Mohali');
  const [headline, setHeadline] = useState('');
  const [category, setCategory] = useState('plumber');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name,
        email,
        phone,
        password,
        role,
        neighbourhood,
        headline: role === 'provider' ? headline || `${name} - Skilled ${category}` : undefined,
        categories: role === 'provider' ? [category] : undefined,
      };

      const user = await register(payload);
      if (user.role === 'provider') navigate('/provider/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg py-12 flex flex-col justify-center">
      <div className="max-w-lg w-full mx-auto px-4">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <img src="/brand/logo.svg" alt="NearFix" className="h-10 w-auto mx-auto" />
          </Link>
          <h1 className="text-2xl font-extrabold text-ink mt-4">Create your account</h1>
          <p className="text-xs text-muted mt-1">Join the trusted local neighbourhood marketplace</p>
        </div>

        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2 bg-surface p-1 rounded-2xl border border-sand mb-6">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              role === 'customer'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            I need services (Customer)
          </button>
          <button
            type="button"
            onClick={() => setRole('provider')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              role === 'provider'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:text-ink'
            }`}
          >
            I am a technician (Provider)
          </button>
        </div>

        <div className="bg-surface rounded-2xl border border-sand p-6 sm:p-8 shadow-soft-sm space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-emergency/10 border border-emergency/20 text-xs font-semibold text-emergency">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Manpreet Singh"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-sand bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
                <User className="w-4 h-4 text-muted absolute left-3 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-sand bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                  <Mail className="w-4 h-4 text-muted absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9815012345"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-sand bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                  <Phone className="w-4 h-4 text-muted absolute left-3 top-3" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                Neighbourhood
              </label>
              <select
                value={neighbourhood}
                onChange={(e) => setNeighbourhood(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-sand bg-bg text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="Phase 7, Mohali">Phase 7, Mohali</option>
                <option value="Phase 3B2, Mohali">Phase 3B2, Mohali</option>
                <option value="Sector 70, Mohali">Sector 70, Mohali</option>
                <option value="Sector 17, Chandigarh">Sector 17, Chandigarh</option>
                <option value="Sector 35, Chandigarh">Sector 35, Chandigarh</option>
                <option value="Sector 5, Panchkula">Sector 5, Panchkula</option>
              </select>
            </div>

            {/* Provider specific inputs */}
            {role === 'provider' && (
              <div className="space-y-4 pt-2 border-t border-sand/60">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                    Primary Trade Specialty
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-sand bg-bg text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="plumber">Plumbing</option>
                    <option value="electrician">Electrical</option>
                    <option value="ac-repair">AC Repair</option>
                    <option value="painter">Painting</option>
                    <option value="carpenter">Carpentry</option>
                    <option value="home-cleaning">Home Cleaning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Master Plumber & Pipe Leak Specialist (8+ Yrs)"
                    className="w-full px-3 py-2.5 rounded-xl border border-sand bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-sand bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
                <Lock className="w-4 h-4 text-muted absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-sand/60">
            <p className="text-xs text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
