import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  ShieldCheck,
  Banknote,
  ArrowRight,
} from 'lucide-react';

export const BookingFlowPage = () => {
  const { providerId } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form inputs
  const serviceCategory = searchParams.get('service') || 'plumber';
  const initialUrgency = searchParams.get('urgency') || 'normal';

  const [urgency, setUrgency] = useState(initialUrgency);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [neighbourhood, setNeighbourhood] = useState(user?.neighbourhood || 'Phase 7, Mohali');
  const [address, setAddress] = useState(user?.address || '');
  const [problemDescription, setProblemDescription] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/book/${providerId}`);
      return;
    }
    fetchProvider();
  }, [providerId, isAuthenticated]);

  const fetchProvider = async () => {
    try {
      const res = await api.get(`/providers/${providerId}`);
      setProvider(res.data.provider);
    } catch (err) {
      setError('Could not load provider details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please provide your complete street address.');
      return;
    }
    if (!problemDescription.trim()) {
      setError('Please briefly describe the service or repair needed.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${timeSlot.split(' ')[0]}:00`);
      const visitPrice = provider?.pricing?.visitCharge || 349;

      const res = await api.post('/bookings', {
        providerId,
        category: serviceCategory,
        serviceName: `${serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1)} Service`,
        address,
        neighbourhood,
        urgency,
        scheduledFor: isNaN(scheduledDateTime.getTime()) ? new Date() : scheduledDateTime,
        problemDescription,
        price: visitPrice,
      });

      const newBooking = res.data.booking;
      // Redirect to simulated payment page
      navigate(`/pay/${newBooking._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg py-12">
        <div className="max-w-2xl mx-auto px-4 animate-pulse space-y-4">
          <div className="h-6 w-48 bg-sand/50 rounded" />
          <div className="h-96 bg-surface rounded-2xl border border-sand" />
        </div>
      </div>
    );
  }

  const visitPrice = provider?.pricing?.visitCharge || 349;

  return (
    <div className="min-h-screen bg-bg py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-surface rounded-2xl border border-sand p-6 sm:p-8 shadow-soft-sm space-y-6">
          {/* Header */}
          <div className="border-b border-sand pb-4">
            <h1 className="text-2xl font-extrabold text-ink">Schedule a Service Visit</h1>
            <p className="text-xs text-muted mt-1">
              Booking technician <strong className="text-ink">{provider?.user?.name || 'Local Technician'}</strong>
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-emergency/10 border border-emergency/20 text-xs font-semibold text-emergency flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Urgency selector */}
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                Booking Urgency
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUrgency('normal')}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    urgency === 'normal'
                      ? 'border-primary bg-tint text-primary ring-1 ring-primary'
                      : 'border-sand bg-bg text-ink hover:bg-sand/30'
                  }`}
                >
                  <span className="block font-bold">Standard Appointment</span>
                  <span className="text-[11px] text-muted">Choose your preferred day and slot</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgency('emergency')}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    urgency === 'emergency'
                      ? 'border-emergency bg-emergency/10 text-emergency ring-1 ring-emergency emergency-pulse'
                      : 'border-sand bg-bg text-ink hover:bg-sand/30'
                  }`}
                >
                  <span className="block font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Emergency Dispatch
                  </span>
                  <span className="text-[11px] text-muted">Priority arrival within 30-45 mins</span>
                </button>
              </div>
            </div>

            {/* Date & Time (if normal) */}
            {urgency === 'normal' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-sand bg-bg text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Time Window
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-sand bg-bg text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="9:00 AM - 11:00 AM">Morning: 9:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 1:00 PM">Noon: 11:00 AM - 1:00 PM</option>
                    <option value="2:00 PM - 4:00 PM">Afternoon: 2:00 PM - 4:00 PM</option>
                    <option value="4:00 PM - 6:00 PM">Evening: 4:00 PM - 6:00 PM</option>
                    <option value="6:00 PM - 8:00 PM">Late Evening: 6:00 PM - 8:00 PM</option>
                  </select>
                </div>
              </div>
            )}

            {/* Neighbourhood */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Neighbourhood / Sector
              </label>
              <select
                value={neighbourhood}
                onChange={(e) => setNeighbourhood(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-sand bg-bg text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="Phase 7, Mohali">Phase 7, Mohali</option>
                <option value="Phase 3B2, Mohali">Phase 3B2, Mohali</option>
                <option value="Phase 5, Mohali">Phase 5, Mohali</option>
                <option value="Sector 70, Mohali">Sector 70, Mohali</option>
                <option value="Sector 17, Chandigarh">Sector 17, Chandigarh</option>
                <option value="Sector 22, Chandigarh">Sector 22, Chandigarh</option>
                <option value="Sector 35, Chandigarh">Sector 35, Chandigarh</option>
                <option value="Sector 5, Panchkula">Sector 5, Panchkula</option>
              </select>
            </div>

            {/* Complete Address */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Complete House / Street Address
              </label>
              <input
                type="text"
                placeholder="e.g. House #1240, 2nd Floor, Sector 35-D, Chandigarh"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-sand bg-bg text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            {/* Problem Description */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Describe the problem or service needed
              </label>
              <textarea
                rows={3}
                placeholder="Please describe what needs repair (e.g. leaking sink brass pipe, MCB tripping when AC starts, water purifier filter alarm beep)"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-sand bg-bg text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            {/* Price Quote Summary */}
            <div className="p-4 rounded-xl bg-bg border border-sand space-y-2">
              <div className="flex justify-between text-xs text-muted">
                <span>Inspection & Visit Fee</span>
                <span className="font-bold text-ink">₹{visitPrice}</span>
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>Platform Facilitation</span>
                <span className="font-bold text-success">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-ink pt-2 border-t border-sand">
                <span>Total Estimated Upfront</span>
                <span className="text-primary text-base font-extrabold">₹{visitPrice}</span>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm flex items-center justify-center gap-2 ${
                urgency === 'emergency'
                  ? 'bg-emergency hover:bg-emergency-dark'
                  : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              <span>{submitting ? 'Confirming Booking...' : 'Confirm & Proceed to Payment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
