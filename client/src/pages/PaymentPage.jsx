import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  CreditCard,
  Smartphone,
  Landmark,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const PaymentPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${bookingId}`);
      setBooking(res.data.booking);
    } catch (err) {
      console.error('Failed to load booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    setProcessing(true);
    try {
      const res = await api.post('/payments/simulate', {
        bookingId,
        amount: booking.price,
        method,
      });

      setPaymentSuccess(res.data.payment);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment simulation failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg py-12 text-center text-muted">
        Loading payment checkout...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-bg py-16 text-center">
        <h2 className="text-xl font-bold text-ink">Booking not found</h2>
        <Link to="/customer/bookings" className="text-sm font-semibold text-primary mt-2 inline-block">
          Go to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-12">
      <div className="max-w-xl mx-auto px-4">
        {paymentSuccess ? (
          /* Payment Success Confirmation */
          <div className="bg-surface rounded-2xl border border-sand p-8 text-center space-y-6 shadow-soft-sm animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-success uppercase tracking-wider">
                Payment Confirmed
              </span>
              <h1 className="text-2xl font-extrabold text-ink mt-1">₹{booking.price} Settled</h1>
              <p className="text-xs text-muted mt-1">
                Transaction Reference: <strong className="text-ink">{paymentSuccess.reference}</strong>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-bg border border-sand text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Service</span>
                <span className="font-bold text-ink">{booking.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Address</span>
                <span className="font-bold text-ink truncate max-w-xs">{booking.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Payment Method</span>
                <span className="font-bold uppercase text-ink">{method}</span>
              </div>
            </div>

            <Link
              to="/customer/bookings"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all"
            >
              <span>View & Track Booking</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Payment Form */
          <div className="bg-surface rounded-2xl border border-sand p-6 sm:p-8 space-y-6 shadow-soft-sm">
            <div className="border-b border-sand pb-4">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Checkout</span>
              <h1 className="text-2xl font-extrabold text-ink mt-0.5">Settle Visit Charges</h1>
              <p className="text-xs text-muted mt-1">
                Booking for <strong>{booking.serviceName}</strong> in {booking.neighbourhood}
              </p>
            </div>

            {/* Order summary */}
            <div className="p-4 rounded-xl bg-bg border border-sand flex items-center justify-between">
              <div>
                <span className="text-xs text-muted block">Total Payable</span>
                <span className="text-2xl font-extrabold text-ink">₹{booking.price}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-success flex items-center gap-1 justify-end">
                  <ShieldCheck className="w-3.5 h-3.5" /> Simulated Gateway
                </span>
                <span className="text-[10px] text-muted">Zero test charge</span>
              </div>
            </div>

            {/* Payment method options */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-muted uppercase tracking-wider">
                Select Payment Mode
              </label>

              {/* UPI */}
              <label
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  method === 'upi'
                    ? 'border-primary bg-tint/60 ring-1 ring-primary'
                    : 'border-sand hover:bg-bg'
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  value="upi"
                  checked={method === 'upi'}
                  onChange={() => setMethod('upi')}
                  className="text-primary focus:ring-primary"
                />
                <Smartphone className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <span className="text-sm font-bold text-ink block">UPI (Instant)</span>
                  <span className="text-xs text-muted">Google Pay, PhonePe, Paytm, BHIM</span>
                </div>
              </label>

              {/* Card */}
              <label
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  method === 'card'
                    ? 'border-primary bg-tint/60 ring-1 ring-primary'
                    : 'border-sand hover:bg-bg'
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  value="card"
                  checked={method === 'card'}
                  onChange={() => setMethod('card')}
                  className="text-primary focus:ring-primary"
                />
                <CreditCard className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <span className="text-sm font-bold text-ink block">Credit / Debit Card</span>
                  <span className="text-xs text-muted">Visa, Mastercard, RuPay</span>
                </div>
              </label>

              {/* Net Banking */}
              <label
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  method === 'netbanking'
                    ? 'border-primary bg-tint/60 ring-1 ring-primary'
                    : 'border-sand hover:bg-bg'
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  value="netbanking"
                  checked={method === 'netbanking'}
                  onChange={() => setMethod('netbanking')}
                  className="text-primary focus:ring-primary"
                />
                <Landmark className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <span className="text-sm font-bold text-ink block">Net Banking</span>
                  <span className="text-xs text-muted">HDFC, SBI, ICICI, Axis and all major banks</span>
                </div>
              </label>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={processing}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>{processing ? 'Simulating Processing...' : `Pay ₹${booking.price} Now`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
