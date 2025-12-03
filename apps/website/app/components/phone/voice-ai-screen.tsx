'use client';

import React from 'react';
import { ChevronLeft, Sparkles, Settings, Mic } from 'lucide-react';

export const VoiceAIScreen = () => (
  <div className="flex-1 px-6 pt-10 pb-20 flex flex-col items-center animate-fadeIn relative overflow-hidden">
     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
     <div className="w-full flex justify-between items-center mb-12">
        <ChevronLeft className="w-6 h-6 text-slate-400" />
        <div className="flex items-center gap-2">
           <Sparkles className="w-4 h-4 text-[#E4B400]" fill="currentColor" />
           <span className="font-bold text-[#0A2DAA]">Acadion AI</span>
        </div>
        <Settings className="w-6 h-6 text-slate-400" />
     </div>
     <div className="relative mb-12">
        <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-[#0A2DAA] to-[#2563EB] flex items-center justify-center shadow-xl shadow-blue-500/30 relative z-10 animate-pulse-slow">
             <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                 <Mic className="w-12 h-12 text-white" />
             </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border border-blue-200 rounded-full opacity-60 animate-ping-slow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-blue-100 rounded-full opacity-40 animate-ping-slower"></div>
     </div>
     <h3 className="text-center font-bold text-slate-800 text-lg mb-2">Hi Principal!</h3>
     <p className="text-center text-slate-500 text-sm max-w-[200px] leading-relaxed mb-8">
        I&apos;m ready to help. Ask me anything about your school&apos;s data.
     </p>
     <div className="flex gap-3">
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors">
            Attendance Report
        </button>
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors">
            Fee Status
        </button>
     </div>
  </div>
);
