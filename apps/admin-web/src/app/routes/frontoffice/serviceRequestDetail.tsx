import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, Send, X, FileText, User, Phone } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface ServiceRequest {
  id: string;
  request_id: string;
  type: 'certificate' | 'id_card' | 'bonafide' | 'transfer' | 'character';
  student_name: string;
  parent_name: string;
  class: string;
  contact: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  requested_date: string;
  clearance_status?: {
    finance?: boolean;
    library?: boolean;
    principal?: boolean;
  };
  fees_due?: number;
  notes?: string;
  history?: Array<{
    timestamp: string;
    action: string;
    by: string;
    note?: string;
  }>;
}

export default function ServiceRequestDetailPage() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [note, setNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // ✅ FETCH REQUEST DATA BASED ON ID
  useEffect(() => {
    // Mock data - Replace with actual API call: fetchRequestById(requestId)
    const mockRequests: ServiceRequest[] = [
      {
        id: '1',
        request_id: 'REQ-998',
        type: 'transfer',
        student_name: 'Rohan Das',
        parent_name: 'Mrs. Sunita Das',
        class: 'Grade 8A',
        contact: '+91 98765 43210',
        status: 'pending',
        requested_date: '2025-11-23T10:30:00Z',
        clearance_status: { finance: true, library: false, principal: false },
        fees_due: 12000,
        notes: 'Outstanding Q3 fees',
        history: [
          { timestamp: '2025-11-23T10:30:00Z', action: 'Request submitted', by: 'Mrs. Sunita Das' },
          { timestamp: '2025-11-23T11:00:00Z', action: 'Finance clearance approved', by: 'Mr. Gupta' },
        ]
      },
      {
        id: '2',
        request_id: 'REQ-997',
        type: 'bonafide',
        student_name: 'Priya Sharma',
        parent_name: 'Mr. Rajesh Sharma',
        class: 'Grade 10B',
        contact: '+91 98765 22222',
        status: 'approved',
        requested_date: '2025-11-22T14:00:00Z',
        clearance_status: { finance: true, library: true, principal: true },
        history: [
          { timestamp: '2025-11-22T14:00:00Z', action: 'Request submitted', by: 'Mr. Rajesh Sharma' },
          { timestamp: '2025-11-22T15:30:00Z', action: 'All clearances approved', by: 'Front Office' },
          { timestamp: '2025-11-22T16:00:00Z', action: 'Certificate issued', by: 'Principal Dr. Mehta' },
        ]
      },
      {
        id: '3',
        request_id: 'REQ-996',
        type: 'character',
        student_name: 'Arjun Kumar',
        parent_name: 'Mrs. Anjali Kumar',
        class: 'Grade 12A',
        contact: '+91 98765 33333',
        status: 'approved',
        requested_date: '2025-11-21T09:00:00Z',
        clearance_status: { finance: true, library: true, principal: true },
        history: [
          { timestamp: '2025-11-21T09:00:00Z', action: 'Request submitted', by: 'Mrs. Anjali Kumar' },
          { timestamp: '2025-11-21T11:00:00Z', action: 'All clearances approved', by: 'Front Office' },
          { timestamp: '2025-11-21T14:00:00Z', action: 'Certificate issued', by: 'Principal Dr. Mehta' },
        ]
      },
    ];

    const foundRequest = mockRequests.find(r => r.id === requestId);
    setRequest(foundRequest || null);
  }, [requestId]);

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  const getCertificateLabel = (type: string) => {
    const labels = {
      certificate: 'General Certificate',
      id_card: 'ID Card',
      bonafide: 'Bonafide Certificate',
      transfer: 'Transfer Certificate',
      character: 'Character Certificate',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-700',
      in_progress: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const clearanceSteps = [
    {
      dept: 'Request Received',
      status: 'completed',
      date: new Date(request.requested_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      approver: 'Front Office',
      icon: CheckCircle
    },
    {
      dept: 'Finance Clearance',
      status: request.clearance_status?.finance ? 'completed' : 'pending',
      date: request.clearance_status?.finance ? 'Nov 24' : '-',
      approver: 'Mr. Gupta',
      icon: request.clearance_status?.finance ? CheckCircle : Clock
    },
    {
      dept: 'Library Clearance',
      status: request.clearance_status?.library ? 'completed' : 'pending',
      date: request.clearance_status?.library ? 'Nov 25' : '-',
      approver: 'Mrs. Singh',
      icon: request.clearance_status?.library ? CheckCircle : Clock
    },
    {
      dept: 'Principal Approval',
      status: request.clearance_status?.principal ? 'completed' : 'pending',
      date: request.clearance_status?.principal ? 'Nov 26' : '-',
      approver: 'Dr. Mehta',
      icon: request.clearance_status?.principal ? CheckCircle : Clock
    },
  ];

  // ✅ ENHANCED HANDLERS WITH REAL LOGIC
  const handleSendPaymentReminder = () => {
    // TODO: Call API to send SMS/Email to parent
    const message = `Dear ${request.parent_name}, this is a reminder that ${request.student_name} has outstanding fees of ₹${request.fees_due}. Please clear the dues to proceed with the ${getCertificateLabel(request.type)} request.`;

    alert('✅ Payment reminder sent to parent via SMS and WhatsApp!');

    // Add to history
    const newHistory = {
      timestamp: new Date().toISOString(),
      action: 'Payment reminder sent to parent',
      by: 'Front Office Admin',
    };

    setRequest({
      ...request,
      history: [...(request.history || []), newHistory]
    });
  };

  const handleSendDeptReminder = () => {
    // TODO: Call API to notify library department
    alert('✅ Reminder sent to Library Department via email and internal notification!');

    const newHistory = {
      timestamp: new Date().toISOString(),
      action: 'Reminder sent to Library Department',
      by: 'Front Office Admin',
    };

    setRequest({
      ...request,
      history: [...(request.history || []), newHistory]
    });
  };

  const handleAddNote = () => {
    if (!note.trim()) {
      alert('⚠️ Please enter a note');
      return;
    }

    // TODO: Call API to save note
    const newHistory = {
      timestamp: new Date().toISOString(),
      action: 'Note added',
      by: 'Front Office Admin',
      note: note.trim(),
    };

    setRequest({
      ...request,
      notes: request.notes ? `${request.notes}\n${note.trim()}` : note.trim(),
      history: [...(request.history || []), newHistory]
    });

    alert('✅ Note added successfully!');
    setNote('');
    setShowNoteModal(false);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('⚠️ Please provide a reason for rejection');
      return;
    }

    // TODO: Call API to reject request and notify parent
    const newHistory = {
      timestamp: new Date().toISOString(),
      action: 'Request rejected',
      by: 'Front Office Admin',
      note: `Reason: ${rejectionReason.trim()}`,
    };

    setRequest({
      ...request,
      status: 'rejected',
      history: [...(request.history || []), newHistory]
    });

    alert(`❌ Request rejected. Parent will be notified via SMS.\nReason: ${rejectionReason}`);
    setRejectionReason('');
    setShowRejectModal(false);
  };

  const handleApprove = () => {
    // ✅ VALIDATION LOGIC
    if (request.fees_due && request.fees_due > 0) {
      alert('❌ Cannot approve: Outstanding fees must be cleared first');
      return;
    }

    if (!request.clearance_status?.finance) {
      alert('❌ Cannot approve: Finance clearance pending');
      return;
    }

    if (!request.clearance_status?.library) {
      alert('❌ Cannot approve: Library clearance pending');
      return;
    }

    if (!request.clearance_status?.principal) {
      alert('❌ Cannot approve: Principal approval pending');
      return;
    }

    // TODO: Call API to approve and generate certificate
    const newHistory = {
      timestamp: new Date().toISOString(),
      action: 'Certificate approved and issued',
      by: 'Principal Dr. Mehta',
    };

    setRequest({
      ...request,
      status: 'approved',
      history: [...(request.history || []), newHistory]
    });

    alert('✅ Certificate approved and issued! Parent will be notified via SMS.');
    setTimeout(() => navigate('/frontoffice/serviceRequest'), 1500);
  };

  const canApprove = !request.fees_due &&
                     request.clearance_status?.finance &&
                     request.clearance_status?.library &&
                     request.clearance_status?.principal;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/frontoffice/serviceRequest')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Service Requests
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Request Header */}
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {request.request_id}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {getCertificateLabel(request.type)}
                </p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div>Requested: {new Date(request.requested_date).toLocaleDateString()}</div>
                <div className="mt-1">By: {request.parent_name}</div>
              </div>
            </div>

            {/* Student Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <User className="w-3 h-3" />
                  Student Name
                </div>
                <div className="font-medium text-gray-900">{request.student_name}</div>
                <div className="text-sm text-gray-600">{request.class}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <User className="w-3 h-3" />
                  Parent
                </div>
                <div className="font-medium text-gray-900">{request.parent_name}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <Phone className="w-3 h-3" />
                  Contact
                </div>
                <div className="font-medium text-gray-900">{request.contact}</div>
              </div>
            </div>

            {/* Clearance Status Tracker */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Clearance Status</h3>
              <div className="flex items-center justify-between">
                {clearanceSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex-1 flex items-center">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                          step.status === 'completed'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="text-xs text-center font-medium mb-1">{step.dept}</div>
                        <div className="text-xs text-gray-500">{step.date}</div>
                        <div className="text-xs text-gray-500">{step.approver}</div>
                      </div>
                      {index < clearanceSteps.length - 1 && (
                        <div className={`h-0.5 flex-1 mx-2 ${
                          step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fee Clearance Alert */}
            {request.fees_due && request.fees_due > 0 && (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2 text-red-900">Fee Clearance Required</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-red-900">
                        ₹ {request.fees_due.toLocaleString()}
                      </span>
                      <span className="text-sm text-red-700">Outstanding Dues</span>
                    </div>
                    <p className="text-sm text-red-800 mb-4">
                      Q3 Tuition Fee + Transport Fee
                    </p>
                    <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-red-900">
                        ⚠️ <strong>Cannot issue {getCertificateLabel(request.type)}.</strong> Outstanding fees must be cleared before processing.
                      </p>
                    </div>
                    <button
                      onClick={handleSendPaymentReminder}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Send Payment Reminder to Parent
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Library Clearance Pending */}
            {!request.clearance_status?.library && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-yellow-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Pending: Library Clearance</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Waiting for confirmation that all books have been returned and library card has been surrendered.
                    </p>
                    <button
                      onClick={handleSendDeptReminder}
                      className="flex items-center gap-2 px-4 py-2 border border-yellow-600 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Send Reminder to Library Department
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={request.status === 'approved' || request.status === 'rejected'}
                className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Request
              </button>
              <button
                onClick={() => setShowNoteModal(true)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Add Note
              </button>
              <button
                onClick={handleApprove}
                disabled={!canApprove || request.status === 'approved'}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={!canApprove ? 'All clearances must be completed' : ''}
              >
                {request.status === 'approved' ? '✓ Approved' : 'Approve & Issue Certificate'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - History & Notes */}
        <div className="space-y-6">
          {/* Request History */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Request History
            </h3>
            <div className="space-y-3">
              {(request.history || []).map((item, index) => (
                <div key={index} className="border-l-2 border-purple-200 pl-4 py-2">
                  <div className="text-sm font-medium text-gray-900">{item.action}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">By: {item.by}</div>
                  {item.note && (
                    <div className="text-xs text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                      {item.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          {request.notes && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {request.notes}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Add Note</h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter your note here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-red-900">Reject Request</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this certificate request. The parent will be notified.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
