'use client';

import React, { useState } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal = ({ isOpen, onClose }: SupportModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        grievance: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Using Web3Forms API key from environment or hardcoded
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: '819ce2fb-c13f-4f6c-b3e8-9d859dd8d5e4',
                    subject: `Support Request: ${formData.subject}`,
                    from_name: formData.name,
                    email: formData.email,
                    message: formData.grievance,
                }),
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
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white rounded-t-3xl border-b border-slate-100 px-8 py-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Contact Support</h2>
                        <p className="text-sm text-slate-500 mt-1">Share your concern and we&apos;ll help you out</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        <Plus className="w-5 h-5 text-slate-600 rotate-45" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 py-6">
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                                    placeholder="Brief description of your issue"
                                />
                            </div>

                            {/* Grievance */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">
                                    Describe Your Issue *
                                </label>
                                <textarea
                                    name="grievance"
                                    value={formData.grievance}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-900"
                                    placeholder="Please provide details about your concern or issue..."
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-[#0A2DAA] text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    ) : (
                        // Success State
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Request Submitted!</h3>
                            <p className="text-slate-600 mb-8 max-w-md mx-auto">
                                Thank you for reaching out. Our support team will get back to you shortly at {formData.email}
                            </p>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
