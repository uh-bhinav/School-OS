'use client';

import React, { useState } from 'react';
import { PricingCard } from '../ui/pricing-card';

export const PricingSection = () => {
    const [pricingMode, setPricingMode] = useState<'annual' | 'implementation'>('annual');

    return (
        <section id="pricing" className="relative py-32 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                        Innovative Pricing for <br/>
                        <span className="text-[#0A2DAA]">Modern Needs</span>
                    </h2>
                    <p className="text-lg text-slate-600 mb-8">
                        Flexible plans designed to scale with your institution. No hidden costs.
                    </p>
                    
                    {/* Toggle */}
                    <div className="inline-flex bg-white p-1.5 rounded-full border border-slate-200 shadow-sm relative">
                        <div className={`absolute top-1.5 bottom-1.5 w-[140px] bg-[#0A2DAA] rounded-full transition-all duration-300 ${pricingMode === 'annual' ? 'left-1.5' : 'left-[145px]'}`}></div>
                        <button 
                            onClick={() => setPricingMode('annual')}
                            className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold w-[140px] transition-colors ${pricingMode === 'annual' ? 'text-white' : 'text-slate-600'}`}
                        >
                            Per Student
                        </button>
                        <button 
                            onClick={() => setPricingMode('implementation')}
                            className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold w-[160px] transition-colors ${pricingMode === 'implementation' ? 'text-white' : 'text-slate-600'}`}
                        >
                            Implementation
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-center">
                    <PricingCard 
                        title="Core" 
                        tag="Essential"
                        desc="Vital functions for schools starting their digital journey."
                        price="149"
                        implementation="15,000"
                        pricingMode={pricingMode}
                        features={[
                            "Academics & Finance Module",
                            "Communication & Admissions",
                            "Parent & Teacher Mobile Apps",
                            "AI Timetable Generator",
                            "Transport & Library Mgmt"
                        ]}
                    />
                    <PricingCard 
                        title="Standard" 
                        tag="Recommended"
                        desc="For schools seeking to streamline operations and inventory."
                        price="229"
                        implementation="20,000"
                        pricingMode={pricingMode}
                        isPopular={true}
                        features={[
                            "All Core features included",
                            "Central Budget & Monitoring",
                            "Inventory & School Store",
                            "Objective Exams Module",
                            "Basic AI Agent Support"
                        ]}
                    />
                    <PricingCard 
                        title="Advanced" 
                        tag="Expert"
                        desc="Full automation and AI power for modern institutions."
                        price="299"
                        implementation="25,000"
                        pricingMode={pricingMode}
                        features={[
                            "All Standard features included",
                            "Event Management System",
                            "AI-Driven Automation",
                            "Advanced HR Payroll",
                            "Priority Support & Training"
                        ]}
                    />
                </div>
            </div>
        </section>
    );
};
