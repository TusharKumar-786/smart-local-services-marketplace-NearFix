import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, ShieldCheck, Star, Banknote, AlertCircle } from 'lucide-react';

export const HeroSection = ({ categories, areas }) => {
  const [service, setService] = useState('plumber');
  const [area, setArea] = useState('Phase 7, Mohali');
  const [urgency, setUrgency] = useState('normal');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?service=${encodeURIComponent(service)}&area=${encodeURIComponent(area)}&urgency=${urgency}`);
  };

  return (
    <section className="relative pt-6 pb-16 lg:pt-12 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline and Search Form */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-primary bg-tint border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Serving Mohali, Chandigarh & Panchkula
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink leading-[1.12]">
                Skilled help, <br className="hidden sm:inline" />
                nearby, <span className="text-primary underline decoration-accent decoration-wavy decoration-2">fast</span>.
              </h1>

              <p className="text-lg sm:text-xl text-muted max-w-xl leading-relaxed">
                Connect directly with vetted local plumbers, electricians, AC technicians, and carpenters. Transparent visit charges, honest reviews from your neighbours, and same-day arrival.
              </p>
            </motion.div>

            {/* Interactive Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="bg-surface p-4 sm:p-5 rounded-2xl shadow-soft-lg border border-sand"
            >
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Service selector */}
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Service Needed
                    </label>
                    <div className="relative">
                      <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="w-full pl-3 pr-8 py-2.5 bg-bg text-ink rounded-xl border border-sand text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                      >
                        <option value="plumber">Plumber (Pipe & Leak)</option>
                        <option value="electrician">Electrician (Wiring & MCB)</option>
                        <option value="ac-repair">AC Repair & Gas Servicing</option>
                        <option value="painter">House Painter</option>
                        <option value="carpenter">Carpenter & Furniture</option>
                        <option value="home-cleaning">Deep Home Cleaning</option>
                        <option value="appliance-repair">Appliance Repair</option>
                        <option value="pest-control">Pest Control</option>
                        <option value="water-purifier">Water Purifier RO</option>
                        <option value="cctv-wifi">CCTV & Wi-Fi Setup</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Area selector */}
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Neighbourhood
                    </label>
                    <div className="relative">
                      <select
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full pl-3 pr-8 py-2.5 bg-bg text-ink rounded-xl border border-sand text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                      >
                        <option value="Phase 7, Mohali">Phase 7, Mohali</option>
                        <option value="Phase 3B2, Mohali">Phase 3B2, Mohali</option>
                        <option value="Phase 5, Mohali">Phase 5, Mohali</option>
                        <option value="Sector 70, Mohali">Sector 70, Mohali</option>
                        <option value="Sector 17, Chandigarh">Sector 17, Chandigarh</option>
                        <option value="Sector 22, Chandigarh">Sector 22, Chandigarh</option>
                        <option value="Sector 35, Chandigarh">Sector 35, Chandigarh</option>
                        <option value="Sector 43, Chandigarh">Sector 43, Chandigarh</option>
                        <option value="Sector 8, Chandigarh">Sector 8, Chandigarh</option>
                        <option value="Sector 5, Panchkula">Sector 5, Panchkula</option>
                        <option value="Sector 11, Panchkula">Sector 11, Panchkula</option>
                        <option value="Sector 20, Panchkula">Sector 20, Panchkula</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted">
                        <MapPin className="w-4 h-4 text-muted" />
                      </div>
                    </div>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      When Needed
                    </label>
                    <div className="relative">
                      <select
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value)}
                        className={`w-full pl-3 pr-8 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 appearance-none ${
                          urgency === 'emergency'
                            ? 'bg-emergency/10 border-emergency text-emergency focus:ring-emergency font-semibold'
                            : 'bg-bg border-sand text-ink focus:ring-primary'
                        }`}
                      >
                        <option value="normal">Standard (Today / Tomorrow)</option>
                        <option value="emergency">🚨 Emergency (Immediate help)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted">
                        <Calendar className="w-4 h-4 text-muted" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    <span>140+ technicians online across Tricity</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-sm hover:shadow"
                  >
                    <Search className="w-4 h-4" />
                    <span>Find Local Technicians</span>
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Three Trust Points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink">ID & Skill Verified</h4>
                  <p className="text-xs text-muted">Background and trade skills checked before going live.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-accent/20 text-accent-dark shrink-0">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink">Rated by Neighbours</h4>
                  <p className="text-xs text-muted">Real reviews from homeowners in your area.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-tint text-primary shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink">Clear Upfront Rates</h4>
                  <p className="text-xs text-muted">Exact visit charges in ₹ with zero hidden surcharges.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Real Photograph */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-soft-lg border border-sand bg-sand/30 aspect-[4/5] sm:aspect-[3/4]">
                <img
                  src="/images/hero.webp"
                  alt="Local technician arriving with diagnostic equipment"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />

                {/* Overlaid Provider Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-surface/95 backdrop-blur-md border border-white/50 shadow-soft-md">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=120&q=80"
                      alt="Rajesh Sharma"
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-ink truncate">Rajesh Sharma</h4>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-ink bg-accent/20 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-accent text-accent" /> 4.9
                        </span>
                      </div>
                      <p className="text-xs text-muted">Electrician • Sector 35, Chandigarh</p>
                      <p className="text-[11px] font-semibold text-success flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" /> Available now • 1.8 km away
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Accent Ring */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/15 rounded-full filter blur-xl -z-10" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full filter blur-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
