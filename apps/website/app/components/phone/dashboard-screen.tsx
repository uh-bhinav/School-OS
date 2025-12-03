'use client';

import React from 'react';
import { 
  Menu, 
  Search, 
  LayoutDashboard,
  Calendar,
  GraduationCap,
  User,
  Bell,
  FileText,
  BarChart3,
  Users
} from 'lucide-react';

export const DashboardScreen = () => (
  <div className="flex-1 flex flex-col bg-slate-50 animate-fadeIn">
    {/* App Header */}
    <div className="flex items-center justify-between px-5 py-3">
      <Menu className="w-5 h-5 text-slate-600" />
      <div className="relative">
        <User className="w-5 h-5 text-slate-600" />
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
      </div>
    </div>

    {/* Main Content Area */}
    <div className="flex-1 px-5 pb-20 overflow-y-auto no-scrollbar">
      {/* Welcome Text */}
      <p className="text-xs text-slate-500 mb-0.5">Welcome back, Principal</p>
      <h1 className="text-lg font-bold text-slate-800 mb-4">School Overview</h1>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl shadow-sm border border-slate-200 mb-4">
        <Search className="w-4 h-4 text-slate-400" />
        <span className="text-xs text-slate-400">Search student, staff...</span>
      </div>

      {/* AI Insight Card */}
      <div className="bg-gradient-to-br from-[#0A2DAA] to-blue-700 p-4 rounded-2xl shadow-lg mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-[#E4B400] rounded-full blur-3xl opacity-30 -mr-5 -mt-5"></div>
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Bell className="w-4 h-4 text-[#E4B400]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-[#E4B400] uppercase tracking-wider mb-1">AI Alert</p>
            <p className="text-[11px] text-white/90 leading-relaxed">Class 10B attendance is unusually low (82%). Verify?</p>
          </div>
        </div>
      </div>

      {/* Today's Updates */}
      <p className="text-xs font-semibold text-slate-600 mb-2">Today&apos;s Updates</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center text-green-600 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <p className="text-base font-bold text-slate-800">94%</p>
          <p className="text-[10px] text-slate-400">Total Attendance</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 mb-2">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <p className="text-base font-bold text-slate-800">12</p>
          <p className="text-[10px] text-slate-400">Pending Approvals</p>
        </div>
      </div>

      {/* Modules Section */}
      <p className="text-xs font-semibold text-slate-600 mb-2">Modules</p>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        <div className="flex-shrink-0 w-20 h-20 bg-purple-100 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm">
          <Users className="w-5 h-5 text-purple-600" />
          <span className="text-[10px] font-medium text-purple-700">Staff</span>
        </div>
        <div className="flex-shrink-0 w-20 h-20 bg-blue-100 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          <span className="text-[10px] font-medium text-blue-700">Students</span>
        </div>
        <div className="flex-shrink-0 w-20 h-20 bg-yellow-100 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm">
          <FileText className="w-5 h-5 text-yellow-600" />
          <span className="text-[10px] font-medium text-yellow-700">Finance</span>
        </div>
      </div>
    </div>
  </div>
);

export const PhoneBottomNav = () => (
  <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center animate-fadeIn">
    <div className="flex flex-col items-center gap-1 text-[#0A2DAA]">
      <div className="w-10 h-8 bg-blue-50 rounded-full flex items-center justify-center"><LayoutDashboard className="w-4 h-4" /></div>
    </div>
    <div className="flex flex-col items-center gap-1 text-slate-400"><Calendar className="w-5 h-5" /></div>
    <div className="flex flex-col items-center gap-1 text-slate-400"><Bell className="w-5 h-5" /></div>
    <div className="flex flex-col items-center gap-1 text-slate-400"><User className="w-5 h-5" /></div>
  </div>
);
