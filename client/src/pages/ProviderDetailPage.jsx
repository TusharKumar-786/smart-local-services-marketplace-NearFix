import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import {
  Star,
  MapPin,
  ShieldCheck,
  Clock,
  Banknote,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

export const ProviderDetailPage = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/providers/${id}`);
      setProvider(res.data.provider);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg py-12">
        <div className="max-w-5xl mx-auto px-4 animate-pulse space-y-6">
          <div className="h-6 w-32 bg-sand/50 rounded" />
          <div className="h-64 bg-surface rounded-2xl border border-sand" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-bg py-16 text-center">
        <h2 className="text-xl font-bold text-ink">Provider profile not found</h2>
        <Link to="/search" className="text-sm font-semibold text-primary mt-2 inline-block">
          Return to search
        </Link>
      </div>
    );
  }

  const name = provider.user?.name || 'Local Technician';
  const avatar =
    provider.user?.avatar ||
    provider.photos?.[0] ||
    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80';

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to results</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface rounded-2xl border border-sand p-6 sm:p-8 space-y-6 shadow-soft-sm">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                <div className="relative shrink-0">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-sand"
                  />
                  {provider.verificationStatus === 'verified' && (
                    <div
                      title="Verified Identity and Trade Background"
                      className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-success text-white shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-ink">{name}</h1>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-success bg-success/10 border border-success/20">
                      ID Verified
                    </span>
                    {provider.availability?.isAvailableNow ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Available Now
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs text-muted bg-sand/40">
                        Currently Busy
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-primary">{provider.headline}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
                    <span className="flex items-center gap-1 font-bold text-ink">
                      <Star className="w-4 h-4 fill-accent text-accent" /> {provider.ratingAverage || 4.8}
                      <span className="text-muted font-normal">
                        ({provider.ratingCount || 15} reviews)
                      </span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-muted" />
                      {provider.serviceAreas?.[0] || 'Mohali / Chandigarh'}
                    </span>
                    <span>•</span>
                    <span>{provider.experienceYears || 5} Years Experience</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="pt-4 border-t border-sand/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  About & Background
                </h3>
                <p className="text-sm text-ink/90 leading-relaxed">{provider.bio}</p>
              </div>

              {/* Specializations & Skills */}
              <div className="pt-4 border-t border-sand/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                  Skills & Specialties
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(provider.skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-tint text-primary border border-primary/15"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Service Areas */}
              <div className="pt-4 border-t border-sand/60">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                  Neighbourhood Service Area
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(provider.serviceAreas || []).map((area) => (
                    <span
                      key={area}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-bg text-ink border border-sand"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-surface rounded-2xl border border-sand p-6 sm:p-8 space-y-6 shadow-soft-sm">
              <div className="flex items-center justify-between pb-4 border-b border-sand">
                <h2 className="text-lg font-bold text-ink">
                  Customer Reviews ({reviews.length})
                </h2>
                <div className="flex items-center gap-1 text-sm font-bold text-ink">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span>{provider.ratingAverage || 4.8} / 5.0</span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="text-sm text-muted py-4">No reviews yet for this professional.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-4 rounded-xl bg-bg border border-sand/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.customer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-sand"
                          />
                          <div>
                            <span className="text-xs font-bold text-ink block leading-tight">
                              {rev.customer?.name || 'Neighbourhood Resident'}
                            </span>
                            <span className="text-[10px] text-muted">
                              {rev.customer?.neighbourhood || 'Tricity'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-ink/80 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pricing & Booking Card */}
          <div className="space-y-6">
            <div className="bg-surface rounded-2xl border border-sand p-6 space-y-5 sticky top-28 shadow-soft-sm">
              <div className="border-b border-sand pb-4">
                <span className="text-xs font-semibold text-muted block uppercase tracking-wider">
                  Standard Visit Charge
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-ink">
                    ₹{provider.pricing?.visitCharge || 349}
                  </span>
                  <span className="text-xs text-muted">per inspection</span>
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Covers doorstep travel and thorough diagnosis of the issue.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-muted">
                <div className="flex justify-between py-1 border-b border-sand/40">
                  <span>Additional Hourly Rate</span>
                  <span className="font-bold text-ink">₹{provider.pricing?.hourlyRate || 250}/hr</span>
                </div>
                <div className="flex justify-between py-1 border-b border-sand/40">
                  <span>Working Hours</span>
                  <span className="font-bold text-ink">{provider.availability?.hours || '8:30 AM - 8:30 PM'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-sand/40">
                  <span>Urgent Response</span>
                  <span className="font-bold text-emergency">Available for Emergency</span>
                </div>
              </div>

              <Link
                to={`/book/${provider._id}?service=${provider.categories?.[0] || 'plumber'}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Book This Technician</span>
              </Link>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-muted">
                  No payment required right now. Settle directly after work is done.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
