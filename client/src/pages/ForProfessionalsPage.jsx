import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatIndianCurrency } from '../utils/formatters';
import {
  Wrench,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Wallet,
  CheckCircle2,
  ChevronDown,
  Star,
  Users,
  MapPin,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

const TRADES = [
  { slug: 'electrician', name: 'Electrician', avgJobValue: 650 },
  { slug: 'plumber', name: 'Plumber', avgJobValue: 700 },
  { slug: 'ac-repair', name: 'AC Technician', avgJobValue: 1100 },
  { slug: 'appliance-repair', name: 'Appliance Repair', avgJobValue: 800 },
  { slug: 'carpenter', name: 'Carpenter', avgJobValue: 750 },
  { slug: 'painter', name: 'House Painter', avgJobValue: 1400 },
];

export const ForProfessionalsPage = () => {
  // Calculator state
  const [selectedTrade, setSelectedTrade] = useState(TRADES[0]);
  const [jobsPerDay, setJobsPerDay] = useState(4);
  const [daysPerWeek, setDaysPerWeek] = useState(6);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(0);

  const estimatedMonthly = selectedTrade.avgJobValue * jobsPerDay * (daysPerWeek * 4);
  const estimatedAnnual = estimatedMonthly * 12;

  const faqs = [
    {
      q: 'How does NearFix differ from other gig apps?',
      a: 'NearFix is built specifically for local Tricity tradespeople. There are no middleman call centers, no hidden cuts, and no lead bidding wars. You set your own visit charge, talk directly to customers in your sectors, and get paid immediately upon job completion.',
    },
    {
      q: 'When and how do I receive my earnings?',
      a: 'Customers pay you directly at doorstep via UPI, card, or cash upon service completion. For digital payments processed through NearFix simulated escrow, payouts transfer to your verified bank account weekly.',
    },
    {
      q: 'Can I decline a job if I am already busy?',
      a: 'Yes. You have complete autonomy. You can accept or decline any incoming booking request, or simply toggle your status to Offline when you are resting or fully booked.',
    },
    {
      q: 'What documents are required to join?',
      a: 'You need a valid Government ID (Aadhaar or Driving License), proof of trade experience (2+ years), your own basic toolset, and a smartphone with location services enabled.',
    },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-surface to-bg pt-16 pb-20 border-b border-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tint border border-primary/20 text-xs font-bold text-primary">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Now Enrolling Verified Technicians Across Tricity</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight leading-tight">
                Earn <span className="text-primary underline decoration-accent/60">₹35,000 to ₹75,000+</span> per month working in your own neighbourhood.
              </h1>

              <p className="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
                Connect directly with homeowners in Chandigarh, Mohali, and Panchkula who need skilled plumbers, electricians, AC technicians, and carpenters. No agency cuts, no bidding fees.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/register?role=provider"
                  className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-soft-sm flex items-center justify-center gap-2 text-center"
                >
                  <span>Apply as a Professional</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#calculator"
                  className="px-6 py-3.5 rounded-xl text-sm font-bold text-ink bg-surface hover:bg-sand border border-sand transition-all text-center"
                >
                  Calculate Your Earnings
                </a>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-muted border-t border-sand/60">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Zero Signup Fee
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Weekly Payouts
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Verified Customers
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-surface rounded-3xl border border-sand p-6 sm:p-8 shadow-soft-md relative">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src="/images/categories/electrician.webp"
                      alt="Technician at work"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20"
                    />
                    <div>
                      <h3 className="font-bold text-ink">Rajesh Kumar</h3>
                      <p className="text-xs text-muted">Electrician • Sector 35, Chandigarh</p>
                      <div className="flex items-center gap-1 text-xs font-bold text-accent mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-accent" />
                        <span>4.9 (184 reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-tint/60 border border-primary/10 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted">Jobs Completed This Month</span>
                      <strong className="text-ink">92 jobs</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Gross Earnings</span>
                      <strong className="text-primary text-sm font-bold">₹64,400</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Average Trip Distance</span>
                      <strong className="text-ink">2.8 km</strong>
                    </div>
                  </div>

                  <p className="text-xs text-muted italic leading-relaxed">
                    "Before NearFix, I spent half my day travelling 20 km across the city for a single repair. Now I get 3 to 4 steady calls right inside Sector 35 and 36."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Benefit Cards */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
            Why Professionals Choose NearFix
          </h2>
          <p className="text-sm text-muted mt-2">
            Designed from the ground up to respect your time, your craft, and your independence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface rounded-2xl border border-sand p-6 space-y-3 shadow-soft-xs">
            <div className="w-12 h-12 rounded-xl bg-tint flex items-center justify-center text-primary">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-ink">Direct Customer Leads</h3>
            <p className="text-xs text-muted leading-relaxed">
              No middleman taking 25% to 30% cuts. You set your own visit charge and get paid for the skilled work you perform.
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-sand p-6 space-y-3 shadow-soft-xs">
            <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-ink">Flexible Schedule</h3>
            <p className="text-xs text-muted leading-relaxed">
              Work full-time or take jobs only when you have free slots. Toggle your workstation to Active or Offline with a single tap.
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-sand p-6 space-y-3 shadow-soft-xs">
            <div className="w-12 h-12 rounded-xl bg-success/15 flex items-center justify-center text-success">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-ink">Weekly Direct Payouts</h3>
            <p className="text-xs text-muted leading-relaxed">
              Get prompt payments deposited directly into your bank account. Settle cash on the spot or receive guaranteed app payouts.
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-sand p-6 space-y-3 shadow-soft-xs">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-ink">Hyper-Local Tricity Base</h3>
            <p className="text-xs text-muted leading-relaxed">
              Save fuel and travel time. All service alerts match your preferred sectors across Chandigarh, Mohali, and Panchkula.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Earnings Calculator */}
      <section id="calculator" className="py-16 bg-surface border-y border-sand">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Income Estimator
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink mt-1">
              Estimate Your Monthly Earnings
            </h2>
            <p className="text-xs text-muted mt-2">
              Based on real average repair visit and service values in Chandigarh, Mohali, and Panchkula.
            </p>
          </div>

          <div className="bg-bg rounded-3xl border border-sand p-6 sm:p-10 shadow-soft-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  1. Select Your Primary Trade
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TRADES.map((t) => (
                    <button
                      key={t.slug}
                      onClick={() => setSelectedTrade(t)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border text-left ${
                        selectedTrade.slug === t.slug
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-surface text-ink border-sand hover:border-primary/40'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">
                    2. Service Jobs Per Day
                  </label>
                  <span className="text-sm font-extrabold text-primary">{jobsPerDay} jobs / day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={jobsPerDay}
                  onChange={(e) => setJobsPerDay(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-sand rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-muted mt-1 font-medium">
                  <span>1 job (part-time)</span>
                  <span>4 jobs (balanced)</span>
                  <span>8 jobs (full-time pro)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">
                    3. Working Days Per Week
                  </label>
                  <span className="text-sm font-extrabold text-primary">{daysPerWeek} days / week</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="6"
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-sand rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-muted mt-1 font-medium">
                  <span>3 days</span>
                  <span>5 days</span>
                  <span>6 days</span>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-5 bg-surface rounded-2xl border border-sand p-6 sm:p-8 space-y-6 text-center">
              <div>
                <span className="text-xs font-bold text-muted uppercase tracking-wider block">
                  Potential Monthly Income
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-primary block mt-2">
                  {formatIndianCurrency(estimatedMonthly)}
                </span>
                <span className="text-xs text-muted block mt-1">
                  ~ {formatIndianCurrency(estimatedAnnual)} annual potential
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-tint/60 border border-primary/10 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">Estimated Jobs / Month:</span>
                  <strong className="text-ink">{jobsPerDay * daysPerWeek * 4}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Average Earnings / Job:</span>
                  <strong className="text-ink">₹{selectedTrade.avgJobValue}</strong>
                </div>
              </div>

              <Link
                to="/register?role=provider"
                className="w-full inline-block py-3 px-4 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-sm"
              >
                Sign Up & Start Earning
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Onboarding Timeline */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
            How to Get Started in 4 Easy Steps
          </h2>
          <p className="text-sm text-muted mt-2">
            Our onboarding process is fast, transparent, and respectful of your professional trade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Create Account',
              desc: 'Sign up as a Professional with your phone number, service trade, and neighbourhood.',
            },
            {
              step: '02',
              title: 'Aadhaar Verification',
              desc: 'Upload your Govt ID and trade experience credentials for swift background verification.',
            },
            {
              step: '03',
              title: 'Set Your Rates',
              desc: 'Configure your inspection visit charge and choose your active sectors across Tricity.',
            },
            {
              step: '04',
              title: 'Accept Jobs & Earn',
              desc: 'Toggle Active to receive direct job alerts from nearby customers. Complete work and get paid.',
            },
          ].map((s) => (
            <div key={s.step} className="bg-surface rounded-2xl border border-sand p-6 space-y-3 relative">
              <span className="text-2xl font-black text-primary/30 block">{s.step}</span>
              <h3 className="text-base font-bold text-ink">{s.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Requirements Checklist */}
      <section className="py-16 bg-surface border-t border-sand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
              Requirements for Verification
            </h2>
            <p className="text-xs text-muted mt-2">
              NearFix maintains high customer trust by welcoming only capable, honest tradespeople.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Valid Indian Govt Photo ID', desc: 'Aadhaar Card, Voter ID, or Driving License.' },
              { title: '2+ Years Field Experience', desc: 'Demonstrated experience in your selected trade or ITI certification.' },
              { title: 'Own Complete Toolset', desc: 'Standard diagnostic and repair tools necessary for your category.' },
              { title: 'Smartphone with GPS', desc: 'Android or iOS device to receive customer requests and share live arrival status.' },
              { title: 'Clean Background Record', desc: 'No history of criminal complaints or fraudulent trade activity.' },
              { title: 'Customer First Attitude', desc: 'Polite communication and respect for customer homes.' },
            ].map((req, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-bg border border-sand flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-ink">{req.title}</h4>
                  <p className="text-[11px] text-muted mt-0.5">{req.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
            Stories from Verified Partners
          </h2>
          <p className="text-sm text-muted mt-2">
            Listen to fellow technicians who turned their craft into a stable, thriving local business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Gurmeet Singh',
              trade: 'Master Plumber',
              area: 'Phase 7, Mohali',
              quote: 'NearFix removed the uncertainty. Earlier, some days I had 3 calls and other weeks nothing. Now I have regular repeat work in Phase 3B2, Phase 5, and Phase 7.',
              img: '/images/categories/plumber.webp',
            },
            {
              name: 'Amanpreet Kaur',
              trade: 'Deep Home Cleaning Specialist',
              area: 'Sector 20, Panchkula',
              quote: 'The customer transparency makes all the difference. Clients already know the visit charge and services beforehand, so there are never arguments over billing.',
              img: '/images/categories/home-cleaning.webp',
            },
            {
              name: 'Vikram Joshi',
              trade: 'AC & Refrigeration Tech',
              area: 'Sector 22, Chandigarh',
              quote: 'During summer rush, the emergency alerts let me pick jobs right on my commute. My monthly income increased by almost 45% compared to agency contracts.',
              img: '/images/categories/ac-repair.webp',
            },
          ].map((t, idx) => (
            <div key={idx} className="bg-surface rounded-2xl border border-sand p-6 space-y-4 shadow-soft-xs">
              <div className="flex items-center gap-3">
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border border-sand"
                />
                <div>
                  <h4 className="text-sm font-bold text-ink">{t.name}</h4>
                  <p className="text-[11px] text-muted">{t.trade} • {t.area}</p>
                </div>
              </div>
              <p className="text-xs text-ink/80 leading-relaxed italic">
                "{t.quote}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 bg-surface border-t border-sand">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-muted mt-2">
              Clear answers to the most common questions from prospective service partners.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-sand bg-bg overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-ink"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-muted leading-relaxed border-t border-sand/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-8 text-center">
            <Link
              to="/register?role=provider"
              className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all inline-flex items-center gap-2 shadow-soft-sm"
            >
              <span>Join NearFix as a Professional Today</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
export default ForProfessionalsPage;
