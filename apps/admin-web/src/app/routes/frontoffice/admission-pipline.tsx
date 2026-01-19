import { useState } from 'react';
import {
  Phone,
  Flame,
  Snowflake,
  GripVertical,
  Calendar,
  DollarSign,
  ClipboardCheck,
  UserCheck,
  GraduationCap,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePipelineLeads, useUpdateLeadStatus } from '../../services/admissionsPipeline.hooks';
import { LeadDrawer } from '../../components/frontoffice/LeadDrawer';
import { PaymentModal } from '../../components/frontoffice/PaymentModal';
import  LeadCaptureModal  from '../../components/frontoffice/LeadCaptureModal';
import type { AdmissionLead } from '../../types/admissions.types';
import { toast } from 'sonner';

const columns = [
  { id: 'enquiry', title: 'New Enquiry', icon: Phone, color: 'bg-blue-100' },
  { id: 'formSold', title: 'Form Sold/Paid', icon: DollarSign, color: 'bg-purple-100' },
  { id: 'assessment', title: 'Assessment Scheduled', icon: Calendar, color: 'bg-yellow-100' },
  { id: 'cleared', title: 'Assessment Cleared', icon: ClipboardCheck, color: 'bg-green-100' },
  { id: 'provisional', title: 'Provisional Admission', icon: UserCheck, color: 'bg-orange-100' },
  { id: 'enrolled', title: 'Enrolled', icon: GraduationCap, color: 'bg-emerald-100' },
] as const;

export default function AdmissionsPipeline() {
  const navigate = useNavigate();
  const { data: leads = [], isLoading } = usePipelineLeads();
  const updateStatusMutation = useUpdateLeadStatus();

  const [draggedLead, setDraggedLead] = useState<{ lead: AdmissionLead; fromColumn: string } | null>(null);
  const [selectedLead, setSelectedLead] = useState<AdmissionLead | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);

  const handleDragStart = (lead: AdmissionLead) => {
    setDraggedLead({ lead, fromColumn: lead.status });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (toColumn: string) => {
    if (!draggedLead) return;

    const { lead, fromColumn } = draggedLead;

    // Check if moving to Form Sold from Enquiry - trigger payment modal
    if (toColumn === 'formSold' && fromColumn === 'enquiry') {
      setSelectedLead(lead);
      setShowPaymentModal(true);
      setDraggedLead(null);
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        leadId: lead.id,
        status: toColumn as AdmissionLead['status'],
      });

      toast.success(`${lead.student_name} moved to ${columns.find(c => c.id === toColumn)?.title}`);
    } catch (error) {
      toast.error('Failed to update lead status');
    }

    setDraggedLead(null);
  };

  const handleCardClick = (lead: AdmissionLead) => {
    setSelectedLead(lead);
    setShowDrawer(true);
  };

  const handleCall = (lead: AdmissionLead, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info(`Calling ${lead.parent_name} at ${lead.contact}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admissions Pipeline</h1>
            <p className="text-gray-600 mt-1">Sales Funnel & Lead Management</p>
          </div>
          <button
            onClick={() => setShowCaptureModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add New Lead
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {columns.map((column) => {
            const Icon = column.icon;
            const columnLeads = leads.filter(lead => lead.status === column.id);

            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                <div className={`${column.color} p-4 rounded-t-2xl border-2 border-transparent`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <h3 className="font-semibold">{column.title}</h3>
                    </div>
                    <span className="px-2 py-1 bg-white rounded-full text-sm font-medium">
                      {columnLeads.length}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-b-2xl min-h-[600px] space-y-3">
                  {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : columnLeads.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">No leads</div>
                  ) : (
                    columnLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => handleDragStart(lead)}
                        onClick={() => handleCardClick(lead)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-sm">{lead.student_name}</span>
                            </div>
                            <div className="text-xs text-gray-600 ml-6">{lead.parent_name}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {lead.score === 'hot' && (
                              <div title="Hot Lead">
                                <Flame className="w-4 h-4 text-red-500" />
                              </div>
                            )}
                            {lead.score === 'cold' && (
                              <div title="Cold Lead">
                                <Snowflake className="w-4 h-4 text-blue-400" />
                              </div>
                            )}
                            {lead.score === 'warm' && (
                              <div className="w-4 h-4 bg-yellow-400 rounded-full" title="Warm Lead" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {lead.grade_applying}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{lead.contact}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="capitalize">{lead.source.replace('_', ' ')}</span>
                            <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleCall(lead, e)}
                          className="w-full mt-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm"
                        >
                          <Phone className="w-3 h-3" />
                          Quick Call
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals & Drawers */}
      {selectedLead && (
        <>
          <LeadDrawer
            isOpen={showDrawer}
            onClose={() => setShowDrawer(false)}
            lead={selectedLead}
          />
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            lead={selectedLead}
          />
        </>
      )}

      <LeadCaptureModal
        isOpen={showCaptureModal}
        onClose={() => setShowCaptureModal(false)}
      />
    </div>
  );
}
