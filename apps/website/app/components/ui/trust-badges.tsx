'use client';

import React from 'react';
import { User, GraduationCap, School } from 'lucide-react';

export const TrustBadges = () => (
  <div className="flex items-center gap-4 mb-8">
    <div className="flex -space-x-3">
      <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[#0A2DAA] shadow-sm relative z-30">
        <User size={18} />
      </div>
      <div className="w-10 h-10 rounded-full border-2 border-white bg-[#E4B400]/20 flex items-center justify-center text-[#B48E00] shadow-sm relative z-20">
        <GraduationCap size={18} />
      </div>
      <div className="w-10 h-10 rounded-full border-2 border-white bg-green-100 flex items-center justify-center text-green-600 shadow-sm relative z-10">
        <School size={18} />
      </div>
    </div>
    <div className="flex flex-col">
       <span className="text-sm font-bold text-slate-700">2000+ Students, Teachers & Schools</span>
       <span className="text-xs text-slate-500">Trust AcadionAI for daily operations</span>
    </div>
  </div>
);
