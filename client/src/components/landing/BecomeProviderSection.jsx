import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Wallet, Clock, ArrowRight } from 'lucide-react';

export const BecomeProviderSection = () => {
  const benefits = [
    {
      icon: Briefcase,
      title: 'More local jobs nearby',
      desc: 'Receive repair and service requests right inside your neighbourhood. Less travel time, more completed visits.',
    },
    {
      icon: Clock,
      title: 'Set your hours & prices',
      desc: 'You control your availability calendar, your service radius, and your visit charges. Work when you want.',
    },
    {
      icon: Wallet,
      title: 'Direct payments after each job',
      desc: 'No waiting weeks for commissions. Customers settle charges directly upon completion of work.',
    },
  ];

  return (
    <section className="py-20 bg-primary text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-accent border border-white/20">
              For Skilled Tradespeople & Technicians
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Grow your local repair business with NearFix
            </h2>
            <p className="text-sand/90 text-base sm:text-lg leading-relaxed max-w-xl">
              Are you an experienced electrician, plumber, AC specialist, or carpenter in Chandigarh, Mohali, or Panchkula? Join a network that values quality craft and fair compensation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-accent">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-white">{b.title}</h4>
                    <p className="text-xs text-sand/80 leading-relaxed">{b.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/register?role=provider"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-ink bg-accent hover:bg-accent-light transition-all shadow-soft-md"
              >
                <span>Register as a Service Provider</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/for-professionals"
                className="text-xs font-semibold text-sand/90 hover:text-white transition-colors"
              >
                Learn about verification requirements
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-surface/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-white space-y-4">
              <h3 className="font-bold text-lg text-white">Technician Verification Checklist</h3>
              <ul className="space-y-3 text-xs text-sand/90">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">✓</span>
                  Government ID Verification (Aadhaar / Voter ID)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">✓</span>
                  Minimum 2 years proven trade experience
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">✓</span>
                  Standard toolkit & basic safety equipment
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">✓</span>
                  Commitment to honest upfront visit charges
                </li>
              </ul>
              <div className="pt-2">
                <p className="text-[11px] text-sand/70 italic">
                  Verification review takes under 24 hours. Once verified, your profile appears immediately in customer searches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full filter blur-3xl" />
    </section>
  );
};
