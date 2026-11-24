import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { formatCategoryName, formatIndianCurrency, formatRating } from '../utils/formatters';
import { isProviderAvailable } from '../utils/providerUtils';
import { SearchMapView } from '../components/search/SearchMapView';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Clock,
  Filter,
  ArrowUpDown,
  Map as MapIcon,
  List as ListIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  // Query states
  const service = searchParams.get('service') || 'plumber';
  const area = searchParams.get('area') || 'Phase 7, Mohali';
  const urgency = searchParams.get('urgency') || 'normal';
  const sort = searchParams.get('sort') || 'best_match';
  const budget = searchParams.get('budget') || '';

  useEffect(() => {
    fetchProviders();
  }, [searchParams]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/providers/search', {
        params: {
          service,
          area,
          urgency,
          sort,
          budget: budget || undefined,
        },
      });
      setProviders(res.data.providers || []);
    } catch (err) {
      console.error('Search error:', err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, val) => {
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Search Controls Bar */}
        <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-sand shadow-soft-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Service */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Service
              </label>
              <select
                value={service}
                onChange={(e) => handleFilterChange('service', e.target.value)}
                className="w-full px-3 py-2 bg-bg text-ink rounded-xl border border-sand text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="plumber">Plumber</option>
                <option value="electrician">Electrician</option>
                <option value="ac-repair">AC Repair</option>
                <option value="painter">Painter</option>
                <option value="carpenter">Carpenter</option>
                <option value="home-cleaning">Home Cleaning</option>
                <option value="appliance-repair">Appliance Repair</option>
                <option value="pest-control">Pest Control</option>
                <option value="water-purifier">Water Purifier</option>
                <option value="cctv-wifi">CCTV & Wi-Fi</option>
              </select>
            </div>

            {/* Area */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Neighbourhood
              </label>
              <select
                value={area}
                onChange={(e) => handleFilterChange('area', e.target.value)}
                className="w-full px-3 py-2 bg-bg text-ink rounded-xl border border-sand text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
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

            {/* Urgency */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => handleFilterChange('urgency', e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm font-medium focus:ring-2 focus:outline-none ${
                  urgency === 'emergency'
                    ? 'bg-emergency/10 border-emergency text-emergency font-bold'
                    : 'bg-bg border-sand text-ink focus:ring-primary'
                }`}
              >
                <option value="normal">Standard (Today / Tomorrow)</option>
                <option value="emergency">🚨 Emergency (Immediate help)</option>
              </select>
            </div>

            {/* Sort by */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 bg-bg text-ink rounded-xl border border-sand text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="best_match">Best Match</option>
                <option value="rating">Top Rated</option>
                <option value="distance">Closest Distance</option>
                <option value="price_asc">Lowest Visit Price</option>
                <option value="availability">Soonest Available</option>
              </select>
            </div>
          </div>

          {/* Secondary filter & view switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-sand/60 gap-3">
            <div className="flex items-center gap-4 text-xs font-medium text-muted">
              <span>
                Found <strong className="text-ink">{providers.length}</strong> verified professionals
              </span>
              {urgency === 'emergency' && (
                <span className="inline-flex items-center gap-1 text-emergency font-bold bg-emergency/10 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" /> Emergency Prioritized
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-bg text-muted hover:text-ink'
                }`}
              >
                <ListIcon className="w-3.5 h-3.5" /> List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'map'
                    ? 'bg-primary text-white'
                    : 'bg-bg text-muted hover:text-ink'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" /> Map View
              </button>
            </div>
          </div>
        </div>

        {/* Content area: List or Map */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-surface border border-sand animate-pulse flex flex-col sm:flex-row gap-5"
              >
                <div className="w-20 h-20 rounded-full bg-sand/50 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-48 bg-sand/50 rounded" />
                  <div className="h-4 w-32 bg-sand/40 rounded" />
                  <div className="h-3 w-3/4 bg-sand/30 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-2xl border border-sand p-8">
            <MapPin className="w-12 h-12 text-muted mx-auto mb-3" />
            <h3 className="text-lg font-bold text-ink">No providers found for this selection</h3>
            <p className="text-sm text-muted mt-1 max-w-md mx-auto">
              Try choosing an adjacent neighbourhood or widening your criteria to see technicians available across Tricity.
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {providers.map((p, idx) => {
              const isTopMatch = idx === 0 && sort === 'best_match';
              const providerId = p._id || p.id;
              const providerName = p.name || p.user?.name || 'Local Technician';
              const avatar =
                p.user?.avatar ||
                p.photos?.[0] ||
                `https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&q=80`;

              return (
                <div
                  key={providerId}
                  className={`bg-surface rounded-2xl p-5 sm:p-6 border transition-all duration-200 hover:shadow-soft-md ${
                    isTopMatch
                      ? 'border-accent shadow-soft-sm ring-1 ring-accent/30'
                      : 'border-sand'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    {/* Left: Avatar & Bio */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={avatar}
                          alt={providerName}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-sand"
                        />
                        {p.verificationStatus === 'verified' && (
                          <div
                            title="Verified Technician"
                            className="absolute -bottom-1 -right-1 p-1 rounded-full bg-success text-white"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-ink leading-tight">
                            {providerName}
                          </h3>
                          {isTopMatch && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent text-ink">
                              Best Match
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold text-primary bg-tint border border-primary/20">
                            {p.matchPercentage}% match
                          </span>
                          {isProviderAvailable(p) ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-emerald-800 bg-emerald-100 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span> Available Now
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-muted bg-sand/60">
                              Offline
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-medium text-muted line-clamp-1">
                          {p.headline || `${p.experienceYears || 5}+ years local experience`}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted pt-1">
                          {p.ratingAverage == null || p.ratingCount === 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-accent/20 text-accent">
                              New
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 font-bold text-ink">
                              <Star className="w-3.5 h-3.5 fill-accent text-accent" /> {formatRating(p.ratingAverage)}
                              <span className="text-muted font-normal">
                                ({p.ratingCount} reviews)
                              </span>
                            </span>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1 text-ink font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-muted" /> {p.distanceKm || 2.4} km away • arrives in about {p.etaMinutes || 6} min
                          </span>
                          <span>•</span>
                          <span className="text-muted">
                            {p.primaryArea || p.serviceAreas?.[0] || 'Mohali / Chandigarh'}
                          </span>
                        </div>

                        {/* Skills chips */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {(p.skills || ['Diagnosis & Repair', 'Emergency Fix']).slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-bg text-muted border border-sand/60"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Pricing & CTA */}
                    <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-sand/40 gap-3">
                      <div>
                        <span className="text-[11px] text-muted block">Visit & Inspection</span>
                        <span className="text-2xl font-extrabold text-ink">
                          {formatIndianCurrency(p.startingPrice || p.pricing?.visitCharge || 349)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/providers/${providerId}?area=${encodeURIComponent(area)}&urgency=${urgency}`}
                          state={{ distanceKm: p.distanceKm, etaMinutes: p.etaMinutes }}
                          className="px-3 py-2 text-xs font-bold text-ink hover:text-primary transition-colors border border-sand rounded-xl bg-bg"
                        >
                          View Profile
                        </Link>
                        <Link
                          to={`/book/${providerId}?service=${service}&urgency=${urgency}`}
                          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-sm"
                        >
                          Book Visit
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <SearchMapView
            providers={providers}
            customerArea={area}
            urgency={urgency}
            service={service}
          />
        )}
      </div>
    </div>
  );
};
