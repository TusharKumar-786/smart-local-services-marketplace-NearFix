import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { api } from '../api/client';
import { generateTravelWaypoints, calculateDistanceKm } from '../utils/simulateTravel';
import { createCustomerIcon, createMovingTechnicianIcon, createProviderIcon } from '../utils/mapIcons';
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
} from 'lucide-react';

export const BookingTrackingPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

      // Generate waypoints between provider coordinates and customer destination
      const providerCoords = b.provider?.location?.coordinates || [76.7562, 30.7225]; // [lng, lat]
      const customerCoords = b.location?.coordinates || [76.7110, 30.7050];

      const start = { lat: providerCoords[1], lng: providerCoords[0] };
      const end = { lat: customerCoords[1], lng: customerCoords[0] };

      const points = generateTravelWaypoints(start, end, 50);
      setWaypoints(points);
      setCurrentIndex(0);
      setHasArrived(false);
      setJobStarted(b.status === 'in_progress');
    } catch (err) {
      console.error('Failed to load tracking details:', err);
    } finally {
      setLoading(false);
    }
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

  const customerCoords = [
    booking.location?.coordinates?.[1] || 30.7050,
    booking.location?.coordinates?.[0] || 76.7110,
  ];

  const currentProviderCoords =
    waypoints[currentIndex] || [
      booking.provider?.location?.coordinates?.[1] || 30.7225,
      booking.provider?.location?.coordinates?.[0] || 76.7562,
    ];

  // Calculate remaining distance and ETA
  const remainingFraction = 1 - currentIndex / Math.max(1, waypoints.length - 1);
  const totalDist = 4.2; // approx baseline
  const remainingDist = hasArrived ? 0 : Math.max(0.1, Math.round(totalDist * remainingFraction * 10) / 10);
  const remainingMins = hasArrived ? 0 : Math.max(1, Math.round(remainingDist * 3.5));

  const providerUser = booking.provider?.user;

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
              <span>Technician On Route</span>
              <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            </h1>
            <p className="text-xs text-muted">
              Live location dispatch for <strong className="text-ink">{booking.serviceName}</strong> • Booking #{booking._id.slice(-6)}
            </p>
          </div>

          {/* Top ETA Badge */}
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
        </div>

        {/* Map View & Travel Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Map */}
          <div className="lg:col-span-8 bg-surface rounded-2xl border border-sand p-2 shadow-soft-sm relative overflow-hidden">
            <div className="h-[460px] sm:h-[520px] w-full rounded-xl overflow-hidden z-10 relative">
              <MapContainer
                center={customerCoords}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Road Waypoints Polyline */}
                {waypoints.length > 0 && (
                  <Polyline
                    positions={waypoints}
                    pathOptions={{ color: '#0F5C63', weight: 4, opacity: 0.7, dashArray: '6, 6' }}
                  />
                )}

                {/* Customer Anchor Pin */}
                <Marker position={customerCoords} icon={createCustomerIcon()}>
                  <Popup>
                    <div className="p-1 text-xs">
                      <strong className="block font-bold text-ink">Your Address</strong>
                      <span className="text-muted text-[11px]">{booking.address}</span>
                    </div>
                  </Popup>
                </Marker>

                {/* Moving Provider Marker */}
                <Marker position={currentProviderCoords} icon={createMovingTechnicianIcon()}>
                  <Popup>
                    <div className="p-1 text-xs">
                      <strong className="block font-bold text-ink">{providerUser?.name || 'Technician'}</strong>
                      <span className="text-muted text-[11px]">
                        {hasArrived ? 'Arrived at destination' : `En route • ${remainingDist} km away`}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Simulation Presentation Controls Bar */}
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

              {/* Arrival State Callout */}
              {hasArrived ? (
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
              ) : (
                <div className="p-4 rounded-xl bg-tint border border-primary/20 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <Clock className="w-4 h-4" />
                    <span>Technician is traveling to you</span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Please ensure the water mains or electrical trip switch is accessible if required for diagnosis.
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
