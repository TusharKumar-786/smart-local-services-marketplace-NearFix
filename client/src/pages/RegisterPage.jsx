import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Banknote,
  Clock,
  Briefcase,
  Home,
} from 'lucide-react';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'customer';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [neighbourhood, setNeighbourhood] = useState('Phase 7, Mohali');
  const [headline, setHeadline] = useState('');
  const [category, setCategory] = useState('plumber');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setError('All fields are required.');
      return;
    }
    if (phone.length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept NearFix Terms & Privacy Policy to continue.');
      return;
    }

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
      if (!err.response) {
        setError('Cannot reach the server. Make sure the backend is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Desktop Left Split Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-dark text-white p-12 flex-col justify-between">
        <img
          src="/images/categories/electrician.webp"
          alt="Indian technician working on electrical panel"
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
            Join the most dependable local services platform
          </h2>
          <p className="text-sm text-sand/80 leading-relaxed">
            Whether you need prompt home repairs or want to provide expert services in your own neighbourhood, create your free NearFix profile today.
          </p>

          <div className="space-y-4 pt-4 border-t border-white/15">
            <div className="flex items-center gap-3 text-xs text-sand/90">
              <div className="p-2 rounded-xl bg-white/10 text-accent">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span><strong>Verified network:</strong> Rigorous identity checks for safety</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-sand/90">
              <div className="p-2 rounded-xl bg-white/10 text-accent">
                <Banknote className="w-4 h-4" />
              </div>
              <span><strong>Transparent earnings:</strong> Clear visit fees with direct payouts</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-sand/90">
              <div className="p-2 rounded-xl bg-white/10 text-accent">
                <Clock className="w-4 h-4" />
              </div>
              <span><strong>Local proximity:</strong> Connect directly within your sector or phase</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-sand/60">
          © {new Date().getFullYear()} NearFix Marketplace Technologies Pvt. Ltd.
        </div>
      </div>

      {/* Right Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-lg space-y-5 py-4"
        >
          {/* Mobile Header Image */}
          <div className="lg:hidden text-center space-y-2 mb-2">
            <Link to="/" className="inline-block">
              <img src="/brand/logo.svg" alt="NearFix" className="h-9 w-auto mx-auto" />
            </Link>
            <p className="text-xs text-muted">Skilled help, nearby, fast.</p>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-ink">Create your account</h1>
            <p className="text-xs text-muted mt-1">
              Select how you would like to use NearFix:
            </p>
          </div>

          {/* Role selector as two large selectable cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                role === 'customer'
                  ? 'border-primary bg-tint/80 ring-2 ring-primary text-primary'
                  : 'border-sand bg-surface hover:bg-bg text-ink'
              }`}
            >
              <Home className="w-6 h-6 mb-2" />
              <span className="block font-bold text-sm">Customer</span>
              <span className="text-[11px] text-muted block mt-0.5">
                I want to book repairs for my home
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole('provider')}
              className={`p-4 rounded-2xl border text-left transition-all relative ${
                role === 'provider'
                  ? 'border-primary bg-tint/80 ring-2 ring-primary text-primary'
                  : 'border-sand bg-surface hover:bg-bg text-ink'
              }`}
            >
              <Briefcase className="w-6 h-6 mb-2" />
              <span className="block font-bold text-sm">Professional</span>
              <span className="text-[11px] text-muted block mt-0.5">
                I am a skilled technician offering services
              </span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-emergency/10 border border-emergency/20 text-xs font-semibold text-emergency">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="relative">
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                className="peer w-full pl-10 pr-3 pt-5 pb-2 rounded-xl border border-sand bg-surface text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                required
              />
              <User className="w-4 h-4 text-muted absolute left-3.5 top-4 peer-focus:text-primary transition-colors" />
              <label
                htmlFor="reg-name"
                className="absolute text-xs text-muted duration-200 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-primary"
              >
                Full Name
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email */}
              <div className="relative">
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  className="peer w-full pl-10 pr-3 pt-5 pb-2 rounded-xl border border-sand bg-surface text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                  required
                />
                <Mail className="w-4 h-4 text-muted absolute left-3.5 top-4 peer-focus:text-primary transition-colors" />
                <label
                  htmlFor="reg-email"
                  className="absolute text-xs text-muted duration-200 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-primary"
                >
                  Email Address
                </label>
              </div>

              {/* Phone */}
              <div className="relative">
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder=" "
                  className="peer w-full pl-10 pr-3 pt-5 pb-2 rounded-xl border border-sand bg-surface text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                  required
                />
                <Phone className="w-4 h-4 text-muted absolute left-3.5 top-4 peer-focus:text-primary transition-colors" />
                <label
                  htmlFor="reg-phone"
                  className="absolute text-xs text-muted duration-200 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-primary"
                >
                  Phone Number
                </label>
              </div>
            </div>

            {/* Neighbourhood */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Your Neighbourhood / Base Area
              </label>
              <select
                value={neighbourhood}
                onChange={(e) => setNeighbourhood(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-sand bg-surface text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="Phase 7, Mohali">Phase 7, Mohali</option>
                <option value="Phase 3B2, Mohali">Phase 3B2, Mohali</option>
                <option value="Phase 5, Mohali">Phase 5, Mohali</option>
                <option value="Sector 70, Mohali">Sector 70, Mohali</option>
                <option value="Sector 17, Chandigarh">Sector 17, Chandigarh</option>
                <option value="Sector 22, Chandigarh">Sector 22, Chandigarh</option>
                <option value="Sector 35, Chandigarh">Sector 35, Chandigarh</option>
                <option value="Sector 43, Chandigarh">Sector 43, Chandigarh</option>
                <option value="Sector 5, Panchkula">Sector 5, Panchkula</option>
                <option value="Sector 11, Panchkula">Sector 11, Panchkula</option>
              </select>
            </div>

            {/* Provider specific inputs */}
            {role === 'provider' && (
              <div className="space-y-3 pt-2 border-t border-sand/60">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    Primary Trade Specialty
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-sand bg-surface text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="plumber">Plumber (Pipes & Drainage)</option>
                    <option value="electrician">Electrician (Wiring & Switches)</option>
                    <option value="ac-repair">AC Repair & Servicing</option>
                    <option value="painter">House Painter</option>
                    <option value="carpenter">Carpenter & Furniture</option>
                    <option value="home-cleaning">Home Cleaning</option>
                    <option value="appliance-repair">Appliance Repair</option>
                    <option value="pest-control">Pest Control</option>
                    <option value="water-purifier">Water Purifier RO</option>
                    <option value="cctv-wifi">CCTV & Wi-Fi Setup</option>
                  </select>
                </div>

                <div className="relative">
                  <input
                    id="reg-headline"
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder=" "
                    className="peer w-full pl-3 pr-3 pt-5 pb-2 rounded-xl border border-sand bg-surface text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                  />
                  <label
                    htmlFor="reg-headline"
                    className="absolute text-xs text-muted duration-200 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-primary"
                  >
                    Professional Headline (e.g. Master Plumber with 8 Yrs Exp)
                  </label>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="peer w-full pl-10 pr-10 pt-5 pb-2 rounded-xl border border-sand bg-surface text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                required
              />
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-4 peer-focus:text-primary transition-colors" />
              <label
                htmlFor="reg-password"
                className="absolute text-xs text-muted duration-200 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:text-primary"
              >
                Password (min 6 characters)
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

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-muted select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-sand text-primary focus:ring-primary"
                />
                <span>I agree to the NearFix Terms of Service and Privacy Policy</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{loading ? 'Creating account...' : `Sign Up as ${role === 'provider' ? 'Professional' : 'Customer'}`}</span>
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
        </motion.div>
      </div>
    </div>
  );
};
