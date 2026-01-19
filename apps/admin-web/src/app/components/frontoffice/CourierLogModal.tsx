// ============================================================================
// COURIER LOG MODAL - Log incoming couriers
// ============================================================================

import { useState } from 'react';
import { X, Package, User, Building2, Hash, FileText } from 'lucide-react';
import { useLogCourier } from '../../services/frontoffice.hooks';
import type { Courier } from '../../mockDataProviders/mockCouriers';

interface CourierLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CourierLogModal({ isOpen, onClose }: CourierLogModalProps) {
  const [formData, setFormData] = useState({
    tracking_number: '',
    recipient_name: '',
    recipient_type: 'teacher' as Courier['recipient_type'],
    grade: '',
    courier_company: 'BlueDart' as Courier['courier_company'],
    notes: '',
  });

  const logMutation = useLogCourier();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await logMutation.mutateAsync(formData);
      alert('✅ Courier logged successfully! SMS notification sent.');
      onClose();
      setFormData({
        tracking_number: '',
        recipient_name: '',
        recipient_type: 'teacher',
        grade: '',
        courier_company: 'BlueDart',
        notes: '',
      });
    } catch (error) {
      alert('❌ Failed to log courier');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Log Incoming Courier</h2>
            <p className="text-sm text-gray-600">Register courier for delivery tracking</p>
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
          {/* Courier Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              Courier Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.tracking_number}
                    onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="AWB-123456789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Courier Company *
                </label>
                <select
                  required
                  value={formData.courier_company}
                  onChange={(e) => setFormData({ ...formData, courier_company: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="BlueDart">BlueDart</option>
                  <option value="DHL">DHL</option>
                  <option value="DTDC">DTDC</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="FedEx">FedEx</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              Recipient Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Teacher name or office"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Type *
                </label>
                <select
                  required
                  value={formData.recipient_type}
                  onChange={(e) => setFormData({ ...formData, recipient_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="principal">Principal Office</option>
                  <option value="admin">Admin Office</option>
                </select>
              </div>
            </div>

            {formData.recipient_type === 'teacher' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade/Department (Optional)
                </label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Grade 5A, Science Lab"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Package contents, special instructions..."
              />
            </div>
          </div>

          {/* Notification Info */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900">Automatic Notification</p>
                <p className="text-sm text-orange-700 mt-1">
                  SMS will be sent to recipient immediately after logging
                </p>
              </div>
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
              disabled={logMutation.isPending}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {logMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging...
                </>
              ) : (
                'Log Courier & Notify'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
