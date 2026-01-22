'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, CreditCard, AlertTriangle, BarChart, Sparkles, Cpu, MessageSquare } from 'lucide-react';
import { FeatureCard } from '../ui/feature-card';


export const PreviewBox = ({
    image,
    video,
    borderColor = "#0A2DAA"
}: {
    image: string;
    video: string;
    borderColor?: string;
}) => {
    return (
        <div
            className="relative w-full h-full rounded-xl overflow-hidden shadow-lg border-[3px]"
            style={{ borderColor }}
        >
            {/* Image */}
            <img
                src={image}
                className="
                  absolute inset-0 w-full h-full object-cover
                  transition-opacity duration-300
                  hover-supported:group-hover:opacity-0
                  no-hover:opacity-0
                "
            />

            {/* Video */}
            <video
                src={video}
                className="
                  absolute inset-0 w-full h-full object-cover
                  transition-opacity duration-300
                  hover-supported:opacity-0 hover-supported:group-hover:opacity-100
                  no-hover:opacity-100
                "
                autoPlay
                loop
                muted
                playsInline
            />
        </div>
    );
};



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
                            Unlock the Power of <span className="text-[#0A2DAA]">Intelligent School Automation</span>
                        </h2>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            AcadionAI brings AI-driven efficiency to every corner of your school — from scheduling to fees to insights. Automate daily work, reduce errors, and empower your staff to focus on what truly matters.
                        </p>
                        <Link href="/features">
                            <button className="px-8 py-4 bg-[#0A2DAA] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-1 transition-all flex items-center gap-2 group">
                                Get Full Feature List <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Right Side Feature Cards */}
                <div className="lg:w-2/3 flex flex-col gap-12">

                    {/* Feature 1 — AI Timetable */}
                    <FeatureCard
                        title="AI Timetable & Scheduling"
                        subtitle="Timetables built in seconds — without conflicts."
                        color="bg-blue-600"
                        icon={Calendar}
                        points={[
                            "Resolves teacher load & subject clashes automatically",
                            "Optimizes timetable for school-wide efficiency",
                            "Updates instantly when a teacher is absent",
                            "Automatically adjusts for substitutions & sudden changes",
                            "Generates optimal room allocations without conflicts",
                            "Ensures fair and balanced teaching hours for every staff member"
                        ]}
                    >
                        <PreviewBox
                            image="/timetable.png"
                            video="/timetable.mp4"
                            borderColor="#0A2DAA"
                        />
                    </FeatureCard>

                    {/* Feature 2 — Smart Fee Automation */}
                    <FeatureCard
                        title="Smart Fee Management & Automation"
                        subtitle="Fees collected on time — every time."
                        color="bg-emerald-600"
                        icon={CreditCard}
                        points={[
  "Automated fee reminders across WhatsApp/SMS/app",
  "Razorpay sync & instant reconciliation",
  "Track dues, collections & aging reports effortlessly",
  "Smart predictions for upcoming fee defaulters",
  "Auto-generated monthly collection & outstanding reports",
  "Reduces manual accounting errors with AI validation"
]
}
                    >
                        <PreviewBox
                            image="/p-fees.png"
                            video="/p-fees.mp4"
                            borderColor="#10b981"
                        />
                    </FeatureCard>

                    {/* Feature 3 — AI Workflow Agents */}
                    <FeatureCard
                        title="AI Agents for Every Workflow"
                        subtitle="Your always-on school assistant."
                        color="bg-purple-600"
                        icon={Cpu}
                        points={[
  "Auto-sends reminders, alerts & follow-ups",
  "Flags risks before they become problems",
  "Works across academics, HR, fees & communication",
  "Handles repetitive admin tasks automatically",
  "Tracks pending work and nudges staff proactively",
  "Runs 24/7 without supervision — your always-on assistant"
]
}
                    >
                        <PreviewBox
                            image="/travel.png"
                            video="/p-transport.mp4"
                            borderColor="#9333ea"
                        />
                    </FeatureCard>

                    {/* Feature 4 — Report & Alerts Intelligence */}
                    <FeatureCard
                        title="Reports & Automated Alerts"
                        subtitle="Know before things go wrong."
                        color="bg-pink-600"
                        icon={MessageSquare}
                        points={[
  "Instant risk detection for attendance & academics",
  "Auto-generated daily, weekly & monthly reports",
  "Alerts sent automatically to staff & parents",
  "Predicts at-risk students before performance drops",
  "Detects unusual attendance patterns using AI",
  "Flags critical issues that require immediate principal attention"
]
}
                    >
                        <PreviewBox
                            image="/achievements.png"
                            video="/p-achievements.mp4"
                            borderColor="#db2777"
                        />
                    </FeatureCard>

                    {/* Feature 5 — Principal Dashboard */}
                    <FeatureCard
                        title="Meaningful Dashboard Insights"
                        subtitle="See everything that matters — at a glance."
                        color="bg-blue-700"
                        icon={BarChart}
                        points={[
  "Real-time view of academics, fees & attendance",
  "AI-powered predictions & actionable insights",
  "One dashboard for leadership decisions",
  "Spot trends and patterns instantly with visual analytics",
  "Monitor school health metrics in a single unified view",
  "Customizable widgets tailored to each administrator's role"
]
}
                    >
                        <PreviewBox
                            image="/dashb.png"
                            video="p-achievements.mp4"
                            borderColor="#1d4ed8"
                        />
                    </FeatureCard>

                </div>
            </div>
        </section>
    );
};