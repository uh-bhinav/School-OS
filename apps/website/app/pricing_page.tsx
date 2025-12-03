'use client';

import React, { useState } from 'react';
import { PricingSection } from './components/sections/pricing-section';
import { FAQSection } from './components/sections/faq-section';
import { Footer } from './components/sections/footer';
import { Navbar } from './components/navbar';
import { FloatingGetInTouchButton } from './components/ui/floating-button';
import { GetInTouchModal } from './components/modals/get-in-touch-modal';

export default function PricingPage() {
  const [isGetInTouchOpen, setIsGetInTouchOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'hero') {
      window.location.href = '/';
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <div className="bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-[#0A2DAA]">
      
      {/* Navbar */}
      <div className="relative">
        <Navbar 
          opacity={1} 
          onNavigate={scrollToSection} 
          onGetInTouch={() => setIsGetInTouchOpen(true)} 
        />
      </div>

      {/* Spacer for navbar */}
      <div className="h-24"></div>

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />

      {/* Floating Get In Touch Button */}
      <FloatingGetInTouchButton onClick={() => setIsGetInTouchOpen(true)} />

      {/* Get In Touch Modal */}
      <GetInTouchModal isOpen={isGetInTouchOpen} onClose={() => setIsGetInTouchOpen(false)} />

    </div>
  );
}
