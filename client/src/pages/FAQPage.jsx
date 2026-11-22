import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, HelpCircle, Phone, ArrowRight } from 'lucide-react';

const FAQ_ITEMS = [
  // Customers
  {
    category: 'customers',
    categoryLabel: 'Customers',
    q: 'How does NearFix calculate the match percentage for technicians?',
    a: 'Match percentage is calculated using a multi-factor score that assesses road distance to your neighbourhood, trade specialization, verified customer ratings, and immediate real-time availability. The closest, highest-rated technicians ready to dispatch score highest.',
  },
  {
    category: 'customers',
    categoryLabel: 'Customers',
    q: 'What is included in the inspection visit charge?',
    a: 'The visit charge covers the technician’s travel to your doorstep, preliminary safety inspection, and formal diagnostic assessment of the issue. If the repair requires replacement spare parts or extensive labor, the pro will quote the total price for your approval before starting.',
  },
  {
    category: 'customers',
    categoryLabel: 'Customers',
    q: 'How fast can an emergency technician arrive?',
    a: 'When you select "Emergency" during booking, NearFix gives highest priority to technicians currently available within 2 to 5 km of your sector. In most Tricity sectors, arrival occurs within 20 to 35 minutes.',
  },
  {
    category: 'customers',
    categoryLabel: 'Customers',
    q: 'Can I cancel a booking if my schedule changes?',
    a: 'Yes, you can cancel any booking in "Requested" or "Accepted" status directly from your Bookings dashboard with zero cancellation penalty.',
  },

  // Professionals
  {
    category: 'professionals',
    categoryLabel: 'Professionals',
    q: 'How do I join NearFix as a service provider?',
    a: 'Click "Sign Up as a Professional" on the register page, choose your service trade, and fill in your basic details. Once you upload your Aadhaar ID and experience credentials, our team verifies your account within 24 to 48 hours.',
  },
  {
    category: 'professionals',
    categoryLabel: 'Professionals',
    q: 'Does NearFix charge commission on every booking?',
    a: 'NearFix operates on a transparent model with 0% commission on standard doorstep visits during our introductory period. You keep 100% of your listed visit charges and labour fees.',
  },
  {
    category: 'professionals',
    categoryLabel: 'Professionals',
    q: 'How do I control my working hours?',
    a: 'From your Provider Workstation, simply flip the "Active" toggle on when you want to receive booking requests, and switch to "Offline" when you are done for the day or resting.',
  },

  // Payments & Billing
  {
    category: 'payments',
    categoryLabel: 'Payments & Billing',
    q: 'What payment methods are supported?',
    a: 'NearFix supports simulated doorstep UPI (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, or direct cash payment after the job is completed and inspected to your satisfaction.',
  },
  {
    category: 'payments',
    categoryLabel: 'Payments & Billing',
    q: 'Do I have to pay upfront when booking a service?',
    a: 'No upfront payment is required. You only pay after the technician has arrived at your home, diagnosed the repair, and completed the requested service.',
  },
  {
    category: 'payments',
    categoryLabel: 'Payments & Billing',
    q: 'What happens if I am charged more than the quoted price?',
    a: 'Technicians are bound by our transparent pricing policy. Any additional labour or parts cost must be agreed upon with you prior to commencing work. If there is a dispute, you can file a complaint with one click from your Bookings page for prompt resolution.',
  },

  // Safety & Quality
  {
    category: 'safety',
    categoryLabel: 'Safety & Quality',
    q: 'How does NearFix verify technicians?',
    a: 'Every technician on NearFix undergoes a multi-step verification process: Government identity validation (Aadhaar/Driving License), trade experience verification, and criminal record screening.',
  },
  {
    category: 'safety',
    categoryLabel: 'Safety & Quality',
    q: 'Is there a warranty on repair services?',
    a: 'Yes, NearFix provides a 7-day service satisfaction guarantee on all completed repair jobs. If the same issue reoccurs within 7 days, a technician will revisit at zero additional inspection charge.',
  },
];

export const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({ 0: true });

  const toggleItem = (idx) => {
    setOpenItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <section className="bg-surface border-b border-sand py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Help Center & Knowledge Base
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-muted max-w-xl mx-auto leading-relaxed">
            Everything you need to know about booking, paying, tracking, and working with local professionals on NearFix.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative pt-2">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 mt-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. payment, emergency, refund)..."
              className="w-full pl-10 pr-4 py-2.5 bg-bg rounded-xl border border-sand text-xs font-medium text-ink placeholder:text-muted focus:outline-none focus:border-primary shadow-soft-xs"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'customers', label: 'Homeowners' },
              { id: 'professionals', label: 'Service Partners' },
              { id: 'payments', label: 'Payments & Billing' },
              { id: 'safety', label: 'Safety & Warranty' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-surface text-muted border-sand hover:text-ink'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Accordion List */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-2xl border border-sand p-8">
            <HelpCircle className="w-10 h-10 text-muted mx-auto mb-2" />
            <h3 className="text-base font-bold text-ink">No matching questions found</h3>
            <p className="text-xs text-muted mt-1">
              Try adjusting your search terms or selecting a different category.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = !!openItems[idx];
              return (
                <div
                  key={idx}
                  className="bg-surface rounded-2xl border border-sand overflow-hidden transition-all shadow-soft-xs"
                >
                  <button
                    onClick={() => toggleItem(idx)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 text-xs sm:text-sm font-bold text-ink hover:text-primary transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary block">
                        {faq.categoryLabel}
                      </span>
                      <span>{faq.q}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-muted shrink-0 mt-1 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-muted leading-relaxed border-t border-sand/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Still have questions */}
        <div className="mt-12 bg-tint/60 border border-primary/20 rounded-2xl p-6 text-center space-y-3">
          <h3 className="text-base font-bold text-ink">Still have questions?</h3>
          <p className="text-xs text-muted max-w-md mx-auto">
            Our local Tricity support team is available 7 days a week from 8:00 AM to 9:00 PM to help you.
          </p>
          <div className="pt-1 flex items-center justify-center gap-3">
            <Link
              to="/contact"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-all inline-flex items-center gap-1.5 shadow-sm"
            >
              <span>Contact Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
export default FAQPage;
