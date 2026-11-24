import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, CheckCircle2, ArrowLeft } from 'lucide-react';

export const TermsPage = () => {
  return (
    <div className="min-h-screen bg-bg py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-extrabold text-ink">Terms of Service</h1>
          </div>
          <p className="text-xs text-muted mt-1">
            Last Updated: November 2026 • NearFix Marketplace Technologies Pvt. Ltd., Chandigarh
          </p>
        </div>

        <div className="bg-surface rounded-2xl border border-sand p-6 sm:p-8 space-y-6 text-sm text-ink/80 leading-relaxed shadow-soft-sm">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-ink">1. Platform Scope & Agreement</h2>
            <p>
              NearFix connects homeowners and businesses in Chandigarh, Mohali, and Panchkula (Tricity) with independent, verified service professionals ("technicians"). By accessing or using our website, customer portals, or technician dispatch features, you agree to comply with and be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-ink">2. Booking & Price Commitments</h2>
            <p>
              Standard visit charges (diagnostics and initial inspection) are shown upfront before confirming your appointment. Additional labor and material charges must be mutually agreed upon with the customer before commencing work. All transactions are denominated in Indian Rupees (₹).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-ink">3. Verified Professional Standards</h2>
            <p>
              Service providers registered on NearFix undergo identity validation and local presence confirmation. Technicians agree to uphold courteous conduct, transparent pricing, and punctual arrival within designated Tricity sectors.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-ink">4. Payments & Cancellation</h2>
            <p>
              Customers may settle fees via verified payment options including UPI, Card, and Net Banking. Cancellations initiated prior to technician dispatch incur no penalties. Where work cannot be performed due to unexpected constraints, refunds are processed according to our dispute policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-ink">5. Customer Support & Dispute Resolution</h2>
            <p>
              In the event of service quality concerns or pricing discrepancies, customers may raise an issue through their dashboard. Our administrative team reviews every grievance with both parties to ensure fair and prompt resolution.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
