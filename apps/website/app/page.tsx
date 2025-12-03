"use client";

import React from 'react';
import { 
  Menu, 
  Search, 
  LayoutDashboard,
  Calendar,
  GraduationCap,
  School,
  User,
  QrCode, 
  ArrowRight,
  BarChart3,
  Users,
  Bell,
  CheckCircle2,
  FileText
} from 'lucide-react';

// --- Animated Background Components ---

const AnimatedOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Large floating orb 1 - slow drift */}
    <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-300/20 blur-3xl animate-float-slow" />
    
    {/* Large floating orb 2 - medium drift */}
    <div className="absolute top-[30%] left-[5%] w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-[#0A2DAA]/25 to-blue-500/15 blur-3xl animate-float-medium" />
    
    {/* Medium orb 3 - fast pulse */}
    <div className="absolute top-[50%] right-[20%] w-[250px] h-[250px] rounded-full bg-gradient-to-bl from-cyan-400/25 to-blue-600/20 blur-2xl animate-float-fast" />
    
    {/* Small accent orb */}
    <div className="absolute top-[20%] left-[40%] w-[150px] h-[150px] rounded-full bg-gradient-to-r from-[#E4B400]/20 to-yellow-300/10 blur-2xl animate-pulse-slow" />
    
    {/* Bottom left orb */}
    <div className="absolute bottom-[20%] left-[15%] w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-blue-500/20 to-indigo-400/15 blur-3xl animate-float-reverse" />
    
    {/* Center back glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#0A2DAA]/15 to-cyan-400/10 blur-[80px] animate-pulse-slow" />
  </div>
);

const AnimatedClouds = () => (
  <div className="absolute bottom-0 left-0 right-0 h-[400px] overflow-hidden pointer-events-none">
    {/* Cloud layer 1 - slowest, back */}
    <div className="absolute bottom-[-80px] left-[-10%] w-[600px] h-[300px] bg-white rounded-full blur-[60px] opacity-90 animate-cloud-drift-slow" />
    <div className="absolute bottom-[-100px] right-[-5%] w-[500px] h-[250px] bg-white rounded-full blur-[50px] opacity-85 animate-cloud-drift-slow-reverse" />
    
    {/* Cloud layer 2 - medium speed */}
    <div className="absolute bottom-[-60px] left-[20%] w-[450px] h-[220px] bg-gradient-to-t from-white to-blue-50/80 rounded-full blur-[40px] opacity-95 animate-cloud-drift-medium" />
    <div className="absolute bottom-[-70px] right-[25%] w-[400px] h-[200px] bg-gradient-to-t from-white to-slate-50 rounded-full blur-[45px] opacity-90 animate-cloud-drift-medium-reverse" />
    
    {/* Cloud layer 3 - fastest, front */}
    <div className="absolute bottom-[-40px] left-[10%] w-[350px] h-[180px] bg-white rounded-full blur-[30px] opacity-100 animate-cloud-drift-fast" />
    <div className="absolute bottom-[-50px] right-[15%] w-[380px] h-[190px] bg-white rounded-full blur-[35px] opacity-95 animate-cloud-drift-fast-reverse" />
    <div className="absolute bottom-[-30px] left-[45%] w-[300px] h-[150px] bg-white rounded-full blur-[25px] opacity-100 animate-cloud-float" />
    
    {/* Subtle blue tint clouds */}
    <div className="absolute bottom-[20px] left-[30%] w-[200px] h-[100px] bg-blue-100/50 rounded-full blur-[30px] animate-cloud-drift-medium" />
    <div className="absolute bottom-[40px] right-[35%] w-[180px] h-[90px] bg-cyan-100/40 rounded-full blur-[25px] animate-cloud-drift-slow" />
  </div>
);

// --- Components ---

const Navbar = () => (
  <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
    {/* Logo */}
    <div className="flex items-center gap-3">
      {/* LOGO PLACEHOLDER: Replace the src below with your actual logo URL */}
      <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md">
        <img 
            src="https://placehold.co/80x80/0A2DAA/E4B400?text=AI" 
            alt="AcadionAI Logo" 
            className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex flex-col leading-none">
        <span className="text-2xl font-bold text-[#0A2DAA] tracking-tight">AcadionAI</span>
        <div className="flex gap-1 mt-1">
            <div className="w-6 h-1 bg-[#E4B400] rounded-full"></div>
        </div>
      </div>
    </div>

    {/* Desktop Nav */}
    <div className="hidden lg:flex items-center gap-1 bg-white/70 backdrop-blur-md px-2 py-2 rounded-full shadow-sm border border-white/50">
      {['Home', 'Features', 'Pricing', 'For Schools', 'Contact'].map((item) => (
        <button key={item} className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-[#0A2DAA] hover:bg-blue-50/80 rounded-full transition-all">
          {item}
        </button>
      ))}
    </div>

    {/* Mobile Menu Toggle */}
    <button className="lg:hidden p-2 bg-white/50 rounded-full">
      <Menu className="w-6 h-6 text-[#0A2DAA]" />
    </button>
  </nav>
);

const TrustBadges = () => (
  <div className="flex items-center gap-4 mb-8">
    <div className="flex -space-x-3">
      {/* Teacher Icon */}
      <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[#0A2DAA] shadow-sm relative z-30">
        <User size={18} />
      </div>
      {/* Student Icon */}
      <div className="w-10 h-10 rounded-full border-2 border-white bg-[#E4B400]/20 flex items-center justify-center text-[#B48E00] shadow-sm relative z-20">
        <GraduationCap size={18} />
      </div>
      {/* School Icon */}
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

const PhoneMockup = () => {
  return (
    <div className="relative z-10 mx-auto transform hover:scale-[1.02] transition-transform duration-500 ease-in-out">
      {/* Phone Frame */}
      <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[40px] shadow-2xl border-[8px] border-slate-900 overflow-hidden ring-1 ring-white/20">
        
        {/* Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-black rounded-b-2xl z-20 flex items-center justify-center gap-2">
            <div className="w-10 h-1 bg-gray-800 rounded-full"></div>
        </div>

        {/* Screen Content */}
        <div className="w-full h-full bg-slate-50 flex flex-col font-sans overflow-hidden">
          
          {/* Status Bar */}
          <div className="flex justify-between items-center px-6 pt-3 pb-2 text-[10px] font-bold text-slate-800">
            <span>9:41</span>
            <div className="flex gap-1">
              <div className="w-4 h-2.5 bg-slate-800 rounded-sm"></div>
              <div className="w-0.5 h-2.5 bg-slate-800 rounded-sm"></div>
            </div>
          </div>

          {/* App Header */}
          <div className="px-6 py-2 flex justify-between items-center">
            <Menu className="w-5 h-5 text-slate-600" />
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center relative">
               <div className="absolute top-0 right-0 w-2 h-2 bg-[#E4B400] rounded-full border border-white"></div>
               <User className="w-4 h-4 text-[#0A2DAA]" />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 px-6 pt-2 pb-20 overflow-y-auto no-scrollbar">
            <h2 className="text-sm font-semibold text-slate-500 mb-0.5">
              Welcome back, Principal
            </h2>
            <h2 className="text-xl font-bold text-[#0A2DAA] leading-tight mb-5">
              School Overview
            </h2>

            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-5">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search student, staff..." className="flex-1 bg-transparent text-xs outline-none text-slate-600 placeholder:text-slate-400" />
            </div>

            {/* AI Insight Card */}
            <div className="bg-gradient-to-br from-[#0A2DAA] to-blue-800 p-4 rounded-2xl shadow-md mb-5 relative overflow-hidden group text-white">
               <div className="absolute top-0 right-0 w-24 h-24 bg-[#E4B400] rounded-full blur-[40px] opacity-30 -mr-6 -mt-6"></div>
               <div className="flex items-start gap-3 relative z-10">
                 <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-[#E4B400]">
                   <Bell className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-xs font-bold text-[#E4B400] uppercase tracking-wider mb-1">AI Alert</h3>
                   <p className="text-xs font-medium leading-relaxed opacity-90">Class 10B attendance is unusually low today (82%). Verify with Mr. Sharma?</p>
                   <button className="mt-3 px-3 py-1.5 bg-white text-[#0A2DAA] text-[10px] font-bold rounded-lg hover:bg-blue-50 transition-colors">
                     Check Details
                   </button>
                 </div>
               </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="flex justify-between items-end mb-3">
               <h3 className="font-bold text-slate-800 text-sm">Today's Updates</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
                 <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                    <CheckCircle2 size={16} />
                 </div>
                 <div>
                    <span className="text-lg font-bold text-slate-800">94%</span>
                    <p className="text-[10px] text-slate-400">Total Attendance</p>
                 </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
                 <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                    <FileText size={16} />
                 </div>
                 <div>
                    <span className="text-lg font-bold text-slate-800">12</span>
                    <p className="text-[10px] text-slate-400">Pending Approvals</p>
                 </div>
              </div>
            </div>

             {/* Recent Activities / Modules */}
             <div className="flex justify-between items-end mb-3">
               <h3 className="font-bold text-slate-800 text-sm">Modules</h3>
               <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
                 <div className="flex-none w-20 h-20 rounded-xl bg-purple-50 border border-purple-100 flex flex-col items-center justify-center gap-1 text-purple-600">
                    <Users size={20} />
                    <span className="text-[10px] font-medium">Staff</span>
                 </div>
                 <div className="flex-none w-20 h-20 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center gap-1 text-[#0A2DAA]">
                    <GraduationCap size={20} />
                    <span className="text-[10px] font-medium">Students</span>
                 </div>
                 <div className="flex-none w-20 h-20 rounded-xl bg-yellow-50 border border-yellow-100 flex flex-col items-center justify-center gap-1 text-[#b48e00]">
                    <BarChart3 size={20} />
                    <span className="text-[10px] font-medium">Finance</span>
                 </div>
            </div>

          </div>

          {/* Bottom Nav */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center">
            <div className="flex flex-col items-center gap-1 text-[#0A2DAA]">
               <div className="w-10 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4" />
               </div>
               <span className="text-[9px] font-bold">Dash</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-400">
               <Calendar className="w-5 h-5" />
               <span className="text-[9px] font-medium">Calendar</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-slate-400">
               <Bell className="w-5 h-5" />
               <span className="text-[9px] font-medium">Notice</span>
            </div>
             <div className="flex flex-col items-center gap-1 text-slate-400">
               <User className="w-5 h-5" />
               <span className="text-[9px] font-medium">Profile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden font-sans selection:bg-blue-100 selection:text-[#0A2DAA]">
      
      {/* --- CSS Animations --- */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -20px) scale(1.05); }
          50% { transform: translate(-20px, 30px) scale(0.95); }
          75% { transform: translate(-30px, -10px) scale(1.02); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 25px) scale(1.03); }
          66% { transform: translate(25px, -15px) scale(0.97); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        
        @keyframes float-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -25px) scale(1.05); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        
        @keyframes cloud-drift-slow {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(40px); }
        }
        
        @keyframes cloud-drift-slow-reverse {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-40px); }
        }
        
        @keyframes cloud-drift-medium {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(60px); }
        }
        
        @keyframes cloud-drift-medium-reverse {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-60px); }
        }
        
        @keyframes cloud-drift-fast {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(80px); }
        }
        
        @keyframes cloud-drift-fast-reverse {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-80px); }
        }
        
        @keyframes cloud-float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(15px); }
          50% { transform: translateY(5px) translateX(30px); }
          75% { transform: translateY(-5px) translateX(15px); }
        }
        
        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 15s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 8s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 18s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 10s ease-in-out infinite; }
        .animate-cloud-drift-slow { animation: cloud-drift-slow 25s ease-in-out infinite; }
        .animate-cloud-drift-slow-reverse { animation: cloud-drift-slow-reverse 28s ease-in-out infinite; }
        .animate-cloud-drift-medium { animation: cloud-drift-medium 18s ease-in-out infinite; }
        .animate-cloud-drift-medium-reverse { animation: cloud-drift-medium-reverse 20s ease-in-out infinite; }
        .animate-cloud-drift-fast { animation: cloud-drift-fast 12s ease-in-out infinite; }
        .animate-cloud-drift-fast-reverse { animation: cloud-drift-fast-reverse 14s ease-in-out infinite; }
        .animate-cloud-float { animation: cloud-float 16s ease-in-out infinite; }
      `}</style>
      
      {/* --- Dynamic Animated Background --- */}
      <div className="absolute inset-0 z-0">
        {/* Animated floating orbs */}
        <AnimatedOrbs />
        
        {/* Static gradient base */}
        <div className="absolute top-[-10%] right-[-5%] w-[900px] h-[900px] bg-[#0A2DAA]/5 rounded-full blur-[120px]" />
        <div className="absolute top-[-5%] left-[-10%] w-[700px] h-[700px] bg-[#E4B400]/8 rounded-full blur-[100px]" />
        
        {/* Animated clouds at bottom */}
        <AnimatedClouds />
        
        {/* Bottom gradient overlay for smooth cloud blend */}
        <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-white via-white/90 to-transparent z-20 pointer-events-none" />
      </div>

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-10 min-h-screen flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* --- Left Content --- */}
        <div className="flex-1 max-w-lg lg:pr-8 text-center lg:text-left pt-6">
          <TrustBadges />
          
          <h1 className="text-4xl lg:text-6xl font-extrabold text-[#0A2DAA] tracking-tight leading-[1.1] mb-6">
            The Most Intelligent <br/> 
            <span className="text-slate-900">SchoolOS</span> for <br/>
            Modern Education
          </h1>
          
          <p className="text-slate-600 text-lg leading-relaxed max-w-md mx-auto lg:mx-0 mb-8 font-medium">
            AcadionAI automates admin work, boosts productivity, simplifies parent communication, and gives schools an intelligent assistant that works 24/7.
          </p>
        </div>

        {/* --- Center Phone --- */}
        <div className="flex-none relative w-full max-w-[320px] lg:max-w-[360px] flex justify-center order-first lg:order-none mt-4 lg:mt-0">
            {/* The gradient circle specifically backing the phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[90%] bg-gradient-to-b from-[#0A2DAA] to-blue-900 rounded-full blur-3xl opacity-20"></div>
            <PhoneMockup />
        </div>

        {/* --- Right Content (QR & Actions) --- */}
        <div className="flex-1 flex flex-col items-center lg:items-end gap-8">
          <div className="text-center lg:text-right">
             <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-6">
               Launch AcadionAI for <br/> Your School
             </h3>
             
             <div className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] shadow-xl border border-white inline-block">
                {/* Custom QR Code */}
                <div className="w-56 h-56 bg-slate-50 rounded-2xl relative overflow-hidden flex items-center justify-center border-4 border-white shadow-inner mx-auto lg:ml-auto">
                    {/* QR Pattern - Royal Blue & Gold - Deterministic pattern */}
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-1 p-3">
                         {[1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,0,1,1,0,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,1,0,0,1,0,1,0,1,1,1,0,1,1,0,1,0,0,1,1,0,1,1,0,1,0,1,1,0,1,0].map((filled, i) => (
                             <div key={i} className={`rounded-sm ${filled ? 'bg-[#0A2DAA]' : 'bg-transparent'} ${[5,18,27,42,55].includes(i) ? '!bg-[#E4B400]' : ''}`}></div>
                         ))}
                    </div>
                    {/* Inner QR Markers */}
                    <div className="absolute top-3 left-3 w-12 h-12 border-4 border-[#0A2DAA] rounded-xl bg-white/10 backdrop-blur-sm z-10"></div>
                    <div className="absolute top-3 right-3 w-12 h-12 border-4 border-[#0A2DAA] rounded-xl bg-white/10 backdrop-blur-sm z-10"></div>
                    <div className="absolute bottom-3 left-3 w-12 h-12 border-4 border-[#0A2DAA] rounded-xl bg-white/10 backdrop-blur-sm z-10"></div>
                    
                    {/* Center Icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md z-20">
                         <QrCode className="w-6 h-6 text-[#0A2DAA]" />
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-6 w-56 mx-auto lg:ml-auto">
                   <button className="w-full py-3 bg-[#0A2DAA] hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 active:scale-95 flex items-center justify-center gap-2">
                      View Demo <ArrowRight size={16}/>
                   </button>
                   <button className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 border border-[#E4B400] rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95">
                      Book Free Consultation
                   </button>
                </div>
             </div>
          </div>
        </div>

      </main>

      {/* Footer Branding */}
      <div className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-slate-200 flex items-center gap-2">
         <div className="w-2 h-2 rounded-full bg-[#0A2DAA]"></div>
         <span className="text-xs font-bold text-slate-700">AcadionAI</span>
      </div>

    </div>
  );
}