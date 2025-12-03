'use client';

import React from 'react';
import { 
  Sparkles, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Youtube, 
  Lock, 
  ShieldCheck, 
  Globe, 
  CheckCircle2,
  CreditCard
} from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-black text-white pt-20 pb-8 rounded-t-[3rem] mt-[-3rem] relative z-20">
            <div className="max-w-7xl mx-auto px-6">
                
                {/* Logo & Tagline */}
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="relative w-12 h-12 bg-gradient-to-br from-[#0A2DAA] to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Sparkles size={24} className="text-white" />
                            <div className="absolute inset-0 bg-white/20 blur-lg rounded-full"></div>
                        </div>
                        <span className="text-3xl font-extrabold tracking-tight">AcadionAI</span>
                    </div>
                    <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
                        AcadionAI is redefining how schools operate. From AI-powered communication to automated workflows, we help institutions run smarter, faster, and more efficiently — so educators can focus on what truly matters: students.
                    </p>
                </div>

                {/* Navigation Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-16 p-10 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                    {/* Column 1 */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Navigation</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            {['Home', 'Features', 'Solutions', 'Pricing', 'Contact', 'Book Demo'].map(item => (
                                <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Documentation</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            {['Privacy Policy', 'Terms & Conditions', 'Refund & Cancellation Policy', 'Data Security & Compliance', 'Changelog'].map(item => (
                                <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Social Connects</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li className="flex items-center gap-2"><Linkedin size={16}/><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                            <li className="flex items-center gap-2"><Instagram size={16}/><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                            <li className="flex items-center gap-2"><Facebook size={16}/><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                            <li className="flex items-center gap-2"><Youtube size={16}/><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col xl:flex-row justify-between items-center pt-8 border-t border-white/10 gap-6">
                    <p className="text-sm text-slate-500">© 2025 AcadionAI. All Rights Reserved.</p>
                    
                    {/* Trust Icons Row */}
                    <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5"><Lock size={10} className="text-[#0A2DAA]"/> Data Encrypted</span>
                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5"><ShieldCheck size={10} className="text-[#0A2DAA]"/> ISO Security</span>
                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5"><Globe size={10} className="text-[#0A2DAA]"/> Multi-tenant</span>
                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5"><CheckCircle2 size={10} className="text-[#0A2DAA]"/> 99.9% Uptime</span>
                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5"><CreditCard size={10} className="text-[#0A2DAA]"/> Verified Payments</span>
                    </div>
                </div>

                {/* Big Footer Branding */}
                <div className="mt-20 opacity-20 select-none pointer-events-none">
                    <h1 className="text-[12vw] font-bold text-center leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent">
                        AcadionAI
                    </h1>
                </div>
            </div>
        </footer>
    );
};
