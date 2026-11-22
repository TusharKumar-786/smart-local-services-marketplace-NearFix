import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Banknote,
  Clock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

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
    setError('');
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Desktop Left Split Panel: Authentic tradesperson photography with Deep Teal overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-dark text-white p-12 flex-col justify-between">
        <img
          src="/images/hero.webp"
          alt="Indian technician on local doorstep repair visit"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A4247]/90 via-[#0F5C63]/85 to-[#0A4247]/95" />

        <div className="relative z-10 space-y-4">
          <Link to="/" className="inline-block">
            <img src="/brand/logo-white.svg" alt="NearFix" className="h-9 w-auto" />
          </Link>
          <p className="text-sand/90 text-sm font-medium tracking-wide">
            Skilled help, nearby, fast.
          </p>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Connecting homes with verified local professionals
          </h2>
          <p className="text-sm text-sand/80 leading-relaxed">
            Sign in to check technician arrivals, manage appointments, or handle incoming neighbourhood repair jobs across Mohali, Chandigarh, and Panchkula.
          </p>

          <div className="space-y-4 pt-4 border-t border-white/15">
            <div className="flex items-center gap-3 text-xs text-sand/90">
              <div className="p-2 rounded-xl bg-white/10 text-accent">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span><strong>Verified professionals:</strong> Aadhaar & trade credentials checked</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-sand/90">
              <div className="p-2 rounded-xl bg-white/10 text-accent">
                <Banknote className="w-4 h-4" />
              </div>
              <span><strong>Transparent pricing:</strong> Exact visit charges in ₹ with zero surprises</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-sand/90">
              <div className="p-2 rounded-xl bg-white/10 text-accent">
                <Clock className="w-4 h-4" />
              </div>
              <span><strong>Fast local help:</strong> Average technician response within 30-45 mins</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-sand/60">
          © {new Date().getFullYear()} NearFix Marketplace Technologies Pvt. Ltd.
        </div>
      </div>

      {/* Right Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md space-y-6"
        >
          {/* Mobile Header Image */}
          <div className="lg:hidden text-center space-y-2 mb-4">
            <Link to="/" className="inline-block">
              <img src="/brand/logo.svg" alt="NearFix" className="h-9 w-auto mx-auto" />
            </Link>
            <p className="text-xs text-muted">Skilled help, nearby, fast.</p>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-ink">Sign in to your account</h1>
            <p className="text-xs text-muted mt-1">
              Welcome back. Enter your credentials to access your dashboard.
            </p>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="bg-tint p-4 rounded-2xl border border-primary/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /> One-Click Demo Logins
              </span>
              <span className="text-[10px] text-muted">Instant Access</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('arjun.customer@nearfix.in', 'CustomerPass123!')}
                className="py-1.5 px-2 rounded-xl bg-surface text-ink text-xs font-bold border border-sand hover:border-primary shadow-soft-sm transition-all text-center"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('rajesh.electric@nearfix.in', 'ProviderPass123!')}
                className="py-1.5 px-2 rounded-xl bg-surface text-ink text-xs font-bold border border-sand hover:border-primary shadow-soft-sm transition-all text-center"
              >
                Provider
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@nearfix.in', 'AdminPass123!')}
                className="py-1.5 px-2 rounded-xl bg-surface text-ink text-xs font-bold border border-sand hover:border-primary shadow-soft-sm transition-all text-center"
              >
                Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-emergency/10 border border-emergency/20 text-xs font-semibold text-emergency">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Floating label Email */}
            <div className="relative">
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full pl-10 pr-3 pt-5 pb-2 rounded-xl border border-sand bg-surface text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                required
              />
              <Mail className="w-4 h-4 text-muted absolute left-3.5 top-4 peer-focus:text-primary transition-colors" />
              <label
                htmlFor="login-email"
                className="absolute text-xs text-muted duration-200 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-primary"
              >
                Email Address
              </label>
            </div>

            {/* Floating label Password with toggle */}
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer w-full pl-10 pr-10 pt-5 pb-2 rounded-xl border border-sand bg-surface text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                required
              />
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-4 peer-focus:text-primary transition-colors" />
              <label
                htmlFor="login-password"
                className="absolute text-xs text-muted duration-200 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-primary"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-4 text-muted hover:text-ink transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-muted select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-sand text-primary focus:ring-primary"
                />
                <span>Remember me on this browser</span>
              </label>

              <Link to="/faq" className="font-semibold text-primary hover:underline">
                Need help?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-4 border-t border-sand/60">
            <p className="text-xs text-muted">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
