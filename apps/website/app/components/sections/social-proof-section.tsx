'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TestimonialCard } from '../ui/testimonial-card';

export const SocialProofSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            
            // Calculate progress: 0 when section enters viewport, 1 when it leaves
            const scrollProgress = Math.max(0, Math.min(1, 
                (-sectionTop) / (sectionHeight - viewportHeight)
            ));
            setProgress(scrollProgress);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const testimonials = [
        {
            name: "Anjali Mehta",
            role: "Senior Teacher, Bloomfield International",
            text: "AcadionAI has completely changed the way I manage my classroom workload. Lesson planning, attendance, and parent updates happen so smoothly now. I finally get time to focus on actual teaching rather than administrative tasks.",
            img: "https://i.pravatar.cc/150?img=5"
        },
        {
            name: "Arvind Nair",
            role: "Principal, Greenwood Public Academy",
            text: "Our entire school runs more efficiently. Fee reminders, announcements, and daily schedules are automated. What used to take hours now happens in minutes — and our parents absolutely love the communication clarity.",
            img: "https://i.pravatar.cc/150?img=11"
        },
        {
            name: "Divya Suresh",
            role: "Parent of Grade 7 Student",
            text: "As a parent, AcadionAI keeps me updated instantly — homework, attendance, announcements, everything. I no longer miss important school messages. It feels like the school is finally communicating the way we always wished.",
            img: "https://i.pravatar.cc/150?img=9"
        },
        {
            name: "Rahul Kulkarni",
            role: "Admin Officer, Horizon Public School",
            text: "Managing fee collections and generating reports used to be stressful. With AcadionAI, reminders go out automatically and reports are ready instantly. Our workload has reduced drastically, and we have fewer parent queries.",
            img: "https://i.pravatar.cc/150?img=3"
        }
    ];

    return (
        <section ref={containerRef} className="relative bg-slate-50" style={{ height: '300vh' }}>
            {/* Sticky Container */}
            <div className="sticky top-0 h-screen overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                    <div className="absolute top-20 left-[-100px] w-[400px] h-[400px] bg-blue-100 rounded-full blur-[120px] opacity-50"></div>
                    <div className="absolute bottom-20 right-[-100px] w-[400px] h-[400px] bg-blue-100 rounded-full blur-[120px] opacity-50"></div>
                </div>

                <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="inline-block px-4 py-2 bg-blue-100 text-[#0A2DAA] text-xs font-bold uppercase tracking-wider rounded-full mb-6">
                            Success Stories
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                            Schools Share Their <span className="text-[#0A2DAA]">AcadionAI Experience</span>
                        </h2>
                        <p className="text-lg text-slate-600">
                            See how AcadionAI is transforming schools by automating workflows, improving communication, and giving teachers more time to teach.
                        </p>
                    </div>

                    {/* Stacking Cards Container */}
                    <div className="relative w-full max-w-3xl h-[280px]">
                        {testimonials.map((t, i) => (
                            <TestimonialCard key={i} index={i} progress={progress} {...t} />
                        ))}
                    </div>
                    
                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400">
                        <span className="text-xs uppercase tracking-wider">Scroll to see more</span>
                        <div className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-1">
                            <div className="w-1.5 h-3 bg-slate-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
