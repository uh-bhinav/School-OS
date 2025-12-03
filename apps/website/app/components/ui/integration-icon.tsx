'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IntegrationIconProps {
  icon: LucideIcon;
  color: string;
  title: string;
}

export const IntegrationIcon = ({ icon: Icon, color, title }: IntegrationIconProps) => (
    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-[2rem] shadow-xl border border-slate-100 flex flex-col items-center justify-center gap-2 group hover:scale-105 transition-transform duration-300">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white`}>
            <Icon size={20} />
        </div>
        <span className="text-[10px] font-bold text-slate-600 group-hover:text-[#0A2DAA] transition-colors">{title}</span>
    </div>
);
