'use client';

import React, { useState, Suspense } from 'react';
import { ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function ApplyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get('role');
  
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    location: '',
    
    // Status
    currentStatus: 'student', // student or working
    
    // Student Fields
    collegeName: '',
    degree: '',
    branch: '',
    yearOfStudy: '',
    cgpa: '',
    expectedGraduation: '',
    
    // Working Professional Fields
    currentCompany: '',
    currentRole: '',
    experience: '',
    noticePeriod: '',
    
    // Common Fields
    role: roleFromUrl || '',
    portfolio: '',
    github: '',
    linkedin: '',
    resume: null as File | null,
    coverLetter: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare form data (note: resume file will be sent as file name only)
      const applicationData = {
        ...formData,
        resume: formData.resume ? { name: formData.resume.name, size: formData.resume.size } : null
      };
      
      const response = await fetch('/api/send-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmitted(true);
      } else {
        alert('Failed to submit application. Please try again or email us directly at talktous@concierai.com');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again or email us directly at talktous@concierai.com');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Submitted!</h2>
          <p className="text-slate-600 mb-8">
            Thank you for applying to AcadionAI. We've received your application and will review it shortly. 
            You'll hear back from us within 5-7 business days.
          </p>
          <button
            onClick={() => router.push('/careers')}
            className="px-6 py-3 bg-[#0A2DAA] text-white rounded-xl font-semibold hover:bg-blue-800 transition-all"
          >
            Back to Careers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-[#0A2DAA] mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Careers
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            {roleFromUrl || 'Apply to AcadionAI'}
          </h1>
          <p className="text-slate-600 mb-8">
            Fill out the form below and we'll get back to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all text-slate-900"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all text-slate-900"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all text-slate-900"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all text-slate-900"
                    placeholder="Mumbai, India"
                  />
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Current Status</h3>
              <div className="flex gap-4 mb-6">
                <label className="flex-1">
                  <input
                    type="radio"
                    name="currentStatus"
                    value="student"
                    checked={formData.currentStatus === 'student'}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="px-6 py-4 border-2 border-slate-200 rounded-xl cursor-pointer transition-all peer-checked:border-[#0A2DAA] peer-checked:bg-blue-50 text-center font-semibold">
                    Student
                  </div>
                </label>
                <label className="flex-1">
                  <input
                    type="radio"
                    name="currentStatus"
                    value="working"
                    checked={formData.currentStatus === 'working'}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="px-6 py-4 border-2 border-slate-200 rounded-xl cursor-pointer transition-all peer-checked:border-[#0A2DAA] peer-checked:bg-blue-50 text-center font-semibold">
                    Working Professional
                  </div>
                </label>
              </div>

              {/* Student Fields */}
              {formData.currentStatus === 'student' && (
                <div className="grid md:grid-cols-2 gap-4 p-6 bg-blue-50 rounded-xl">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      College/University Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="collegeName"
                      required={formData.currentStatus === 'student'}
                      value={formData.collegeName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all bg-white text-slate-900"
                      placeholder="IIT Bombay"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Degree <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="degree"
                      required={formData.currentStatus === 'student'}
                      value={formData.degree}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all bg-white text-slate-900"
                    >
                      <option value="">Select Degree</option>
                      <option value="B.Tech">B.Tech</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="BCA">BCA</option>
                      <option value="MCA">MCA</option>
                      <option value="B.Sc">B.Sc</option>
                      <option value="M.Sc">M.Sc</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Branch/Specialization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="branch"
                      required={formData.currentStatus === 'student'}
                      value={formData.branch}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all bg-white text-slate-900"
                      placeholder="Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Year of Study <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="yearOfStudy"
                      required={formData.currentStatus === 'student'}
                      value={formData.yearOfStudy}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all bg-white text-slate-900"
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Final Year">Final Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      CGPA/Percentage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cgpa"
                      required={formData.currentStatus === 'student'}
                      value={formData.cgpa}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all bg-white text-slate-900"
                      placeholder="8.5 / 85%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Expected Graduation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="month"
                      name="expectedGraduation"
                      required={formData.currentStatus === 'student'}
                      value={formData.expectedGraduation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all bg-white text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Working Professional Fields */}
              {formData.currentStatus === 'working' && (
                <div className="grid md:grid-cols-2 gap-4 p-6 bg-green-50 rounded-xl">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Current Company <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="currentCompany"
                      required={formData.currentStatus === 'working'}
                      value={formData.currentCompany}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all bg-white text-slate-900"
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Current Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="currentRole"
                      required={formData.currentStatus === 'working'}
                      value={formData.currentRole}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all bg-white text-slate-900"
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Total Experience <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="experience"
                      required={formData.currentStatus === 'working'}
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all bg-white text-slate-900"
                    >
                      <option value="">Select Experience</option>
                      <option value="0-1 years">0-1 years</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="2-3 years">2-3 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5+ years">5+ years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Notice Period <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="noticePeriod"
                      required={formData.currentStatus === 'working'}
                      value={formData.noticePeriod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all bg-white text-slate-900"
                    >
                      <option value="">Select Period</option>
                      <option value="Immediate">Immediate</option>
                      <option value="15 days">15 days</option>
                      <option value="1 month">1 month</option>
                      <option value="2 months">2 months</option>
                      <option value="3 months">3 months</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Role Selection (for general application) */}
            {!roleFromUrl && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Which role are you applying for? <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all text-slate-900"
                >
                  <option value="">Select a role</option>
                  <option value="Flutter Developer Intern (Mobile Apps)">Flutter Developer Intern (Mobile Apps)</option>
                  <option value="Backend Developer Intern (Python/FastAPI)">Backend Developer Intern (Python/FastAPI)</option>
                  <option value="Web Developer Intern (Admin Dashboard)">Web Developer Intern (Admin Dashboard)</option>
                  <option value="Cloud & DevOps Intern">Cloud & DevOps Intern</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {/* Links & Portfolio */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Links & Portfolio</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all text-slate-900"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all text-slate-900"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Portfolio / Personal Website
                  </label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all text-slate-900"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Resume <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="resume"
                  required
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="flex items-center justify-center gap-3 w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#0A2DAA] hover:bg-blue-50 transition-all"
                >
                  <Upload size={24} className="text-slate-400" />
                  <div className="text-center">
                    {formData.resume ? (
                      <p className="text-sm font-semibold text-slate-700">{formData.resume.name}</p>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-slate-700">Upload your resume</p>
                        <p className="text-xs text-slate-500">PDF, DOC, or DOCX (Max 5MB)</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Cover Letter / Why do you want to join AcadionAI?
              </label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0A2DAA] focus:border-transparent outline-none transition-all resize-none text-slate-900"
                placeholder="Tell us why you're excited about this role and what makes you a great fit..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-4 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-4 bg-[#0A2DAA] text-white rounded-xl font-semibold hover:bg-blue-800 transition-all shadow-lg"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <ApplyPageContent />
    </Suspense>
  );
}
