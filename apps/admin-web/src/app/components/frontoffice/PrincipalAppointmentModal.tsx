import { useState } from 'react';
import { X, Calendar, Clock, User, Phone, MessageSquare, Send, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  duration: string;
}

interface AppointmentRequest {
  parentName: string;
  studentName: string;
  phone: string;
  purpose: string;
  selectedDate: string;
  selectedSlot: TimeSlot | null;
  additionalNotes: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrincipalAppointmentModal({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const [request, setRequest] = useState<AppointmentRequest>({
    parentName: '',
    studentName: '',
    phone: '',
    purpose: '',
    selectedDate: new Date().toISOString().split('T')[0],
    selectedSlot: null,
    additionalNotes: '',
  });

  // Mock available slots
  const availableSlots: TimeSlot[] = [
    { id: '1', time: '09:00 AM', available: true, duration: '30 min' },
    { id: '2', time: '10:30 AM', available: true, duration: '30 min' },
    { id: '3', time: '02:00 PM', available: true, duration: '30 min' },
    { id: '4', time: '04:00 PM', available: true, duration: '30 min' },
  ];

  const freeSlots = availableSlots.filter(slot => slot.available);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!request.parentName || !request.phone || !request.purpose || !request.selectedSlot) {
      alert('⚠️ Please fill all required fields and select a time slot');
      return;
    }

    alert(`✅ Appointment request sent to Principal!\n\nDate: ${request.selectedDate}\nTime: ${request.selectedSlot.time}\nParent: ${request.parentName}`);

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setRequest({
      parentName: '',
      studentName: '',
      phone: '',
      purpose: '',
      selectedDate: new Date().toISOString().split('T')[0],
      selectedSlot: null,
      additionalNotes: '',
    });
  };

  const handleViewFullCalendar = () => {
    onClose();
    navigate('/frontoffice/principalCalendar');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Request Principal Appointment</h2>
            <p className="text-sm text-gray-600 mt-1">Select an available time slot</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Parent Name *
              </label>
              <input
                type="text"
                required
                value={request.parentName}
                onChange={(e) => setRequest({ ...request, parentName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Enter parent's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Contact Number *
              </label>
              <input
                type="tel"
                required
                value={request.phone}
                onChange={(e) => setRequest({ ...request, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Purpose of Meeting *
              </label>
              <input
                type="text"
                required
                value={request.purpose}
                onChange={(e) => setRequest({ ...request, purpose: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Discuss academic performance"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Select Date *
            </label>
            <input
              type="date"
              required
              value={request.selectedDate}
              onChange={(e) => setRequest({ ...request, selectedDate: e.target.value, selectedSlot: null })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4 inline mr-1" />
                Available Time Slots ({freeSlots.length} available)
              </label>
              <button
                type="button"
                onClick={handleViewFullCalendar}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                <Eye className="w-4 h-4" />
                View Full Calendar
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {freeSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setRequest({ ...request, selectedSlot: slot })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    request.selectedSlot?.id === slot.id
                      ? 'border-purple-600 bg-purple-50 text-purple-900'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-sm">{slot.time}</div>
                  <div className="text-xs text-gray-600 mt-1">{slot.duration}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => { onClose(); resetForm(); }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!request.selectedSlot}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
