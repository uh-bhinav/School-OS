'use client';

import React, { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { 
    ArrowRight, 
    AlertTriangle,
    Users,
    Send,
    Calendar,
    CreditCard,
    RefreshCw
} from 'lucide-react';
import { Navbar } from '../navbar';

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
    
    // Phone fades out as we scroll
    const phoneOpacity = Math.max(1 - scrollProgress * 3, 0);
    const phoneScale = Math.max(1 - scrollProgress * 0.5, 0.5);
    
    // Monitor moves to exact center and scales up
    const monitorScale = 1 + scrollProgress * 0.25; // grows more
    
    // Notifications appear after scroll and spread out more
    const notificationProgress = Math.max((scrollProgress - 0.3) * 2.5, 0);
    const notificationOpacity = Math.min(notificationProgress, 1);

    type NotificationCardConfig = {
        title: string;
        description: string;
        accentGradient: string;
        accentShadow: string;
        iconBg: string;
        iconColor: string;
        Icon: LucideIcon;
    };

    type PositionedNotification = NotificationCardConfig & {
    id: string;
    offset: { x: number; y: number };
    rotation: number;
    side: "left" | "right";
};



    const notifications: PositionedNotification[] = [
    {
        id: 'auto',
        side: "left",
        title: 'Auto Reconciliation',
        description: 'Razorpay synced at 3:40 PM',
        accentGradient: 'rgba(79, 116, 255, 0.32)',
        accentShadow: 'rgba(47, 78, 180, 0.42)',
        iconBg: 'rgba(79, 116, 255, 0.24)',
        iconColor: '#214BFF',
        Icon: RefreshCw,
        offset: { x: -580, y: -120 },
        rotation: -6,
    },
    {
        id: 'attendance',
        side: "left",
        title: 'Low Attendance Alert',
        description: 'Class 9-A · 68% today',
        accentGradient: 'rgba(255, 188, 62, 0.28)',
        accentShadow: 'rgba(219, 140, 17, 0.38)',
        iconBg: 'rgba(255, 188, 62, 0.2)',
        iconColor: '#B46000',
        Icon: AlertTriangle,
        offset: { x: -600, y: 0 },
        rotation: 4,
    },
    {
        id: 'broadcast',
        title: 'Broadcast Sent',
        side: "left",
        description: 'PTM notice delivered',
        accentGradient: 'rgba(162, 124, 255, 0.28)',
        accentShadow: 'rgba(132, 94, 209, 0.4)',
        iconBg: 'rgba(162, 124, 255, 0.2)',
        iconColor: '#7B4CFF',
        Icon: Send,
        offset: { x: -580, y: 120 },
        rotation: -5,
    },
    {
        id: 'fee-reminder',
        title: 'Fee Reminder Sent',
        side: "right",
        description: '42 parents notified',
        accentGradient: 'rgba(82, 215, 166, 0.3)',
        accentShadow: 'rgba(62, 173, 128, 0.36)',
        iconBg: 'rgba(82, 215, 166, 0.22)',
        iconColor: '#0E825C',
        Icon: CreditCard,
        offset: { x: 580, y: -120 },
        rotation: 5,
    },
    {
        id: 'at-risk',
        title: 'At-Risk Students',
        side: "right",
        description: '5 students flagged',
        accentGradient: 'rgba(255, 149, 149, 0.3)',
        accentShadow: 'rgba(214, 86, 86, 0.36)',
        iconBg: 'rgba(255, 149, 149, 0.22)',
        iconColor: '#C74343',
        Icon: Users,
        offset: { x: 600, y: 0 },
        rotation: -4,
    },
    {
        id: 'timetable',
        title: 'Timetable Updated',
        side: "right",
        description: 'By AI Agent',
        accentGradient: 'rgba(88, 210, 222, 0.3)',
        accentShadow: 'rgba(54, 162, 173, 0.36)',
        iconBg: 'rgba(88, 210, 222, 0.22)',
        iconColor: '#0E6A74',
        Icon: Calendar,
        offset: { x: 580, y: 120 },
        rotation: 3,
    },
];


    const renderNotificationCard = (card: PositionedNotification) => (
    <div
        key={card.id}
        className="absolute z-20 flex items-center gap-3 px-4 py-3 w-[240px] h-[90px] bg-white rounded-2xl shadow-[0px_4px_18px_rgba(0,0,0,0.06)] transition-transform duration-500"
        style={{
            position: "absolute",
            left: card.side === "left" ? `calc(50% + ${card.offset.x}px)` : undefined,
            right: card.side === "right" ? `calc(50% - ${card.offset.x}px)` : undefined,
            top: `calc(50% + ${card.offset.y}px)`,
            transform: `
                translateY(-50%)
                rotate(${card.rotation}deg)
                scale(${0.95 + notificationOpacity * 0.05})
            `,
            opacity: notificationOpacity
        }}

    >
        {/* Icon bubble */}
        <div
            className="flex items-center justify-center w-12 h-12 rounded-full"
            style={{
                background: card.iconBg,
                color: card.iconColor
            }}
        >
            <card.Icon size={22} />
        </div>

        {/* Text content */}
        <div className="flex flex-col text-left">
            <p className="text-sm font-semibold text-slate-900">{card.title}</p>
            <p className="text-xs text-slate-500">{card.description}</p>
        </div>
    </div>
);


    return (
        <div id="hero" className="h-[200vh] relative">
            <style jsx>{`
                @keyframes float-monitor {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-12px) rotate(0.5deg); }
                }
                @keyframes float-phone {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-18px) rotate(-1deg); }
                }
                @keyframes glow-pulse {
                    0%, 100% { box-shadow: 0 25px 50px -12px rgba(10, 45, 170, 0.25); }
                    50% { box-shadow: 0 25px 80px -12px rgba(10, 45, 170, 0.4); }
                }
                .float-monitor { animation: float-monitor 5s ease-in-out infinite; }
                .float-phone { animation: float-phone 4s ease-in-out infinite 0.5s; }
                .glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
            `}</style>

            <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center relative">
                
                {/* Background Effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
                    <div className="w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#0A2DAA]/20 rounded-full blur-[60px]"></div>
                </div>

                <Navbar opacity={heroOpacity} onNavigate={scrollToSection} onGetInTouch={onGetInTouch} />

                <div className="relative z-10 w-full h-full flex items-center justify-center">
                
                    {/* Hero Left - Text (fades out on scroll) */}
                    <div 
                        className="px-6 lg:absolute lg:left-24 w-full max-w-lg transition-all duration-500 ease-out"
                        style={{ 
                            opacity: heroOpacity, 
                            transform: `translateY(${heroTranslateY}px) scale(${heroScale})`,
                            pointerEvents: heroOpacity < 0.1 ? 'none' : 'auto' 
                        }}
                    >
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
                            Tired of juggling <span className="text-[#0A2DAA]">6 different systems</span> that never talk to each other?
                        </h1>
                        <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-md mb-8 font-medium">
                            AcadionAI unifies operations, academics, fees, HR and communication — powered by <span className="text-[#0A2DAA] font-semibold">AI agents</span> that work 24/7 so you don't have to.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button onClick={onGetInTouch} className="px-6 sm:px-8 py-3 sm:py-4 bg-[#0A2DAA] hover:bg-blue-800 text-white rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 active:scale-95 flex items-center justify-center gap-2 w-full sm:w-fit">
                                Book a Demo <ArrowRight size={18}/>
                            </button>
                            <p className="text-xs sm:text-sm text-slate-500 italic">Experience the future of school operations</p>
                        </div>
                    </div>

                    {/* Monitor & Phone Container */}
                    <div
                        className="hidden lg:flex absolute transition-all duration-700 ease-out items-center justify-center"
                        style={{ 
                            left: heroOpacity > 0.1 ? 'auto' : '50%',
                            right: heroOpacity > 0.1 ? '1rem' : 'auto',
                            transform: heroOpacity > 0.1 ? 'translateX(0)' : 'translateX(-50%)'
                        }}
                    >
                        <div className="relative w-[960px] h-[560px] flex items-center justify-center">
                            {/* Floating Phone */}
                            <div
                                className="hidden lg:block absolute float-phone glow-pulse transition-all duration-500 ease-out"
                                style={{
                                    left: '90%',
                                    top: '58%',
                                    opacity: phoneOpacity,
                                    transform: `translate(-50%, -50%) translateY(${(1 - phoneOpacity) * 20}px) scale(${phoneScale})`,
                                    pointerEvents: phoneOpacity < 0.1 ? 'none' : 'auto',
                                    zIndex: 25
                                }}
                            >
                                <div className="relative w-[170px] h-[340px] bg-slate-900 rounded-[36px] shadow-2xl border-[6px] border-slate-800 overflow-hidden">
                                    <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                        <source src="/mob-alerts.mp4" type="video/mp4" />
                                    </video>
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-white/30 rounded-full"></div>
                                </div>
                            </div>

                            {/* Main Monitor - centered */}
                            <div 
                                className="relative float-monitor glow-pulse flex-shrink-0 transition-all duration-700 ease-out"
                                style={{ transform: `scale(${monitorScale})` }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                                    <div className="absolute w-[620px] h-[620px] rounded-full border border-blue-500/15"></div>
                                    <div className="absolute w-[520px] h-[520px] rounded-full border border-blue-500/25"></div>
                                    <div className="absolute w-[420px] h-[420px] rounded-full bg-blue-500/20 blur-[120px]"></div>
                                </div>
                                <div className="relative w-[480px] h-[300px] bg-slate-900 rounded-t-2xl shadow-2xl border-[8px] border-slate-800 overflow-hidden">
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-600 z-10"></div>
                                    <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                        <source src="/dashbb.mp4" type="video/mp4" />
                                    </video>
                                </div>
                                <div className="w-20 h-8 bg-gradient-to-b from-slate-700 to-slate-800 mx-auto"></div>
                                <div className="w-32 h-2.5 bg-gradient-to-b from-slate-600 to-slate-700 mx-auto rounded-lg shadow-xl"></div>
                            </div>
                        </div>

                        {/* Notifications outside monitor */}
                        <div className="absolute inset-0 pointer-events-none z-30">
                            {notifications.map((card) => renderNotificationCard(card))}
                        </div>
                    </div>

                    {/* Mobile Only - Monitor appears centered with notifications, then Phone slides in */}
                    <div className="lg:hidden absolute inset-0 pointer-events-none">
                        {/* Monitor Container - appears first (scroll 0.2-0.5) */}
                        <div 
                            className="absolute transition-all duration-700 ease-out"
                            style={{
                                opacity: scrollProgress > 0.2 && scrollProgress <= 0.55 ? Math.min((scrollProgress - 0.2) * 3, 1) : scrollProgress > 0.55 ? Math.max(1 - (scrollProgress - 0.55) * 2, 0) : 0,
                                top: '50%',
                                left: '50%',
                                transform: `translate(-50%, -50%) scale(${scrollProgress > 0.2 && scrollProgress <= 0.5 ? 0.85 + Math.min((scrollProgress - 0.2) * 0.4, 0.15) : 0.85})`,
                                zIndex: 20,
                                pointerEvents: scrollProgress > 0.2 && scrollProgress <= 0.55 ? 'auto' : 'none'
                            }}
                        >
                            <div className="flex flex-col items-center">
                                <div className="relative w-[320px] h-[200px] bg-slate-900 rounded-t-xl shadow-2xl border-4 border-slate-800 overflow-hidden">
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-600 z-10"></div>
                                    <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                        <source src="/dashbb.mp4" type="video/mp4" />
                                    </video>
                                </div>
                                <div className="w-14 h-5 bg-gradient-to-b from-slate-700 to-slate-800"></div>
                                <div className="w-24 h-2 bg-gradient-to-b from-slate-600 to-slate-700 rounded-lg shadow-xl"></div>
                            </div>
                        </div>

                        {/* Mobile Notifications - fan out around monitor (scroll 0.35-0.5) */}
                        <div className="absolute inset-0">
                            {notifications.slice(0, 4).map((card, index) => {
                                const notifProgress = scrollProgress > 0.35 && scrollProgress <= 0.55 ? Math.max((scrollProgress - 0.35) * 5, 0) : scrollProgress > 0.55 ? Math.max(1 - (scrollProgress - 0.55) * 3, 0) : 0;
                                const positions = [
  // ABOVE monitor
  { x: -90, y: -70, rotation: -4 }, // top-left
  { x: 90,  y: -70, rotation: 4 },  // top-right

  // BELOW monitor
  { x: -90, y: 230, rotation: 4 },   // bottom-left
  { x: 90,  y: 230, rotation: -4 },  // bottom-right
];
                                const pos = positions[index];
                                
                                return (
                                    <div
                                        key={card.id}
                                        className="absolute flex items-center gap-2 px-3 py-2 w-[160px] bg-white rounded-xl shadow-lg transition-all duration-500"
                                        style={{
                                            left: '50%',
                                            top: '40%',
                                            transform: `
                                                translate(calc(-50% + ${pos.x * Math.min(notifProgress, 1)}px), calc(-50% + ${pos.y * Math.min(notifProgress, 1)}px))
                                                rotate(${pos.rotation}deg)
                                                scale(${0.8 + Math.min(notifProgress, 1) * 0.2})
                                            `,
                                            opacity: Math.min(notifProgress, 1),
                                            zIndex: 15
                                        }}
                                    >
                                        <div
                                            className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                                            style={{
                                                background: card.iconBg,
                                                color: card.iconColor
                                            }}
                                        >
                                            <card.Icon size={14} />
                                        </div>
                                        <div className="flex flex-col text-left min-w-0">
                                            <p className="text-[11px] font-semibold text-slate-900 truncate">{card.title}</p>
                                            <p className="text-[9px] text-slate-500 truncate">{card.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Phone - appears centered after monitor fades (scroll 0.6+) */}
                        <div 
                            className="absolute transition-all duration-700 ease-out"
                            style={{
                                opacity: scrollProgress > 0.6 ? Math.min((scrollProgress - 0.6) * 2.5, 1) : 0,
                                top: '50%',
                                left: '50%',
                                transform: `translate(-50%, -50%) scale(${scrollProgress > 0.6 ? 0.85 + Math.min((scrollProgress - 0.6) * 0.4, 0.15) : 0.85})`,
                                zIndex: 30,
                                pointerEvents: scrollProgress > 0.6 ? 'auto' : 'none'
                            }}
                        >
                            <div className="relative w-[200px] h-[400px] bg-slate-900 rounded-[32px] shadow-2xl border-[6px] border-slate-800 overflow-hidden">
                                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                                    <source src="/mob-alerts.mp4" type="video/mp4" />
                                </video>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-14 h-1 bg-white/30 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};