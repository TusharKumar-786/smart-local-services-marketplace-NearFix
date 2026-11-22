import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Bell, User, LogOut, Menu, X, ShieldCheck, Briefcase, Calendar } from 'lucide-react';
import { api } from '../../api/client';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isCustomer, isProvider, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
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
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/brand/logo.svg"
              alt="NearFix"
              className="h-9 w-auto transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/services"
              className="text-sm font-medium text-ink/80 hover:text-primary transition-colors"
            >
              Services
            </Link>
            <Link
              to="/how-it-works"
              className="text-sm font-medium text-ink/80 hover:text-primary transition-colors"
            >
              How it works
            </Link>
            <Link
              to="/for-professionals"
              className="text-sm font-medium text-ink/80 hover:text-primary transition-colors"
            >
              For professionals
            </Link>
            <Link
              to="/faq"
              className="text-sm font-medium text-ink/80 hover:text-primary transition-colors"
            >
              Help & FAQ
            </Link>
          </nav>

          {/* Right Action Cluster */}
          <div className="hidden md:flex items-center gap-4">
            {/* Urgent Request CTA */}
            <Link
              to="/search?urgency=emergency&service=plumber"
              className="emergency-pulse inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emergency bg-emergency/10 hover:bg-emergency hover:text-white transition-all border border-emergency/30"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Urgent Help</span>
            </Link>

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

                {/* Role Specific Quick Jump */}
                {isCustomer && (
                  <Link
                    to="/customer/bookings"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-tint rounded-lg hover:bg-primary hover:text-white transition-all"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>My Bookings</span>
                  </Link>
                )}

                {isProvider && (
                  <Link
                    to="/provider/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-tint rounded-lg hover:bg-primary hover:text-white transition-all"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Provider Portal</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-100 rounded-lg hover:bg-emerald-800 hover:text-white transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* Profile Pill & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-sand">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-ink leading-tight">{user.name}</p>
                    <p className="text-[10px] text-muted capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    title="Log out"
                    className="p-1.5 rounded-lg text-muted hover:text-emergency hover:bg-emergency/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
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
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <Link
              to="/search?urgency=emergency&service=plumber"
              className="emergency-pulse inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-emergency bg-emergency/10"
            >
              <AlertCircle className="w-3 h-3" />
              <span>Urgent</span>
            </Link>
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
          <div className="md:hidden py-4 border-t border-sand bg-surface rounded-b-2xl px-2 space-y-3">
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-tint"
            >
              Services
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-tint"
            >
              How it works
            </Link>
            <Link
              to="/for-professionals"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-tint"
            >
              For professionals
            </Link>
            <Link
              to="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-tint"
            >
              Help & FAQ
            </Link>

            <div className="pt-3 border-t border-sand">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <p className="px-3 text-xs text-muted">
                    Signed in as <span className="font-semibold text-ink">{user.name}</span> ({user.role})
                  </p>
                  {isCustomer && (
                    <Link
                      to="/customer/bookings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-primary bg-tint"
                    >
                      My Bookings
                    </Link>
                  )}
                  {isProvider && (
                    <Link
                      to="/provider/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-primary bg-tint"
                    >
                      Provider Dashboard
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-800 bg-emerald-100"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-emergency hover:bg-emergency/10"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-semibold text-ink border border-sand rounded-lg"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-semibold text-white bg-primary rounded-lg"
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
