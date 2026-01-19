import { useState } from 'react';
import { ArrowLeft, GraduationCap, Search, X , TrendingUp, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../../services/frontoffice.hooks';
import LeadCaptureModal from '../../components/frontoffice/LeadCaptureModal';
import type { AdmissionLead } from '../../mockDataProviders/mockAdmissionLeads';

export default function AdmissionsPage() {
  const navigate = useNavigate();
  const [scoreFilter, setScoreFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<AdmissionLead | null>(null);
  const { data: leads = [], isLoading } = useLeads(
    scoreFilter === 'all' ? {} : { score: scoreFilter as AdmissionLead['score'] }
  );

  const filteredLeads = leads.filter(l =>
    l.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.contact.includes(searchTerm)
  );

  const getScoreBadge = (score: string) => {
    const badges = {
      hot: 'bg-red-100 text-red-800 border-red-300',
      warm: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      cold: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    const emojis = { hot: '🔥', warm: '☀️', cold: '❄️' };
    return { class: badges[score as keyof typeof badges], emoji: emojis[score as keyof typeof emojis] };
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-purple-600" />
              Admission Leads
            </h1>
            <p className="text-gray-600 mt-1">Manage prospective student enquiries</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            + Capture Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">Total Leads</p>
          <p className="text-2xl font-bold">{leads.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">🔥 Hot</p>
          <p className="text-2xl font-bold text-red-600">
            {leads.filter(l => l.score === 'hot').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">☀️ Warm</p>
          <p className="text-2xl font-bold text-yellow-600">
            {leads.filter(l => l.score === 'warm').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">❄️ Cold</p>
          <p className="text-2xl font-bold text-blue-600">
            {leads.filter(l => l.score === 'cold').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'hot', 'warm', 'cold'].map((f) => (
              <button
                key={f}
                onClick={() => setScoreFilter(f as any)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  scoreFilter === f ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {f === 'hot' ? '🔥' : f === 'warm' ? '☀️' : f === 'cold' ? '❄️' : ''} {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">Loading...</td>
              </tr>
            ) : filteredLeads.map((lead) => {
              const badge = getScoreBadge(lead.score);
              return (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{lead.student_name}</td>
                  <td className="px-6 py-4 text-sm">{lead.parent_name}</td>
                  <td className="px-6 py-4 text-sm">{lead.contact}</td>
                  <td className="px-6 py-4 text-sm">{lead.grade_applying}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${badge.class}`}>
                      {badge.emoji} {lead.score.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                  <button
                      onClick={() => setSelectedLead(lead)}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      View Timeline
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ ADD: Timeline Modal */}
      {selectedLead && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Timeline: {selectedLead.student_name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Parent: {selectedLead.parent_name} • {selectedLead.contact}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-0.5 h-full bg-gray-300"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="font-semibold text-green-900">Lead Captured</p>
                      <p className="text-sm text-green-700 mt-1">
                        {new Date(selectedLead.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Source: {selectedLead.source.replace('_', ' ')} • Grade: {selectedLead.grade_applying}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="w-0.5 h-full bg-gray-300"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="font-semibold text-blue-900">Welcome SMS Sent</p>
                      <p className="text-sm text-blue-700 mt-1">
                        {new Date(selectedLead.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Automated message sent to {selectedLead.contact}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="font-semibold text-yellow-900">Follow-up Scheduled</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Tomorrow at 10:00 AM
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Next: Schedule school tour
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {selectedLead.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedLead.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <LeadCaptureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
