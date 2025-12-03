'use client';

import React from 'react';
import { ArrowRight, Sparkles, MessageSquare, BarChart, User, Globe, CheckSquare } from 'lucide-react';
import { FeatureCard } from '../ui/feature-card';

export const FeaturesSection = () => {
    return (
        <section id="features" className="relative px-6 py-24 bg-white z-20">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20">
                
                {/* Sticky Header (Left Side) */}
                <div className="lg:w-1/3">
                    <div className="sticky top-32">
                        <span className="inline-block px-4 py-2 bg-blue-50 text-[#0A2DAA] text-xs font-bold uppercase tracking-wider rounded-full mb-6">
                            Features
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                            Unlock the Power of <span className="text-[#0A2DAA]">Smart School Automation</span>
                        </h2>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Boost teacher productivity, streamline school operations, enhance parent communication, and bring AI-driven intelligence to every classroom with AcadionAI.
                        </p>
                        <button className="px-8 py-4 bg-[#0A2DAA] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-1 transition-all flex items-center gap-2 group">
                            Get Demo <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Cards (Right Side) */}
                <div className="lg:w-2/3 flex flex-col gap-12">
                    
                    {/* Card 1: Teacher's Assistant */}
                    <FeatureCard 
                        title="Smart Teacher's AI Assistant"
                        subtitle="AI that helps teachers plan faster and work smarter."
                        color="bg-purple-600"
                        icon={Sparkles}
                        points={[
                            "Generate lesson plans instantly",
                            "Auto-create question papers & assignments",
                            "Improve explanations for any topic"
                        ]}
                    >
                        {/* Chat UI Mockup */}
                        <div className="absolute inset-x-8 top-10 bottom-0 bg-white rounded-t-3xl shadow-xl border border-slate-100 p-6 flex flex-col gap-4 transform rotate-1 transition-transform duration-500 group-hover:rotate-0">
                            <div className="flex items-end gap-3 justify-end">
                                <div className="bg-[#0A2DAA] text-white p-3 rounded-2xl rounded-tr-sm text-xs max-w-[80%]">
                                    Create a lesson plan for Grade 6 Science – Water Cycle
                                </div>
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                    <User size={14} className="text-purple-600"/>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#E4B400]/20 flex items-center justify-center shrink-0">
                                    <Sparkles size={14} className="text-[#B48E00]"/>
                                </div>
                                <div className="bg-slate-50 text-slate-700 p-3 rounded-2xl rounded-tl-sm text-xs w-full border border-slate-100">
                                    <p className="font-bold mb-1 text-slate-900">Lesson Plan: The Water Cycle</p>
                                    <p className="mb-2">Objective: Understand evaporation, condensation...</p>
                                    <div className="h-1.5 w-3/4 bg-slate-200 rounded-full mb-1"></div>
                                    <div className="h-1.5 w-1/2 bg-slate-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </FeatureCard>

                    {/* Card 2: Parent Communication */}
                    <FeatureCard 
                        title="Parent Communication Assistant"
                        subtitle="Send announcements and updates with one click."
                        color="bg-pink-600"
                        icon={MessageSquare}
                        points={[
                            "Auto-draft parent messages",
                            "Translate updates into any language",
                            "Attach homework, reminders & notices"
                        ]}
                    >
                        {/* Notification Mockup */}
                        <div className="absolute w-[80%] top-12 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 transform -rotate-2 group-hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-[#0A2DAA] flex items-center justify-center text-white font-bold text-xs">A</div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">Acadion School</p>
                                        <p className="text-[10px] text-slate-400">Just now</p>
                                    </div>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            </div>
                            <p className="text-xs font-medium text-slate-800 mb-1">📢 School Trip Update</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed">The bus will arrive at the main gate by 4:00 PM. Please be present to pick up your ward.</p>
                            <div className="mt-3 flex gap-2">
                                <span className="px-2 py-1 bg-slate-100 rounded-md text-[9px] font-bold text-slate-600 flex items-center gap-1"><Globe size={10}/> Translate</span>
                            </div>
                        </div>
                        <div className="absolute w-[80%] top-44 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 p-4 opacity-60 scale-95"></div>
                    </FeatureCard>

                    {/* Card 3: Automated Attendance */}
                    <FeatureCard 
                        title="Automated Attendance System"
                        subtitle="AI that handles attendance without manual work."
                        color="bg-emerald-600"
                        icon={CheckSquare}
                        points={[
                            "Smart attendance via mobile app",
                            "Auto-generated daily reports",
                            "Real-time alerts sent to parents"
                        ]}
                    >
                        {/* Checklist UI */}
                        <div className="absolute inset-x-12 top-8 bottom-0 bg-white rounded-t-3xl shadow-xl border border-slate-100 overflow-hidden transform group-hover:translate-y-2 transition-transform duration-500">
                            <div className="bg-emerald-600 p-4 text-white">
                                <p className="text-xs font-medium opacity-80">Class 10-A</p>
                                <p className="text-sm font-bold">Daily Attendance</p>
                            </div>
                            <div className="p-4 space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <img src={`https://i.pravatar.cc/100?img=${20+i}`} className="w-8 h-8 rounded-full" alt="Student"/>
                                            <span className="text-xs font-bold text-slate-700">Student {i}</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${i === 2 ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}`}>
                                            {i === 2 ? '✕' : '✓'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FeatureCard>

                    {/* Card 4: Analytics */}
                    <FeatureCard 
                        title="Principal's Analytics Dashboard"
                        subtitle="Get real-time insights that help run your school better."
                        color="bg-blue-600"
                        icon={BarChart}
                        points={[
                            "Performance dashboards",
                            "Attendance & fee analytics",
                            "Predictive insights from AI"
                        ]}
                    >
                        {/* Charts Mockup */}
                        <div className="absolute inset-8 bg-white rounded-2xl shadow-lg border border-slate-100 p-5 flex flex-col gap-4 transform group-hover:scale-105 transition-transform duration-500">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-slate-400">Total Revenue</p>
                                    <p className="text-lg font-bold text-slate-900">$124k</p>
                                </div>
                                <div className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">+12%</div>
                            </div>
                            {/* Fake Chart */}
                            <div className="flex items-end gap-2 h-24 mt-auto">
                                {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                                    <div key={i} className="flex-1 bg-blue-50 rounded-t-sm relative group/bar">
                                        <div className="absolute bottom-0 inset-x-0 bg-blue-500 rounded-t-sm transition-all duration-700" style={{height: `${h}%`}}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FeatureCard>

                </div>
            </div>
        </section>
    );
};
