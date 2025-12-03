'use client';

import React, { useState, useEffect } from 'react';
import { 
    ArrowRight, 
    QrCode, 
    User, 
    Heart, 
    CheckCircle2, 
    MessageSquare,
    LayoutDashboard,
    Calendar,
    Bell
} from 'lucide-react';
import { Navbar } from '../navbar';
import { TrustBadges } from '../ui/trust-badges';
import { DashboardScreen, PhoneBottomNav } from '../phone/dashboard-screen';
import { VoiceAIScreen } from '../phone/voice-ai-screen';

interface HeroSectionProps {
    onGetInTouch: () => void;
}

export const HeroSection = ({ onGetInTouch }: HeroSectionProps) => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const progress = Math.min(Math.max(scrollY / (windowHeight * 0.8), 0), 1);
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else if (sectionId === 'hero') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const heroOpacity = Math.max(1 - scrollProgress * 2.5, 0); 
    const heroScale = Math.max(1 - scrollProgress * 0.1, 0.9);
    const heroTranslateY = scrollProgress * -100;
    
    const bubblesOpacity = Math.min(Math.max((scrollProgress - 0.4) * 2, 0), 1);
    const bubblesScale = Math.min(Math.max(0.5 + (scrollProgress - 0.4), 0.5), 1);
    const isVoiceMode = scrollProgress > 0.4;

    return (
        <div id="hero" className="h-[200vh] relative">
            <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center relative">
                
                {/* Background Effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
                    <div className="w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-multiply animate-pulse-slow"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#0A2DAA]/20 rounded-full blur-[60px]"></div>
                </div>

                <Navbar opacity={heroOpacity} onNavigate={scrollToSection} onGetInTouch={onGetInTouch} />

                <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex items-center justify-center h-full">
                
                    {/* Hero Left */}
                    <div 
                        className="absolute left-6 lg:left-0 top-32 lg:top-auto w-full max-w-lg transition-all duration-500 ease-out"
                        style={{ 
                            opacity: heroOpacity, 
                            transform: `translateY(${heroTranslateY}px) scale(${heroScale})`,
                            pointerEvents: heroOpacity < 0.1 ? 'none' : 'auto' 
                        }}
                    >
                        <TrustBadges />
                        <h1 className="text-4xl lg:text-6xl font-extrabold text-[#0A2DAA] tracking-tight leading-[1.1] mb-6">
                            The Most Intelligent <br/> 
                            <span className="text-slate-900">SchoolOS</span> for <br/>
                            Modern Education
                        </h1>
                        <p className="text-slate-600 text-lg leading-relaxed max-w-md mb-8 font-medium">
                            AcadionAI automates admin work, boosts productivity, and gives schools an intelligent assistant that works 24/7.
                        </p>
                    </div>

                    {/* Hero Right (QR) */}
                    <div 
                        className="absolute right-6 lg:right-0 bottom-32 lg:bottom-auto flex flex-col items-end gap-8 transition-all duration-500 ease-out"
                        style={{ 
                            opacity: heroOpacity, 
                            transform: `translateY(${heroTranslateY}px) scale(${heroScale})`,
                            pointerEvents: heroOpacity < 0.1 ? 'none' : 'auto'
                        }}
                    >
                        <div className="text-right">
                            <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-6">
                                Launch AcadionAI for <br/> Your School
                            </h3>
                            <div className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] shadow-xl border border-white inline-block">
                                <div className="w-48 h-48 bg-slate-50 rounded-2xl relative overflow-hidden flex items-center justify-center border-4 border-white shadow-inner mx-auto">
                                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-1 p-3">
                                        {Array.from({length: 64}).map((_, i) => {
                                            const isBlue = (i * 13 + 7) % 10 > 3; 
                                            const isGold = (i * 29 + 3) % 20 === 0;
                                            return (
                                                <div key={i} className={`rounded-sm ${isBlue ? 'bg-[#0A2DAA]' : 'bg-transparent'} ${isGold ? '!bg-[#E4B400]' : ''}`}></div>
                                            );
                                        })}
                                    </div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md z-20">
                                        <QrCode className="w-5 h-5 text-[#0A2DAA]" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 mt-4 w-48">
                                    <button className="w-full py-2 bg-[#0A2DAA] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2">
                                        View Demo <ArrowRight size={14}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Phone */}
                    <div className="relative z-20">
                        {/* Floating Elements */}
                        <div 
                            className="absolute top-0 -left-72 lg:-left-96 bg-white p-6 pr-10 rounded-[2rem] rounded-tl-none shadow-2xl border border-slate-100 flex items-center gap-6 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105"
                            style={{ 
                                opacity: bubblesOpacity, 
                                transform: `translate(${bubblesOpacity * 40}px, 0) scale(${bubblesScale})` 
                            }}
                        >
                            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                                <User size={32} />
                            </div>
                            <div className="min-w-[140px]">
                                <p className="text-lg font-bold text-slate-800">Generate Report</p>
                                <p className="text-sm text-slate-500 mt-1 font-medium">Class 10-A Math</p>
                            </div>
                        </div>

                        <div 
                            className="absolute bottom-20 -right-72 lg:-right-96 bg-white p-6 pl-10 rounded-[2rem] rounded-br-none shadow-2xl border border-slate-100 flex items-center gap-6 transition-all duration-700 delay-100 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105"
                            style={{ 
                                opacity: bubblesOpacity, 
                                transform: `translate(${bubblesOpacity * -40}px, 0) scale(${bubblesScale})` 
                            }}
                        >
                            <div className="text-right min-w-[140px]">
                                <p className="text-lg font-bold text-slate-800">Fee Reminder</p>
                                <p className="text-sm text-slate-500 mt-1 font-medium">Sent to 45 Parents</p>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0 shadow-sm">
                                <Heart size={28} fill="currentColor" />
                            </div>
                        </div>

                        <div 
                            className="absolute -top-24 -right-32 w-28 h-28 bg-white rounded-full p-2 shadow-2xl transition-all duration-700 delay-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110"
                            style={{ opacity: bubblesOpacity, transform: `scale(${bubblesScale})` }}
                        >
                            <div className="w-full h-full bg-blue-100 rounded-full overflow-hidden">
                                <img src="https://i.pravatar.cc/150?img=12" alt="User" className="w-full h-full object-cover" />
                            </div>
                        </div>

                        <div 
                            className="absolute -bottom-16 -left-32 w-24 h-24 bg-white rounded-full p-2 shadow-2xl transition-all duration-700 delay-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110"
                            style={{ opacity: bubblesOpacity, transform: `scale(${bubblesScale})` }}
                        >
                            <div className="w-full h-full bg-orange-100 rounded-full overflow-hidden">
                                <img src="https://i.pravatar.cc/150?img=5" alt="User" className="w-full h-full object-cover" />
                            </div>
                        </div>

                        {/* New Card - Top Right */}
                        <div 
                            className="absolute top-32 -right-80 lg:-right-[26rem] bg-white p-5 pr-8 rounded-[2rem] rounded-tr-none shadow-2xl border border-slate-100 flex items-center gap-5 transition-all duration-700 delay-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105"
                            style={{ 
                                opacity: bubblesOpacity, 
                                transform: `translate(${bubblesOpacity * -30}px, 0) scale(${bubblesScale})` 
                            }}
                        >
                            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0 shadow-sm">
                                <CheckCircle2 size={28} />
                            </div>
                            <div className="min-w-[120px]">
                                <p className="text-base font-bold text-slate-800">Attendance Done</p>
                                <p className="text-xs text-slate-500 mt-1 font-medium">Grade 8-B • 42/45</p>
                            </div>
                        </div>

                        {/* New Card - Bottom Left */}
                        <div 
                            className="absolute bottom-48 -left-80 lg:-left-[26rem] bg-white p-5 pl-8 rounded-[2rem] rounded-bl-none shadow-2xl border border-slate-100 flex items-center gap-5 transition-all duration-700 delay-250 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105"
                            style={{ 
                                opacity: bubblesOpacity, 
                                transform: `translate(${bubblesOpacity * 30}px, 0) scale(${bubblesScale})` 
                            }}
                        >
                            <div className="text-right min-w-[120px]">
                                <p className="text-base font-bold text-slate-800">New Message</p>
                                <p className="text-xs text-slate-500 mt-1 font-medium">From Parent • 2m ago</p>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                                <MessageSquare size={26} />
                            </div>
                        </div>

                        {/* The Phone */}
                        <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[40px] shadow-2xl border-[8px] border-slate-900 overflow-hidden ring-1 ring-white/20 transition-transform duration-500">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-black rounded-b-2xl z-20 flex items-center justify-center gap-2">
                                <div className="w-10 h-1 bg-gray-800 rounded-full"></div>
                            </div>
                            <div className="w-full bg-slate-50 flex justify-between items-center px-6 pt-3 pb-2 text-[10px] font-bold text-slate-800 z-10 relative">
                                <span>9:41</span>
                                <div className="flex gap-1">
                                    <div className="w-4 h-2.5 bg-slate-800 rounded-sm"></div>
                                    <div className="w-0.5 h-2.5 bg-slate-800 rounded-sm"></div>
                                </div>
                            </div>
                            <div className="w-full h-full bg-slate-50 flex flex-col relative">
                                {isVoiceMode ? <VoiceAIScreen /> : <DashboardScreen />}
                                {!isVoiceMode && <PhoneBottomNav />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
