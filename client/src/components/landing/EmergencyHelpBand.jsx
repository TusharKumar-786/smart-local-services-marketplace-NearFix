import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, Zap, ArrowRight } from 'lucide-react';

export const EmergencyHelpBand = () => {
  return (
    <section className="py-14 bg-gradient-to-r from-emergency/10 via-surface to-emergency/5 border-y border-emergency/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-emergency bg-emergency/15 border border-emergency/30">
              <span className="w-2 h-2 rounded-full bg-emergency animate-ping" />
              <span>Priority Response Dispatch</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Facing a sudden breakdown or emergency?
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              Burst pipes, major electrical short circuits, or a dead air conditioner in peak summer cannot wait. Our emergency flow immediately notifies the closest available technician within your neighbourhood.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-ink">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emergency" /> Target arrival under 30-45 mins
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emergency" /> Highest priority routing
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/search?urgency=emergency&service=plumber"
              className="emergency-pulse w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-emergency hover:bg-emergency-dark shadow-soft-md transition-all"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Request Urgent Help Now</span>
            </Link>
            <Link
              to="/faq#emergency"
              className="w-full sm:w-auto text-center px-4 py-3 text-xs font-semibold text-muted hover:text-ink transition-colors"
            >
              How emergency booking works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
