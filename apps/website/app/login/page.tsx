'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Store login state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', formData.email);
    
    console.log(isSignUp ? 'Sign Up' : 'Login', formData);
    
    // Redirect to home page after successful login/signup
    window.location.href = '/';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <img src="/logo.svg" alt="AcadionAI" className="h-12 w-auto" />
            <span className="text-3xl font-bold text-[#0A2DAA] tracking-tight">AcadionAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-6">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-slate-600 mt-2">
            {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all text-slate-900"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all text-slate-900"
                placeholder="Enter your password"
              />
            </div>

            {/* Confirm Password (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all text-slate-900"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-[#0A2DAA] text-white rounded-xl font-semibold hover:bg-blue-800 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Toggle between Login/Sign Up */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#0A2DAA] font-semibold hover:underline"
            >
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-slate-600 hover:text-[#0A2DAA] font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
