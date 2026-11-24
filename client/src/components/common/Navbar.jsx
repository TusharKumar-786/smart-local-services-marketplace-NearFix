import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AlertCircle,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Calendar,
  Briefcase,
  ShieldCheck,
  Check,
  ChevronDown,
} from 'lucide-react';
import { api } from '../../api/client';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isCustomer, isProvider, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications')
        .then((res) => setNotifications(res.data.notifications || []))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleMarkRead = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      try {
        await api.post('/notifications/read');
        setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
      } catch (err) {}
    }
  };

  const isActive = (path) => {
    if (path.includes('?')) {
      const [base, query] = path.split('?');
      return location.pathname === base && location.search.includes(query);
    }
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  // Nav links by role
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Services', path: '/services' },
        { label: 'How it works', path: '/how-it-works' },
        { label: 'For professionals', path: '/for-professionals' },
        { label: 'FAQ', path: '/faq' },
        { label: 'Contact', path: '/contact' },
      ];
    }
    if (isCustomer) {
      return [
        { label: 'Find a pro', path: '/search' },
        { label: 'My bookings', path: '/customer/bookings' },
      ];
    }
    if (isProvider) {
      return [
        { label: 'Dashboard', path: '/provider/dashboard' },
        { label: 'My jobs', path: '/provider/dashboard' },
        { label: 'Earnings', path: '/provider/dashboard' },
      ];
    }
    if (isAdmin) {
      return [
        { label: 'Overview', path: '/admin/dashboard?tab=overview' },
        { label: 'Bookings', path: '/admin/dashboard?tab=bookings' },
        { label: 'Payments', path: '/admin/dashboard?tab=payments' },
        { label: 'Providers', path: '/admin/dashboard?tab=providers' },
        { label: 'Users', path: '/admin/dashboard?tab=users' },
        { label: 'Complaints', path: '/admin/dashboard?tab=complaints' },
        { label: 'Activity', path: '/admin/dashboard?tab=activity' },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-surface/95 backdrop-blur-md shadow-soft-sm border-b border-sand'
          : 'bg-bg/90 backdrop-blur-sm border-b border-sand/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img
              src="/brand/logo.svg"
              alt="NearFix"
              className="h-9 w-auto transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link, idx) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={`${link.label}-${idx}`}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors relative py-1 ${
                    active
                      ? 'text-primary'
                      : 'text-ink/80 hover:text-primary'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="hidden md:flex items-center gap-4">
            {/* Urgent Request CTA (Show for customers & logged out) */}
            {(!isAuthenticated || isCustomer) && (
              <Link
                to="/search?urgency=emergency&service=plumber"
                className="emergency-pulse inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emergency bg-emergency/10 hover:bg-emergency hover:text-white transition-all border border-emergency/30"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Urgent Help</span>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={handleMarkRead}
                    aria-label="View notifications"
                    className="p-2 rounded-full text-muted hover:text-ink hover:bg-sand/30 transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emergency rounded-full" />
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-surface rounded-xl shadow-soft-lg border border-sand p-3 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between pb-2 border-b border-sand mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                          Notifications
                        </span>
                        <span className="text-xs text-muted">{notifications.length} total</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-muted text-center py-4">No notifications yet.</p>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div key={n._id} className="p-2 rounded-lg bg-bg text-xs">
                              <p className="font-semibold text-ink">{n.title}</p>
                              <p className="text-muted text-[11px] mt-0.5">{n.body}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile menu with Avatar or Initials */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-sand/30 transition-colors"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-sand"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center border border-primary/20">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-bold text-ink leading-tight">{user.name}</p>
                      <p className="text-[10px] text-muted capitalize">{user.role}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-soft-lg border border-sand py-1.5 z-50">
                      <div className="px-3 py-2 border-b border-sand/60">
                        <p className="text-xs font-bold text-ink">{user.name}</p>
                        <p className="text-[11px] text-muted truncate">{user.email}</p>
                      </div>

                      {isCustomer && (
                        <Link
                          to="/customer/bookings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-3 py-2 text-xs font-semibold text-ink hover:bg-tint"
                        >
                          My Bookings
                        </Link>
                      )}
                      {isProvider && (
                        <Link
                          to="/provider/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-3 py-2 text-xs font-semibold text-ink hover:bg-tint"
                        >
                          Provider Dashboard
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-3 py-2 text-xs font-semibold text-ink hover:bg-tint"
                        >
                          Admin Console
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-emergency hover:bg-emergency/10 flex items-center gap-2 border-t border-sand/40"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-ink hover:text-primary transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {(!isAuthenticated || isCustomer) && (
              <Link
                to="/search?urgency=emergency&service=plumber"
                className="emergency-pulse inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-emergency bg-emergency/10"
              >
                <AlertCircle className="w-3 h-3" />
                <span>Urgent</span>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-ink hover:text-primary"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-sand bg-surface rounded-b-2xl px-3 space-y-2">
            {navLinks.map((link, idx) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={`mobile-${link.label}-${idx}`}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    active ? 'bg-tint text-primary font-bold' : 'text-ink hover:bg-sand/30'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-sand">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-1">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <div className="text-xs">
                      <span className="font-bold text-ink block">{user.name}</span>
                      <span className="text-muted capitalize">{user.role}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-emergency hover:bg-emergency/10 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-ink border border-sand rounded-xl bg-bg"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-white bg-primary rounded-xl"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
