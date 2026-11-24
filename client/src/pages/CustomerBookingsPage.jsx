import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatIndianCurrency, formatRating } from '../utils/formatters';
import {
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Star,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  Navigation,
} from 'lucide-react';

export const CustomerBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  // Modals state
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [complaintModalBooking, setComplaintModalBooking] = useState(null);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/customer');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${bookingId}/status`, {
        status: 'cancelled',
        note: 'Customer cancelled booking',
      });
      fetchBookings();
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        bookingId: reviewModalBooking._id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewModalBooking(null);
      setReviewComment('');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Review submission failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDesc.trim()) return;
    setSubmittingComplaint(true);
    try {
      await api.post('/complaints', {
        bookingId: complaintModalBooking._id,
        subject: complaintSubject,
        description: complaintDesc,
      });
      setComplaintModalBooking(null);
      setComplaintSubject('');
      setComplaintDesc('');
      alert('Complaint lodged with administration.');
    } catch (err) {
      alert(err.response?.data?.message || 'Complaint submission failed');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'active') {
      return ['requested', 'accepted', 'in_progress'].includes(b.status);
    }
    if (filter === 'completed') {
      return b.status === 'completed';
    }
    return true;
  });

  const getTimelineSteps = (status) => {
    const steps = [
      { key: 'requested', label: 'Requested' },
      { key: 'accepted', label: 'Accepted' },
      { key: 'in_progress', label: 'In Progress' },
      { key: 'completed', label: 'Completed' },
    ];

    const statusWeights = {
      requested: 1,
      accepted: 2,
      in_progress: 3,
      completed: 4,
      cancelled: 0,
      rejected: 0,
    };

    const currentWeight = statusWeights[status] || 0;

    return steps.map((s, idx) => ({
      ...s,
      isDone: idx + 1 <= currentWeight,
      isCurrent: idx + 1 === currentWeight,
    }));
  };

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-ink">My Service Bookings</h1>
            <p className="text-xs text-muted mt-0.5">
              Track arrival status, payments, and reviews for your home repairs.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-sand">
            {['all', 'active', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === tab
                    ? 'bg-primary text-white'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-surface rounded-2xl border border-sand animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-2xl border border-sand p-8">
            <Calendar className="w-12 h-12 text-muted mx-auto mb-3" />
            <h3 className="text-base font-bold text-ink">No bookings found</h3>
            <p className="text-xs text-muted mt-1">You have no service bookings in this category.</p>
            <Link
              to="/search"
              className="inline-block mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary"
            >
              Book a Service
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((b) => {
              const timeline = getTimelineSteps(b.status);
              const providerUser = b.provider?.user;

              return (
                <div
                  key={b._id}
                  className="bg-surface rounded-2xl border border-sand p-5 sm:p-6 shadow-soft-sm space-y-5"
                >
                  {/* Top card bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand/60">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={
                          providerUser?.avatar ||
                          'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80'
                        }
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border border-sand"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-ink">{b.serviceName}</h3>
                          {b.urgency === 'emergency' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emergency bg-emergency/10 border border-emergency/30 emergency-pulse">
                              Emergency
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          Technician: <strong className="text-ink">{providerUser?.name || 'Local Technician'}</strong>
                          {providerUser?.phone && ` • 📞 ${providerUser.phone}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-muted block">
                        Scheduled for: <strong className="text-ink">{new Date(b.scheduledFor).toLocaleDateString()}</strong>
                      </span>
                      <div className="flex items-center sm:justify-end gap-2 mt-1">
                        <span className="text-sm font-extrabold text-ink">{formatIndianCurrency(b.price)}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            b.paymentStatus === 'paid'
                              ? 'bg-success/15 text-success'
                              : b.paymentStatus === 'refunded'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Problem Description & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-bg p-3.5 rounded-xl border border-sand/60">
                    <div>
                      <span className="text-muted block font-semibold">Service Address</span>
                      <span className="text-ink">{b.address} ({b.neighbourhood})</span>
                    </div>
                    <div>
                      <span className="text-muted block font-semibold">Issue Description</span>
                      <span className="text-ink">{b.problemDescription}</span>
                    </div>
                  </div>

                  {/* Visual Status Timeline */}
                  {b.status !== 'cancelled' && b.status !== 'rejected' && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-sand -z-0" />
                        {timeline.map((step, idx) => (
                          <div key={step.key} className="flex flex-col items-center relative z-10 bg-surface px-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                step.isDone
                                  ? 'bg-primary text-white ring-4 ring-tint'
                                  : 'bg-sand text-muted'
                              }`}
                            >
                              {step.isDone ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`text-[11px] font-semibold mt-1 ${
                                step.isDone ? 'text-primary font-bold' : 'text-muted'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Cluster */}
                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-sand/40 gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setComplaintModalBooking(b)}
                        className="text-xs text-muted hover:text-emergency flex items-center gap-1 transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Report Issue</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Live Tracking link if accepted or in_progress */}
                      {['accepted', 'in_progress'].includes(b.status) && (
                        <Link
                          to={`/track/${b._id}`}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Navigation className="w-3.5 h-3.5 text-accent animate-pulse" />
                          <span>Track Technician</span>
                        </Link>
                      )}

                      {/* Pay button only for accepted, in_progress or completed bookings with pending payment */}
                      {['accepted', 'in_progress', 'completed'].includes(b.status) &&
                        b.paymentStatus === 'pending' && (
                          <Link
                            to={`/pay/${b._id}`}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay ₹{b.price}</span>
                          </Link>
                        )}

                      {/* Refunded state */}
                      {b.paymentStatus === 'refunded' && (
                        <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Refunded
                        </span>
                      )}

                      {/* Cancel button if requested */}
                      {b.status === 'requested' && (
                        <button
                          onClick={() => handleCancel(b._id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emergency hover:bg-emergency/10 border border-emergency/30 transition-all"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {/* Review button if completed and no review yet */}
                      {b.status === 'completed' && !b.hasReview && (
                        <button
                          onClick={() => setReviewModalBooking(b)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-ink bg-accent hover:bg-accent-light transition-all flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>Leave Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Review Modal */}
        {reviewModalBooking && (
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl border border-sand p-6 max-w-md w-full space-y-4 shadow-soft-lg">
              <h3 className="text-lg font-bold text-ink">Rate & Review Service</h3>
              <p className="text-xs text-muted">
                How was your experience with <strong>{reviewModalBooking.serviceName}</strong>?
              </p>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= reviewRating
                              ? 'fill-accent text-accent'
                              : 'text-sand fill-transparent'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Your Feedback
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe punctuality, workmanship, cleanliness..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-sand bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalBooking(null)}
                    className="px-4 py-2 text-xs font-semibold text-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 text-xs font-bold text-white bg-primary rounded-xl"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Complaint Modal */}
        {complaintModalBooking && (
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl border border-sand p-6 max-w-md w-full space-y-4 shadow-soft-lg">
              <h3 className="text-lg font-bold text-ink">Report an Issue / Complaint</h3>
              <p className="text-xs text-muted">
                Our administration will investigate the incident and contact both parties.
              </p>

              <form onSubmit={handleSubmitComplaint} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Technician arrived late / Billing issue"
                    value={complaintSubject}
                    onChange={(e) => setComplaintSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-sand bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Description of Issue
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Please explain in detail what happened..."
                    value={complaintDesc}
                    onChange={(e) => setComplaintDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-sand bg-bg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setComplaintModalBooking(null)}
                    className="px-4 py-2 text-xs font-semibold text-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingComplaint}
                    className="px-5 py-2 text-xs font-bold text-white bg-emergency rounded-xl"
                  >
                    {submittingComplaint ? 'Lodging...' : 'Submit to Admin'}
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
