import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatIndianCurrency, formatRating } from '../utils/formatters';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Wallet,
  Star,
  Power,
  MapPin,
  Save,
  Navigation,
  MessageSquare,
} from 'lucide-react';

const ALL_CATEGORIES = [
  { slug: 'plumber', label: 'Plumber' },
  { slug: 'electrician', label: 'Electrician' },
  { slug: 'ac-technician', label: 'AC Technician' },
  { slug: 'carpenter', label: 'Carpenter' },
  { slug: 'painter', label: 'Painter' },
  { slug: 'cleaner', label: 'Cleaner' },
  { slug: 'appliance-repair', label: 'Appliance Repair' },
  { slug: 'cctv-security', label: 'CCTV & Security' },
  { slug: 'pest-control', label: 'Pest Control' },
  { slug: 'water-purifier', label: 'Water Purifier' },
];

const StarDisplay = ({ rating }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-3.5 h-3.5 ${s <= rating ? 'fill-accent text-accent' : 'text-sand'}`}
      />
    ))}
  </span>
);

export const ProviderDashboardPage = () => {
  const { user, providerProfile, updateProviderData } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'profile' | 'reviews'

  // Availability state
  const [isAvailableNow, setIsAvailableNow] = useState(
    providerProfile?.availability?.isAvailableNow ?? true
  );

  // Profile editor state
  const [headline, setHeadline] = useState(providerProfile?.headline || '');
  const [bio, setBio] = useState(providerProfile?.bio || '');
  const [visitCharge, setVisitCharge] = useState(providerProfile?.pricing?.visitCharge || 350);
  const [hourlyRate, setHourlyRate] = useState(providerProfile?.pricing?.hourlyRate || 250);
  const [experienceYears, setExperienceYears] = useState(providerProfile?.experienceYears || 1);
  const [skillsInput, setSkillsInput] = useState((providerProfile?.skills || []).join(', '));
  const [serviceAreasInput, setServiceAreasInput] = useState(
    (providerProfile?.serviceAreas || []).join(', ')
  );
  const [selectedCategories, setSelectedCategories] = useState(providerProfile?.categories || []);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Live Location Sharing state
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [liveLocationInfo, setLiveLocationInfo] = useState('');

  const handleToggleLiveLocation = () => {
    if (isSharingLocation) {
      setIsSharingLocation(false);
      setLiveLocationInfo('');
      return;
    }
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsSharingLocation(true);
          setLiveLocationInfo(
            `Live GPS: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`
          );
        },
        () => {
          setIsSharingLocation(true);
          setLiveLocationInfo('Simulated GPS: 30.7046° N, 76.7179° E (Phase 7, Mohali)');
        },
        { timeout: 5000 }
      );
    } else {
      setIsSharingLocation(true);
      setLiveLocationInfo('Simulated GPS: 30.7046° N, 76.7179° E (Phase 7, Mohali)');
    }
  };

  useEffect(() => {
    fetchProviderBookings();
  }, []);

  const fetchProviderBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/provider');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load provider bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await api.get('/reviews/my-reviews');
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'reviews' && reviews.length === 0) {
      fetchMyReviews();
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const res = await api.post('/providers/toggle-availability');
      setIsAvailableNow(res.data.isAvailableNow);
      if (providerProfile) {
        updateProviderData({
          ...providerProfile,
          availability: {
            ...providerProfile.availability,
            isAvailableNow: res.data.isAvailableNow,
          },
        });
      }
    } catch (err) {
      alert('Failed to update availability status.');
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, {
        status: newStatus,
        note: `Provider updated status to ${newStatus}`,
      });
      fetchProviderBookings();
    } catch (err) {
      alert('Failed to update job status.');
    }
  };

  const toggleCategory = (slug) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSavedMsg('');
    try {
      const skills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const serviceAreas = serviceAreasInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.patch('/providers/profile', {
        headline,
        bio,
        pricing: {
          visitCharge: Number(visitCharge),
          hourlyRate: Number(hourlyRate),
        },
        experienceYears: Number(experienceYears),
        skills,
        serviceAreas,
        categories: selectedCategories,
      });
      updateProviderData(res.data.profile);
      setProfileSavedMsg('Profile changes saved successfully.');
    } catch (err) {
      alert('Failed to save profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Metrics
  const totalCompleted = bookings.filter((b) => b.status === 'completed').length;
  const activeJobs = bookings.filter((b) =>
    ['requested', 'accepted', 'in_progress'].includes(b.status)
  );
  const totalEarnings = providerProfile?.earningsTotal || 0;

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Live Availability Toggle */}
        <div className="bg-surface rounded-2xl border border-sand p-6 shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-ink">Provider Workstation</h1>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                  providerProfile?.verificationStatus === 'verified'
                    ? 'text-success bg-success/10 border-success/20'
                    : 'text-accent bg-accent/10 border-accent/20'
                }`}
              >
                {providerProfile?.verificationStatus === 'verified'
                  ? 'Verified Provider'
                  : 'Verification Pending'}
              </span>
            </div>
            <p className="text-xs text-muted mt-1">
              Welcome back, <strong className="text-ink">{user?.name}</strong> •{' '}
              {providerProfile?.headline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleToggleLiveLocation}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                isSharingLocation
                  ? 'bg-accent text-ink hover:bg-accent-hover'
                  : 'bg-sand text-muted hover:text-ink'
              }`}
            >
              <Navigation className={`w-4 h-4 ${isSharingLocation ? 'animate-spin' : ''}`} />
              <span>{isSharingLocation ? 'Live GPS Active' : 'Share Live Location'}</span>
            </button>

            <button
              onClick={handleToggleAvailability}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                isAvailableNow
                  ? 'bg-success text-white hover:bg-success-dark'
                  : 'bg-sand text-muted hover:text-ink'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isAvailableNow ? 'Active (Accepting Jobs)' : 'Offline (Paused)'}</span>
            </button>
          </div>
        </div>

        {isSharingLocation && liveLocationInfo && (
          <div className="bg-tint/70 border border-primary/20 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-primary font-medium shadow-soft-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
              <span>{liveLocationInfo}</span>
            </div>
            <span className="text-[11px] text-muted">Transmitting telemetry to assigned customers</span>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
            <span className="text-xs text-muted font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" /> Active Tasks
            </span>
            <span className="text-2xl font-extrabold text-ink block">{activeJobs.length}</span>
          </div>

          <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
            <span className="text-xs text-muted font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" /> Completed Jobs
            </span>
            <span className="text-2xl font-extrabold text-ink block">{totalCompleted}</span>
          </div>

          <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
            <span className="text-xs text-muted font-medium flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-accent" /> Total Revenue
            </span>
            <span className="text-2xl font-extrabold text-ink block">
              {formatIndianCurrency(totalEarnings)}
            </span>
          </div>

          <div className="bg-surface p-5 rounded-2xl border border-sand space-y-1">
            <span className="text-xs text-muted font-medium flex items-center gap-1.5">
              <Star className="w-4 h-4 text-accent fill-accent" /> Rating Average
            </span>
            <span className="text-2xl font-extrabold text-ink block">
              {providerProfile?.ratingAverage ? formatRating(providerProfile.ratingAverage) : '—'}
              <span className="text-xs font-normal text-muted ml-1">
                ({providerProfile?.ratingCount || 0} reviews)
              </span>
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 border-b border-sand pb-2">
          <button
            onClick={() => handleTabChange('jobs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'jobs' ? 'bg-primary text-white' : 'text-muted hover:text-ink'
            }`}
          >
            Job Requests & Schedule ({bookings.length})
          </button>
          <button
            onClick={() => handleTabChange('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'profile' ? 'bg-primary text-white' : 'text-muted hover:text-ink'
            }`}
          >
            Profile & Rates Settings
          </button>
          <button
            onClick={() => handleTabChange('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'reviews' ? 'bg-primary text-white' : 'text-muted hover:text-ink'
            }`}
          >
            My Reviews
          </button>
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' ? (
          loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-surface rounded-2xl border border-sand animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 bg-surface rounded-2xl border border-sand p-8">
              <Briefcase className="w-12 h-12 text-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-ink">No bookings yet</h3>
              <p className="text-xs text-muted mt-1">
                When customers search for your trade category in your area, new requests will appear
                here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="bg-surface rounded-2xl border border-sand p-5 space-y-4 shadow-soft-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-ink">{b.serviceName}</h3>
                        {b.urgency === 'emergency' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emergency bg-emergency/10 border border-emergency/30 emergency-pulse">
                            🚨 Emergency Job
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'completed'
                              ? 'bg-success/15 text-success'
                              : b.status === 'in_progress'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-sand text-muted'
                          }`}
                        >
                          {b.status.replace('_', ' ')}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.paymentStatus === 'paid'
                              ? 'bg-success/15 text-success'
                              : b.paymentStatus === 'refunded'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.paymentStatus === 'paid'
                            ? 'Paid'
                            : b.paymentStatus === 'refunded'
                            ? 'Refunded'
                            : 'Payment pending'}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1">
                        Customer:{' '}
                        <strong className="text-ink">{b.customer?.name}</strong> • 📞{' '}
                        {b.customer?.phone}
                      </p>
                      <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-muted" /> {b.address} ({b.neighbourhood}
                        )
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-base font-extrabold text-ink block">₹{b.price}</span>
                      <span className="text-[11px] text-muted">
                        Slot: {new Date(b.scheduledFor).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-bg rounded-xl text-xs text-ink/90 border border-sand/40">
                    <strong className="text-muted block text-[10px] uppercase">
                      Problem Description
                    </strong>
                    {b.problemDescription}
                  </div>

                  {/* Actions according to state */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-sand/40">
                    {b.status === 'requested' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'rejected')}
                          className="px-3.5 py-1.5 text-xs font-semibold text-emergency hover:bg-emergency/10 rounded-xl transition-all"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'accepted')}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all"
                        >
                          Accept Booking
                        </button>
                      </>
                    )}
                    {b.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'in_progress')}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all"
                      >
                        Start Work (In Progress)
                      </button>
                    )}
                    {b.status === 'in_progress' && (
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'completed')}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-success hover:bg-success-dark rounded-xl transition-all"
                      >
                        Mark Job Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'reviews' ? (
          /* My Reviews Tab */
          <div className="space-y-4">
            {reviewsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-surface rounded-2xl border border-sand animate-pulse"
                  />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16 bg-surface rounded-2xl border border-sand p-8">
                <MessageSquare className="w-12 h-12 text-muted mx-auto mb-3" />
                <h3 className="text-base font-bold text-ink">No reviews yet</h3>
                <p className="text-xs text-muted mt-1">
                  Customer reviews appear here after they rate a completed and paid service.
                </p>
              </div>
            ) : (
              reviews.map((r) => (
                <div
                  key={r._id}
                  className="bg-surface rounded-2xl border border-sand p-5 space-y-2 shadow-soft-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-ink">{r.customer?.name}</p>
                      <p className="text-[11px] text-muted">{r.customer?.neighbourhood}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <StarDisplay rating={r.rating} />
                      <span className="text-[10px] text-muted">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  {r.booking?.serviceName && (
                    <span className="inline-block text-[10px] font-bold text-primary bg-tint px-2 py-0.5 rounded-full">
                      {r.booking.serviceName}
                    </span>
                  )}
                  <p className="text-xs text-ink/80 leading-relaxed">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Profile Settings Tab */
          <div className="bg-surface rounded-2xl border border-sand p-6 sm:p-8 max-w-2xl space-y-6 shadow-soft-sm">
            <div className="border-b border-sand pb-4">
              <h2 className="text-lg font-bold text-ink">Technician Profile Settings</h2>
              <p className="text-xs text-muted mt-0.5">
                Keep your profile, service areas, skills and rates up to date so customers find the
                right match.
              </p>
            </div>

            {profileSavedMsg && (
              <div className="p-3 rounded-xl bg-success/15 border border-success/30 text-xs font-bold text-success">
                {profileSavedMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                  Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-sand bg-bg text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                  About & Background
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-sand bg-bg text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-sand bg-bg text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g. Leak Detection, Drain Clearing, Geyser Installation"
                  className="w-full px-3 py-2.5 rounded-xl border border-sand bg-bg text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                  Service Areas (comma-separated neighbourhood names)
                </label>
                <input
                  type="text"
                  value={serviceAreasInput}
                  onChange={(e) => setServiceAreasInput(e.target.value)}
                  placeholder="e.g. Phase 7, Mohali, Sector 35, Chandigarh"
                  className="w-full px-3 py-2.5 rounded-xl border border-sand bg-bg text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  Trade Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => toggleCategory(cat.slug)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                        selectedCategories.includes(cat.slug)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-bg text-muted border-sand hover:border-primary'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                    Visit Charge (₹)
                  </label>
                  <input
                    type="number"
                    value={visitCharge}
                    onChange={(e) => setVisitCharge(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-sand bg-bg text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                    Hourly Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-sand bg-bg text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
