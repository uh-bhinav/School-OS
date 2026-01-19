import { useState } from 'react';
import { X } from 'lucide-react';
import { useRecordPayment } from '../../services/admissionsPipeline.hooks';
import type { AdmissionLead } from '../../types/admissions.types';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: AdmissionLead;
}

export function PaymentModal({ isOpen, onClose, lead }: PaymentModalProps) {
  const recordPaymentMutation = useRecordPayment();
  const [formData, setFormData] = useState({
    amount: '1000',
    payment_mode: '' as 'cash' | 'card' | 'upi' | 'online' | '',
    receipt_number: `REC-${Date.now()}`,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.payment_mode) {
      toast.error('Please select a payment mode');
      return;
    }

    try {
      await recordPaymentMutation.mutateAsync({
        lead_id: lead.id,
        amount: parseFloat(formData.amount),
        payment_mode: formData.payment_mode,
        receipt_number: formData.receipt_number,
      });

      toast.success('Payment recorded successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Collect Application Fee</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Student Name
            </label>
            <input
              type="text"
              value={lead.student_name}
              disabled
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Parent Name
            </label>
            <input
              type="text"
              value={lead.parent_name}
              disabled
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-700">
              Application Fee Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-gray-500">₹</span>
              <input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="paymentMode" className="mb-1 block text-sm font-medium text-gray-700">
              Payment Mode *
            </label>
            <select
              id="paymentMode"
              value={formData.payment_mode}
              onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value as any })}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select payment mode</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="online">Online Transfer</option>
            </select>
          </div>

          <div>
            <label htmlFor="receiptNumber" className="mb-1 block text-sm font-medium text-gray-700">
              Receipt Number *
            </label>
            <input
              id="receiptNumber"
              type="text"
              value={formData.receipt_number}
              onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recordPaymentMutation.isPending}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {recordPaymentMutation.isPending ? 'Processing...' : 'Record Payment & Issue Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
