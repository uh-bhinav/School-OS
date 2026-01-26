'use client';

import React, { useState } from 'react';
import { FAQItem } from '../ui/faq-item';
import { SupportModal } from '../modals/support-modal';

export const FAQSection = () => {
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

    // --- FAQs ---
const faqs = [
{
    q: "How long does it take to set up AcadionAI for our school?",
    a: "AcadionAI typically takes 45–60 days to be fully set up and stabilized. This allows proper data migration, rule configuration, workflow testing, and user training — without rushing or risking errors. During this period, your school continues operating normally."
},
{
    q: "What will my staff need to do during setup?",
    a: "Almost nothing beyond sharing data and clarifying policies. Your staff does not need to enter data manually, learn the system immediately, or attend long training sessions. Once data is shared, our team handles setup, validation, configuration, and testing."
},
{
    q: "Will this disrupt daily school operations?",
    a: "No. Setup happens quietly in the background while your existing processes continue as usual. There is no downtime, no forced switch, and no pressure on teachers or administrators during onboarding."
},
{
    q: "Can we run AcadionAI alongside our current system initially?",
    a: "Yes, you can. However, most schools don’t feel the need to because AcadionAI is designed to act as a single source of truth — removing duplicate data entry, confusion, and follow-ups across multiple systems."
},
{
    q: "What if our data is messy, incomplete, or partly manual?",
    a: "That’s very common — and not a problem. Our onboarding team cleans and structures your data, fills gaps with your inputs, and validates accuracy before go-live. You are not expected to prepare perfect data beforehand."
},
{
    q: "How quickly will my staff learn to use the system?",
    a: "Most staff members are comfortable within 15–30 minutes. AcadionAI is built for non-technical users with a clean interface and guided workflows. Training is short, practical, and role-based."
},
{
    q: "Will this increase teachers’ workload?",
    a: "No — it reduces it. AcadionAI removes repetitive tasks like manual attendance follow-ups, fee reminders, and report compilation, allowing teachers to focus on teaching instead of administration."
},
{
    q: "Does AcadionAI take decisions on its own?",
    a: "No. AcadionAI never takes final decisions independently. It highlights patterns, risks, and suggestions, but all critical actions require human approval. You always remain in control."
},
{
    q: "Can we review or approve actions before anything is sent to parents?",
    a: "Yes. Built-in approval workflows exist for notices, fee-related communication, reports, and broadcast messages. Nothing sensitive goes out without review."
},
{
    q: "Can I manually override or correct anything?",
    a: "Yes — at any time. Administrators can edit entries, override AI suggestions, correct mistakes, and reverse actions when required. AcadionAI supports human judgment — it doesn’t block it."
},
{
    q: "Is our school’s data safe with AcadionAI?",
    a: "Yes. Your data belongs only to your school and is stored in secure, isolated systems. It is never shared, sold, reused, or used to train public AI models. Access is limited strictly to authorized users."
},
{
    q: "Who can see what inside the system?",
    a: "Access is strictly role-based. Principals, admins, teachers, and staff only see what they are permitted to see. All actions are logged for transparency and accountability."
},
{
    q: "What happens if something goes wrong or data looks incorrect?",
    a: "You are never locked in. Data can be reviewed, corrected, and revalidated at any time. Activity logs and approvals ensure mistakes don’t silently affect reports or finances."
},
{
    q: "Is the system reliable during exams or fee deadlines?",
    a: "Yes. AcadionAI is engineered to handle high-usage periods like exam results, fee due dates, and parent communication peaks, while maintaining performance and stability."
},
{
    q: "In simple terms — what changes after adopting AcadionAI?",
    a: "You stop relying on follow-ups, phone calls, and assumptions, and start running the school with clear visibility, structured workflows, and confident control."
}
];



    // --- GROUP FAQS INTO SETS OF 5 ---
    const chunkSize = 5;
    const faqPages = [];
    for (let i = 0; i < faqs.length; i += chunkSize) {
        faqPages.push(faqs.slice(i, i + chunkSize));
    }

    return (
        <>
        <section className="relative py-32 bg-white flex flex-col md:flex-row max-w-7xl mx-auto px-6 gap-16">

            {/* LEFT CONTENT */}
            <div className="md:w-1/3">
                <div className="sticky top-32">
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-[#0A2DAA] rounded-full mb-6"></div>
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                        Answers to Your <br />
                        <span className="text-[#0A2DAA]">Top Questions</span>
                    </h2>
                    <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                        Everything you need to know about adopting AcadionAI — setup, security, integrations, AI capabilities, and more.
                    </p>
                    <button 
                        onClick={() => setIsSupportModalOpen(true)}
                        className="px-6 py-3 bg-slate-50 text-[#0A2DAA] font-bold rounded-xl border border-slate-200 hover:bg-blue-50 transition-colors"
                    >
                        Contact Support
                    </button>
                </div>
            </div>

            {/* RIGHT SIDE — HORIZONTAL PAGINATION, 5 PER PAGE */}
<div className="md:w-2/3 overflow-x-auto no-scrollbar snap-x snap-mandatory flex">

    {faqPages.map((group, pageIndex) => (
        <div 
            key={pageIndex}
            className="snap-center shrink-0 w-full pr-6"
        >
            <div className="flex flex-col gap-4">
                {group.map((item, i) => (
                    <FAQItem key={i} question={item.q} answer={item.a} />
                ))}
            </div>
        </div>
    ))}

</div>


        </section>
        
        <SupportModal 
            isOpen={isSupportModalOpen} 
            onClose={() => setIsSupportModalOpen(false)} 
        />
    </>
    );
};
