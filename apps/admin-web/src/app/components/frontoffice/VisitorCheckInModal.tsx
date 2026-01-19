// ============================================================================
// VISITOR CHECK-IN MODAL - Quick visitor registration
// ============================================================================

import { useState } from 'react';
import { X, User, Phone, Building, FileText, Camera } from 'lucide-react';
import { useCheckInVisitor } from '../../services/frontoffice.hooks';
import type { Visitor } from '../../mockDataProviders/mockVisitors';

interface VisitorCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VisitorCheckInModal({ isOpen, onClose }: VisitorCheckInModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    purpose: 'admission_enquiry' as Visitor['purpose'],
    student_name: '',
    grade: '',
    notes: '',
  });

  const checkInMutation = useCheckInVisitor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await checkInMutation.mutateAsync(formData);
      alert('✅ Visitor checked in successfully! Gate pass generated.');
      onClose();
      setFormData({
        name: '',
        contact: '',
        purpose: 'admission_enquiry',
        student_name: '',
        grade: '',
        notes: '',
      });
    } catch (error) {
      alert('❌ Failed to check in visitor');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Issue Visitor Pass</h2>
            <p className="text-sm text-gray-600">Quick check-in for walk-in visitors</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Visitor Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Visitor Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter visitor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Visit Purpose
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose of Visit *
              </label>
              <select
                required
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="admission_enquiry">Admission Enquiry</option>
                <option value="parent_meeting">Parent Meeting</option>
                <option value="maintenance">Maintenance</option>
                <option value="vendor">Vendor</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Conditional Fields */}
            {(formData.purpose === 'admission_enquiry' || formData.purpose === 'parent_meeting') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter student name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade
                  </label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Grade 5"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Additional Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional information..."
              />
            </div>
          </div>

          {/* Photo Capture (Optional) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">Capture Photo (Optional)</p>
                <p className="text-sm text-blue-700">Take a photo for visitor badge</p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open Camera
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={checkInMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {checkInMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                'Issue Pass & Check In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
