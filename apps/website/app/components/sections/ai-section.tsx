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
                        Run Your Entire School <span className="text-[#0A2DAA]">Without Chasing Anyone</span>
                    </h2>
                    <p className="text-lg text-slate-600">
                        AcadionAI gives principals and management real-time visibility into attendance,
fees, academics, staff performance, and risks — while AI agents quietly handle
the follow-ups, reminders, and reporting in the background.
                    </p>
                </div>

                {/* Hexagonal Layout Container */}
                <div className="relative w-full max-w-5xl mx-auto lg:block hidden" style={{ height: '950px' }}>
                    
                    {/* SVG Lines */}
                    {/* (unchanged — keeping your animations intact) */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 700" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <linearGradient id="flowGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="40%" stopColor="#3B82F6" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#60A5FA" stopOpacity="1" />
                                <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="transparent" />
                                <animate attributeName="x1" values="-100%;100%" dur="2s" repeatCount="indefinite" begin="0s" />
                                <animate attributeName="x2" values="0%;200%" dur="2s" repeatCount="indefinite" begin="0s" />
                            </linearGradient>

                            <linearGradient id="flowGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="40%" stopColor="#3B82F6" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#60A5FA" stopOpacity="1" />
                                <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="transparent" />
                                <animate attributeName="x1" values="-100%;100%" dur="2s" repeatCount="indefinite" begin="1s" />
                                <animate attributeName="x2" values="0%;200%" dur="2s" repeatCount="indefinite" begin="1s" />
                            </linearGradient>

                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Dim lines */}
                        <g opacity="0.3" stroke="#0A2DAA" strokeWidth="2" fill="none">
                            <line x1="400" y1="350" x2="150" y2="120" />
                            <line x1="400" y1="350" x2="80" y2="350" />
                            <line x1="400" y1="350" x2="150" y2="580" />
                            <line x1="400" y1="350" x2="650" y2="120" />
                            <line x1="400" y1="350" x2="720" y2="350" />
                            <line x1="400" y1="350" x2="650" y2="580" />
                        </g>

                        {/* Animated lines */}
                        <g filter="url(#glow)">
                            <line x1="400" y1="350" x2="150" y2="120" stroke="url(#flowGradient1)" strokeWidth="3" strokeLinecap="round" />
                            <line x1="400" y1="350" x2="80" y2="350" stroke="url(#flowGradient1)" strokeWidth="3" strokeLinecap="round" />
                            <line x1="400" y1="350" x2="150" y2="580" stroke="url(#flowGradient1)" strokeWidth="3" strokeLinecap="round" />
                        </g>

                        <g filter="url(#glow)">
                            <line x1="400" y1="350" x2="650" y2="120" stroke="url(#flowGradient2)" strokeWidth="3" strokeLinecap="round" />
                            <line x1="400" y1="350" x2="720" y2="350" stroke="url(#flowGradient2)" strokeWidth="3" strokeLinecap="round" />
                            <line x1="400" y1="350" x2="650" y2="580" stroke="url(#flowGradient2)" strokeWidth="3" strokeLinecap="round" />
                        </g>
                    </svg>

                    {/* Center Orb */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <div className="relative w-32 h-32">
                            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-600/20 via-blue-400/10 to-blue-600/20 blur-xl animate-pulse" />
                            <div className="absolute -inset-8 rounded-full bg-blue-500/5 blur-2xl" />
                            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 shadow-2xl shadow-blue-500/50 flex items-center justify-center border border-blue-400/50">
                                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent" />
                                <div className="relative z-10 text-white font-bold text-lg">
                                    <Sparkles className="w-10 h-10" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --------------------- FEATURE CARDS ----------------------- */}

                    {/* 1 — Top Left */}
                    <div className="absolute" style={{ left: '2%', top: '2%' }}>
                        <div className="w-72 bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#0A2DAA]/50 shadow-lg group transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-[#0A2DAA]" />
                            </div>
                            <h3 className="text-slate-900 font-semibold text-base mb-2">
                                Reduce Admin Work by 60%
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                AI agents automate attendance, fees, reports & reminders—saving hours every day.
                            </p>
                        </div>
                    </div>

                    {/* 2 — Top Right */}
                    <div className="absolute" style={{ right: '2%', top: '2%' }}>
                        <div className="w-72 bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#0A2DAA]/50 shadow-lg group transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4">
                                <Cpu className="w-6 h-6 text-[#0A2DAA]" />
                            </div>
                            <h3 className="text-slate-900 font-semibold text-base mb-2">
                                Boost Fee Recovery by 20–35%
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Automated reminders, Razorpay reconciliation & real-time follow-ups improve collections instantly.
                            </p>
                        </div>
                    </div>

                    {/* 3 — Middle Left */}
                    <div className="absolute" style={{ left: '0%', top: '50%', transform: 'translateY(-50%)' }}>
                        <div className="w-72 bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#0A2DAA]/50 shadow-lg group transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4">
                                <BrainCircuit className="w-6 h-6 text-[#0A2DAA]" />
                            </div>
                            <h3 className="text-slate-900 font-semibold text-base mb-2">
                                100% Visibility Across Your School
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Live insights for academics, attendance, fees & behavior—no more guessing or chasing updates.
                            </p>
                        </div>
                    </div>

                    {/* 4 — Middle Right */}
                    <div className="absolute" style={{ right: '0%', top: '50%', transform: 'translateY(-50%)' }}>
                        <div className="w-72 bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#0A2DAA]/50 shadow-lg group transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4">
                                <ShieldCheck className="w-6 h-6 text-[#0A2DAA]" />
                            </div>
                            <h3 className="text-slate-900 font-semibold text-base mb-2">
                                AI That Adapts to Your School
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Learns patterns like absenteeism, fee cycles, class strength & performance to optimize decisions.
                            </p>
                        </div>
                    </div>

                    {/* 5 — Bottom Left */}
                    <div className="absolute" style={{ left: '2%', bottom: '2%' }}>
                        <div className="w-72 bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#0A2DAA]/50 shadow-lg group transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4">
                                <Building2 className="w-6 h-6 text-[#0A2DAA]" />
                            </div>
                            <h3 className="text-slate-900 font-semibold text-base mb-2">
                                Enterprise-Grade Stability & Security
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Encrypted, reliable & built for peak load—trusted for schools from 200 to 10,000+ students.
                            </p>
                        </div>
                    </div>

                    {/* 6 — Bottom Right */}
                    <div className="absolute" style={{ right: '2%', bottom: '2%' }}>
                        <div className="w-72 bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#0A2DAA]/50 shadow-lg group transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4">
                                <Gauge className="w-6 h-6 text-[#0A2DAA]" />
                            </div>
                            <h3 className="text-slate-900 font-semibold text-base mb-2">
                                Faster Decisions, Better Outcomes
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Principals get instant insights to act quickly and confidently on academic and operational issues.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Mobile Stacked Layout */}
                <div className="lg:hidden grid grid-cols-1 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                        <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-[#0A2DAA]" />
                        </div>
                        <h3 className="text-slate-900 font-semibold text-base mb-2">
                            Reduce Admin Work by 60%
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            AI agents automate attendance, fees, reports & reminders—saving hours every day.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                        <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4">
                            <Cpu className="w-6 h-6 text-[#0A2DAA]" />
                        </div>
                        <h3 className="text-slate-900 font-semibold text-base mb-2">
                            Boost Fee Recovery by 20–35%
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Automated reminders, Razorpay reconciliation & real-time follow-ups improve collections instantly.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                        <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4">
                            <BrainCircuit className="w-6 h-6 text-[#0A2DAA]" />
                        </div>
                        <h3 className="text-slate-900 font-semibold text-base mb-2">
                            100% Visibility Across Your School
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Live insights for academics, attendance, fees & behavior—no more guessing or chasing updates.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                        <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6 text-[#0A2DAA]" />
                        </div>
                        <h3 className="text-slate-900 font-semibold text-base mb-2">
                            AI That Adapts to Your School
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Learns patterns like absenteeism, fee cycles, class strength & performance to optimize decisions.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                        <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4">
                            <Building2 className="w-6 h-6 text-[#0A2DAA]" />
                        </div>
                        <h3 className="text-slate-900 font-semibold text-base mb-2">
                            Enterprise-Grade Stability & Security
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Encrypted, reliable & built for peak load—trusted for schools from 200 to 10,000+ students.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                        <div className="w-12 h-12 rounded-xl bg-[#0A2DAA]/10 flex items-center justify-center mb-4">
                            <Gauge className="w-6 h-6 text-[#0A2DAA]" />
                        </div>
                        <h3 className="text-slate-900 font-semibold text-base mb-2">
                            Faster Decisions, Better Outcomes
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Principals get instant insights to act quickly and confidently on academic and operational issues.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
