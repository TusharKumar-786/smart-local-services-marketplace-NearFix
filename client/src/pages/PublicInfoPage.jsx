import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Clock, Banknote, MapPin, Mail, Phone } from 'lucide-react';

export const PublicInfoPage = () => {
  const { pathname } = useLocation();

  if (pathname === '/services') {
    return (
      <div className="min-h-screen bg-bg py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-extrabold text-ink">All Service Categories</h1>
            <p className="text-muted text-sm mt-2">
              NearFix offers vetted local technicians across 10 essential home repair trades.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { slug: 'plumber', name: 'Plumber', price: 349, desc: 'Pipe leak repairs, drainage fixes, sanitary installations and geyser setup.' },
              { slug: 'electrician', name: 'Electrician', price: 299, desc: 'Short circuits, MCB switchboard fixing, ceiling fans and full house wiring.' },
              { slug: 'ac-repair', name: 'AC Repair', price: 499, desc: 'Foam jet servicing, cooling diagnosis, gas charging and PCB board repairs.' },
              { slug: 'painter', name: 'House Painter', price: 599, desc: 'Wall putty application, interior emulsion, texture walls and trim finishing.' },
              { slug: 'carpenter', name: 'Carpenter', price: 399, desc: 'Door lock replacement, hinge repair, wardrobe assembly and custom wood trim.' },
              { slug: 'home-cleaning', name: 'Deep Home Cleaning', price: 799, desc: 'Deep bathroom scrubbing, kitchen tile degreasing, sofa and carpet shampooing.' },
              { slug: 'appliance-repair', name: 'Appliance Repair', price: 349, desc: 'Washing machines, refrigerators, microwaves and domestic motor fixes.' },
              { slug: 'pest-control', name: 'Pest Control', price: 649, desc: 'Herbal cockroach gel treatment, termite drilling and bed bug eradication.' },
              { slug: 'water-purifier', name: 'Water Purifier RO', price: 399, desc: 'RO membrane replacement, sediment carbon filter changes and TDS calibration.' },
              { slug: 'cctv-wifi', name: 'CCTV & Wi-Fi Setup', price: 499, desc: 'Security IP cameras, NVR/DVR setup, mesh Wi-Fi range and optical cabling.' },
            ].map((cat) => (
              <div key={cat.slug} className="bg-surface p-6 rounded-2xl border border-sand space-y-3">
                <h3 className="text-lg font-bold text-ink">{cat.name}</h3>
                <p className="text-xs text-muted leading-relaxed">{cat.desc}</p>
                <div className="flex items-center justify-between pt-2 border-t border-sand/40">
                  <span className="text-xs font-semibold text-primary">From ₹{cat.price}</span>
                  <Link
                    to={`/search?service=${cat.slug}`}
                    className="px-3 py-1.5 text-xs font-bold text-primary bg-tint rounded-lg hover:bg-primary hover:text-white transition-all"
                  >
                    Find Technicians
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pathname === '/how-it-works') {
    return (
      <div className="min-h-screen bg-bg py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-ink">How NearFix Works</h1>
            <p className="text-muted text-sm mt-2">
              A transparent, local approach to hiring dependable tradespeople.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-2xl border border-sand space-y-2">
              <span className="text-xs font-extrabold text-primary uppercase">Step 1</span>
              <h3 className="text-lg font-bold text-ink">Search by Trade & Neighbourhood</h3>
              <p className="text-xs text-muted leading-relaxed">
                Choose the service you require and select your sector or phase in Mohali, Chandigarh, or Panchkula. If you have an urgent situation like an overflowing pipe or short circuit, choose Emergency.
              </p>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-sand space-y-2">
              <span className="text-xs font-extrabold text-primary uppercase">Step 2</span>
              <h3 className="text-lg font-bold text-ink">Compare Transparent Match Scores</h3>
              <p className="text-xs text-muted leading-relaxed">
                View verified professionals ranked by match percentage. Check exact road driving distances, authentic reviews left by verified neighbours, and clear visit inspection charges.
              </p>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-sand space-y-2">
              <span className="text-xs font-extrabold text-primary uppercase">Step 3</span>
              <h3 className="text-lg font-bold text-ink">Doorstep Service & Secure Settlement</h3>
              <p className="text-xs text-muted leading-relaxed">
                Your technician confirms and arrives during your scheduled window. Review the work after completion, settle payment with simulated UPI, card, or cash, and rate your experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pathname === '/for-professionals') {
    return (
      <div className="min-h-screen bg-bg py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-ink">Join NearFix as a Professional</h1>
            <p className="text-muted text-sm mt-2">
              Build a steady flow of high-quality service jobs in your home neighbourhood.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface p-6 rounded-2xl border border-sand space-y-2">
              <Clock className="w-6 h-6 text-primary" />
              <h3 className="font-bold text-sm text-ink">Your Schedule, Your Rules</h3>
              <p className="text-xs text-muted">Toggle your availability on or off in one tap whenever you are busy.</p>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-sand space-y-2">
              <Banknote className="w-6 h-6 text-accent" />
              <h3 className="font-bold text-sm text-ink">Keep Your Earnings</h3>
              <p className="text-xs text-muted">Receive payment directly after finishing each repair without delayed payouts.</p>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-sand space-y-2">
              <ShieldCheck className="w-6 h-6 text-success" />
              <h3 className="font-bold text-sm text-ink">Verified Trust Badge</h3>
              <p className="text-xs text-muted">Stand out to local homeowners as an approved, verified trade technician.</p>
            </div>
          </div>

          <div className="bg-surface p-8 rounded-2xl border border-sand text-center space-y-4">
            <h2 className="text-xl font-bold text-ink">Ready to start receiving jobs?</h2>
            <Link
              to="/register?role=provider"
              className="inline-block px-6 py-3 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-all"
            >
              Register as a Service Provider
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default: Contact & Support
  return (
    <div className="min-h-screen bg-bg py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-ink">Contact NearFix Support</h1>
          <p className="text-muted text-sm mt-2">
            We are here to assist residents and professionals across the Tricity area.
          </p>
        </div>

        <div className="bg-surface p-8 rounded-2xl border border-sand space-y-6 shadow-soft-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-bg rounded-xl border border-sand">
              <Phone className="w-5 h-5 text-primary mb-2" />
              <strong className="block text-ink">Customer Helpline</strong>
              <span className="text-muted">+91 172 299 4400</span>
            </div>
            <div className="p-4 bg-bg rounded-xl border border-sand">
              <Mail className="w-5 h-5 text-primary mb-2" />
              <strong className="block text-ink">Email Support</strong>
              <span className="text-muted">help@nearfix.in</span>
            </div>
            <div className="p-4 bg-bg rounded-xl border border-sand">
              <MapPin className="w-5 h-5 text-primary mb-2" />
              <strong className="block text-ink">Regional Office</strong>
              <span className="text-muted">Phase 7, Industrial Area, Mohali</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
