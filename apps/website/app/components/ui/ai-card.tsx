'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AICardProps {
  title: string;
  desc: string;
  icon: LucideIcon;
  isCenter?: boolean;
}

export const AICard = ({ title, desc, icon: Icon, isCenter = false }: AICardProps) => (
    <div className={`relative p-8 rounded-[2rem] border transition-all duration-500 hover:-translate-y-1 hover:shadow-xl flex flex-col gap-4 group
        ${isCenter 
            ? 'bg-[#0A2DAA] text-white border-[#0A2DAA] shadow-2xl shadow-blue-900/30 lg:col-span-1 lg:row-span-1 flex items-center justify-center text-center overflow-hidden' 
            : 'bg-white text-slate-800 border-blue-50 hover:border-blue-200'
        }
    `}>
        {isCenter && (
            <>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#0A2DAA] to-[#E4B400] opacity-30 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
            </>
        )}
        
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 transition-transform duration-500 group-hover:scale-110
            ${isCenter ? 'bg-white/10 backdrop-blur-md text-[#E4B400]' : 'bg-blue-50 text-[#0A2DAA]'}
        `}>
            <Icon size={28} />
        </div>
        
        <h3 className={`text-xl font-bold ${isCenter ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
        <p className={`text-sm leading-relaxed ${isCenter ? 'text-blue-100' : 'text-slate-500'}`}>{desc}</p>
    </div>
);
