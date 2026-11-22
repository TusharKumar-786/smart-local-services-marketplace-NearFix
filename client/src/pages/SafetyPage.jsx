import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileCheck,
  UserCheck,
  AlertTriangle,
  RotateCcw,
  Phone,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const SafetyPage = () => {
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <section className="bg-surface border-b border-sand py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-tint flex items-center justify-center text-primary mx-auto mb-2">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Trust & Community Safety
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">
            Your Safety & Peace of Mind Come First
          </h1>
          <p className="text-sm text-muted max-w-xl mx-auto leading-relaxed">
            NearFix was founded on a simple principle: inviting a technician into your home requires complete, uncompromising trust.
          </p>
        </div>
      </section>

      {/* 4 Pillars of NearFix Safety */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface rounded-3xl border border-sand p-8 space-y-4 shadow-soft-xs">
            <div className="w-12 h-12 rounded-xl bg-tint flex items-center justify-center text-primary">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-ink">1. Multi-Stage Identity Verification</h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Every professional must undergo government photo ID verification (Aadhaar or Driving License), local residence confirmation in Tricity, and background checks before their profile is approved by our admin team.
            </p>
            <ul className="space-y-1.5 text-xs text-ink/80 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>Govt photo ID cross-referencing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>Trade credentials & experience audit</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>Continuous community review monitoring</span>
              </li>
            </ul>
          </div>

          <div className="bg-surface rounded-3xl border border-sand p-8 space-y-4 shadow-soft-xs">
            <div className="w-12 h-12 rounded-xl bg-tint flex items-center justify-center text-primary">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-ink">2. 100% Upfront Price Transparency</h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Never experience unexpected billing surprises at your door. Inspection visit charges are shown prominently on each provider card, and additional labor or part replacement quotes must be approved by you before work begins.
            </p>
            <ul className="space-y-1.5 text-xs text-ink/80 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>Fixed diagnostic visit fees</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>Itemized invoice breakdowns</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>No hidden platform or dispatch surcharges</span>
              </li>
            </ul>
          </div>

          <div className="bg-surface rounded-3xl border border-sand p-8 space-y-4 shadow-soft-xs">
            <div className="w-12 h-12 rounded-xl bg-tint flex items-center justify-center text-primary">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-ink">3. 7-Day Workmanship Warranty</h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              If a repair problem reoccurs within 7 days of service completion, NearFix arranges a revisit at zero additional inspection charge. We hold our service partners to the highest standards of workmanship.
            </p>
            <ul className="space-y-1.5 text-xs text-ink/80 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>Complimentary rework within 7 days</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>Dedicated dispute resolution desk</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>Prompt fee refund if service cannot be completed</span>
              </li>
            </ul>
          </div>

          <div className="bg-surface rounded-3xl border border-sand p-8 space-y-4 shadow-soft-xs">
            <div className="w-12 h-12 rounded-xl bg-tint flex items-center justify-center text-primary">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-ink">4. Real-Time Tracking & Emergency Escalation</h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Know exactly who is coming to your house and when. Every booking includes technician photo identification, verified phone contact, and interactive route progress tracking.
            </p>
            <ul className="space-y-1.5 text-xs text-ink/80 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>Technician photo & verified badge check</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>Live map transit simulation & arrival countdown</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span>Direct customer hotline: 1800-NEARFIX</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center space-y-4">
          <h3 className="text-xl font-bold text-ink">Ready to book a verified professional?</h3>
          <p className="text-xs text-muted max-w-md mx-auto">
            Browse verified technicians across all 32 Tricity sectors and experience stress-free home service.
          </p>
          <div className="pt-2">
            <Link
              to="/search"
              className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all inline-flex items-center gap-2 shadow-soft-sm"
            >
              <span>Explore Nearby Technicians</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
export default SafetyPage;
