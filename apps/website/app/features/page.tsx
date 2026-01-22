'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, CreditCard, Users, GraduationCap, FileText, MessageSquare, DollarSign, ShoppingCart, Image, Trophy, Shield, BarChart, Clock, BookOpen, CheckCircle2, Cpu, Zap, AlertTriangle } from 'lucide-react';

interface FeatureModuleProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  features: string[];
}

const FeatureModule = ({ title, description, icon: Icon, color, features }: FeatureModuleProps) => (
  <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 transition-shadow duration-300 lg:hover:shadow-2xl">
    <div className="flex items-start gap-4 mb-6">
      <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center text-white flex-shrink-0`}>
        <Icon size={28} />
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>

    <div className="space-y-2">
      {features.map((feature, i) => (
        <div key={i} className="flex items-start gap-3">
          <CheckCircle2 size={18} className="text-[#0A2DAA] mt-0.5 flex-shrink-0" />
          <span className="text-sm text-slate-700">{feature}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function FeaturesPage() {
  const modules: FeatureModuleProps[] = [
    {
      title: 'Academic Management',
      description: 'Complete academic year lifecycle and class organization',
      icon: GraduationCap,
      color: 'bg-blue-600',
      features: [
        'Academic year creation with start/end dates and transitions',
        'Multi-year support for historical data tracking',
        'Class creation with grade levels, sections, and teacher assignments',
        'Subject management with streams, specializations, and curriculum tracking',
        'Bulk student promotion between grades and academic years',
        'Advanced search by grade, section, teacher, or year'
      ]
    },
    {
      title: 'AI Timetable Generation ⭐',
      description: 'Automated intelligent scheduling with constraint satisfaction',
      icon: Calendar,
      color: 'bg-purple-600',
      features: [
        'Automated timetable generation resolving teacher load & subject clashes',
        'Optimizes for school-wide efficiency with core subjects in morning',
        'Instant updates for teacher absences and substitutions',
        'Consecutive period scheduling for lab subjects',
        'Enforces daily/weekly teaching hour caps per teacher',
        'Dry run mode to preview before committing to database',
        'Quality scoring (0-100) to validate timetable optimization',
        'Manual swap with conflict detection after generation'
      ]
    },
    {
      title: 'Student Information System',
      description: 'Comprehensive student lifecycle management',
      icon: Users,
      color: 'bg-emerald-600',
      features: [
        'Student registration with personal and academic details',
        'Class enrollment with roll numbers and proctor assignments',
        'Parent/guardian linking with relationship verification',
        'Multi-guardian support with authorization controls',
        'Academic summary view with attendance and performance',
        'Bulk promotion and transfer management',
        'Soft delete for historical record preservation'
      ]
    },
    {
      title: 'Teacher Management',
      description: 'Teacher profiles, assignments, and workload tracking',
      icon: Users,
      color: 'bg-cyan-600',
      features: [
        'Comprehensive profiles with qualifications and experience',
        'Subject specialization and expertise tracking',
        'Class teacher and proctor assignments',
        'Weekly timetable view and workload monitoring',
        'Employment details and qualification tracking',
        'Historical data preservation with soft delete'
      ]
    },
    {
      title: 'Attendance Tracking',
      description: 'Comprehensive attendance management and reporting',
      icon: Clock,
      color: 'bg-orange-600',
      features: [
        'Daily attendance marking (present, absent, late, leave)',
        'Period-level tracking for each class session',
        'Bulk entry for entire class in single transaction',
        'Date range reports and percentage calculation',
        'Weekly summaries with pre-calculated statistics',
        'Truancy detection and trend analysis',
        'Late arrivals vs. absent distinction'
      ]
    },
    {
      title: 'Assessment & Grading',
      description: 'Complete examination and marks management',
      icon: FileText,
      color: 'bg-pink-600',
      features: [
        'Exam scheduling with types (mid-term, final, quiz, unit test)',
        'Mark entry with max marks tracking and bulk operations',
        'Subject-wise and exam-wise performance reports',
        'Automatic percentage and grade computation',
        'Consolidated report cards combining all exams',
        'Historical mark tracking per student',
        'PDF generation for report cards and transcripts'
      ]
    },
    {
      title: 'Smart Fee Management ⭐',
      description: 'Automated fee collection and reconciliation',
      icon: CreditCard,
      color: 'bg-green-600',
      features: [
        'Fee structure templates with customizable components',
        'Individual student fee overrides and scholarships',
        'Discount management (sibling, early payment, merit)',
        'Automated invoice generation with itemized billing',
        'Due date tracking and late fee calculation',
        'Razorpay payment integration with webhook support',
        'Auto-reconciliation and payment allocation',
        'Refund processing with partial refund support',
        'Payment history and audit trail'
      ]
    },
    {
      title: 'Payment Processing ⭐',
      description: 'Secure Razorpay integration with advanced features',
      icon: DollarSign,
      color: 'bg-indigo-600',
      features: [
        'Multiple payment methods (UPI, Card, Net Banking, Wallet)',
        'Signature verification for cryptographic security',
        'Real-time webhook processing with idempotency',
        'Payment allocation across invoice line items',
        'Partial payment and installment support',
        'Authorization handling (Authorize → Capture flow)',
        'Automated reconciliation with race condition prevention',
        'Payment analytics and health monitoring',
        'School-specific Razorpay credentials'
      ]
    },
    {
      title: 'Communication System',
      description: 'Multi-channel communication platform',
      icon: MessageSquare,
      color: 'bg-violet-600',
      features: [
        'Multi-channel announcements (web, mobile, email)',
        'Targeted broadcasting by grade, class, or student',
        'Priority levels (urgent, important, normal)',
        'Scheduled announcements and expiry dates',
        'Read tracking for monitoring engagement',
        'One-on-one and group conversations',
        'Message threading and read receipts',
        'Role-based access for all user types'
      ]
    },
    {
      title: 'E-Commerce Platform ⭐',
      description: 'Complete school store with inventory management',
      icon: ShoppingCart,
      color: 'bg-teal-600',
      features: [
        'Product catalog with categories and variants',
        'Real-time stock tracking with reorder alerts',
        'SKU management and manufacturer info',
        'Product packages/bundles with discounts',
        'Persistent shopping cart per user',
        'Stock validation and race condition prevention',
        'Order management with status workflow',
        'Atomic checkout with pessimistic locking',
        'Order tracking and delivery status',
        'Inventory adjustments with audit trail'
      ]
    },
    {
      title: 'Media & Albums',
      description: 'Organize and share photos and videos',
      icon: Image,
      color: 'bg-rose-600',
      features: [
        'Album creation with access control',
        'Target audience specification (public, grade, class, individual)',
        'Secure cloud storage with Supabase integration',
        'Signed URLs for temporary file access',
        'File upload with metadata tracking',
        'Storage buckets for profiles, events, products',
        'Authorization checks before serving files'
      ]
    },
    {
      title: 'Clubs & Activities',
      description: 'Manage extracurricular clubs and events',
      icon: Users,
      color: 'bg-amber-600',
      features: [
        'Club creation with capacity management',
        'Membership tracking (active, pending, inactive)',
        'Teacher sponsorship assignments',
        'Activity planning with date, time, venue',
        'Attendance tracking for club events',
        'Contribution scoring for members',
        'Leadership role assignments',
        'Approval workflow for membership requests'
      ]
    },
    {
      title: 'Achievement & Gamification ⭐',
      description: 'Point-based system to boost engagement',
      icon: Trophy,
      color: 'bg-yellow-600',
      features: [
        'Achievement point rules by category',
        'Categories: Academic, Sports, Cultural, Leadership, Service',
        'Automatic point assignment based on rules',
        'Verification workflow for achievements',
        'School-wide, class-wide, and club leaderboards',
        'Multi-metric combining exam marks and achievements',
        'Achievement history per student',
        'Club ranking by total member contributions'
      ]
    },
    {
      title: 'AI Agents & Automation ⭐',
      description: 'Intelligent automation across all workflows',
      icon: Cpu,
      color: 'bg-fuchsia-600',
      features: [
        'Auto-sends reminders, alerts, and follow-ups',
        'Flags risks before they become problems',
        'Works across academics, HR, fees, and communication',
        'Handles repetitive admin tasks automatically',
        'Tracks pending work and nudges staff proactively',
        'Runs 24/7 without supervision',
        'Predicts at-risk students before performance drops',
        'Detects unusual patterns using AI'
      ]
    },
    {
      title: 'Reports & Analytics',
      description: 'Comprehensive insights and automated alerts',
      icon: BarChart,
      color: 'bg-blue-700',
      features: [
        'Real-time dashboards for academics, fees, attendance',
        'AI-powered predictions and actionable insights',
        'Instant risk detection for attendance and academics',
        'Auto-generated daily, weekly, monthly reports',
        'Alerts sent automatically to staff and parents',
        'Customizable widgets by administrator role',
        'Visual analytics with trend spotting',
        'Critical issue flagging for principal attention'
      ]
    },
    {
      title: 'Security & Compliance',
      description: 'Enterprise-grade security and audit trails',
      icon: Shield,
      color: 'bg-slate-700',
      features: [
        'Complete audit logging (CREATE, UPDATE, DELETE, LOGIN)',
        'User tracking with IP address logging',
        'Data snapshots for before/after states',
        'Multi-tenant architecture with data isolation',
        'Row-level security (RLS) with Supabase',
        'API key encryption for sensitive credentials',
        'Webhook signature verification',
        'Role-based access control (RBAC)',
        'Input validation with Pydantic schemas',
        'Rate limiting and CORS protection'
      ]
    }
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 z-50 lg:bg-white/95 lg:backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#0A2DAA] transition-colors mb-4">
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Home</span>
          </Link>
          
          <div className="mt-4">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3">
              Complete Feature List
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl">
              Comprehensive school management platform with 15+ modules, 40+ services, and AI-powered automation across academics, administration, and financial operations.
            </p>
          </div>
        </div>
      </div>

      {/* Key Highlights */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Zap, label: 'Multi-Tenant Architecture', description: 'Secure data isolation for multiple schools' },
            { icon: Shield, label: 'Role-Based Access', description: 'Granular permissions for all user roles' },
            { icon: Cpu, label: 'AI-Powered Features', description: 'Automated timetables and intelligent workflows' },
            { icon: AlertTriangle, label: 'Real-Time Operations', description: 'Async architecture for high performance' }
          ].map((highlight, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
              <highlight.icon className="w-10 h-10 text-[#0A2DAA] mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">{highlight.label}</h3>
              <p className="text-sm text-slate-600">{highlight.description}</p>
            </div>
          ))}
        </div>

        {/* Feature Modules Grid */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-slate-900">All Modules & Features</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {modules.map((module, i) => (
              <FeatureModule key={i} {...module} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-slate-100">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Ready to Transform Your School?</h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Experience the power of AI-driven school management. Join hundreds of schools already using AcadionAI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <button className="px-8 py-4 bg-[#0A2DAA] text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all">
                Get In Touch
              </button>
            </Link>
            <Link href="/careers">
              <button className="px-8 py-4 bg-white text-[#0A2DAA] border-2 border-[#0A2DAA] rounded-xl font-bold hover:bg-blue-50 transition-all">
                Join Our Team
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
