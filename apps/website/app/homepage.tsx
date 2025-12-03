'use client';

import React, { useState } from 'react';

// Section Components
import { HeroSection } from './components/sections/hero-section';
import { FeaturesSection } from './components/sections/features-section';
import { AISection } from './components/sections/ai-section';
import { EmpoweringSection } from './components/sections/empowering-section';
import { IntegrateAutomateSection } from './components/sections/integrate-automate-section';
import { SocialProofSection } from './components/sections/social-proof-section';
import { PricingSection } from './components/sections/pricing-section';
import { FAQSection } from './components/sections/faq-section';
import { FooterCTA } from './components/sections/footer-cta';
import { Footer } from './components/sections/footer';

// UI Components
import { FloatingGetInTouchButton } from './components/ui/floating-button';
import { GetInTouchModal } from './components/modals/get-in-touch-modal';

export default function HomePage() {
  const [isGetInTouchOpen, setIsGetInTouchOpen] = useState(false);

  return (
    <div className="bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-[#0A2DAA]">
      
      {/* --- SECTION 1: HERO (Sticky Scroll) --- */}
      <HeroSection onGetInTouch={() => setIsGetInTouchOpen(true)} />

      {/* --- SECTION 2: FEATURES (Sticky Scroll) --- */}
      <FeaturesSection />

      {/* --- SECTION 3: NEXT-GEN AI (Hexagonal Layout) --- */}
      <AISection />

      {/* --- SECTION 4: EMPOWERING (Orbiting Users - Sticky Scroll) --- */}
      <EmpoweringSection />

      {/* --- SECTION 5: Integrate & Automate --- */}
      <IntegrateAutomateSection />

      {/* --- SECTION 6: Social Proof (Stacking Cards) --- */}
      <SocialProofSection />

      {/* --- SECTION 7: Pricing --- */}
      <PricingSection />

      {/* --- SECTION 8: FAQ --- */}
      <FAQSection />

      {/* --- SECTION 9: Footer CTA --- */}
      <FooterCTA />

      {/* --- SECTION 10: Footer --- */}
      <Footer />

      {/* --- Floating Get In Touch Button --- */}
      <FloatingGetInTouchButton onClick={() => setIsGetInTouchOpen(true)} />

      {/* --- Get In Touch Modal --- */}
      <GetInTouchModal isOpen={isGetInTouchOpen} onClose={() => setIsGetInTouchOpen(false)} />

    </div>
  );
}
