'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  subtitle: string;
  points: string[];
  color: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}

export const FeatureCard = ({ title, subtitle, points, color, icon: Icon, children }: FeatureCardProps) => (
  <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-xl border border-slate-100 flex flex-col gap-8 overflow-hidden group hover:shadow-2xl transition-all duration-500">
     <div>
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6`}>
           <Icon size={24} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 mb-6 leading-relaxed">{subtitle}</p>
        <ul className="space-y-3">
           {points.map((point: string, i: number) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                 <CheckCircle2 size={16} className="text-[#0A2DAA] shrink-0" />
                 {point}
              </li>
           ))}
        </ul>
     </div>
     
     {/* Mockup Container */}
     <div className="relative h-64 bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100"></div>
        {children}
     </div>
  </div>
);
