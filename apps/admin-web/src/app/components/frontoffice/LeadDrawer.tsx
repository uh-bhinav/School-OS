import { useState } from 'react';
import { X, Mail, Phone, Flame, FileText, User, Briefcase } from 'lucide-react';
import { useLeadTimeline, useLeadDocuments } from '../../services/admissionsPipeline.hooks';
import type { AdmissionLead, LeadTimeline } from '../../types/admissions.types';
import { toast } from 'sonner';

interface LeadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: AdmissionLead;
}

// Unified timeline item type that works with both API and mock data
interface TimelineItem {
  id: string;
  lead_id: string;
  event: string;
  event_type: 'info' | 'success' | 'default';
  created_at: string;
  notes: string | null;
  score: string | null;
  source: string | null;
}

export function LeadDrawer({ isOpen, onClose, lead }: LeadDrawerProps) {
  const { data: timeline = [], isLoading: timelineLoading } = useLeadTimeline(lead.id);
  const { data: documents = [] } = useLeadDocuments(lead.id);
  const [activeTab, setActiveTab] = useState<'timeline' | 'docs' | 'family'>('family');

  if (!isOpen) return null;

  const handleCall = (contact: string, name: string) => {
    toast.info(`Calling ${name} at ${contact}`);
  };

  const getWarmthColor = (score: string) => {
    switch (score) {
      case 'hot': return { bg: 'bg-red-50', text: 'text-red-700', label: 'High Warmth' };
      case 'warm': return { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Medium Warmth' };
      case 'cold': return { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Low Warmth' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Unknown' };
    }
  };

  const warmth = getWarmthColor(lead.score);

  // Convert API timeline to TimelineItem format
  const displayTimeline: TimelineItem[] = timeline.length > 0
    ? timeline.map((item: LeadTimeline): TimelineItem => ({
        id: item.id,
        lead_id: item.lead_id,
        event: item.event,
        event_type: item.event_type as 'info' | 'success' | 'default',
        created_at: item.created_at,
        notes: item.notes ?? null,
        score: item.score ?? null,
        source: item.source ?? null,
      }))
    : [
        {
          id: '1',
          lead_id: lead.id,
          event: 'Call Logged: Spoke to Father about fees',
          event_type: 'info',
          created_at: new Date().toISOString(),
          notes: null,
          score: null,
          source: null,
        },
        {
          id: '2',
          lead_id: lead.id,
          event: 'Entrance Test: Scored 85/100',
          event_type: 'success',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          notes: null,
          score: '85/100',
          source: null,
        },
        {
          id: '3',
          lead_id: lead.id,
          event: 'Campus Tour Completed',
          event_type: 'info',
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          notes: null,
          score: null,
          source: null,
        },
        {
          id: '4',
          lead_id: lead.id,
          event: 'Enquiry Received via Website',
          event_type: 'default',
          created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
          notes: null,
          score: null,
          source: 'website',
        },
      ];

  // Group timeline by date
  const groupedTimeline = displayTimeline.reduce((acc, item) => {
    const date = new Date(item.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let label: string;
    if (date.toDateString() === today.toDateString()) {
      label = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday';
    } else {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    if (!acc[label]) {
      acc[label] = [];
    }
    acc[label].push(item);
    return acc;
  }, {} as Record<string, TimelineItem[]>);

  return (
    <>
      {/* Backdrop - Very high z-index */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Drawer - Highest z-index possible */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-slide-in-right"
        style={{ zIndex: 9999 }}
      >
        {/* Header */}
        <div className="relative bg-white px-6 py-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white">
              {lead.student_name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{lead.student_name}</h2>
              <p className="text-sm text-gray-600">{lead.grade_applying}</p>
            </div>
          </div>

          {/* Warmth Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md ${warmth.bg}`}>
            <Flame className="w-4 h-4 text-red-500" />
            <span className={`text-sm font-medium ${warmth.text}`}>{warmth.label}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 mx-6 mt-6 rounded-full p-1">
          {[
            { id: 'timeline', label: 'Timeline' },
            { id: 'docs', label: 'Docs' },
            { id: 'family', label: 'Family' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 text-sm font-medium transition-all rounded-full ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-8">
              {Object.entries(groupedTimeline).map(([dateLabel, items]) => (
                <div key={dateLabel}>
                  {/* Date Label with colored dot */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-2 h-2 rounded-full ${
                      dateLabel === 'Today' ? 'bg-blue-500' :
                      dateLabel === 'Yesterday' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-500">{dateLabel}</span>
                  </div>

                  {/* Timeline Items */}
                  <div className="space-y-4 ml-5">
                    {items.map((item) => (
                      <div key={item.id} className="pb-4">
                        <h4 className="text-base text-gray-900 mb-2">{item.event}</h4>
                        {item.score && (
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm rounded-md font-medium">
                            {item.score}
                          </span>
                        )}
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Contact Information Box at bottom of timeline */}
              <div className="bg-blue-50 rounded-2xl p-5 mt-8">
                <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900">{lead.contact}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900">{lead.email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-4">
                    <FileText className="h-6 w-6 text-gray-400" />
                    <span className="text-base font-medium text-gray-900">Birth Certificate</span>
                  </div>
                  <span className="px-4 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Uploaded
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-4">
                    <FileText className="h-6 w-6 text-gray-400" />
                    <span className="text-base font-medium text-gray-900">Previous School TC</span>
                  </div>
                  <span className="px-4 py-1.5 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                    Pending
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-4">
                    <FileText className="h-6 w-6 text-gray-400" />
                    <span className="text-base font-medium text-gray-900">Medical Records</span>
                  </div>
                  <span className="px-4 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Uploaded
                  </span>
                </div>
              </div>

              {/* Contact Information Box */}
              <div className="bg-blue-50 rounded-2xl p-5 mt-8">
                <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900">{lead.contact}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900">{lead.email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Family Tab */}
          {activeTab === 'family' && (
            <div className="space-y-6">
              {/* Father Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  <span>Father</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900">{lead.parent_name}</h3>

                <div className="flex items-center gap-3 text-gray-700">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <span className="text-base">{lead.father_occupation || 'Software Engineer'}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span className="text-base">{lead.contact}</span>
                </div>

                <button
                  onClick={() => handleCall(lead.contact, lead.parent_name)}
                  className="w-full py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 text-gray-900 font-medium mt-4"
                >
                  <Phone className="w-5 h-5" />
                  Call Father
                </button>
              </div>

              {/* Mother Section */}
              <div className="space-y-4 pt-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  <span>Mother</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900">{lead.mother_name || 'Mrs. Priya Patel'}</h3>

                <div className="flex items-center gap-3 text-gray-700">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <span className="text-base">{lead.mother_occupation || 'Teacher'}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span className="text-base">{lead.contact.replace(/\d$/, '1')}</span>
                </div>

                <button
                  onClick={() => handleCall(lead.contact, lead.mother_name || 'Mother')}
                  className="w-full py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 text-gray-900 font-medium mt-4"
                >
                  <Phone className="w-5 h-5" />
                  Call Mother
                </button>
              </div>

              {/* Contact Information Box */}
              <div className="bg-blue-50 rounded-2xl p-5 mt-8">
                <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900">{lead.contact.replace(/\d$/, '5')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900">{lead.email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 bg-white p-6 space-y-3">
          <button
            onClick={() => toast.info('Converting to student...')}
            className="w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-base"
          >
            Convert to Student
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => toast.info('Adding note...')}
              className="py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <FileText className="w-4 h-4" />
              Add Note
            </button>
            <button
              onClick={() => handleCall(lead.contact, lead.parent_name)}
              className="py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Phone className="w-4 h-4" />
              Call Parent
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  );
}
