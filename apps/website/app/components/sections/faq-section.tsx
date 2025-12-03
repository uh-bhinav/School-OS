'use client';

import React from 'react';
import { FAQItem } from '../ui/faq-item';

export const FAQSection = () => {
    const faqs = [
        {
            q: "How long does AcadionAI take to set up in a school?",
            a: "Most schools are fully onboarded in 3–7 days. Basic modules like attendance, messaging, and AI assistance work on day one, while deeper integrations (ERP, payment gateway, timetable imports) follow right after."
        },
        {
            q: "Is the data of students and parents secure?",
            a: "Absolutely. All data is encrypted, each school gets its own isolated environment, and sensitive information is protected using industry-standard security practices. Only authorized staff can access school data."
        },
        {
            q: "Does AcadionAI replace teachers or staff?",
            a: "No. AcadionAI supports teachers and staff by automating repetitive work — attendance, schedules, reminders, reports — so they can focus more on teaching and student engagement."
        },
        {
            q: "What if the AI makes a mistake or is unsure?",
            a: "AcadionAI is built with human-in-the-loop supervision. If the AI is uncertain, it flags the task for review instead of executing it. Staff always stay in control of approvals and sensitive decisions."
        },
        {
            q: "What does the pricing include?",
            a: "Pricing includes AI assistance, automation tools, parent communication, teacher workflows, analytics, and ongoing support. Schools can choose between a monthly subscription or annual plan with discounted rates."
        }
    ];

    return (
        <section className="relative py-32 bg-white flex flex-col md:flex-row max-w-7xl mx-auto px-6 gap-16">
            {/* Left Content */}
            <div className="md:w-1/3">
                <div className="sticky top-32">
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-[#0A2DAA] rounded-full mb-6"></div>
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                        Answers to Your <br/>
                        <span className="text-[#0A2DAA]">Top Questions</span>
                    </h2>
                    <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                        From setup steps to feature details, our FAQs cover everything you need to know about transforming your school with AI.
                    </p>
                    <button className="px-6 py-3 bg-slate-50 text-[#0A2DAA] font-bold rounded-xl border border-slate-200 hover:bg-blue-50 transition-colors">
                        Contact Support
                    </button>
                </div>
            </div>

            {/* Right Accordion */}
            <div className="md:w-2/3 flex flex-col gap-4">
                {faqs.map((item, i) => (
                    <FAQItem key={i} question={item.q} answer={item.a} />
                ))}
            </div>
        </section>
    );
};
