import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Users, CheckCircle2 } from 'lucide-react';

export const HowItWorksSection = () => {
  const steps = [
    {
      num: '01',
      icon: ClipboardList,
      title: 'Tell us what you need',
      desc: 'Pick your trade service, select your neighbourhood, and let us know whether you need standard help or an emergency visit.',
    },
    {
      num: '02',
      icon: Users,
      title: 'Compare people nearby',
      desc: 'See nearby verified professionals with clear match scores, driving distance, true customer ratings, and upfront visit charges.',
    },
    {
      num: '03',
      icon: CheckCircle2,
      title: 'Book and track',
      desc: 'Confirm your time slot in one tap. Track your technician as they accept and complete your repair, then pay securely afterwards.',
    },
  ];

  return (
    <section className="py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-ink tracking-tight">
            How NearFix works
          </h2>
          <p className="text-muted text-base mt-2">
            No endless calling or price bargaining. Clear help from start to finish.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative bg-surface p-8 rounded-2xl border border-sand shadow-soft-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold text-sand font-heading">
                      {s.num}
                    </span>
                    <div className="p-3 rounded-xl bg-tint text-primary">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-ink mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
