import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Briefcase,
  Calendar,
  AlertCircle,
  Banknote,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  Star,
  RefreshCw,
  Clock,
  ChevronRight,
  X,
  CreditCard,
  Smartphone,
  Landmark,
  FileText,
  Activity,
  Filter,
} from 'lucide-react';
import { formatIndianCurrency, formatRating, formatCategoryName } from '../utils/formatters';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'payments', label: 'Payments' },
  { id: 'providers', label: 'Providers' },
  { id: 'users', label: 'Users' },
  { id: 'complaints', label: 'Complaints' },
  { id: 'activity', label: 'Activity' },
];

export const AdminDashboardPage = () => {
  const { user: currentAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Toast / Error state
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const showToast = (msg, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 4000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Tab 1: Overview
  const [metrics, setMetrics] = useState(null);
  const [bookingsByStatus, setBookingsByStatus] = useState([]);
  const [revenueByMethod, setRevenueByMethod] = useState([]);
  const [signupsLast7Days, setSignupsLast7Days] = useState([]);
  const [bookingsLast7Days, setBookingsLast7Days] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Tab 2: Bookings
  const [bookingsList, setBookingsList] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingUrgencyFilter, setBookingUrgencyFilter] = useState('all');
  const [bookingPaymentFilter, setBookingPaymentFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedBookingLoading, setSelectedBookingLoading] = useState(false);
  const [selectedBookingPayment, setSelectedBookingPayment] = useState(null);

  // Tab 3: Payments
  const [paymentsList, setPaymentsList] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [totalsByMethod, setTotalsByMethod] = useState({ upi: 0, card: 0, netbanking: 0, total: 0 });

  // Tab 4: Providers
  const [providersList, setProvidersList] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providerVerificationFilter, setProviderVerificationFilter] = useState('all');
  const [providerCategoryFilter, setProviderCategoryFilter] = useState('all');
  const [providerSearch, setProviderSearch] = useState('');

  // Tab 5: Users
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // Tab 6: Complaints
  const [complaintsList, setComplaintsList] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('all');
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  // Tab 7: Activity Feed
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [lastActivityRefresh, setLastActivityRefresh] = useState(new Date());

  // Auto-refresh timer for activity tab (30s)
  useEffect(() => {
    if (activeTab === 'activity') {
      loadActivityFeed();
      const interval = setInterval(() => {
        loadActivityFeed(true);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'overview') fetchAnalytics();
    if (activeTab === 'bookings') loadBookings();
    if (activeTab === 'payments') loadPayments();
    if (activeTab === 'providers') loadProviders();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'complaints') loadComplaints();
    if (activeTab === 'activity') loadActivityFeed();
  }, [activeTab]);

  // Fetch Overview Analytics
  const fetchAnalytics = async () => {
    setOverviewLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      setMetrics(res.data.metrics || null);
      setBookingsByStatus(res.data.bookingsByStatus || []);
      setRevenueByMethod(res.data.revenueByMethod || []);
      setSignupsLast7Days(res.data.signupsLast7Days || []);
      setBookingsLast7Days(res.data.bookingsLast7Days || []);
      setCategoryBreakdown(res.data.categoryBreakdown || []);
      setTopProviders(res.data.topProviders || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch admin metrics', true);
    } finally {
      setOverviewLoading(false);
    }
  };

  // Load Bookings
  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const params = {};
      if (bookingStatusFilter !== 'all') params.status = bookingStatusFilter;
      if (bookingUrgencyFilter !== 'all') params.urgency = bookingUrgencyFilter;
      if (bookingPaymentFilter !== 'all') params.paymentStatus = bookingPaymentFilter;
      if (bookingSearch.trim()) params.q = bookingSearch.trim();

      const res = await api.get('/admin/bookings', { params });
      setBookingsList(res.data.bookings || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load bookings list', true);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Inspect Booking Detail (Drawer)
  const openBookingDrawer = async (bookingId) => {
    setSelectedBookingLoading(true);
    setSelectedBooking(null);
    setSelectedBookingPayment(null);
    try {
      const res = await api.get(`/admin/bookings/${bookingId}`);
      setSelectedBooking(res.data.booking);
      setSelectedBookingPayment(res.data.payment);
    } catch (err) {
      showToast('Failed to load booking details', true);
    } finally {
      setSelectedBookingLoading(false);
    }
  };

  // Load Payments
  const loadPayments = async () => {
    setPaymentsLoading(true);
    try {
      const params = {};
      if (paymentMethodFilter !== 'all') params.method = paymentMethodFilter;
      if (paymentStatusFilter !== 'all') params.status = paymentStatusFilter;

      const res = await api.get('/admin/payments', { params });
      setPaymentsList(res.data.payments || []);
      if (res.data.totalsByMethod) {
        setTotalsByMethod(res.data.totalsByMethod);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load payments list', true);
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Load Providers
  const loadProviders = async () => {
    setProvidersLoading(true);
    try {
      const params = {};
      if (providerVerificationFilter !== 'all') params.verificationStatus = providerVerificationFilter;
      if (providerCategoryFilter !== 'all') params.category = providerCategoryFilter;
      if (providerSearch.trim()) params.search = providerSearch.trim();

      const res = await api.get('/admin/providers', { params });
      setProvidersList(res.data.providers || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load providers list', true);
    } finally {
      setProvidersLoading(false);
    }
  };

  const handleVerifyProvider = async (providerId, status) => {
    const actionLabel = status === 'verified' ? 'approve' : status === 'rejected' ? 'reject' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${actionLabel} this technician profile?`)) {
      return;
    }
    try {
      await api.patch(`/admin/providers/${providerId}/verification`, { status });
      showToast(`Provider profile successfully marked as ${status}`);
      loadProviders();
      fetchAnalytics();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update provider status', true);
    }
  };

  // Load Users
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const params = {};
      if (userRoleFilter !== 'all') params.role = userRoleFilter;
      if (userStatusFilter !== 'all') params.status = userStatusFilter;
      if (userSearch.trim()) params.search = userSearch.trim();

      const res = await api.get('/admin/users', { params });
      setUsersList(res.data.users || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load users list', true);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleToggleBlock = async (userId, userObj) => {
    if (String(currentAdmin?._id) === String(userId)) {
      showToast('Cannot block your own administrator account', true);
      return;
    }
    if (userObj?.role === 'admin') {
      showToast('Cannot block another administrator', true);
      return;
    }

    const nextStatus = userObj?.status === 'active' ? 'block' : 'unblock';
    if (!window.confirm(`Are you sure you want to ${nextStatus} user ${userObj?.name}?`)) {
      return;
    }

    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-block`);
      showToast(res.data.message || 'User status updated');
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: res.data.status } : u))
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user status', true);
    }
  };

  // Load Complaints
  const loadComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const params = {};
      if (complaintStatusFilter !== 'all') params.status = complaintStatusFilter;
      const res = await api.get('/admin/complaints', { params });
      setComplaintsList(res.data.complaints || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load complaints list', true);
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!adminNote.trim()) {
      showToast('Please document an administrative resolution note', true);
      return;
    }
    try {
      await api.patch(`/admin/complaints/${resolvingComplaint._id}`, {
        status: 'resolved',
        adminNote: adminNote.trim(),
      });
      showToast('Complaint successfully resolved');
      setResolvingComplaint(null);
      setAdminNote('');
      loadComplaints();
      fetchAnalytics();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resolve complaint', true);
    }
  };

  // Load Activity Feed
  const loadActivityFeed = async (isBackground = false) => {
    if (!isBackground) setActivityLoading(true);
    try {
      const res = await api.get('/admin/activity');
      setActivities(res.data.activities || []);
      setLastActivityRefresh(new Date());
    } catch (err) {
      if (!isBackground) showToast(err.response?.data?.message || 'Failed to load activity stream', true);
    } finally {
      if (!isBackground) setActivityLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Toast notifications */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-emergency/10 border border-emergency/30 text-xs font-bold text-emergency flex items-center justify-between shadow-soft-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')} className="p-1 hover:bg-emergency/20 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-xs font-bold text-success flex items-center justify-between shadow-soft-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="p-1 hover:bg-success/20 rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Header & Tab Navigation */}
        <div className="bg-surface rounded-2xl border border-sand p-6 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-ink">Administrative Command Center</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white bg-primary">
                Full Admin Privileges
              </span>
            </div>
            <p className="text-xs text-muted mt-1">
              Operational control, provider validation, booking lifecycles, revenue audit, and dispute resolution.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-bg p-1.5 rounded-xl border border-sand">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted hover:text-ink hover:bg-sand/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {overviewLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-24 bg-surface rounded-2xl border border-sand p-4" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
                  <span className="text-xs text-muted font-medium flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-primary" /> Total Users
                  </span>
                  <span className="text-2xl font-extrabold text-ink block">{metrics?.totalUsers || 0}</span>
                </div>

                <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted font-medium flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-primary" /> Verified Pros
                    </span>
                    {metrics?.pendingVerificationsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {metrics.pendingVerificationsCount} pending
                      </span>
                    )}
                  </div>
                  <span className="text-2xl font-extrabold text-ink block">{metrics?.totalProviders || 0}</span>
                </div>

                <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
                  <span className="text-xs text-muted font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-success" /> Bookings
                  </span>
                  <span className="text-2xl font-extrabold text-ink block">{metrics?.totalBookings || 0}</span>
                </div>

                <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
                  <span className="text-xs text-muted font-medium flex items-center gap-1 text-emergency">
                    <AlertCircle className="w-3.5 h-3.5 text-emergency" /> Emergency
                  </span>
                  <span className="text-2xl font-extrabold text-emergency block">
                    {metrics?.emergencyBookings || 0}
                  </span>
                </div>

                <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
                  <span className="text-xs text-muted font-medium flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-accent" /> Revenue
                  </span>
                  <span className="text-2xl font-extrabold text-ink block">
                    {formatIndianCurrency(metrics?.totalRevenue || 0)}
                  </span>
                </div>

                <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
                  <span className="text-xs text-muted font-medium flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Complaints
                  </span>
                  <span className="text-2xl font-extrabold text-ink block">
                    {metrics?.openComplaintsCount || 0}
                  </span>
                </div>
              </div>
            )}

            {/* Simple CSS Bars Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CSS Bar Chart: Bookings by Status */}
              <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
                <h3 className="text-sm font-bold text-ink">Bookings by Status</h3>
                {bookingsByStatus.length === 0 ? (
                  <p className="text-xs text-muted py-6 text-center">No bookings on record yet.</p>
                ) : (
                  <div className="space-y-3">
                    {bookingsByStatus.map((item) => {
                      const total = metrics?.totalBookings || 1;
                      const percent = Math.min(100, Math.round((item.count / total) * 100));
                      return (
                        <div key={item.status} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="capitalize text-ink">{item.status.replace('_', ' ')}</span>
                            <span className="text-muted">
                              {item.count} ({percent}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-sand/40 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                item.status === 'completed'
                                  ? 'bg-success'
                                  : item.status === 'in_progress'
                                  ? 'bg-primary'
                                  : item.status === 'accepted'
                                  ? 'bg-accent'
                                  : item.status === 'cancelled' || item.status === 'rejected'
                                  ? 'bg-emergency'
                                  : 'bg-sand'
                              }`}
                              style={{ width: `${Math.max(5, percent)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CSS Bar Chart: Revenue by Method */}
              <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
                <h3 className="text-sm font-bold text-ink">Revenue by Payment Mode</h3>
                {revenueByMethod.length === 0 ? (
                  <p className="text-xs text-muted py-6 text-center">No settled payments yet.</p>
                ) : (
                  <div className="space-y-3">
                    {revenueByMethod.map((item) => {
                      const totalRev = metrics?.totalRevenue || 1;
                      const percent = Math.min(100, Math.round((item.total / totalRev) * 100));
                      return (
                        <div key={item.method} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="uppercase text-ink font-bold">
                              {item.method === 'netbanking' ? 'Net Banking' : item.method}
                            </span>
                            <span className="text-muted">
                              {formatIndianCurrency(item.total)} ({item.count} txns)
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-sand/40 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all"
                              style={{ width: `${Math.max(5, percent)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 7-Day Trend (Signups & Bookings) */}
              <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
                <h3 className="text-sm font-bold text-ink">7-Day Activity Trend</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-muted block mb-2">Bookings (Last 7 Days)</span>
                    {bookingsLast7Days.length === 0 ? (
                      <p className="text-xs text-muted">No recent booking records.</p>
                    ) : (
                      <div className="flex items-end justify-between gap-1.5 h-16 pt-2">
                        {bookingsLast7Days.map((d) => (
                          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <span className="text-[10px] font-bold text-ink">{d.count}</span>
                            <div
                              className="w-full bg-primary rounded-t"
                              style={{ height: `${Math.max(6, Math.min(48, d.count * 10))}px` }}
                            />
                            <span className="text-[9px] text-muted truncate w-full text-center">
                              {d.date.slice(5)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-sand/40">
                    <span className="text-xs font-semibold text-muted block mb-2">New Signups (Last 7 Days)</span>
                    {signupsLast7Days.length === 0 ? (
                      <p className="text-xs text-muted">No recent signup records.</p>
                    ) : (
                      <div className="flex items-end justify-between gap-1.5 h-16 pt-2">
                        {signupsLast7Days.map((s) => (
                          <div key={s.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <span className="text-[10px] font-bold text-ink">{s.count}</span>
                            <div
                              className="w-full bg-accent rounded-t"
                              style={{ height: `${Math.max(6, Math.min(48, s.count * 10))}px` }}
                            />
                            <span className="text-[9px] text-muted truncate w-full text-center">
                              {s.date.slice(5)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Most Requested Services & Top Rated Pros */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
                <h3 className="text-sm font-bold text-ink">Most Requested Trade Categories</h3>
                <div className="space-y-3">
                  {categoryBreakdown.map((item) => (
                    <div key={item._id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="capitalize text-ink">{formatCategoryName(item._id)}</span>
                        <span className="text-muted">{item.count} bookings</span>
                      </div>
                      <div className="w-full h-2 bg-sand/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min(100, (item.count / (metrics?.totalBookings || 1)) * 100 * 2.5)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
                <h3 className="text-sm font-bold text-ink">Highest Rated Verified Technicians</h3>
                <div className="space-y-3">
                  {topProviders.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-bg border border-sand/60"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p.user?.avatar ||
                            'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=120&q=80'
                          }
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-sand"
                        />
                        <div>
                          <span className="text-xs font-bold text-ink block leading-tight">
                            {p.user?.name}
                          </span>
                          <span className="text-[11px] text-muted line-clamp-1">
                            {p.headline}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-ink">
                          <Star className="w-3.5 h-3.5 fill-accent text-accent" /> {formatRating(p.ratingAverage)}
                        </span>
                        <span className="text-[10px] text-muted block">
                          {p.ratingCount} reviews
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-ink">Bookings Directory ({bookingsList.length})</h2>
                <p className="text-xs text-muted">Click any row to view complete timeline, contact info, and payment trail.</p>
              </div>

              {/* Filters bar */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => {
                    setBookingStatusFilter(e.target.value);
                    setTimeout(loadBookings, 0);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-sand bg-bg text-xs font-semibold text-ink focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="requested">Requested</option>
                  <option value="accepted">Accepted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={bookingUrgencyFilter}
                  onChange={(e) => {
                    setBookingUrgencyFilter(e.target.value);
                    setTimeout(loadBookings, 0);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-sand bg-bg text-xs font-semibold text-ink focus:outline-none"
                >
                  <option value="all">All Urgency</option>
                  <option value="normal">Normal</option>
                  <option value="emergency">Emergency</option>
                </select>

                <select
                  value={bookingPaymentFilter}
                  onChange={(e) => {
                    setBookingPaymentFilter(e.target.value);
                    setTimeout(loadBookings, 0);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-sand bg-bg text-xs font-semibold text-ink focus:outline-none"
                >
                  <option value="all">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadBookings()}
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-sand bg-bg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5" />
                </div>

                <button
                  onClick={loadBookings}
                  className="p-2 rounded-xl border border-sand bg-bg text-muted hover:text-ink transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {bookingsLoading ? (
              <div className="py-12 text-center text-xs text-muted animate-pulse">Loading bookings...</div>
            ) : bookingsList.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted">No bookings match the selected filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-sand text-muted font-bold uppercase tracking-wider">
                      <th className="py-2.5">ID / Service</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Technician</th>
                      <th className="py-2.5">Price</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5">Payment</th>
                      <th className="py-2.5">Created</th>
                      <th className="py-2.5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/40">
                    {bookingsList.map((b) => (
                      <tr
                        key={b._id}
                        onClick={() => openBookingDrawer(b._id)}
                        className="hover:bg-bg/60 cursor-pointer transition-colors"
                      >
                        <td className="py-3 font-bold text-ink">
                          {b.serviceName}
                          <span className="block font-mono text-[10px] text-muted">#{b._id.slice(-6)}</span>
                        </td>
                        <td className="py-3 text-ink">
                          <span className="font-semibold block">{b.customer?.name || 'Customer'}</span>
                          <span className="text-[11px] text-muted">{b.customer?.phone || b.neighbourhood}</span>
                        </td>
                        <td className="py-3 text-ink">
                          <span className="font-semibold block">
                            {b.provider?.user?.name || b.provider?.headline || 'Technician'}
                          </span>
                          <span className="text-[11px] text-muted">{b.provider?.user?.phone || 'On File'}</span>
                        </td>
                        <td className="py-3 font-bold text-ink">{formatIndianCurrency(b.price)}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              b.status === 'completed'
                                ? 'bg-success/15 text-success'
                                : b.status === 'in_progress'
                                ? 'bg-primary/10 text-primary'
                                : b.status === 'accepted'
                                ? 'bg-accent/15 text-accent-dark'
                                : b.status === 'cancelled' || b.status === 'rejected'
                                ? 'bg-emergency/15 text-emergency'
                                : 'bg-sand text-muted'
                            }`}
                          >
                            {b.status.replace('_', ' ')}
                          </span>
                          {b.urgency === 'emergency' && (
                            <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emergency text-white">
                              🚨
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              b.paymentStatus === 'paid'
                                ? 'bg-success/15 text-success'
                                : b.paymentStatus === 'refunded'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 text-muted">
                          {new Date(b.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3 text-right">
                          <ChevronRight className="w-4 h-4 text-muted inline-block" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SIDE DRAWER: Booking Details */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex justify-end">
            <div className="bg-surface w-full max-w-lg h-full overflow-y-auto p-6 space-y-6 shadow-soft-lg border-l border-sand animate-in slide-in-from-right">
              <div className="flex items-center justify-between border-b border-sand pb-4">
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Booking Audit</span>
                  <h3 className="text-lg font-bold text-ink">#{selectedBooking._id}</h3>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1 rounded-lg hover:bg-sand/40 text-muted hover:text-ink"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Service & Price */}
              <div className="p-4 rounded-xl bg-bg border border-sand space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-ink">{selectedBooking.serviceName}</span>
                  <span className="font-extrabold text-base text-primary">
                    {formatIndianCurrency(selectedBooking.price)}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Category</span>
                  <span className="font-semibold text-ink capitalize">{selectedBooking.category}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Urgency Profile</span>
                  <span className={`font-bold capitalize ${selectedBooking.urgency === 'emergency' ? 'text-emergency' : 'text-primary'}`}>
                    {selectedBooking.urgency}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Scheduled Slot</span>
                  <span className="font-semibold text-ink">
                    {new Date(selectedBooking.scheduledFor).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2 border-t border-sand/40">
                  <span className="text-muted block text-[10px] uppercase font-bold">Address</span>
                  <span className="text-ink font-semibold">
                    {selectedBooking.address} ({selectedBooking.neighbourhood})
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-[10px] uppercase font-bold">Problem Description</span>
                  <span className="text-ink">{selectedBooking.problemDescription}</span>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="p-4 rounded-xl bg-bg border border-sand space-y-1.5 text-xs">
                <h4 className="font-bold text-ink text-xs uppercase tracking-wider">Customer Contact</h4>
                <div className="flex justify-between">
                  <span className="text-muted">Name</span>
                  <span className="font-bold text-ink">{selectedBooking.customer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Phone</span>
                  <span className="font-semibold text-ink">{selectedBooking.customer?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Email</span>
                  <span className="text-ink">{selectedBooking.customer?.email}</span>
                </div>
              </div>

              {/* Technician Contact */}
              <div className="p-4 rounded-xl bg-bg border border-sand space-y-1.5 text-xs">
                <h4 className="font-bold text-ink text-xs uppercase tracking-wider">Technician Contact</h4>
                <div className="flex justify-between">
                  <span className="text-muted">Name</span>
                  <span className="font-bold text-ink">{selectedBooking.provider?.user?.name || 'Technician'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Phone</span>
                  <span className="font-semibold text-ink">{selectedBooking.provider?.user?.phone || 'On file'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Headline</span>
                  <span className="text-ink truncate max-w-[200px]">{selectedBooking.provider?.headline}</span>
                </div>
              </div>

              {/* Linked Payment Audit */}
              <div className="p-4 rounded-xl bg-bg border border-sand space-y-2 text-xs">
                <h4 className="font-bold text-ink text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>Linked Payment Record</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] uppercase ${
                      selectedBooking.paymentStatus === 'paid'
                        ? 'bg-success/15 text-success'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedBooking.paymentStatus}
                  </span>
                </h4>
                {selectedBookingPayment ? (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span className="text-muted">Payment Reference</span>
                      <span className="font-mono font-bold text-ink">{selectedBookingPayment.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Method</span>
                      <span className="font-bold uppercase text-ink">{selectedBookingPayment.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Settled Amount</span>
                      <span className="font-bold text-ink">
                        {formatIndianCurrency(selectedBookingPayment.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Date</span>
                      <span className="text-ink">
                        {new Date(selectedBookingPayment.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted text-[11px] pt-1">
                    No completed gateway transaction recorded yet (status is {selectedBooking.paymentStatus}).
                  </p>
                )}
              </div>

              {/* Status Timeline */}
              <div className="p-4 rounded-xl bg-bg border border-sand space-y-3 text-xs">
                <h4 className="font-bold text-ink text-xs uppercase tracking-wider">Status History Timeline</h4>
                <div className="space-y-3 pl-2 border-l-2 border-primary/30">
                  {selectedBooking.statusHistory?.map((sh, idx) => (
                    <div key={idx} className="relative pl-3">
                      <span className="w-2 h-2 rounded-full bg-primary absolute -left-[17px] top-1" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink capitalize">{sh.status.replace('_', ' ')}</span>
                        <span className="text-[10px] text-muted">
                          {new Date(sh.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {sh.note && <p className="text-muted text-[11px] mt-0.5">"{sh.note}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Method Totals Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
                <span className="text-xs text-muted font-medium flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-primary" /> Total Settled
                </span>
                <span className="text-xl font-extrabold text-ink block">
                  {formatIndianCurrency(totalsByMethod.total || 0)}
                </span>
              </div>
              <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
                <span className="text-xs text-muted font-medium flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-accent" /> UPI Volume
                </span>
                <span className="text-xl font-extrabold text-ink block">
                  {formatIndianCurrency(totalsByMethod.upi || 0)}
                </span>
              </div>
              <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
                <span className="text-xs text-muted font-medium flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-success" /> Card Volume
                </span>
                <span className="text-xl font-extrabold text-ink block">
                  {formatIndianCurrency(totalsByMethod.card || 0)}
                </span>
              </div>
              <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
                <span className="text-xs text-muted font-medium flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-muted" /> Net Banking
                </span>
                <span className="text-xl font-extrabold text-ink block">
                  {formatIndianCurrency(totalsByMethod.netbanking || 0)}
                </span>
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-ink">Payment Audit Trail ({paymentsList.length})</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => {
                      setPaymentMethodFilter(e.target.value);
                      setTimeout(loadPayments, 0);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-sand bg-bg text-xs font-semibold text-ink focus:outline-none"
                  >
                    <option value="all">All Methods</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="netbanking">Net Banking</option>
                  </select>

                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => {
                      setPaymentStatusFilter(e.target.value);
                      setTimeout(loadPayments, 0);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-sand bg-bg text-xs font-semibold text-ink focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>

                  <button
                    onClick={loadPayments}
                    className="p-2 rounded-xl border border-sand bg-bg text-muted hover:text-ink transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {paymentsLoading ? (
                <div className="py-12 text-center text-xs text-muted animate-pulse">Loading payments audit...</div>
              ) : paymentsList.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted">No payments match the selected criteria.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-sand text-muted font-bold uppercase tracking-wider">
                        <th className="py-2.5">Reference</th>
                        <th className="py-2.5">Customer</th>
                        <th className="py-2.5">Service</th>
                        <th className="py-2.5">Method</th>
                        <th className="py-2.5">Amount</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand/40">
                      {paymentsList.map((p) => (
                        <tr key={p._id} className="hover:bg-bg/60">
                          <td className="py-3 font-mono font-bold text-ink">{p.reference}</td>
                          <td className="py-3">
                            <span className="font-bold text-ink block">{p.customer?.name}</span>
                            <span className="text-[11px] text-muted">{p.customer?.phone}</span>
                          </td>
                          <td className="py-3 text-ink font-semibold">
                            {p.booking?.serviceName || 'Service Visit'}
                          </td>
                          <td className="py-3 font-bold uppercase text-primary">
                            {p.method === 'netbanking' ? 'Net Banking' : p.method}
                          </td>
                          <td className="py-3 font-extrabold text-ink">{formatIndianCurrency(p.amount)}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                p.status === 'completed'
                                  ? 'bg-success/15 text-success'
                                  : 'bg-emergency/15 text-emergency'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 text-right text-muted">
                            {new Date(p.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PROVIDERS */}
        {activeTab === 'providers' && (
          <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-ink">Technician Roster & Verification ({providersList.length})</h2>
                <p className="text-xs text-muted">Review credentials, verify trade certifications, and manage dispatch eligibility.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={providerVerificationFilter}
                  onChange={(e) => {
                    setProviderVerificationFilter(e.target.value);
                    setTimeout(loadProviders, 0);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-sand bg-bg text-xs font-semibold text-ink focus:outline-none"
                >
                  <option value="all">All Verification</option>
                  <option value="pending">Pending Queue</option>
                  <option value="verified">Verified Only</option>
                  <option value="rejected">Rejected Only</option>
                </select>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search technician..."
                    value={providerSearch}
                    onChange={(e) => setProviderSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadProviders()}
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-sand bg-bg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5" />
                </div>

                <button
                  onClick={loadProviders}
                  className="p-2 rounded-xl border border-sand bg-bg text-muted hover:text-ink transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {providersLoading ? (
              <div className="py-12 text-center text-xs text-muted animate-pulse">Loading technician roster...</div>
            ) : providersList.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted">No providers match the filter criteria.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-sand text-muted font-bold uppercase tracking-wider">
                      <th className="py-2.5">Technician</th>
                      <th className="py-2.5">Categories</th>
                      <th className="py-2.5">Base Area</th>
                      <th className="py-2.5">Jobs Done</th>
                      <th className="py-2.5">Earnings</th>
                      <th className="py-2.5">Rating</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/40">
                    {providersList.map((p) => {
                      const isNew = p.rating?.average == null || p.rating?.count === 0;
                      return (
                        <tr key={p._id} className="hover:bg-bg/60">
                          <td className="py-3 font-bold text-ink">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={
                                  p.user?.avatar ||
                                  'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=100&q=80'
                                }
                                alt=""
                                className="w-8 h-8 rounded-full object-cover border border-sand"
                              />
                              <div>
                                <span className="font-bold text-ink block">{p.user?.name || 'Technician'}</span>
                                <span className="text-[11px] text-muted line-clamp-1">{p.headline}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 capitalize font-semibold text-ink">
                            {p.categories?.join(', ')}
                          </td>
                          <td className="py-3 text-muted">{p.serviceAreas?.[0] || 'Tricity'}</td>
                          <td className="py-3 font-bold text-ink">{p.completedJobs || 0}</td>
                          <td className="py-3 font-bold text-ink">{formatIndianCurrency(p.earningsTotal || 0)}</td>
                          <td className="py-3">
                            {isNew ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 text-accent">
                                New
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-bold text-ink">
                                <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                                {formatRating(p.rating?.average)}
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                p.verificationStatus === 'verified'
                                  ? 'bg-success/15 text-success'
                                  : p.verificationStatus === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emergency/15 text-emergency'
                              }`}
                            >
                              {p.verificationStatus}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-1.5">
                            {p.verificationStatus !== 'verified' && (
                              <button
                                onClick={() => handleVerifyProvider(p._id, 'verified')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-success hover:bg-success-dark transition-all"
                              >
                                Approve
                              </button>
                            )}
                            {p.verificationStatus !== 'rejected' && (
                              <button
                                onClick={() => handleVerifyProvider(p._id, 'rejected')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-emergency hover:bg-emergency/10 border border-emergency/30 transition-all"
                              >
                                Reject
                              </button>
                            )}
                            {p.verificationStatus === 'verified' && (
                              <button
                                onClick={() => handleVerifyProvider(p._id, 'pending')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-muted hover:bg-sand/40 border border-sand transition-all"
                              >
                                Suspend
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: USERS */}
        {activeTab === 'users' && (
          <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-ink">User Directory ({usersList.length})</h2>
              <div className="flex items-center gap-2">
                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setTimeout(loadUsers, 0);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-sand bg-bg text-xs font-semibold text-ink focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="provider">Provider</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => {
                    setUserStatusFilter(e.target.value);
                    setTimeout(loadUsers, 0);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-sand bg-bg text-xs font-semibold text-ink focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>

                <div className="relative max-w-xs w-full">
                  <input
                    type="text"
                    placeholder="Search name, email, phone..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-sand bg-bg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {usersLoading ? (
              <div className="py-12 text-center text-xs text-muted animate-pulse">Loading user directory...</div>
            ) : usersList.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted">No users match your search criteria.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-sand text-muted font-bold uppercase tracking-wider">
                      <th className="py-2.5">User</th>
                      <th className="py-2.5">Role</th>
                      <th className="py-2.5">Phone</th>
                      <th className="py-2.5">Neighbourhood</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/40">
                    {usersList.map((u) => {
                      const isSelf = String(currentAdmin?._id) === String(u._id);
                      const isProtectedAdmin = u.role === 'admin';
                      return (
                        <tr key={u._id} className="hover:bg-bg/50">
                          <td className="py-2.5 font-bold text-ink">
                            {u.name}
                            <span className="block text-[11px] font-normal text-muted">{u.email}</span>
                          </td>
                          <td className="py-2.5 capitalize font-semibold">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.role === 'admin'
                                  ? 'bg-primary text-white'
                                  : u.role === 'provider'
                                  ? 'bg-tint text-primary'
                                  : 'bg-sand/60 text-ink'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-2.5 text-muted">{u.phone}</td>
                          <td className="py-2.5 text-muted">{u.neighbourhood || 'Tricity'}</td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                u.status === 'active'
                                  ? 'bg-success/15 text-success'
                                  : 'bg-emergency/15 text-emergency'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            {isProtectedAdmin ? (
                              <span className="text-[11px] text-muted italic">Protected Admin</span>
                            ) : (
                              <button
                                onClick={() => handleToggleBlock(u._id, u)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                  u.status === 'active'
                                    ? 'text-emergency hover:bg-emergency/10 border border-emergency/30'
                                    : 'text-success hover:bg-success/10 border border-success/30'
                                }`}
                              >
                                {u.status === 'active' ? 'Block Account' : 'Unblock Account'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: COMPLAINTS */}
        {activeTab === 'complaints' && (
          <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-ink">Dispute & Complaint Records ({complaintsList.length})</h2>
              <div className="flex items-center gap-2">
                <select
                  value={complaintStatusFilter}
                  onChange={(e) => {
                    setComplaintStatusFilter(e.target.value);
                    setTimeout(loadComplaints, 0);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-sand bg-bg text-xs font-semibold text-ink focus:outline-none"
                >
                  <option value="all">All Complaints</option>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                </select>

                <button
                  onClick={loadComplaints}
                  className="p-2 rounded-xl border border-sand bg-bg text-muted hover:text-ink transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {complaintsLoading ? (
              <div className="py-12 text-center text-xs text-muted animate-pulse">Loading disputes...</div>
            ) : complaintsList.length === 0 ? (
              <p className="text-xs text-muted py-6">No complaints match your selection.</p>
            ) : (
              <div className="space-y-4">
                {complaintsList.map((c) => (
                  <div key={c._id} className="p-4 rounded-xl bg-bg border border-sand/60 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-ink">{c.subject}</h4>
                        <span className="text-muted text-[11px]">
                          Raised by: <strong>{c.raisedBy?.name}</strong> against{' '}
                          <strong>{c.against?.name || 'Technician'}</strong>
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase self-start ${
                          c.status === 'resolved'
                            ? 'bg-success/15 text-success'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-ink/80 leading-relaxed bg-surface p-3 rounded-lg border border-sand/40">
                      "{c.description}"
                    </p>

                    {c.adminNote && (
                      <div className="p-2.5 bg-tint rounded-lg text-[11px] text-primary">
                        <strong>Admin Resolution Note:</strong> {c.adminNote}
                      </div>
                    )}

                    {c.status !== 'resolved' && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => setResolvingComplaint(c)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-dark"
                        >
                          Resolve Complaint
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: ACTIVITY FEED */}
        {activeTab === 'activity' && (
          <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">Live Platform Activity Feed</h2>
                <p className="text-xs text-muted">
                  Last 50 unified platform events (new users, technicians, booking transitions, payments). Auto-refreshes every 30 seconds.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-muted hidden sm:inline">
                  Updated: {lastActivityRefresh.toLocaleTimeString()}
                </span>
                <button
                  onClick={() => loadActivityFeed(false)}
                  className="px-3 py-1.5 rounded-xl border border-sand bg-bg text-xs font-bold text-ink hover:bg-sand/30 flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${activityLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Feed</span>
                </button>
              </div>
            </div>

            {activityLoading ? (
              <div className="py-12 text-center text-xs text-muted animate-pulse">Loading live activity feed...</div>
            ) : activities.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted">No recent activity detected.</div>
            ) : (
              <div className="space-y-3">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-xl bg-bg border border-sand/60 flex items-start justify-between gap-4 text-xs transition-colors hover:bg-surface"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink">{act.title}</span>
                        {act.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              act.badgeColor === 'success'
                                ? 'bg-success/15 text-success'
                                : act.badgeColor === 'emergency'
                                ? 'bg-emergency/15 text-emergency'
                                : act.badgeColor === 'accent'
                                ? 'bg-accent/15 text-accent-dark'
                                : 'bg-tint text-primary'
                            }`}
                          >
                            {act.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-muted leading-relaxed">{act.description}</p>
                    </div>

                    <span className="text-[10px] text-muted shrink-0 mt-0.5">
                      {new Date(act.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Resolve Complaint */}
        {resolvingComplaint && (
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl border border-sand p-6 max-w-md w-full space-y-4 shadow-soft-lg">
              <h3 className="text-lg font-bold text-ink">Resolve Complaint</h3>
              <p className="text-xs text-muted">
                Document administrative resolution for: <strong>{resolvingComplaint.subject}</strong>
              </p>

              <form onSubmit={handleResolveComplaint} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                    Resolution Note
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe corrective actions taken or consensus reached..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-sand bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResolvingComplaint(null);
                      setAdminNote('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-success rounded-xl"
                  >
                    Mark Resolved
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
