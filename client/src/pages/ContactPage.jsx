import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';

export const ContactPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <section className="bg-surface border-b border-sand py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              We are Here to Help
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mt-1">
              Contact NearFix Support
            </h1>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Have questions about a booking, need help with a technician, or interested in partnering with us? Reach our Tricity team directly.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Form */}
          <div className="lg:col-span-7 bg-surface rounded-3xl border border-sand p-6 sm:p-8 shadow-soft-sm">
            <h2 className="text-xl font-bold text-ink mb-1">Send Us a Message</h2>
            <p className="text-xs text-muted mb-6">
              Fill in your details and our customer care team will reply within 2 business hours.
            </p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-tint border border-primary/20 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
                <h3 className="text-base font-bold text-ink">Message Received!</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Thank you for reaching out. A NearFix representative will contact you shortly via email or phone.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 px-4 py-2 text-xs font-bold text-primary hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-emergency/10 border border-emergency/20 text-xs font-semibold text-emergency flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Gurpreet Singh"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-bg text-xs font-medium text-ink focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. gurpreet@example.in"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-bg text-xs font-medium text-ink focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-bg text-xs font-medium text-ink focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                      Subject
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-bg text-xs font-medium text-ink focus:outline-none focus:border-primary"
                    >
                      <option>General Inquiry</option>
                      <option>Booking Dispute or Feedback</option>
                      <option>Provider Partner Registration</option>
                      <option>Corporate Facility Services</option>
                      <option>Billing & Refund</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                    How can we help you? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Provide relevant details such as booking ID, technician name, or your specific inquiry..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand bg-bg text-xs font-medium text-ink focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Info Panels */}
          <div className="lg:col-span-5 space-y-6">
            {/* 24/7 Emergency Support Card */}
            <div className="bg-emergency/10 border border-emergency/30 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emergency text-white flex items-center justify-center emergency-pulse">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emergency">24x7 Emergency Assistance</h3>
                  <p className="text-[11px] text-muted">Active during urgent leaks and electrical hazards</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-emergency/20 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-ink font-bold">
                  <Phone className="w-4 h-4 text-emergency" />
                  <span>Hotline: 1800-NEARFIX (1800-632-7349)</span>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <Phone className="w-4 h-4 text-emergency" />
                  <span>Direct Tricity Desk: 0172-400-3490</span>
                </div>
              </div>
            </div>

            {/* Operating Hours & General Contact */}
            <div className="bg-surface rounded-3xl border border-sand p-6 space-y-4 shadow-soft-xs text-xs">
              <h3 className="text-sm font-bold text-ink">Support Hours & Office</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-ink block">Customer Desk Hours</span>
                    <span className="text-muted">Monday – Sunday: 8:00 AM – 9:00 PM IST</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-ink block">Email Support</span>
                    <span className="text-muted">support@nearfix.in / partners@nearfix.in</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-ink block">Tricity Regional Office</span>
                    <span className="text-muted">
                      NearFix Hub, Plot C-128, Phase 8 (Sector 62), Industrial Area, Mohali, Punjab 160062
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-ink block">Chandigarh City Office</span>
                    <span className="text-muted">
                      SCO 142-143, Sector 17-C, Chandigarh, 160017
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coverage sectors list */}
            <div className="bg-surface rounded-3xl border border-sand p-6 space-y-3 shadow-soft-xs text-xs">
              <h3 className="text-sm font-bold text-ink">Active Service Coverage</h3>
              <p className="text-[11px] text-muted leading-relaxed">
                NearFix provides verified doorstep technician dispatch throughout all 32 primary sectors and phases in <strong>Chandigarh</strong>, <strong>Mohali</strong>, and <strong>Panchkula</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default ContactPage;
