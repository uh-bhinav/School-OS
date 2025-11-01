import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';

export function TimetablePanel({ schoolId }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userData = await api.get('/profiles/me').catch(() => null);
        if (mounted) {
          setCurrentUser(userData);
        }
      } catch (e) {
        console.error('Failed to load user profile:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!schoolId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        // Try /classes first (like StudentsPanel), then fallback to school-specific endpoint
        let data = await api.get('/classes').catch(() => null);
        if (!data || !Array.isArray(data) || data.length === 0) {
          // Fallback to school-specific endpoint
          data = await api.get(`/classes/school/${schoolId}`).catch(() => []);
        }
        if (mounted) {
          setClasses(Array.isArray(data) ? data : []);
          if (data && data.length > 0 && !selectedClass) {
            setSelectedClass(data[0].class_id);
          }
        }
      } catch (e) {
        const errorMessage = e?.message || e?.toString() || 'Failed to load classes';
        setError(errorMessage);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [schoolId, currentUser]);

  useEffect(() => {
    if (!selectedClass) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await api.get(`/timetable/classes/${selectedClass}`).catch(() => []);
        if (mounted) {
          setTimetable(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        const errorMessage = e?.message || e?.toString() || 'Failed to load timetable';
        setError(errorMessage);
        setTimetable([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedClass]);

  // Group timetable by day and period
  const groupedTimetable = {};
  timetable.forEach(entry => {
    const day = entry.day_of_week || 1;
    if (!groupedTimetable[day]) {
      groupedTimetable[day] = {};
    }
    const periodId = entry.period_id || entry.period?.period_id;
    groupedTimetable[day][periodId] = entry;
  });

  // Get all periods from timetable entries
  const allPeriods = [...new Set(timetable.map(e => {
    const period = e.period;
    return period ? { id: period.period_id || period.id, start_time: period.start_time, end_time: period.end_time, name: period.name || period.period_name } : null;
  }).filter(Boolean))].sort((a, b) => {
    if (a.start_time && b.start_time) {
      return a.start_time.localeCompare(b.start_time);
    }
    return (a.id || 0) - (b.id || 0);
  });

  const getClassName = () => {
    const cls = classes.find(c => c.class_id === selectedClass);
    if (!cls) return 'Select Class';
    return `Grade ${cls.grade_level || ''} - Section ${cls.section || ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header and Class Selector */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Timetable</h2>
            <p className="text-sm text-slate-600">View and manage class schedules</p>
          </div>
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-slate-400" />
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white font-medium"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  Grade {cls.grade_level} - Section {cls.section}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
        )}
      </div>

      {/* Timetable Grid */}
      {loading ? (
        <div className="card p-12">
          <div className="text-center text-slate-500">Loading timetable...</div>
        </div>
      ) : !selectedClass ? (
        <div className="card p-12">
          <div className="text-center text-slate-500">
            <ClockIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Select a class to view timetable</p>
          </div>
        </div>
      ) : timetable.length === 0 ? (
        <div className="card p-12">
          <div className="text-center text-slate-500">
            <p className="font-medium mb-2">No timetable found for {getClassName()}</p>
            <p className="text-sm text-slate-400">Timetable entries will appear here once created</p>
          </div>
        </div>
      ) : (
        <div className="card p-6 overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-gradient-to-r from-orange-50 to-fuchsia-50 px-4 py-3 text-left text-xs font-semibold text-slate-700 border border-slate-200">
                    Period
                  </th>
                  {daysOfWeek.map((day, index) => (
                    <th key={day} className="px-4 py-3 text-center text-xs font-semibold text-slate-700 border border-slate-200 bg-gradient-to-b from-slate-50 to-white">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPeriods.map((period) => (
                  <tr key={period.id}>
                    <td className="sticky left-0 z-10 bg-gradient-to-r from-orange-50 to-fuchsia-50 px-4 py-3 text-xs font-medium text-slate-700 border border-slate-200">
                      <div className="font-semibold">{period.name || `Period ${period.id}`}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {period.start_time ? new Date(`2000-01-01T${period.start_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                        {period.start_time && period.end_time ? ' - ' : ''}
                        {period.end_time ? new Date(`2000-01-01T${period.end_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                      </div>
                    </td>
                    {daysOfWeek.map((day, dayIndex) => {
                      const dayNum = dayIndex + 1;
                      const entry = groupedTimetable[dayNum]?.[period.id];
                      return (
                        <td key={`${day}-${period.id}`} className="px-4 py-3 border border-slate-200 text-center">
                          {entry ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200 hover:shadow-md transition-shadow"
                            >
                              <div className="font-semibold text-sm text-blue-900 mb-1">
                                {entry.subject?.subject_name || entry.subject?.name || 'Subject'}
                              </div>
                              {entry.teacher?.profile && (
                                <div className="text-xs text-blue-700 mt-1">
                                  {entry.teacher.profile.first_name} {entry.teacher.profile.last_name}
                                </div>
                              )}
                              {entry.class_record && (
                                <div className="text-xs text-blue-600 mt-1">
                                  G{entry.class_record.grade_level}-{entry.class_record.section}
                                </div>
                              )}
                            </motion.div>
                          ) : (
                            <div className="text-slate-300 text-xs">—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

