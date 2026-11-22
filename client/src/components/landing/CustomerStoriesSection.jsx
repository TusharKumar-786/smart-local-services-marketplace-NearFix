import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

const REVIEWS = [
  {
    name: 'Pooja Bhatia',
    area: 'Phase 7, Mohali',
    service: 'Plumber',
    date: '3 days ago',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    comment: 'A major pipe joint cracked under our kitchen sink late evening. Manpreet arrived within 35 minutes, had the right replacement brass valve, and fixed it without leaving any mess. Transparent pricing.',
  },
  {
    name: 'Gurinder Dhillon',
    area: 'Sector 35, Chandigarh',
    service: 'Electrician',
    date: '1 week ago',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
    comment: 'Our MCB kept tripping repeatedly whenever the geyser turned on. Rajesh diagnosed the circuit imbalance accurately and replaced the burnt contactor. Genuine advice and very polite behaviour.',
  },
  {
    name: 'Dr. Vivek Saraf',
    area: 'Sector 11, Panchkula',
    service: 'AC Repair',
    date: '2 weeks ago',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    comment: 'Superb foam jet service on two split AC units. Cooling is back to factory freshness. The technician checked gas pressure in front of me and charged strictly according to the card.',
  },
];

export const CustomerStoriesSection = () => {
  return (
    <section className="py-20 bg-surface border-t border-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-ink tracking-tight">
            Neighbourhood feedback
          </h2>
          <p className="text-muted text-base mt-2">
            Real experiences from residents across Mohali, Chandigarh, and Panchkula.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((rev, idx) => (
            <motion.div
              key={rev.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-bg border border-sand flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <span className="text-xs text-muted font-medium">{rev.date}</span>
                </div>

                <p className="text-sm text-ink/90 leading-relaxed italic mb-6">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-sand/60">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border border-sand"
                  loading="lazy"
                />
                <div>
                  <h4 className="text-sm font-bold text-ink leading-tight flex items-center gap-1.5">
                    {rev.name}
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  </h4>
                  <p className="text-xs text-muted">
                    {rev.service} • {rev.area}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
