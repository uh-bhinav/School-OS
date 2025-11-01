import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';

export function AttendancePanel({ schoolId }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!schoolId) {
      setLoading(false);
      return;
    }
    
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        // Note: Attendance API requires student_id or class_id
        // For now, show message that this requires selecting a class
        // TODO: Add class selector or use bulk endpoint
        if (mounted) setAttendance([]);
      } catch (e) {
        const errorMessage = e?.message || e?.toString() || 'Failed to load attendance';
        setError(errorMessage);
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [date, schoolId]);

  const stats = {
    present: attendance.filter(a => a.status === 'Present').length,
    absent: attendance.filter(a => a.status === 'Absent').length,
    late: attendance.filter(a => a.status === 'Late').length,
    total: attendance.length,
  };

  return (
    <div className="space-y-6">
      {/* Date Selector and Stats */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Attendance Tracking</h2>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-4 mb-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-700 mb-1">Present</div>
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-sm text-red-700 mb-1">Absent</div>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm text-orange-700 mb-1">Late</div>
            <div className="text-2xl font-bold text-orange-600">{stats.late}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-sm text-slate-700 mb-1">Total</div>
            <div className="text-2xl font-bold text-slate-600">{stats.total}</div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
        )}
      </div>

      {/* Attendance Records */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Attendance Records</h2>
        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading attendance...</div>
        ) : !schoolId ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Please wait while loading school information...
          </div>
        ) : attendance.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            <p className="mb-2">No attendance records for {new Date(date).toLocaleDateString()}</p>
            <p className="text-xs text-slate-400">Attendance records require class selection. This feature will be available soon.</p>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600 border-b border-slate-200">
                  <th className="px-2 py-3">Student</th>
                  <th className="px-2 py-3">Class</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-2 py-3 font-medium">
                      {record.student_name || `${record.student?.first_name || ''} ${record.student?.last_name || ''}`.trim() || 'Unknown'}
                    </td>
                    <td className="px-2 py-3">{record.class_name || '—'}</td>
                    <td className="px-2 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'Present' ? 'bg-green-100 text-green-700' :
                        record.status === 'Late' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {record.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-slate-600">
                      {record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

