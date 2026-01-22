'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  opacity: number;
  onNavigate: (section: string) => void;
  onGetInTouch: () => void;
}

export const Navbar = ({ opacity, onNavigate, onGetInTouch }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      style={{ opacity }}
      className="absolute top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        
        {/* LOGO */}
        <div
          onClick={() => onNavigate('hero')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img
            src="/logo.svg"
            alt="AcadionAI"
            className="h-8 lg:h-10 w-auto"
          />
          <span className="text-lg lg:text-2xl font-bold text-[#0A2DAA]">
            AcadionAI
          </span>
        </div>

        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Careers – desktop only */}
          <Link href="/careers">
            <button className="rounded-full border-2 border-[#0A2DAA] bg-white px-6 py-2.5 text-sm font-semibold text-[#0A2DAA] transition hover:bg-slate-50 active:scale-95">
              Careers
            </button>
          </Link>

          {/* Contact / Get in Touch */}
          <button
            onClick={onGetInTouch}
            className="rounded-full bg-[#0A2DAA] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition hover:bg-blue-800 active:scale-95"
          >
            Get In Touch
          </button>

          {/* Login */}
          <Link href="/login-placeholder">
            <button className="rounded-full bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95">
              Login
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#0A2DAA]"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-slate-200">
          <div className="flex flex-col gap-2 p-4">
            <Link href="/careers" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full text-left px-4 py-3 text-[#0A2DAA] font-semibold hover:bg-slate-50 rounded-lg transition">
                Careers
              </button>
            </Link>
            
            <button
              onClick={() => {
                onGetInTouch();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-[#0A2DAA] font-semibold hover:bg-slate-50 rounded-lg transition"
            >
              Get In Touch
            </button>

            <Link href="/login-placeholder" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full text-left px-4 py-3 text-slate-700 font-semibold hover:bg-slate-50 rounded-lg transition">
                Login
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
