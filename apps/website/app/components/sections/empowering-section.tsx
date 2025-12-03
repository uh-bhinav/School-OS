'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Users } from 'lucide-react';

export const EmpoweringSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // Calculate sticky scroll progress
            const totalDistance = rect.height - viewportHeight;
            const scrolledDistance = -rect.top;
            
            let p = Math.max(0, Math.min(1, scrolledDistance / totalDistance));
            setProgress(p);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Stakeholder Data
    const users = [
        { role: "Principal", img: "11", color: "border-purple-500" },
        { role: "Math Teacher", img: "32", color: "border-blue-500" },
        { role: "Student (Gr 10)", img: "52", color: "border-green-500" },
        { role: "Admin Staff", img: "12", color: "border-orange-500" },
        { role: "Parent", img: "41", color: "border-pink-500" },
        { role: "Science Teacher", img: "64", color: "border-indigo-500" },
        { role: "Student (Gr 6)", img: "8", color: "border-teal-500" },
        { role: "Trustee", img: "3", color: "border-slate-500" },
    ];

    return (
        <section id="empowering" ref={containerRef} className="relative h-[250vh] bg-white"> 
            <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
                
                {/* Concentric Circles Background (Scaled by progress) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none transition-transform duration-100 ease-out">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-blue-100 rounded-full opacity-100"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-blue-50 rounded-full opacity-100"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-slate-50 rounded-full opacity-100"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1050px] h-[1050px] border border-slate-50 rounded-full opacity-100"></div>
                </div>

                {/* Orbiting Users */}
                <div className="absolute top-1/2 left-1/2 w-0 h-0 z-10">
                    {users.map((user, index) => {
                        const angle = (index / users.length) * 2 * Math.PI;
                        const maxRadius = 400;
                        const currentRadius = progress * maxRadius;
                        
                        const x = Math.cos(angle) * currentRadius;
                        const y = Math.sin(angle) * currentRadius;

                        const opacity = Math.min(progress * 2, 1);
                        const scale = 0.5 + (progress * 0.5);

                        return (
                            <div
                                key={index}
                                className="absolute flex flex-col items-center gap-2"
                                style={{
                                    transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`,
                                    opacity: opacity,
                                    transition: 'transform 0.1s ease-out, opacity 0.1s ease-out'
                                }}
                            >
                                {/* Avatar Image - Large Square with Curved Edges */}
                                <div className={`w-28 h-28 md:w-32 md:h-32 rounded-3xl border-4 ${user.color} p-1.5 bg-white shadow-2xl hover:scale-110 transition-transform cursor-pointer group`}>
                                    <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-200">
                                        <img src={`https://i.pravatar.cc/150?img=${user.img}`} alt={user.role} className="w-full h-full object-cover" />
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold py-1.5 px-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                        {user.role}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Center Content */}
                <div 
                    className="relative z-20 text-center max-w-xl px-4 transition-all duration-300"
                    style={{ 
                        opacity: Math.min(progress * 3, 1), 
                        transform: `scale(${0.8 + (progress * 0.2)})` 
                    }}
                >
                    <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-[#0A2DAA] to-blue-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-8 animate-pulse-slow">
                        <Users size={40} className="text-white" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                        Empowering Every <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A2DAA] to-[#E4B400]">Stakeholder</span>
                    </h2>
                    <p className="text-lg text-slate-500 leading-relaxed">
                        From Principals to Parents, Teachers to Students, AcadionAI connects the entire education ecosystem on one unified, intelligent platform.
                    </p>
                </div>
            </div>
        </section>
    );
};
