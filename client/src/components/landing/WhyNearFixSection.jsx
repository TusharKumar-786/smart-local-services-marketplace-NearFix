import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Banknote, Star, Clock } from 'lucide-react';

export const WhyNearFixSection = () => {
  const points = [
    {
      icon: ShieldCheck,
      title: 'Verified Professionals',
      desc: 'Every service provider is vetted with identity documentation and confirmed trade credentials before taking requests.',
    },
    {
      icon: Banknote,
      title: 'Transparent Pricing',
      desc: 'See visit charges and hourly rates upfront before booking. No unexpected markups or awkward doorstep bargaining.',
    },
    {
      icon: Star,
      title: 'Honest Neighbourhood Ratings',
      desc: 'Reviews can only be written by customers after a completed booking. Real experiences from residents on your streets.',
    },
    {
      icon: Clock,
      title: 'Quick Local Booking',
      desc: 'Book a technician in less than 60 seconds. Reschedule or track booking status directly from your phone.',
    },
  ];

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-ink tracking-tight">
            Why neighbours choose NearFix
          </h2>
          <p className="text-muted text-base mt-2">
            Built for reliability, speed, and clean workmanship close to home.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {points.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-6 rounded-2xl bg-bg border border-sand space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-tint text-primary flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-ink">
                  {p.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {p.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
