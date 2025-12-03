'use client';

import React from 'react';
import { 
  CheckSquare, 
  Calendar, 
  CreditCard, 
  BarChart,
  MessageSquare,
  Bus,
  ChevronLeft,
  Settings,
  FileText,
  Globe,
  Bell,
  BookOpen
} from 'lucide-react';
import { IntegrationIcon } from '../ui/integration-icon';

export const IntegrateAutomateSection = () => {
    return (
        // Added pb-32 to push content down and allow next section to overlap
        <section className="relative pt-32 pb-48 px-6 overflow-hidden bg-white z-10">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-blue-100/50 via-purple-100/30 to-white rounded-full blur-[100px] -z-10"></div>

            <div className="max-w-7xl mx-auto text-center relative z-10">
                <h2 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                    Integrate and Automate <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A2DAA] to-blue-600">with Ease</span>
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-16">
                    From connecting with your favorite tools to automating workflows, AcadionAI simplifies daily school operations.
                </p>
                
                {/* Layout Container */}
                <div className="relative flex justify-center items-center h-[500px]">
                    
                    {/* Icons Row - Positioned absolutely to flank the phone */}
                    <div className="absolute inset-0 flex items-center justify-center gap-[340px] pointer-events-none hidden lg:flex">
                        {/* Left Group */}
                        <div className="flex gap-4 sm:gap-6 animate-fadeIn">
                            <IntegrationIcon icon={CheckSquare} color="bg-orange-500" title="Attendance" />
                            <IntegrationIcon icon={Calendar} color="bg-[#8B5CF6]" title="Calendar" />
                            <IntegrationIcon icon={CreditCard} color="bg-blue-500" title="Fees" />
                        </div>

                        {/* Right Group */}
                        <div className="flex gap-4 sm:gap-6 animate-fadeIn">
                            <IntegrationIcon icon={BarChart} color="bg-indigo-500" title="Analytics" />
                            <IntegrationIcon icon={MessageSquare} color="bg-teal-500" title="Messages" />
                            <IntegrationIcon icon={Bus} color="bg-pink-500" title="Transport" />
                        </div>
                    </div>

                    {/* Central Phone Mockup - Pushed down to overlap next section */}
                    <div className="relative z-20 w-[300px] h-[600px] bg-slate-900 rounded-[40px] shadow-2xl border-[8px] border-slate-900 overflow-hidden ring-1 ring-white/20 transform translate-y-16">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-black rounded-b-2xl z-20"></div>
                        
                        {/* Phone Screen */}
                        <div className="w-full h-full bg-slate-50 flex flex-col pt-12 px-6">
                            <div className="flex justify-between items-center mb-6">
                                <ChevronLeft size={20} className="text-slate-400"/>
                                <h3 className="font-bold text-slate-900 text-lg">My Abilities</h3>
                                <Settings size={20} className="text-slate-400"/>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Ability Cards */}
                                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600"><FileText size={16}/></div>
                                    <div><p className="text-[10px] font-bold text-slate-800">Lesson Plans</p><p className="text-[8px] text-slate-400">Generate instantly.</p></div>
                                </div>
                                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><Globe size={16}/></div>
                                    <div><p className="text-[10px] font-bold text-slate-800">Translation</p><p className="text-[8px] text-slate-400">Translate circulars.</p></div>
                                </div>
                                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600"><Bell size={16}/></div>
                                    <div><p className="text-[10px] font-bold text-slate-800">Alerts</p><p className="text-[8px] text-slate-400">Bulk SMS.</p></div>
                                </div>
                                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600"><BookOpen size={16}/></div>
                                    <div><p className="text-[10px] font-bold text-slate-800">Syllabus</p><p className="text-[8px] text-slate-400">Track status.</p></div>
                                </div>
                                 <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><CreditCard size={16}/></div>
                                    <div><p className="text-[10px] font-bold text-slate-800">Fee Mgmt</p><p className="text-[8px] text-slate-400">Auto-reminders.</p></div>
                                </div>
                                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600"><Bus size={16}/></div>
                                    <div><p className="text-[10px] font-bold text-slate-800">Transport</p><p className="text-[8px] text-slate-400">Live tracking.</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* White Fade to cut phone half-way */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white to-transparent z-30"></div>
        </section>
    );
};
