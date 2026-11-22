import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatIndianCurrency } from '../utils/formatters';
import {
  Wrench,
  Zap,
  Flame,
  Paintbrush,
  Hammer,
  Sparkles,
  Tv,
  Bug,
  Droplets,
  Wifi,
  Search,
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const ALL_SERVICES = [
  {
    slug: 'plumber',
    name: 'Plumbing & Drainage',
    startingPrice: 349,
    coverImage: '/images/categories/plumber.webp',
    description: 'Expert pipe leak detection, tap replacement, drainage unclogging, bathroom sanitary fixtures, and overhead water tank maintenance.',
    popularSkills: ['Leak Detection', 'Drain Clearing', 'Bathroom Fixtures', 'Pipe Replacement', 'Geyser Installation'],
  },
  {
    slug: 'electrician',
    name: 'Electrical Repairs',
    startingPrice: 299,
    coverImage: '/images/categories/electrician.webp',
    description: 'Certified electrical troubleshooting, short circuit diagnosis, switchboard fitting, ceiling fan installation, and complete house wiring.',
    popularSkills: ['Short Circuit Diagnosis', 'Switchboard Replacement', 'Ceiling Fan Installation', 'MCB Trip Fixing', 'Inverter Wiring'],
  },
  {
    slug: 'ac-repair',
    name: 'Air Conditioner Servicing',
    startingPrice: 499,
    coverImage: '/images/categories/ac-repair.webp',
    description: 'High pressure foam jet cleaning, refrigerant gas leak detection, compressor capacitor replacement, and PCB circuit board repair.',
    popularSkills: ['Foam Jet Servicing', 'Gas Leak & Charging', 'PCB Board Repair', 'Compressor Capacitor', 'Split AC Uninstallation'],
  },
  {
    slug: 'painter',
    name: 'House & Wall Painting',
    startingPrice: 599,
    coverImage: '/images/categories/painter.webp',
    description: 'Waterproof wall putty application, premium interior emulsion, texture feature walls, wood primer trim, and exterior weather coating.',
    popularSkills: ['Wall Putty Application', 'Interior Emulsion', 'Texture Accent Wall', 'Waterproofing Coat', 'Door Enamel Polish'],
  },
  {
    slug: 'carpenter',
    name: 'Carpentry & Woodwork',
    startingPrice: 399,
    coverImage: '/images/categories/carpenter.webp',
    description: 'Precision door lock fitting, hydraulic hinge replacement, bespoke modular wardrobe adjustments, and wooden furniture repairs.',
    popularSkills: ['Door Lock & Handle Fitting', 'Hydraulic Hinge Repair', 'Modular Kitchen Drawer', 'Furniture Assembly', 'Bed Frame Repair'],
  },
  {
    slug: 'home-cleaning',
    name: 'Deep Home Cleaning',
    startingPrice: 799,
    coverImage: '/images/categories/home-cleaning.webp',
    description: 'Mechanized bathroom scrub cleaning, kitchen oil degreasing, sofa and mattress upholstery extraction shampooing, and balcony sanitization.',
    popularSkills: ['Deep Bathroom Scrubbing', 'Kitchen Degreasing', 'Sofa Shampooing', 'Full House Sanitization', 'Balcony Floor Buffing'],
  },
  {
    slug: 'appliance-repair',
    name: 'Home Appliance Repair',
    startingPrice: 349,
    coverImage: '/images/categories/appliance-repair.webp',
    description: 'Front and top load washing machine drum repair, refrigerator cooling thermostat check, microwave magnetron fix, and kitchen mixer repair.',
    popularSkills: ['Washing Machine Drum Fix', 'Refrigerator Thermostat & Gas', 'Microwave Magnetron Check', 'Mixer Grinder Motor Fix', 'Dishwasher Maintenance'],
  },
  {
    slug: 'pest-control',
    name: 'Pest & Termite Control',
    startingPrice: 649,
    coverImage: '/images/categories/pest-control.webp',
    description: 'Odourless herbal cockroach gel treatment, targeted anti-termite wall drilling, bed bug steam heat treatment, and rodent baiting.',
    popularSkills: ['Cockroach Herbal Gel', 'Anti-Termite Drilling', 'Bed Bug Heat Treatment', 'Mosquito Fogging', 'Rodent Baiting'],
  },
  {
    slug: 'water-purifier',
    name: 'Water Purifier & RO Service',
    startingPrice: 399,
    coverImage: '/images/categories/water-purifier.webp',
    description: 'Original RO membrane replacement, sediment carbon filter change, digital TDS level calibration, and booster pump replacement.',
    popularSkills: ['RO Filter Replacement', 'TDS Level Adjustment', 'Booster Pump Replacement', 'UV Lamp Fix', 'Water Leakage Clearance'],
  },
  {
    slug: 'cctv-wifi',
    name: 'CCTV & Wi-Fi Setup',
    startingPrice: 499,
    coverImage: '/images/categories/cctv-wifi.webp',
    description: 'High-definition dome and bullet IP camera fitting, NVR/DVR cloud setup, whole-home mesh Wi-Fi range optimization, and LAN wiring.',
    popularSkills: ['Dome & Bullet Camera Fitting', 'NVR/DVR Network Config', 'Mesh Wi-Fi Router Range Setup', 'LAN & Fibre Patch Cabling', 'Mobile Remote View Sync'],
  },
];

export const ServicesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = ALL_SERVICES.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.popularSkills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <section className="bg-surface border-b border-sand py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              All Home Repair Trades
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mt-1">
              Verified Local Services Across Tricity
            </h1>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Find background-verified, customer-reviewed professionals in Chandigarh, Mohali, and Panchkula. Transparent inspection rates and clear service guarantees.
            </p>
          </div>

          {/* Search box */}
          <div className="max-w-md relative">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by trade or skill (e.g. Geyser, RO, Putty)..."
              className="w-full pl-10 pr-4 py-2.5 bg-bg rounded-xl border border-sand text-xs font-medium text-ink placeholder:text-muted focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </section>

      {/* Emergency Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-emergency/10 border border-emergency/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emergency text-white flex items-center justify-center shrink-0 emergency-pulse">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-emergency">
                Have an Urgent Burst Pipe or Electrical Spark?
              </h3>
              <p className="text-[11px] sm:text-xs text-muted">
                Use one-tap emergency search for 25-minute priority dispatch across all Tricity sectors.
              </p>
            </div>
          </div>
          <Link
            to="/search?urgency=emergency"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emergency hover:bg-emergency/90 transition-all shadow-sm shrink-0"
          >
            Find Emergency Help
          </Link>
        </div>
      </div>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((cat) => (
            <div
              key={cat.slug}
              className="bg-surface rounded-2xl border border-sand overflow-hidden hover:shadow-soft-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="h-44 w-full overflow-hidden relative">
                  <img
                    src={cat.coverImage}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur px-2.5 py-1 rounded-lg border border-sand text-[11px] font-bold text-primary shadow-sm">
                    From {formatIndianCurrency(cat.startingPrice)}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-ink">{cat.name}</h3>
                  <p className="text-xs text-muted leading-relaxed">{cat.description}</p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                      Common Services
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.popularSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-bg text-muted border border-sand/60 text-[10px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-sand/40 mt-3 flex items-center justify-between">
                <span className="text-xs text-muted">Doorstep diagnosis</span>
                <Link
                  to={`/search?service=${cat.slug}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-primary bg-tint hover:bg-primary hover:text-white transition-all flex items-center gap-1"
                >
                  <span>Find Nearby Pros</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
export default ServicesPage;
