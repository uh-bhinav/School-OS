import { useState } from 'react';
import { ArrowLeft, Wrench, Search, CheckCircle, Clock, AlertCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
}

export default function ServiceRequestsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'approved'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  const [requests] = useState<ServiceRequest[]>([
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
      notes: 'Outstanding Q3 fees'
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
    },
  ]);

  const filteredRequests = requests.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch =
      r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.parent_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-orange-100 text-orange-800 border-orange-300',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

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

  // Stats
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
  const approvedToday = requests.filter(r => {
    const today = new Date().toDateString();
    return r.status === 'approved' && new Date(r.requested_date).toDateString() === today;
  }).length;
  const totalRequests = requests.length;

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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Wrench className="w-8 h-8 text-purple-600" />
              Service Requests
            </h1>
            <p className="text-gray-600 mt-1">Manage certificates and document requests</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-4xl font-bold text-orange-600">{pendingCount}</div>
          <div className="text-sm text-gray-600 mt-1">Pending</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-4xl font-bold text-blue-600">{inProgressCount}</div>
          <div className="text-sm text-gray-600 mt-1">In Progress</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-4xl font-bold text-green-600">{approvedToday}</div>
          <div className="text-sm text-gray-600 mt-1">Approved Today</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-4xl font-bold text-gray-900">{totalRequests}</div>
          <div className="text-sm text-gray-600 mt-1">Total Requests</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student, request ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'pending', 'in_progress', 'approved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All' : f.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/frontoffice/serviceRequest/${request.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{request.request_id}</h3>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(request.status)}`}>
                    {request.status.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    {getCertificateLabel(request.type)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Requested: {new Date(request.requested_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Student</p>
                <p className="font-medium text-gray-900">{request.student_name}</p>
                <p className="text-sm text-gray-600">{request.class}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Parent</p>
                <p className="font-medium text-gray-900">{request.parent_name}</p>
                <p className="text-sm text-gray-600">{request.contact}</p>
              </div>

              {request.fees_due && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Outstanding Dues</p>
                  <p className="font-bold text-red-600">₹ {request.fees_due.toLocaleString()}</p>
                  <p className="text-xs text-red-500">⚠️ Clearance Required</p>
                </div>
              )}
            </div>

            {/* Clearance Status */}
            {request.clearance_status && (
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  {request.clearance_status.finance ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-orange-500" />
                  )}
                  <span className="text-sm text-gray-600">Finance</span>
                </div>

                <div className="flex items-center gap-2">
                  {request.clearance_status.library ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-orange-500" />
                  )}
                  <span className="text-sm text-gray-600">Library</span>
                </div>

                <div className="flex items-center gap-2">
                  {request.clearance_status.principal ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-orange-500" />
                  )}
                  <span className="text-sm text-gray-600">Principal</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
