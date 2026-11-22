import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  CalendarCheck,
  CreditCard,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  Power,
  Inbox,
  Wallet,
} from 'lucide-react';

export const HowItWorksPage = () => {
  const [activeTab, setActiveTab] = useState('customers'); // 'customers' | 'providers'

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <section className="bg-surface border-b border-sand py-14 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Simple & Transparent Process
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">
            How NearFix Connects Tricity
          </h1>
          <p className="text-sm text-muted max-w-xl mx-auto leading-relaxed">
            Hiring a skilled technician should be as simple and predictable as ordering groceries. Here is how we make it dependable.
          </p>

          {/* Toggle Button */}
          <div className="pt-4 inline-flex p-1 rounded-xl bg-bg border border-sand">
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'customers'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              For Homeowners
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'providers'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              For Service Partners
            </button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {activeTab === 'customers' ? (
          <div className="space-y-12">
            {[
              {
                step: '01',
                title: 'Choose Service & Neighbourhood',
                desc: 'Select the trade you require (plumber, electrician, AC repair, etc.) and your sector or phase across Chandigarh, Mohali, or Panchkula. If you have a water pipe burst or circuit blowout, choose Emergency for instant dispatch.',
                icon: Search,
              },
              {
                step: '02',
                title: 'Compare Transparent Match Profiles',
                desc: 'Browse technicians ranked by verified match percentage, exact road distance from your doorstep, transparent visit charges, and reviews left by genuine local neighbours. No anonymous contractors.',
                icon: SlidersHorizontal,
              },
              {
                step: '03',
                title: 'Book & Track Doorstep Arrival',
                desc: 'Pick your preferred date and time slot. When your technician accepts, track their live transit on our interactive map with real-time distance and estimated arrival countdowns.',
                icon: CalendarCheck,
              },
              {
                step: '04',
                title: 'Inspect Work & Settle Securely',
                desc: 'Your technician completes the inspection and repairs with professional tools. Settle the bill via simulated UPI, card, or cash, and leave an authentic review to support local tradespeople.',
                icon: CreditCard,
              },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="bg-surface rounded-3xl border border-sand p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6 shadow-soft-xs"
                >
                  <div className="w-14 h-14 rounded-2xl bg-tint flex items-center justify-center text-primary shrink-0">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-primary/40 uppercase tracking-wider">
                        Step {s.step}
                      </span>
                      <h3 className="text-lg font-bold text-ink">{s.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-muted leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}

            <div className="text-center pt-4">
              <Link
                to="/search"
                className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all inline-flex items-center gap-2 shadow-soft-sm"
              >
                <span>Find a Nearby Professional</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {[
              {
                step: '01',
                title: 'Sign Up & Verify Your Profile',
                desc: 'Register as a professional with your trade, phone number, and service sectors. Submit your Government ID (Aadhaar/Driving License) and experience details for quick verification.',
                icon: UserCheck,
              },
              {
                step: '02',
                title: 'Configure Pricing & Availability',
                desc: 'Set your standard visit charge and hourly rates. Flip your workstation toggle to Active whenever you are ready to take calls in your chosen sectors.',
                icon: Power,
              },
              {
                step: '03',
                title: 'Receive Local Job Alerts',
                desc: 'Get notified immediately when homeowners in your neighbourhood book your services. Review the job details, customer address, and accept with one click.',
                icon: Inbox,
              },
              {
                step: '04',
                title: 'Complete Visit & Earn Directly',
                desc: 'Arrive at the customer home, perform quality service, and mark the job complete. Settle payments at doorstep or receive guaranteed weekly payouts directly to your bank account.',
                icon: Wallet,
              },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="bg-surface rounded-3xl border border-sand p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6 shadow-soft-xs"
                >
                  <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center text-accent shrink-0">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-accent uppercase tracking-wider">
                        Step {s.step}
                      </span>
                      <h3 className="text-lg font-bold text-ink">{s.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-muted leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}

            <div className="text-center pt-4">
              <Link
                to="/register?role=provider"
                className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all inline-flex items-center gap-2 shadow-soft-sm"
              >
                <span>Join as a Service Partner</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Trust & Guarantee highlights */}
      <section className="bg-surface border-t border-sand py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-tint flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-ink">Strict Identity Checks</h4>
              <p className="text-xs text-muted leading-relaxed">
                Every professional must pass government ID verification and skill checks before receiving their first booking.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-tint flex items-center justify-center text-primary">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-ink">Zero Hidden Fees</h4>
              <p className="text-xs text-muted leading-relaxed">
                Visit charges and hourly repair rates are published clearly upfront before you book. No surprise overheads.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-tint flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-ink">25-Min Emergency Guarantee</h4>
              <p className="text-xs text-muted leading-relaxed">
                For urgent burst pipes or power cutouts, our emergency dispatch matches closest available pros first.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default HowItWorksPage;
