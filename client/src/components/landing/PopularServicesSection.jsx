import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CATEGORIES_DATA = [
  {
    slug: 'plumber',
    name: 'Plumber',
    desc: 'Pipe leak repairs, drainage fixes and taps',
    image: '/images/categories/plumber.webp',
    startingPrice: 349,
  },
  {
    slug: 'electrician',
    name: 'Electrician',
    desc: 'Short circuits, switchboards & fan fittings',
    image: '/images/categories/electrician.webp',
    startingPrice: 299,
  },
  {
    slug: 'ac-repair',
    name: 'AC Repair',
    desc: 'Jet servicing, cooling issues & gas charging',
    image: '/images/categories/ac-repair.webp',
    startingPrice: 499,
  },
  {
    slug: 'painter',
    name: 'House Painter',
    desc: 'Wall putty, texture designs & trim painting',
    image: '/images/categories/painter.webp',
    startingPrice: 599,
  },
  {
    slug: 'carpenter',
    name: 'Carpenter',
    desc: 'Door locks, hinges & furniture assembly',
    image: '/images/categories/carpenter.webp',
    startingPrice: 399,
  },
  {
    slug: 'home-cleaning',
    name: 'Home Cleaning',
    desc: 'Deep kitchen degreasing & sofa shampooing',
    image: '/images/categories/home-cleaning.webp',
    startingPrice: 799,
  },
  {
    slug: 'appliance-repair',
    name: 'Appliance Repair',
    desc: 'Washing machines, fridges & microwaves',
    image: '/images/categories/appliance-repair.webp',
    startingPrice: 349,
  },
  {
    slug: 'pest-control',
    name: 'Pest Control',
    desc: 'Herbal gel cockroach & termite treatment',
    image: '/images/categories/pest-control.webp',
    startingPrice: 649,
  },
  {
    slug: 'water-purifier',
    name: 'Water Purifier',
    desc: 'RO membrane, sediment filters & TDS check',
    image: '/images/categories/water-purifier.webp',
    startingPrice: 399,
  },
  {
    slug: 'cctv-wifi',
    name: 'CCTV & Wi-Fi',
    desc: 'Security camera fitting & Wi-Fi coverage',
    image: '/images/categories/cctv-wifi.webp',
    startingPrice: 499,
  },
];

export const PopularServicesSection = () => {
  return (
    <section className="py-16 bg-surface border-y border-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-ink tracking-tight">
              Popular services near you
            </h2>
            <p className="text-muted text-base mt-2">
              Explore tradespeople ready to visit your home today.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-dark transition-colors mt-4 sm:mt-0"
          >
            <span>View all 10 categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 10 Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {CATEGORIES_DATA.map((cat, idx) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
            >
              <Link
                to={`/search?service=${cat.slug}`}
                className="group block rounded-2xl border border-sand bg-bg overflow-hidden hover:shadow-soft-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="aspect-[4/3] overflow-hidden bg-sand/30">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-3.5 space-y-1">
                  <h3 className="font-bold text-sm text-ink group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted line-clamp-1">
                    {cat.desc}
                  </p>
                  <p className="text-xs font-semibold text-primary pt-1">
                    From ₹{cat.startingPrice}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
