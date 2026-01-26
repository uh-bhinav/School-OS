'use client';

import React, { useState } from 'react';
import { Plus, CheckCircle2, ArrowRight, School, User, Building2 } from 'lucide-react';

interface GetInTouchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GetInTouchModal = ({ isOpen, onClose }: GetInTouchModalProps) => {
    const [formData, setFormData] = useState({
        schoolName: '',
        principalName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        studentCount: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const response = await fetch('/api/send-contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            const result = await response.json();
            
            if (result.success) {
                setIsSubmitted(true);
            } else {
                alert('Failed to send message. Please try again or email us directly at talktous@concierai.com');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to send message. Please try again or email us directly at talktous@concierai.com');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-white rounded-t-3xl border-b border-slate-100 px-8 py-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Get in Touch</h2>
                        <p className="text-sm text-slate-500 mt-1">Tell us about your school and we&apos;ll reach out</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        <Plus className="w-5 h-5 text-slate-600 rotate-45" />
                    </button>
                </div>

                {isSubmitted ? (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h3>
                        <p className="text-slate-600 mb-8">We&apos;ve received your details. Our team will contact you within 24 hours.</p>
                        <button 
                            onClick={onClose}
                            className="px-8 py-3 bg-[#0A2DAA] text-white font-bold rounded-full hover:bg-blue-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* School Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <School className="w-4 h-4 text-[#0A2DAA]" />
                                School Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">School Name *</label>
                                    <input 
                                        type="text" 
                                        name="schoolName"
                                        value={formData.schoolName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0A2DAA] focus:ring-2 focus:ring-[#0A2DAA]/20 outline-none transition-all text-slate-900"
                                        placeholder="e.g. Greenwood Public School"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Number of Students</label>
                                    <select 
                                        name="studentCount"
                                        value={formData.studentCount}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0A2DAA] focus:ring-2 focus:ring-[#0A2DAA]/20 outline-none transition-all bg-white text-slate-900"
                                    >
                                        <option value="">Select range</option>
                                        <option value="1-100">1 - 100</option>
                                        <option value="100-500">100 - 500</option>
                                        <option value="500-1000">500 - 1,000</option>
                                        <option value="1000-3000">1,000 - 3,000</option>
                                        <option value="3000+">3,000+</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Person */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <User className="w-4 h-4 text-[#0A2DAA]" />
                                Contact Person
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Principal / Contact Name *</label>
                                    <input 
                                        type="text" 
                                        name="principalName"
                                        value={formData.principalName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0A2DAA] focus:ring-2 focus:ring-[#0A2DAA]/20 outline-none transition-all text-slate-900"
                                        placeholder="e.g. Dr. Sharma"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0A2DAA] focus:ring-2 focus:ring-[#0A2DAA]/20 outline-none transition-all text-slate-900"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0A2DAA] focus:ring-2 focus:ring-[#0A2DAA]/20 outline-none transition-all text-slate-900"
                                    placeholder="principal@school.edu"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#0A2DAA]" />
                                School Address
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Full Address</label>
                                <input 
                                    type="text" 
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0A2DAA] focus:ring-2 focus:ring-[#0A2DAA]/20 outline-none transition-all text-slate-900"
                                    placeholder="Street address, landmark"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                                    <input 
                                        type="text" 
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0A2DAA] focus:ring-2 focus:ring-[#0A2DAA]/20 outline-none transition-all text-slate-900"
                                        placeholder="e.g. Bangalore"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                                    <input 
                                        type="text" 
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0A2DAA] focus:ring-2 focus:ring-[#0A2DAA]/20 outline-none transition-all text-slate-900"
                                        placeholder="e.g. Karnataka"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Additional Message (Optional)</label>
                            <textarea 
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0A2DAA] focus:ring-2 focus:ring-[#0A2DAA]/20 outline-none transition-all resize-none text-slate-900"
                                placeholder="Tell us more about your requirements..."
                            />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-[#0A2DAA] text-white font-bold rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Request
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <p className="text-xs text-center text-slate-500">
                            By submitting, you agree to our Privacy Policy. We&apos;ll never share your data.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};
