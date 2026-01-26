'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  subtitle: string;
  points: string[];
  color: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}

export const FeatureCard = ({ title, subtitle, points, color, icon: Icon, children }: FeatureCardProps) => {
    return (
        <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-slate-100 group hover:shadow-2xl transition-all duration-500">

            {/* CARD HEADER */}
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${color}`}>
                    <Icon size={20} />
                </div>

                <div>
                    <h3 className="text-3xl font-bold text-slate-900">{title}</h3>
                    <p className="text-slate-600 text-sm">{subtitle}</p>
                </div>
            </div>

            {/* BODY */}
            <div className="flex flex-col lg:flex-row items-start gap-10">

                {/* LEFT SIDE TEXT */}
                <div className="flex-1">
                    <ul className="space-y-3">
                        {points.map((p, i) => (
                            <li key={i} className="text-base text-slate-700 flex items-start gap-2">
                                <span className="text-[#0A2DAA] mt-1">•</span>
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* RIGHT SIDE PREVIEW — NOW BIGGER FOR MONITOR VIDEOS */}
                <div className="w-full lg:w-1/2 flex justify-center">
                    <div className="w-full max-w-[480px] aspect-video rounded-xl overflow-hidden shadow-md">
                        {children}
                    </div>
                </div>

            </div>

        </div>
    );
};
