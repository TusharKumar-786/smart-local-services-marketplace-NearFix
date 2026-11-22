import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'provider') navigate('/provider/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-bg py-12 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src="/brand/logo.svg" alt="NearFix" className="h-10 w-auto mx-auto" />
          </Link>
          <h1 className="text-2xl font-extrabold text-ink mt-4">Welcome back</h1>
          <p className="text-xs text-muted mt-1">Sign in to your NearFix account</p>
        </div>

        {/* Quick Demo Credentials Box */}
        <div className="mb-6 bg-tint/80 border border-primary/20 rounded-2xl p-4 space-y-2">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
            ⚡ One-Click Demo Sign In
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('arjun.customer@nearfix.in', 'CustomerPass123!')}
              className="py-1.5 px-2 rounded-lg bg-surface text-ink text-xs font-semibold border border-sand hover:border-primary text-center"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('rajesh.electric@nearfix.in', 'ProviderPass123!')}
              className="py-1.5 px-2 rounded-lg bg-surface text-ink text-xs font-semibold border border-sand hover:border-primary text-center"
            >
              Provider
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@nearfix.in', 'AdminPass123!')}
              className="py-1.5 px-2 rounded-lg bg-surface text-ink text-xs font-semibold border border-sand hover:border-primary text-center"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-sand p-6 sm:p-8 shadow-soft-sm space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-emergency/10 border border-emergency/20 text-xs font-semibold text-emergency">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-sand/60">
            <p className="text-xs text-muted">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
