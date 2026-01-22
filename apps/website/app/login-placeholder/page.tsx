'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LoginPlaceholder() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="text-center mb-8">
            <img src="/logo.svg" alt="AcadionAI" className="h-16 w-auto mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Login Page</h1>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Email</label>
              <input 
                type="email" 
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Password</label>
              <input 
                type="password" 
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <button className="w-full py-3 bg-[#0A2DAA] text-white rounded-lg font-semibold hover:bg-blue-800 transition-all shadow-lg">
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
