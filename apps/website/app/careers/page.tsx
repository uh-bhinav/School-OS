'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Code, Server, Globe, Cloud, CheckCircle2, Briefcase, Download, FileText } from 'lucide-react';

interface JobCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  techStack: string[];
  goodToHave: string[];
  color: string;
}

const JobCard = ({ title, description, icon: Icon, techStack, goodToHave, color }: JobCardProps) => (
  <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-500 group">
    <div className="flex items-start gap-4 mb-6">
      <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center text-white flex-shrink-0`}>
        <Icon size={28} />
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold text-slate-700 mb-3">Tech Stack:</p>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-bold text-slate-700 mb-3">Good to Have:</p>
        <ul className="space-y-2">
          {goodToHave.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 size={16} className="text-[#0A2DAA] mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <Link href={`/careers/apply?role=${encodeURIComponent(title)}`} className="mt-6 block">
      <button className="w-full px-6 py-3 bg-[#0A2DAA] rounded-xl font-semibold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 group-hover:gap-3">
        <span className="text-white">Apply Now</span> <ArrowRight size={18} className="text-white" />
      </button>
    </Link>
  </div>
);

export default function CareersPage() {
  const jobs: JobCardProps[] = [
    {
      title: 'Flutter Developer Intern (Mobile Apps)',
      description: 'Build Teacher App and Parent App workflows. You\'ll work on attendance, marks, timetable views, fees, communication, and offline-first flows with background sync.',
      icon: Code,
      color: 'bg-purple-600',
      techStack: ['Flutter', 'Dart', 'REST APIs', 'Firebase/Supabase Auth', 'State Management (Riverpod/Bloc)'],
      goodToHave: [
        'Experience with offline sync',
        'Attention to UX for non-tech users',
        'Performance optimization for low-end devices'
      ]
    },
    {
      title: 'Backend Developer Intern (Python/FastAPI)',
      description: 'Work on the Core ERP & Intelligence Engine — school ERP core (academics, attendance, fees), multi-tenant data models, reporting & analytics pipelines, and secure role-based access systems.',
      icon: Server,
      color: 'bg-emerald-600',
      techStack: ['Python', 'FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Redis'],
      goodToHave: [
        'API design sense',
        'Data modeling experience',
        'Understanding of async systems'
      ]
    },
    {
      title: 'Web Developer Intern (Admin Dashboard)',
      description: 'Build principal & management dashboards with reports, charts, audit views, and real-time system status & alerts.',
      icon: Globe,
      color: 'bg-blue-600',
      techStack: ['React', 'Next.js', 'Tailwind', 'Charts (Recharts/Chart.js)'],
      goodToHave: [
        'Familiarity with React Query',
        'Server Components experience',
        'Understanding of UX patterns'
      ]
    },
    {
      title: 'Cloud & DevOps Intern',
      description: 'Handle production deployments, monitoring & uptime, CI/CD pipelines, and cost-optimized infrastructure to scale AcadionAI.',
      icon: Cloud,
      color: 'bg-orange-600',
      techStack: ['Docker', 'Linux', 'Nginx', 'AWS/GCP', 'CI/CD'],
      goodToHave: [
        'Kubernetes experience',
        'Load balancing knowledge',
        'Logging and automation scripts'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative px-6 py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px]"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#0A2DAA] rounded-full mb-6 font-semibold text-sm">
            <Briefcase size={16} />
            Join Our Team
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
            Build the Future of <span className="text-[#0A2DAA]">School Operations</span>
          </h1>
          
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
            We're looking for talented interns to help us revolutionize how schools operate with AI-powered automation and intelligent workflows.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/brochure.pdf" 
              download
              className="px-8 py-4 bg-[#0A2DAA] text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download Brochure
            </a>
            <a 
              href="/feature_list.pdf" 
              download
              className="px-8 py-4 bg-white text-[#0A2DAA] border-2 border-[#0A2DAA] rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              Download Feature List
            </a>
          </div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Why Join AcadionAI?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Real Impact',
                description: 'Build products used by thousands of teachers, students, and parents every day',
                icon: '🚀'
              },
              {
                title: 'Learn & Grow',
                description: 'Work with cutting-edge tech: AI, real-time systems, and modern web/mobile stacks',
                icon: '📚'
              },
              {
                title: 'Mentorship',
                description: 'Get guidance from experienced engineers who care about your growth',
                icon: '🎯'
              }
            ].map((benefit, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Open Positions</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We're actively looking for talented interns across multiple roles. Pick the one that excites you most!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {jobs.map((job, i) => (
              <JobCard key={i} {...job} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-[#0A2DAA] to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Don't See Your Role?</h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            We're always looking for exceptional talent. Send us your resume and tell us what you're passionate about building.
          </p>
          <Link href="/careers/apply">
            <button className="px-8 py-4 bg-white text-[#0A2DAA] rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2 mx-auto">
              Send General Application <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
