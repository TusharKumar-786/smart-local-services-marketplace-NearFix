import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { PopularServicesSection } from '../components/landing/PopularServicesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { EmergencyHelpBand } from '../components/landing/EmergencyHelpBand';
import { WhyNearFixSection } from '../components/landing/WhyNearFixSection';
import { FeaturedProsSection } from '../components/landing/FeaturedProsSection';
import { CustomerStoriesSection } from '../components/landing/CustomerStoriesSection';
import { BecomeProviderSection } from '../components/landing/BecomeProviderSection';
import { FAQSection } from '../components/landing/FAQSection';

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Popular Services Grid */}
        <PopularServicesSection />

        {/* 4. How It Works (3 Steps) */}
        <HowItWorksSection />

        {/* 5. Emergency Help Band */}
        <EmergencyHelpBand />

        {/* 6. Why NearFix */}
        <WhyNearFixSection />

        {/* 7. Featured Professionals */}
        <FeaturedProsSection />

        {/* 8. Customer Stories */}
        <CustomerStoriesSection />

        {/* 9. Become a Provider */}
        <BecomeProviderSection />

        {/* 10. FAQ Section */}
        <FAQSection />
      </main>
    </div>
  );
};
