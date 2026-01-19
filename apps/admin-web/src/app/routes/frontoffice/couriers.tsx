import { useState } from 'react';
import { ArrowLeft, Package, Search, CheckCircle, Clock, TrendingUp, Box as BoxIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCouriers, useMarkCourierDelivered } from '../../services/frontoffice.hooks';
import CourierLogModal from '../../components/frontoffice/CourierLogModal';

export default function CouriersPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const markDeliveredMutation = useMarkCourierDelivered();
  const { data: couriers = [], isLoading } = useCouriers(filter === 'all' ? undefined : filter);

  const filteredCouriers = couriers.filter(c =>
    c.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tracking_number.includes(searchTerm)
  );

  const handleMarkDelivered = async (courierId: string) => {
    if (confirm('Mark this courier as delivered and notify recipient?')) {
      try {
        await markDeliveredMutation.mutateAsync({ courierId }); // ✅ Changed to object
      } catch (error) {
        alert('❌ Failed to mark courier as delivered');
      }
    }
  };

  const todayTotal = couriers.filter(c => {
    const today = new Date().toDateString();
    return new Date(c.received_time).toDateString() === today;
  }).length;

  const pendingPickup = couriers.filter(c => c.status === 'pending').length;

  const deliveredToday = couriers.filter(c => {
    const today = new Date().toDateString();
    return c.status === 'delivered' &&
           c.delivered_time &&
           new Date(c.delivered_time).toDateString() === today;
  }).length;

  const thisWeekTotal = couriers.filter(c => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(c.received_time) >= weekAgo;
  }).length;

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
              <Package className="w-8 h-8 text-orange-600" />
              All Couriers
            </h1>
            <p className="text-gray-600 mt-1">Track incoming deliveries</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            + Log Courier
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <BoxIcon className="w-5 h-5 text-blue-600" />
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
            <div className="text-sm text-gray-600">Pending Pickup</div>
          </div>
          <div className="text-4xl font-bold text-orange-600">{pendingPickup}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-sm text-gray-600">Delivered Today</div>
          </div>
          <div className="text-4xl font-bold text-green-600">{deliveredToday}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
          <div className="text-4xl font-bold text-purple-600">{thisWeekTotal}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by recipient or tracking..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'pending', 'delivered'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredCouriers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No couriers found</td>
                </tr>
              ) : (
                filteredCouriers.map((courier) => (
                  <tr key={courier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">{courier.tracking_number}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{courier.recipient_name}</div>
                      <div className="text-sm text-gray-500 capitalize">{courier.recipient_type}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{courier.courier_company}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(courier.received_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        courier.status === 'pending'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {courier.status === 'pending' ? 'Pending' : 'Delivered'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {courier.status === 'pending' ? (
                        <button
                          onClick={() => handleMarkDelivered(courier.id)}
                          disabled={markDeliveredMutation.isPending}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {markDeliveredMutation.isPending ? 'Updating...' : 'Mark Delivered'}
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

      <CourierLogModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
