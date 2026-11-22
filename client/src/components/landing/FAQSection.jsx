import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How does NearFix calculate the match score?',
    a: 'We evaluate several practical factors: whether the technician is located close to your neighbourhood, their current availability, authentic customer ratings from previous jobs, trade skills, and upfront visit charges.',
  },
  {
    q: 'What is included in the technician visit charge?',
    a: 'The visit charge covers the technician traveling to your address, diagnostic inspection of the issue, and an upfront quote. If minor adjustments take less than 15 minutes, many providers include it in the visit fee.',
  },
  {
    q: 'How does emergency service work?',
    a: 'When you select Emergency, our system immediately alerts nearby on-duty technicians within your sector or phase. The closest available professionals are given priority dispatch.',
  },
  {
    q: 'How are technicians verified?',
    a: 'Every provider submits government identification, proof of local address, and trade experience details before their profile is approved by our administration team.',
  },
  {
    q: 'What if I need to cancel or reschedule?',
    a: 'You can cancel or change your booking directly from your customer dashboard with no penalty as long as the technician has not yet departed for your address.',
  },
  {
    q: 'How and when do I pay?',
    a: 'You pay after the work is completed and you are satisfied with the repair. We support simulated UPI, debit/credit cards, net banking, or cash on delivery.',
  },
];

export const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-bg" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-ink tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-muted text-base mt-2">
            Clear, honest answers to help you get the most out of NearFix.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-sand bg-surface overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 font-bold text-base text-ink hover:text-primary transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-muted leading-relaxed border-t border-sand/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
