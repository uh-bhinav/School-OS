'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface PricingCardProps {
  title: string;
  tag?: string;
  desc: string;
  features: string[];
  price: string;
  implementation: string;
  isPopular?: boolean;
  pricingMode: 'annual' | 'implementation';
}

export const PricingCard = ({ title, tag, desc, features, price, implementation, isPopular, pricingMode }: PricingCardProps) => (
    <div className={`p-8 rounded-[2rem] border-2 transition-all duration-300 relative flex flex-col h-full hover:-translate-y-2 hover:shadow-2xl
        ${isPopular ? 'bg-white border-[#0A2DAA] shadow-xl z-10 scale-105' : 'bg-white border-transparent shadow-lg'}
    `}>
        {isPopular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0A2DAA] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                Most Popular
            </div>
        )}
        
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
                {tag && <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase">{tag}</span>}
            </div>
            <p className="text-sm text-slate-500 leading-relaxed min-h-[40px]">{desc}</p>
        </div>

        <div className="flex-1">
            <ul className="space-y-4 mb-8">
                {features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={12} className="text-[#0A2DAA]" />
                        </div>
                        {feat}
                    </li>
                ))}
            </ul>
        </div>

        <div className="pt-6 border-t border-slate-100">
            {pricingMode === 'annual' ? (
                <div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-slate-900">₹{price}</span>
                        <span className="text-sm text-slate-500 font-medium">/student/year</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">+ 18% GST applicable</p>
                </div>
            ) : (
                <div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-slate-900">₹{implementation}</span>
                    </div>
                    <span className="text-sm text-slate-500 font-medium">One-time Implementation (Per Branch)</span>
                    <p className="text-[10px] text-slate-400 mt-1">+ 18% GST applicable</p>
                </div>
            )}
            
            <button className={`w-full mt-6 py-3 rounded-xl font-bold transition-all text-sm
                ${isPopular 
                    ? 'bg-[#0A2DAA] text-white hover:bg-blue-800 shadow-lg shadow-blue-900/20' 
                    : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'
                }
            `}>
                Get Started
            </button>
        </div>
    </div>
);
