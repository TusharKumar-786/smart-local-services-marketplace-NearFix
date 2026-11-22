import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
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
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'verification' | 'complaints'

  // Sub-tab data
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [providersList, setProvidersList] = useState([]);
  const [complaintsList, setComplaintsList] = useState([]);
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      setMetrics(res.data.metrics);
      setCategoryBreakdown(res.data.categoryBreakdown || []);
      setTopProviders(res.data.topProviders || []);
    } catch (err) {
      console.error('Failed to fetch admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users', { params: { search: userSearch } });
      setUsersList(res.data.users || []);
    } catch (err) {}
  };

  const loadVerificationQueue = async () => {
    try {
      const res = await api.get('/admin/providers/verification');
      setProvidersList(res.data.providers || []);
    } catch (err) {}
  };

  const loadComplaints = async () => {
    try {
      const res = await api.get('/admin/complaints');
      setComplaintsList(res.data.complaints || []);
    } catch (err) {}
  };

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'verification') loadVerificationQueue();
    if (activeTab === 'complaints') loadComplaints();
  }, [activeTab]);

  const handleToggleBlock = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-block`);
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: res.data.status } : u))
      );
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleVerifyProvider = async (providerId, status) => {
    try {
      await api.patch(`/admin/providers/${providerId}/verification`, { status });
      loadVerificationQueue();
      fetchAnalytics();
    } catch (err) {
      alert('Failed to update verification');
    }
  };

  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/complaints/${resolvingComplaint._id}`, {
        status: 'resolved',
        adminNote,
      });
      setResolvingComplaint(null);
      setAdminNote('');
      loadComplaints();
      fetchAnalytics();
    } catch (err) {
      alert('Failed to update complaint');
    }
  };

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-surface rounded-2xl border border-sand p-6 shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-ink">Administrative Command Center</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white bg-primary">
                Full Admin Privileges
              </span>
            </div>
            <p className="text-xs text-muted mt-1">
              Platform metrics, verification dispatch, user moderation, and dispute resolution.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-bg p-1 rounded-xl border border-sand">
            {['overview', 'users', 'verification', 'complaints'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-primary text-white'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* High-level KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
                <span className="text-xs text-muted font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-primary" /> Total Users
                </span>
                <span className="text-2xl font-extrabold text-ink block">{metrics?.totalUsers || 0}</span>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
                <span className="text-xs text-muted font-medium flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-primary" /> Providers
                </span>
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
                <span className="text-2xl font-extrabold text-ink block">₹{metrics?.totalRevenue || 0}</span>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Volume Breakdown */}
              <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
                <h3 className="text-base font-bold text-ink">Most Requested Services</h3>
                <div className="space-y-3">
                  {categoryBreakdown.map((item) => (
                    <div key={item._id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="capitalize text-ink">{item._id}</span>
                        <span className="text-muted">{item.count} bookings</span>
                      </div>
                      <div className="w-full h-2 bg-sand/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min(100, (item.count / (metrics?.totalBookings || 1)) * 100 * 3)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Rated Technicians */}
              <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
                <h3 className="text-base font-bold text-ink">Highest Rated Technicians</h3>
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
                          <span className="text-[11px] text-muted">
                            {p.headline?.slice(0, 35)}...
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-ink">
                          <Star className="w-3.5 h-3.5 fill-accent text-accent" /> {p.ratingAverage}
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

        {/* Tab 2: Users Management */}
        {activeTab === 'users' && (
          <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-ink">User Directory ({usersList.length})</h2>
              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-sand bg-bg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5" />
              </div>
            </div>

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
                  {usersList.slice(0, 30).map((u) => (
                    <tr key={u._id} className="hover:bg-bg/50">
                      <td className="py-2.5 font-bold text-ink">
                        {u.name}
                        <span className="block text-[11px] font-normal text-muted">{u.email}</span>
                      </td>
                      <td className="py-2.5 capitalize font-semibold">{u.role}</td>
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
                        <button
                          onClick={() => handleToggleBlock(u._id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            u.status === 'active'
                              ? 'text-emergency hover:bg-emergency/10 border border-emergency/30'
                              : 'text-success hover:bg-success/10 border border-success/30'
                          }`}
                        >
                          {u.status === 'active' ? 'Block Account' : 'Unblock Account'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Verification Queue */}
        {activeTab === 'verification' && (
          <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
            <h2 className="text-lg font-bold text-ink">
              Provider Verification Queue ({providersList.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sand text-muted font-bold uppercase tracking-wider">
                    <th className="py-2.5">Provider</th>
                    <th className="py-2.5">Categories</th>
                    <th className="py-2.5">Experience</th>
                    <th className="py-2.5">Visit Price</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Verification Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/40">
                  {providersList.map((p) => (
                    <tr key={p._id} className="hover:bg-bg/50">
                      <td className="py-2.5 font-bold text-ink">
                        {p.user?.name || 'Technician'}
                        <span className="block text-[11px] font-normal text-muted">{p.headline}</span>
                      </td>
                      <td className="py-2.5 capitalize">{p.categories?.join(', ')}</td>
                      <td className="py-2.5">{p.experienceYears || 3} Years</td>
                      <td className="py-2.5 font-bold">₹{p.pricing?.visitCharge}</td>
                      <td className="py-2.5">
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
                      <td className="py-2.5 text-right space-x-2">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Complaints & Disputes */}
        {activeTab === 'complaints' && (
          <div className="bg-surface rounded-2xl border border-sand p-6 space-y-4">
            <h2 className="text-lg font-bold text-ink">Dispute & Complaint Records</h2>

            {complaintsList.length === 0 ? (
              <p className="text-xs text-muted py-6">No complaints on record.</p>
            ) : (
              <div className="space-y-4">
                {complaintsList.map((c) => (
                  <div key={c._id} className="p-4 rounded-xl bg-bg border border-sand/60 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-ink">{c.subject}</h4>
                        <span className="text-muted text-[11px]">
                          Raised by: <strong>{c.raisedBy?.name}</strong> against <strong>{c.against?.name}</strong>
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

        {/* Resolve Modal */}
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
                    onClick={() => setResolvingComplaint(null)}
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
