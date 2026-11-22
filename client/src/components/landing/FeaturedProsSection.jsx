import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

const FEATURED_PROS = [
  {
    id: 'rajesh-sharma',
    name: 'Rajesh Sharma',
    trade: 'Electrician',
    area: 'Sector 35, Chandigarh',
    rating: 4.9,
    reviews: 38,
    price: 350,
    experience: '12 yrs exp',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80',
    skills: ['Short Circuit', 'MCB Switchboard', 'Inverter Wiring'],
  },
  {
    id: 'manpreet-singh',
    name: 'Manpreet Singh',
    trade: 'Plumber',
    area: 'Phase 7, Mohali',
    rating: 4.9,
    reviews: 42,
    price: 349,
    experience: '10 yrs exp',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    skills: ['Leak Detection', 'Drain Clearing', 'Bathroom Fixtures'],
  },
  {
    id: 'aman-verma',
    name: 'Aman Verma',
    trade: 'AC Technician',
    area: 'Sector 22, Chandigarh',
    rating: 4.8,
    reviews: 29,
    price: 499,
    experience: '8 yrs exp',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    skills: ['Jet Servicing', 'Gas Charging', 'Cooling Diagnosis'],
  },
  {
    id: 'kuldeep-saini',
    name: 'Kuldeep Saini',
    trade: 'Carpenter',
    area: 'Sector 5, Panchkula',
    rating: 4.8,
    reviews: 24,
    price: 399,
    experience: '9 yrs exp',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    skills: ['Door Locks', 'Hinges Repair', 'Modular Furniture'],
  },
];

export const FeaturedProsSection = () => {
  return (
    <section className="py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-ink tracking-tight">
              Featured local professionals
            </h2>
            <p className="text-muted text-base mt-2">
              High-rated technicians trusted by families in Mohali, Chandigarh & Panchkula.
            </p>
          </div>
          <Link
            to="/search?service=plumber"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-dark transition-colors mt-4 sm:mt-0"
          >
            <span>Explore all providers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PROS.map((pro, idx) => (
            <motion.div
              key={pro.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-surface rounded-2xl border border-sand p-5 flex flex-col justify-between hover:shadow-soft-md transition-all group"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="relative">
                    <img
                      src={pro.avatar}
                      alt={pro.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-sand group-hover:border-primary transition-colors"
                      loading="lazy"
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-success text-white">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-ink leading-tight">
                      {pro.name}
                    </h3>
                    <p className="text-xs font-semibold text-primary mt-0.5">{pro.trade}</p>
                    <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-muted" /> {pro.area}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-y border-sand/60 text-xs mb-3">
                  <span className="flex items-center gap-1 font-bold text-ink">
                    <Star className="w-3.5 h-3.5 fill-accent text-accent" /> {pro.rating}
                    <span className="text-muted font-normal">({pro.reviews} reviews)</span>
                  </span>
                  <span className="text-muted">{pro.experience}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {pro.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-bg text-muted border border-sand/60"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-sand/40">
                <div>
                  <span className="text-[11px] text-muted block leading-none">Visit Charge</span>
                  <span className="text-base font-extrabold text-ink">₹{pro.price}</span>
                </div>
                <Link
                  to={`/search?service=${pro.trade.toLowerCase()}&area=${encodeURIComponent(pro.area)}`}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-primary bg-tint hover:bg-primary hover:text-white transition-all"
                >
                  Book Visit
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
