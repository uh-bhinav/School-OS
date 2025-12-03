'use client';

import React from 'react';
import { Sparkles, Zap, Cpu, BrainCircuit, ShieldCheck, Building2, Gauge } from 'lucide-react';

export const AISection = () => {
    return (
        <section className="relative px-6 py-24 bg-white overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
            
            <div className="max-w-7xl mx-auto relative z-10">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-2 bg-blue-100 text-[#0A2DAA] text-xs font-bold uppercase tracking-wider rounded-full mb-6 border border-blue-200">
                        Intelligence Engine
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                        Next-Generation AI for <span className="text-[#0A2DAA]">Modern Schools</span>
                    </h2>
                    <p className="text-lg text-slate-600">
                        From simplifying daily operations to enabling data-driven decisions, AcadionAI delivers unmatched intelligence designed for the education ecosystem.
                    </p>
                </div>

                {/* Hexagonal Layout Container */}
                <div className="relative w-full max-w-5xl mx-auto" style={{ height: '700px' }}>
                    
                    {/* SVG Lines with Flowing Animation */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 700" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            {/* Gradient for flowing gel effect - Set 1 (Top-left diagonal) */}
                            <linearGradient id="flowGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="40%" stopColor="#3B82F6" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#60A5FA" stopOpacity="1" />
                                <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="transparent" />
                                <animate attributeName="x1" values="-100%;100%" dur="2s" repeatCount="indefinite" begin="0s" />
                                <animate attributeName="x2" values="0%;200%" dur="2s" repeatCount="indefinite" begin="0s" />
                            </linearGradient>
                            
                            {/* Gradient for flowing gel effect - Set 2 (Top-right diagonal) */}
                            <linearGradient id="flowGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="40%" stopColor="#3B82F6" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#60A5FA" stopOpacity="1" />
                                <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="transparent" />
                                <animate attributeName="x1" values="-100%;100%" dur="2s" repeatCount="indefinite" begin="1s" />
                                <animate attributeName="x2" values="0%;200%" dur="2s" repeatCount="indefinite" begin="1s" />
                            </linearGradient>

                            {/* Glow filter */}
                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        
                        {/* Base lines (dim) */}
                        <g opacity="0.3" stroke="#0A2DAA" strokeWidth="2" fill="none">
                            {/* Set 1: Top-left, Left, Bottom-left */}
                            <line x1="400" y1="350" x2="150" y2="120" />
                            <line x1="400" y1="350" x2="80" y2="350" />
                            <line x1="400" y1="350" x2="150" y2="580" />
                            {/* Set 2: Top-right, Right, Bottom-right */}
                            <line x1="400" y1="350" x2="650" y2="120" />
                            <line x1="400" y1="350" x2="720" y2="350" />
                            <line x1="400" y1="350" x2="650" y2="580" />
                        </g>
                        
                        {/* Animated flowing lines - Set 1 */}
                        <g filter="url(#glow)">
                            <line x1="400" y1="350" x2="150" y2="120" stroke="url(#flowGradient1)" strokeWidth="3" strokeLinecap="round" />
                            <line x1="400" y1="350" x2="80" y2="350" stroke="url(#flowGradient1)" strokeWidth="3" strokeLinecap="round" />
                            <line x1="400" y1="350" x2="150" y2="580" stroke="url(#flowGradient1)" strokeWidth="3" strokeLinecap="round" />
                        </g>
                        
                        {/* Animated flowing lines - Set 2 (delayed) */}
                        <g filter="url(#glow)">
                            <line x1="400" y1="350" x2="650" y2="120" stroke="url(#flowGradient2)" strokeWidth="3" strokeLinecap="round" />
                            <line x1="400" y1="350" x2="720" y2="350" stroke="url(#flowGradient2)" strokeWidth="3" strokeLinecap="round" />
                            <line x1="400" y1="350" x2="650" y2="580" stroke="url(#flowGradient2)" strokeWidth="3" strokeLinecap="round" />
                        </g>
                    </svg>

                    {/* Center Orb */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <div className="relative w-32 h-32">
                            {/* Outer glow rings */}
                            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-600/20 via-blue-400/10 to-blue-600/20 blur-xl animate-pulse" />
                            <div className="absolute -inset-8 rounded-full bg-blue-500/5 blur-2xl" />
                            
                            {/* Main orb */}
                            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 shadow-2xl shadow-blue-500/50 flex items-center justify-center border border-blue-400/50">
                                {/* Inner glow */}
                                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent" />
                                
                                {/* Logo placeholder */}
                                <div className="relative z-10 text-white font-bold text-lg">
                                    <Sparkles className="w-10 h-10" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hexagon Vertex Cards */}
                    {/* Top Left */}
                    <div className="absolute" style={{ left: '2%', top: '2%' }}>
                        <div className="w-72 bg-white backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-[#0A2DAA]/50 hover:shadow-xl transition-all duration-300 group shadow-lg">
                            <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4 group-hover:bg-[#0A2DAA]/20 transition-colors">
                                <Zap className="w-6 h-6 text-[#0A2DAA]" />
                            </div>
                            <h3 className="text-slate-900 font-semibold text-base mb-2">Lightning-Fast Automation</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Processes tasks instantly — reports, queries — zero delays.</p>
                        </div>
                    </div>

                    {/* Top Right */}
                    <div className="absolute" style={{ right: '2%', top: '2%' }}>
                        <div className="w-72 bg-white backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-[#0A2DAA]/50 hover:shadow-xl transition-all duration-300 group shadow-lg">
                            <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4 group-hover:bg-[#0A2DAA]/20 transition-colors">
                                <Cpu className="w-6 h-6 text-[#0A2DAA]" />
                            </div>
                            <h3 className="text-slate-900 font-semibold text-base mb-2">Advanced Education AI</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Hybrid AI blending LLM with deterministic school logic.</p>
                        </div>
                    </div>

                    {/* Middle Left */}
                    <div className="absolute" style={{ left: '0%', top: '50%', transform: 'translateY(-50%)' }}>
                        <div className="w-72 bg-white backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-[#0A2DAA]/50 hover:shadow-xl transition-all duration-300 group shadow-lg">
                            <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4 group-hover:bg-[#0A2DAA]/20 transition-colors">
                                <BrainCircuit className="w-6 h-6 text-[#0A2DAA]" />
                            </div>
                            <h3 className="text-slate-900 font-semibold text-base mb-2">Adapts to Every School</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Learns patterns — attendance, fee cycles — and optimizes.</p>
                        </div>
                    </div>

                    {/* Middle Right */}
                    <div className="absolute" style={{ right: '0%', top: '50%', transform: 'translateY(-50%)' }}>
                        <div className="w-72 bg-white backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-[#0A2DAA]/50 hover:shadow-xl transition-all duration-300 group shadow-lg">
                            <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4 group-hover:bg-[#0A2DAA]/20 transition-colors">
                                <ShieldCheck className="w-6 h-6 text-[#0A2DAA]" />
                            </div>
                            <h3 className="text-slate-900 font-semibold text-base mb-2">Enterprise-Grade Security</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Encrypted, tenant-isolated, industry-standard protection.</p>
                        </div>
                    </div>

                    {/* Bottom Left */}
                    <div className="absolute" style={{ left: '2%', bottom: '2%' }}>
                        <div className="w-72 bg-white backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-[#0A2DAA]/50 hover:shadow-xl transition-all duration-300 group shadow-lg">
                            <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4 group-hover:bg-[#0A2DAA]/20 transition-colors">
                                <Building2 className="w-6 h-6 text-[#0A2DAA]" />
                            </div>
                            <h3 className="text-slate-900 font-semibold text-base mb-2">Built for Any Size</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">50 to 5000+ students — scales effortlessly.</p>
                        </div>
                    </div>

                    {/* Bottom Right */}
                    <div className="absolute" style={{ right: '2%', bottom: '2%' }}>
                        <div className="w-72 bg-white backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-[#0A2DAA]/50 hover:shadow-xl transition-all duration-300 group shadow-lg">
                            <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4 group-hover:bg-[#0A2DAA]/20 transition-colors">
                                <Gauge className="w-6 h-6 text-[#0A2DAA]" />
                            </div>
                            <h3 className="text-slate-900 font-semibold text-base mb-2">Consistent Performance</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">Smart load distribution for peak time stability.</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
