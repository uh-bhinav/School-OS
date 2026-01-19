import { useState } from 'react';
import { ArrowLeft, Users, Search, LogOut ,  Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVisitors, useCheckOutVisitor } from '../../services/frontoffice.hooks';
import VisitorCheckInModal from '../../components/frontoffice/VisitorCheckInModal';

export function VisitorsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'checked_in' | 'checked_out'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);


  const { data: visitors = [], isLoading } = useVisitors(filter === 'all' ? undefined : filter);
  const checkOutMutation = useCheckOutVisitor();

  const filteredVisitors = visitors.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.contact.includes(searchTerm)
  );

  // ✅ ADD: Handle check-out
  const handleCheckOut = async (visitorId: string) => {
    if (confirm('Check out this visitor?')) {
      try {
        await checkOutMutation.mutateAsync(visitorId);
        alert('✅ Visitor checked out successfully!');
      } catch (error) {
        alert('❌ Failed to check out visitor');
      }
    }
  };

  // ✅ FIX: Use correct status values
  const activeNow = visitors.filter(v => v.status === 'checked_in').length;

  const todayTotal = visitors.filter(v => {
    const today = new Date().toDateString();
    return new Date(v.check_in_time).toDateString() === today;
  }).length;

  // ✅ FIX: Calculate average duration for checked_out visits
  const completedVisits = visitors.filter(v =>
    v.status === 'checked_out' && v.check_out_time
  );

  const avgDuration = completedVisits.length > 0
    ? Math.round(
        completedVisits.reduce((sum, v) => {
          const checkIn = new Date(v.check_in_time).getTime();
          const checkOut = new Date(v.check_out_time!).getTime();
          return sum + (checkOut - checkIn);
        }, 0) / completedVisits.length / 60000 // Convert to minutes
      )
    : 0;

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
              <Users className="w-8 h-8 text-blue-600" />
              All Visitors
            </h1>
            <p className="text-gray-600 mt-1">Manage visitor check-ins and gate passes</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + New Visitor
          </button>
        </div>
      </div>

      {/* ✅ KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-sm text-gray-600">Active Now</div>
          </div>
          <div className="text-4xl font-bold text-gray-900">{activeNow}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-gray-600">Today's Total</div>
          </div>
          <div className="text-4xl font-bold text-gray-900">{todayTotal}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-sm text-gray-600">Avg. Duration</div>
          </div>
          <div className="text-4xl font-bold text-gray-900">{avgDuration}m</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'checked_in', 'checked_out'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'checked_in' ? 'Live' : 'Past'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No visitors found</td>
                </tr>
              ) : (
                filteredVisitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{visitor.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{visitor.contact}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {visitor.purpose.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(visitor.check_in_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        visitor.status === 'checked_in'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {visitor.status === 'checked_in' ? 'Live' : 'Checked Out'}
                      </span>
                    </td>
                    {/* ✅ ADD ACTION COLUMN */}
                    <td className="px-6 py-4">
                      {visitor.status === 'checked_in' ? (
                        <button
                          onClick={() => handleCheckOut(visitor.id)}
                          disabled={checkOutMutation.isPending}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Check Out
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VisitorCheckInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
