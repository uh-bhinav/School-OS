import { useState } from 'react';
import { X, User, Phone, GraduationCap, TrendingUp, CheckCircle } from 'lucide-react';
import { useCreateLead } from '../../services/admissionsPipeline.hooks';
import type { AdmissionLead } from '../../types/admissions.types';
import { toast } from 'sonner';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadCaptureModal({ isOpen, onClose }: LeadCaptureModalProps) {
  const [formData, setFormData] = useState({
    student_name: '',
    parent_name: '',
    contact: '',
    email: '',
    grade_applying: '',
    source: 'walk_in' as AdmissionLead['source'],
    score: 'warm' as AdmissionLead['score'],
    notes: '',
  });

  const [step, setStep] = useState(1);
  const createLeadMutation = useCreateLead();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLeadMutation.mutateAsync(formData);
      toast.success('Lead captured successfully!');
      setStep(3);
      setTimeout(() => {
        onClose();
        setStep(1);
        setFormData({
          student_name: '',
          parent_name: '',
          contact: '',
          email: '',
          grade_applying: '',
          source: 'walk_in',
          score: 'warm',
          notes: '',
        });
      }, 2000);
    } catch (error) {
      toast.error('Failed to capture lead');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">⚡ Flash Lead Capture</h2>
              <p className="text-sm text-gray-600">Quick admission enquiry form (30 seconds)</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-purple-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`} />
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="p-6 space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Student & Parent Details</h3>
              <p className="text-sm text-gray-600 mt-1">Who are we talking to?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                  placeholder="Full name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent/Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold"
            >
              Next: Grade & Source →
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <GraduationCap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Admission Details</h3>
              <p className="text-sm text-gray-600 mt-1">Which grade and how did they find us?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade Applying For *
                </label>
                <select
                  required
                  value={formData.grade_applying}
                  onChange={(e) => setFormData({ ...formData, grade_applying: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                >
                  <option value="">Select grade...</option>
                  <option value="Nursery">Nursery</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How did they hear about us? *
                </label>
                <select
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                >
                  <option value="walk_in">Walk-in</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social_media">Social Media</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Lead Temperature
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, score: 'hot' })}
                  className={`py-3 px-4 rounded-lg border-2 transition-all ${
                    formData.score === 'hot'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  🔥 HOT
                  <p className="text-xs mt-1">Ready to enroll</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, score: 'warm' })}
                  className={`py-3 px-4 rounded-lg border-2 transition-all ${
                    formData.score === 'warm'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-300 hover:border-yellow-300'
                  }`}
                >
                  ☀️ WARM
                  <p className="text-xs mt-1">Interested</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, score: 'cold' })}
                  className={`py-3 px-4 rounded-lg border-2 transition-all ${
                    formData.score === 'cold'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  ❄️ COLD
                  <p className="text-xs mt-1">Just browsing</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Key points from conversation..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-lg"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={createLeadMutation.isPending}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold flex items-center justify-center gap-2"
              >
                {createLeadMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Capture Lead ⚡'
                )}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="p-6 text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Lead Captured! 🎉</h3>
            <p className="text-gray-600 mb-4">
              {formData.student_name}'s enquiry has been logged successfully
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-green-800">
                ✅ Timeline created<br />
                ✅ Follow-up scheduled<br />
                ✅ Parent notified via SMS
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
