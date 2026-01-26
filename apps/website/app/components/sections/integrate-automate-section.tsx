'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CreditCard,
  BarChart,
  Bus,
  Calendar,
  CheckSquare,
  Brain,
  ArrowRight,
} from 'lucide-react';

export const IntegrateAutomateSection = () => {
  const [activeVideo, setActiveVideo] = useState("");

  const features = [
    { title: "Alerts", desc: "Auto-send reminders", icon: Bell, video: "mob-alerts.mp4", color: "bg-orange-500" },
    { title: "Fee Management", desc: "Smart auto-reminders", icon: CreditCard, video: "mob-fees.mp4", color: "bg-blue-600" },
    { title: "Analytics", desc: "Live insights now", icon: BarChart, video: "mob-anal.mp4", color: "bg-indigo-500" },
    { title: "Transport", desc: "Track in real time", icon: Bus, video: "mob-transport.mp4", color: "bg-pink-500" },
    { title: "Timetable", desc: "Auto-schedule timetable", icon: Calendar, video: "mob-tt.mp4", color: "bg-purple-600" },
    { title: "Attendance", desc: "Sync + verify", icon: CheckSquare, video: "mob-atten.mp4", color: "bg-green-500" },
    { title: "Behaviour Insights", desc: "Spot-risk patterns early", icon: Brain, video: "mob-behaviour.mp4", color: "bg-teal-500" },
  ];

  return (
    <section className="relative pt-16 pb-24 px-6 bg-white">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
          Integrate and Automate <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A2DAA] to-blue-600">
            with Ease
          </span>
        </h2>

        <p className="text-md text-slate-600 max-w-xl mx-auto">
          AcadionAI connects your school systems, understands workflows, and automates tasks — everything runs smoother, faster, and intelligently.
        </p>
      </div>

      {/* ⭐ SMALLER PHONE */}
      <div className="flex justify-center mb-12">
        <div className="relative w-[280px] h-[550px] bg-white rounded-[34px] shadow-xl border-[6px] border-slate-900 overflow-hidden">
          
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-24 bg-black rounded-b-2xl z-20"></div>

          {/* Default Logo State */}
          {!activeVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <img src="/logo.svg" alt="AcadionAI" className="w-32 h-32 object-contain" />
            </div>
          )}

          {/* Hover video */}
          {activeVideo && (
            <video
              key={activeVideo}
              src={activeVideo}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          )}
        </div>
      </div>

      {/* ⭐ SMALLER FEATURE CARDS */}
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="flex gap-4 w-max mx-auto px-3 pb-3">
          
          {features.map((f, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setActiveVideo(f.video)}
              className="min-w-[160px] bg-white border border-slate-200 shadow-sm hover:shadow-md rounded-xl p-4 cursor-pointer transition-all"
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3 ${f.color}`}>
                <f.icon size={20} />
              </div>

              {/* Text */}
              <p className="font-bold text-slate-900 text-sm">{f.title}</p>
              <p className="text-xs text-slate-500">{f.desc}</p>
            </div>
          ))}

        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-6">
        <Link
          href="/features"
          className="inline-flex items-center gap-1 text-[#0A2DAA] font-semibold hover:underline text-base"
        >
          See Full AI Abilities <ArrowRight size={16} />
        </Link>
      </div>

    </section>
  );
};
