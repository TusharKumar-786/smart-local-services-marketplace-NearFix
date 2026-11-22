import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-ink text-surface pt-16 pb-12 border-t border-sand/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <img src="/brand/logo-white.svg" alt="NearFix" className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-sand/80 max-w-sm leading-relaxed">
              Skilled help, nearby, fast. NearFix connects residents with vetted local tradespeople in your neighbourhood. Transparent visit charges, honest reviews, and dependable craft.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-sand/60">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-accent" /> Identity Verified
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-accent" /> Prompt Dispatch
              </span>
            </div>
          </div>

          {/* Popular Services */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent mb-4">
              Popular Services
            </h3>
            <ul className="space-y-2.5 text-sm text-sand/80">
              <li><Link to="/search?service=plumber" className="hover:text-white transition-colors">Plumber</Link></li>
              <li><Link to="/search?service=electrician" className="hover:text-white transition-colors">Electrician</Link></li>
              <li><Link to="/search?service=ac-repair" className="hover:text-white transition-colors">AC Servicing & Gas</Link></li>
              <li><Link to="/search?service=painter" className="hover:text-white transition-colors">House Painter</Link></li>
              <li><Link to="/search?service=carpenter" className="hover:text-white transition-colors">Carpenter & Woodwork</Link></li>
              <li><Link to="/search?service=home-cleaning" className="hover:text-white transition-colors">Deep Home Cleaning</Link></li>
            </ul>
          </div>

          {/* Tricity Service Areas */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent mb-4">
              Service Areas
            </h3>
            <ul className="space-y-2.5 text-sm text-sand/80">
              <li><Link to="/search?area=Sector+17%2C+Chandigarh" className="hover:text-white transition-colors">Sector 17, Chandigarh</Link></li>
              <li><Link to="/search?area=Sector+35%2C+Chandigarh" className="hover:text-white transition-colors">Sector 35, Chandigarh</Link></li>
              <li><Link to="/search?area=Phase+7%2C+Mohali" className="hover:text-white transition-colors">Phase 7, Mohali</Link></li>
              <li><Link to="/search?area=Phase+3B2%2C+Mohali" className="hover:text-white transition-colors">Phase 3B2, Mohali</Link></li>
              <li><Link to="/search?area=Sector+70%2C+Mohali" className="hover:text-white transition-colors">Sector 70, Mohali</Link></li>
              <li><Link to="/search?area=Sector+5%2C+Panchkula" className="hover:text-white transition-colors">Sector 5, Panchkula</Link></li>
            </ul>
          </div>

          {/* Platform & Help */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent mb-4">
              NearFix Platform
            </h3>
            <ul className="space-y-2.5 text-sm text-sand/80">
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How NearFix Works</Link></li>
              <li><Link to="/for-professionals" className="hover:text-white transition-colors">Join as a Professional</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Customer Help & FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Technician Sign In</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-sand/60 gap-4">
          <p>© {new Date().getFullYear()} NearFix Marketplace Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/safety" className="hover:text-white transition-colors">Neighbourhood Safety</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
