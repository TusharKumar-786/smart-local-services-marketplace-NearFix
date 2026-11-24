import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

export const PrivacyPage = () => {
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
            <Lock className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-extrabold text-ink">Privacy Policy</h1>
          </div>
          <p className="text-xs text-muted mt-1">
            Last Updated: November 2026 • NearFix Marketplace Technologies Pvt. Ltd., Chandigarh
          </p>
        </div>

        <div className="bg-surface rounded-2xl border border-sand p-6 sm:p-8 space-y-6 text-sm text-ink/80 leading-relaxed shadow-soft-sm">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-ink">1. Information We Collect</h2>
            <p>
              To coordinate doorstep repairs across Chandigarh Tricity, we collect your name, phone number, email address, service location, and neighbourhood. For technicians, we additionally collect trade experience, verification identification, and service sector boundaries.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-ink">2. How Information is Used</h2>
            <p>
              Your personal information is used exclusively to dispatch local technicians, provide estimated arrival times, facilitate secure communications, generate billing receipts, and prevent platform abuse. We do not sell or rent customer data to third-party advertisers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-ink">3. Location Data & Routing</h2>
            <p>
              Sector and neighbourhood coordinates are used to calculate travel estimates and match nearby tradespeople. During active visits, simulated travel waypoints help customers track arrival progress without exposing persistent real-time GPS telemetry.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-ink">4. Data Security</h2>
            <p>
              We implement industry-standard encryption, strict role-based access controls, and hashed authentication credentials. Only verified technicians assigned to your active service visit receive contact phone numbers and service addresses.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-ink">5. Your Rights & Data Inquiries</h2>
            <p>
              You may review, update, or request deletion of your account information at any time by contacting support@nearfix.in or submitting a request via our administrative contact channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
