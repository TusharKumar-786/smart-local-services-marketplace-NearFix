import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { api } from '../api/client';
import { generateTravelWaypoints } from '../utils/simulateTravel';
import { createCustomerIcon, createMovingTechnicianIcon, createProviderIcon } from '../utils/mapIcons';
import { useAreas } from '../hooks/useAreas';
import { isDefaultCoordinates } from '../utils/providerUtils';
import { formatIndianCurrency } from '../utils/formatters';
import {
  Clock,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  XCircle,
} from 'lucide-react';

export const BookingTrackingPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { getAreaCoordinates } = useAreas();

  // Simulation states
  const [waypoints, setWaypoints] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [hasArrived, setHasArrived] = useState(false);
  const [jobStarted, setJobStarted] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${bookingId}`);
      const b = res.data.booking;
      setBooking(b);
      setJobStarted(b.status === 'in_progress');

      // Calculate provider start point and customer destination
      const customerPos = getCustomerCoords(b);
      const providerPos = getProviderCoords(b);

      if (['accepted', 'in_progress'].includes(b.status)) {
        const points = generateTravelWaypoints(providerPos, customerPos, 50);
        setWaypoints(points);
        setCurrentIndex(0);
        setHasArrived(false);
      } else {
        setWaypoints([]);
      }
    } catch (err) {
      console.error('Failed to load tracking details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerCoords = (b) => {
    if (!b) return { lat: 30.7415, lng: 76.7794 };
    if (
      b.location?.coordinates &&
      b.location.coordinates.length === 2 &&
      !isDefaultCoordinates(b.location.coordinates)
    ) {
      return { lat: b.location.coordinates[1], lng: b.location.coordinates[0] };
    }
    return getAreaCoordinates(b.neighbourhood || 'Sector 17, Chandigarh');
  };

  const getProviderCoords = (b) => {
    if (!b || !b.provider) return { lat: 30.7046, lng: 76.7179 };
    const p = b.provider;
    if (
      p.location?.coordinates &&
      p.location.coordinates.length === 2 &&
      !isDefaultCoordinates(p.location.coordinates)
    ) {
      return { lat: p.location.coordinates[1], lng: p.location.coordinates[0] };
    }
    const area = p.serviceAreas?.[0] || 'Phase 7, Mohali';
    return getAreaCoordinates(area);
  };

  // Movement timer
  useEffect(() => {
    if (!isPlaying || waypoints.length === 0 || hasArrived) return;

    const intervalMs = Math.max(200, Math.floor(1000 / speedMultiplier));
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= waypoints.length - 1) {
          clearInterval(timerRef.current);
          setHasArrived(true);
          return waypoints.length - 1;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timerRef.current);
  }, [isPlaying, waypoints, speedMultiplier, hasArrived]);

  const handleReset = () => {
    setCurrentIndex(0);
    setHasArrived(false);
    setIsPlaying(true);
  };

  const handleStartJob = async () => {
    try {
      await api.patch(`/bookings/${booking._id}/status`, {
        status: 'in_progress',
        note: 'Technician arrived and started work',
      });
      setJobStarted(true);
      fetchBooking();
    } catch (err) {
      alert('Failed to update booking status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg py-12 text-center text-muted">
        Loading live route tracking...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-bg py-16 text-center">
        <h2 className="text-xl font-bold text-ink">Booking not found</h2>
        <Link to="/customer/bookings" className="text-sm font-semibold text-primary mt-2 inline-block">
          Return to My Bookings
        </Link>
      </div>
    );
  }

  const customerPos = getCustomerCoords(booking);
  const providerPos = getProviderCoords(booking);

  const customerLatLng = [customerPos.lat, customerPos.lng];
  const currentProviderLatLng =
    waypoints[currentIndex] || [providerPos.lat, providerPos.lng];

  // Calculate remaining distance and ETA (speed: 25 km/h standard, 37.5 km/h for emergency)
  const remainingFraction = 1 - currentIndex / Math.max(1, waypoints.length - 1);
  const totalDist = 4.2;
  const remainingDist = hasArrived ? 0 : Math.max(0.1, Math.round(totalDist * remainingFraction * 10) / 10);
  const speed = booking.urgency === 'emergency' ? 37.5 : 25;
  const remainingMins = hasArrived ? 0 : Math.max(1, Math.round((remainingDist / speed) * 60));

  const providerUser = booking.provider?.user;
  const isRequested = booking.status === 'requested';
  const isAcceptedOrProgress = ['accepted', 'in_progress'].includes(booking.status);
  const isFinalState = ['completed', 'cancelled', 'rejected'].includes(booking.status);

  return (
    <div className="min-h-screen bg-bg py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/customer/bookings')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Bookings</span>
            </button>
            <h1 className="text-2xl font-extrabold text-ink flex items-center gap-2">
              <span>
                {isRequested
                  ? 'Booking Requested'
                  : isAcceptedOrProgress
                  ? 'Technician On Route'
                  : booking.status === 'completed'
                  ? 'Service Completed'
                  : 'Booking Cancelled'}
              </span>
              {isAcceptedOrProgress && (
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
              )}
            </h1>
            <p className="text-xs text-muted">
              Location dispatch for <strong className="text-ink">{booking.serviceName}</strong> • Booking #{booking._id.slice(-6)}
            </p>
          </div>

          {/* Top ETA Badge */}
          {isAcceptedOrProgress && (
            <div className="bg-surface px-5 py-3 rounded-2xl border border-sand shadow-soft-sm flex items-center gap-4">
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                  Estimated Arrival
                </span>
                <span className="text-xl font-extrabold text-primary">
                  {hasArrived ? 'Arrived at Address' : `${remainingMins} mins away`}
                </span>
              </div>
              <div className="text-right pl-4 border-l border-sand">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                  Remaining Distance
                </span>
                <span className="text-sm font-bold text-ink">
                  {hasArrived ? '0.0 km' : `${remainingDist} km`}
                </span>
              </div>
            </div>
          )}

          {isRequested && (
            <div className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-2xl flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-900 block">Waiting for technician acceptance</span>
                <span className="text-[11px] text-amber-700">Live technician dispatch route activates upon acceptance.</span>
              </div>
            </div>
          )}

          {isFinalState && (
            <div className="bg-surface px-4 py-3 rounded-2xl border border-sand flex items-center gap-3">
              {booking.status === 'completed' ? (
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-emergency shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold text-ink block capitalize">{booking.status.replace('_', ' ')}</span>
                <span className="text-[11px] text-muted">Static final state record</span>
              </div>
            </div>
          )}
        </div>

        {/* Map View & Travel Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Map */}
          <div className="lg:col-span-8 bg-surface rounded-2xl border border-sand p-2 shadow-soft-sm relative overflow-hidden">
            <div className="h-[460px] sm:h-[520px] w-full rounded-xl overflow-hidden z-10 relative">
              <MapContainer
                center={customerLatLng}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Road Waypoints Polyline for accepted / in_progress */}
                {isAcceptedOrProgress && waypoints.length > 0 && (
                  <Polyline
                    positions={waypoints}
                    pathOptions={{ color: '#0F5C63', weight: 4, opacity: 0.7, dashArray: '6, 6' }}
                  />
                )}

                {/* Customer Anchor Pin */}
                <Marker position={customerLatLng} icon={createCustomerIcon()}>
                  <Popup>
                    <div className="p-1 text-xs">
                      <strong className="block font-bold text-ink">Your Address</strong>
                      <span className="text-muted text-[11px]">{booking.address}</span>
                    </div>
                  </Popup>
                </Marker>

                {/* Provider Marker */}
                {isAcceptedOrProgress ? (
                  <Marker position={currentProviderLatLng} icon={createMovingTechnicianIcon()}>
                    <Popup>
                      <div className="p-1 text-xs">
                        <strong className="block font-bold text-ink">{providerUser?.name || 'Technician'}</strong>
                        <span className="text-muted text-[11px]">
                          {hasArrived ? 'Arrived at destination' : `En route • ${remainingDist} km away`}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ) : (
                  <Marker position={[providerPos.lat, providerPos.lng]} icon={createProviderIcon(true)}>
                    <Popup>
                      <div className="p-1 text-xs">
                        <strong className="block font-bold text-ink">{providerUser?.name || 'Technician Base'}</strong>
                        <span className="text-muted text-[11px]">Dispatch Hub</span>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            {/* Simulation Presentation Controls Bar (only active for accepted/in_progress) */}
            {isAcceptedOrProgress && (
              <div className="mt-3 p-3 bg-bg rounded-xl border border-sand flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Demo Simulator:
                  </span>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all ${
                      isPlaying
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Start'}</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg border border-sand bg-surface text-muted hover:text-ink font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>

                {/* Speed Toggles */}
                <div className="flex items-center gap-1">
                  <span className="text-muted text-[11px] mr-1">Speed:</span>
                  {[1, 2, 5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSpeedMultiplier(spd)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        speedMultiplier === spd
                          ? 'bg-primary text-white'
                          : 'bg-surface border border-sand text-muted hover:text-ink'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Technician Details & Arrival Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface rounded-2xl border border-sand p-6 shadow-soft-sm space-y-5">
              <div className="flex items-center gap-3.5 pb-4 border-b border-sand">
                <img
                  src={
                    providerUser?.avatar ||
                    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&q=80'
                  }
                  alt=""
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary"
                />
                <div>
                  <h3 className="font-bold text-base text-ink leading-tight">
                    {providerUser?.name || 'Local Technician'}
                  </h3>
                  <p className="text-xs font-semibold text-primary mt-0.5">
                    {booking.provider?.headline || 'Verified Trade Specialist'}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> ID Verified Professional
                  </span>
                </div>
              </div>

              {/* Direct call button */}
              {providerUser?.phone && (
                <a
                  href={`tel:${providerUser.phone}`}
                  className="w-full py-2.5 rounded-xl border border-sand bg-bg hover:bg-sand/30 text-xs font-bold text-ink flex items-center justify-center gap-2 transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>Call Technician ({providerUser.phone})</span>
                </a>
              )}

              {/* Status card */}
              <div className="p-4 rounded-xl bg-bg border border-sand space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">Destination</span>
                  <span className="font-semibold text-ink truncate max-w-[170px]">
                    {booking.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Neighbourhood</span>
                  <span className="font-semibold text-ink">{booking.neighbourhood}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Visit Charge</span>
                  <span className="font-bold text-ink">{formatIndianCurrency(booking.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Urgency</span>
                  <span className={`font-bold capitalize ${booking.urgency === 'emergency' ? 'text-emergency' : 'text-primary'}`}>
                    {booking.urgency}
                  </span>
                </div>
              </div>

              {/* Status Callout */}
              {isRequested ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Waiting for technician to accept</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    The service provider has received your visit request and will confirm shortly.
                  </p>
                </div>
              ) : hasArrived ? (
                <div className="p-4 rounded-xl bg-success/15 border border-success/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-success font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Provider has arrived!</span>
                  </div>
                  <p className="text-xs text-ink/80 leading-relaxed">
                    The technician is outside your address. Please verify identity and guide them to the repair location.
                  </p>

                  {!jobStarted ? (
                    <button
                      onClick={handleStartJob}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-success hover:bg-success-dark transition-all shadow-sm"
                    >
                      Confirm Arrival & Start Work
                    </button>
                  ) : (
                    <div className="text-center py-1.5 text-xs font-bold text-primary">
                      ✓ Work In Progress
                    </div>
                  )}
                </div>
              ) : isAcceptedOrProgress ? (
                <div className="p-4 rounded-xl bg-tint border border-primary/20 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <Clock className="w-4 h-4" />
                    <span>Technician is traveling to you</span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Please ensure the repair site is accessible for inspection and diagnosis.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-bg border border-sand space-y-2">
                  <div className="flex items-center gap-2 text-muted font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Booking record complete</span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    This booking has reached its final state ({booking.status}).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
