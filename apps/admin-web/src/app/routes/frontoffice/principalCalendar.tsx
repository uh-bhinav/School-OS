import { useState } from 'react';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'meeting' | 'appointment' | 'blocked';
  startTime: string;
  endTime: string;
  attendees?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export default function PrincipalCalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  // Mock events - Replace with actual API call
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Parent Meeting - Mrs. Sunita Das',
      type: 'appointment',
      startTime: '09:30 AM',
      endTime: '10:00 AM',
      attendees: 'Mrs. Sunita Das',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Staff Meeting',
      type: 'meeting',
      startTime: '11:00 AM',
      endTime: '12:00 PM',
      status: 'confirmed',
    },
    {
      id: '3',
      title: 'Lunch Break',
      type: 'blocked',
      startTime: '01:00 PM',
      endTime: '02:00 PM',
      status: 'confirmed',
    },
    {
      id: '4',
      title: 'Parent Meeting - Mr. Rajesh Sharma',
      type: 'appointment',
      startTime: '02:30 PM',
      endTime: '03:00 PM',
      attendees: 'Mr. Rajesh Sharma',
      status: 'confirmed',
    },
  ];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const getEventColor = (type: string, status: string) => {
    if (status === 'pending') return 'bg-orange-100 border-orange-300 text-orange-900';
    if (status === 'cancelled') return 'bg-red-100 border-red-300 text-red-900';
    if (type === 'meeting') return 'bg-blue-100 border-blue-300 text-blue-900';
    if (type === 'blocked') return 'bg-gray-100 border-gray-300 text-gray-900';
    return 'bg-green-100 border-green-300 text-green-900';
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-8 h-8 text-purple-600" />
              Principal's Calendar
            </h1>
            <p className="text-gray-600 mt-1">View complete schedule and availability</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'day'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'week'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">
              {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
                ...(viewMode === 'day' && { day: 'numeric', weekday: 'long' })
              })}
            </h2>
          </div>

          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
            <span className="text-sm text-gray-600">Confirmed Appointment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300"></div>
            <span className="text-sm text-gray-600">Pending Approval</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
            <span className="text-sm text-gray-600">Meeting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
            <span className="text-sm text-gray-600">Blocked/Unavailable</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50">
                  Time
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase min-w-[200px]">
                  Schedule
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {timeSlots.map((time) => {
                const slotEvents = events.filter(e => e.startTime === time);
                return (
                  <tr key={time} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-600 sticky left-0 bg-white">
                      <Clock className="w-4 h-4 inline mr-2" />
                      {time}
                    </td>
                    <td className="px-6 py-4">
                      {slotEvents.length > 0 ? (
                        <div className="space-y-2">
                          {slotEvents.map((event) => (
                            <div
                              key={event.id}
                              className={`p-3 rounded-lg border-l-4 ${getEventColor(event.type, event.status)}`}
                            >
                              <div className="font-medium text-sm">{event.title}</div>
                              <div className="text-xs mt-1">
                                {event.startTime} - {event.endTime}
                              </div>
                              {event.attendees && (
                                <div className="text-xs mt-1">👤 {event.attendees}</div>
                              )}
                              {event.status === 'pending' && (
                                <span className="text-xs bg-orange-200 px-2 py-1 rounded mt-2 inline-block">
                                  ⏳ Pending Approval
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-sm text-gray-400 py-2">
                          Available
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
