'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { AppleLogo, GooglePlayLogo } from '../icons';

export const FooterCTA = () => {
    // Deterministic QR pattern
    const qrPattern = [
        1,0,1,1,0,1,0,1,
        1,1,0,0,1,0,1,1,
        0,1,1,0,1,1,0,0,
        1,0,0,1,0,1,1,0,
        0,1,1,0,1,0,0,1,
        1,0,1,1,0,1,1,0,
        0,1,0,0,1,0,1,1,
        1,1,0,1,0,1,0,0,
    ];

    return (
        <section className="relative py-24 bg-white overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">
                <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                    
                    {/* Left: Phone with Gradient Orb Screen */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-start relative">
                        {/* Phone Frame */}
                        <div className="relative w-[280px] h-[560px] bg-slate-900 rounded-[45px] border-[10px] border-slate-900 overflow-hidden shadow-2xl ring-1 ring-white/20">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-28 bg-black rounded-b-2xl z-20"></div>
                            
                            {/* Status Bar */}
                            <div className="absolute top-2 left-0 right-0 flex justify-between items-center px-8 text-[10px] font-semibold text-slate-800 z-10">
                                <span>9:41</span>
                                <div className="flex gap-1">
                                    <div className="w-4 h-2 bg-slate-800 rounded-sm"></div>
                                </div>
                            </div>
                            
                            {/* Screen Content - Gradient Orb Style */}
                            <div className="w-full h-full bg-gradient-to-b from-slate-100 to-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
                                {/* Glowing Orb */}
                                <div className="relative">
                                    {/* Outer glow */}
                                    <div className="absolute -inset-16 bg-gradient-to-br from-cyan-300/40 via-blue-400/50 to-purple-400/30 rounded-full blur-3xl"></div>
                                    
                                    {/* Main orb */}
                                    <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-cyan-300 via-blue-400 to-blue-600 shadow-2xl flex items-center justify-center overflow-hidden">
                                        {/* Shine effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"></div>
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-white/40 rounded-full blur-md"></div>
                                        
                                        {/* Inner orb */}
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-blue-500/30"></div>
                                    </div>
                                </div>
                                
                                {/* Brand text below orb */}
                                <div className="mt-8 text-center">
                                    <h3 className="text-2xl font-bold text-[#0A2DAA]">Acadion</h3>
                                    <div className="flex justify-center gap-1 mt-2">
                                        <div className="w-2 h-2 rounded-full bg-[#0A2DAA]"></div>
                                        <div className="w-2 h-2 rounded-full bg-[#0A2DAA]"></div>
                                        <div className="w-2 h-2 rounded-full bg-[#0A2DAA]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                            Start Your AcadionAI <br/> Journey Today
                        </h2>
                        <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto lg:mx-0">
                            Available on iOS and Android for seamless access anytime, anywhere.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8">
                            {/* App Store Buttons - Icon Style */}
                            <div className="flex items-center gap-4">
                                <button className="w-14 h-14 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center hover:scale-105 transition-transform">
                                    <AppleLogo />
                                </button>
                                <button className="w-14 h-14 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center hover:scale-105 transition-transform">
                                    <GooglePlayLogo />
                                </button>
                            </div>

                            {/* QR Code - Styled like Framer */}
                            <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                                <div className="w-28 h-28 bg-white rounded-xl relative overflow-hidden">
                                    {/* QR Grid */}
                                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-[2px] p-2">
                                        {qrPattern.map((cell, i) => (
                                            <div key={i} className={`rounded-[2px] ${cell ? 'bg-[#0A2DAA]' : 'bg-transparent'}`}></div>
                                        ))}
                                    </div>
                                    
                                    {/* Corner Markers */}
                                    <div className="absolute top-2 left-2 w-6 h-6 border-[3px] border-[#0A2DAA] rounded-lg"></div>
                                    <div className="absolute top-2 right-2 w-6 h-6 border-[3px] border-[#0A2DAA] rounded-lg"></div>
                                    <div className="absolute bottom-2 left-2 w-6 h-6 border-[3px] border-[#0A2DAA] rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
