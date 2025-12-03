'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { LogoPlaceholder } from './icons';

interface NavbarProps {
  opacity: number;
  onNavigate: (section: string) => void;
  onGetInTouch: () => void;
}

export const Navbar = ({ opacity, onNavigate, onGetInTouch }: NavbarProps) => {
  const navItems = [
    { label: 'Home', section: 'hero' },
    { label: 'Features', section: 'features' },
    { label: 'Pricing', section: 'pricing' },
    { label: 'For Schools', section: 'empowering' },
    { label: 'Contact', section: 'contact' },
  ];

  return (
    <nav 
      style={{ opacity }}
      className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto transition-opacity duration-300"
    >
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('hero')}>
        <LogoPlaceholder />
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-bold text-[#0A2DAA] tracking-tight">AcadionAI</span>
          <div className="flex gap-1 mt-1">
              <div className="w-6 h-1 bg-[#E4B400] rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-1 bg-white/70 backdrop-blur-md px-2 py-2 rounded-full shadow-sm border border-white/50">
        {navItems.map((item) => (
          <button 
            key={item.label} 
            onClick={() => item.label === 'Contact' ? onGetInTouch() : onNavigate(item.section)}
            className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-[#0A2DAA] hover:bg-blue-50/80 rounded-full transition-all"
          >
            {item.label}
          </button>
        ))}
      </div>

      <button className="lg:hidden p-2 bg-white/50 rounded-full">
        <Menu className="w-6 h-6 text-[#0A2DAA]" />
      </button>
    </nav>
  );
};
