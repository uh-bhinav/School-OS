import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';

export function AttendancePanel({ schoolId }) {
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('overall'); // 'overall' or 'daily'
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceHistory, setAttendanceHistory] = useState([]); // For graph

  // Fetch classes
  useEffect(() => {
    if (!schoolId) return;
    let mounted = true;
    (async () => {
      try {
        // Try /classes first (like StudentsPanel), then fallback
        let data = await api.get('/classes').catch(() => null);
        if (!data || !Array.isArray(data) || data.length === 0) {
          data = await api.get(`/classes/school/${schoolId}`).catch(() => []);
        }
        if (mounted) {
          setClasses(Array.isArray(data) ? data : []);
          if (data && data.length > 0 && !selectedClass) {
            setSelectedClass(data[0].class_id);
          }
        }
      } catch (e) {
        console.error('Failed to load classes:', e);
      }
    })();
    return () => { mounted = false; };
  }, [schoolId]);

  // Fetch attendance - overall or by date
  useEffect(() => {
    if (!schoolId) {
      setAttendance([]);
      setLoading(false);
      return;
    }
    
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        
        if (viewMode === 'overall') {
          // Fetch all attendance records for selected class or all classes
          if (selectedClass) {
            // Get attendance for last 30 days for the selected class
            const endDate = new Date();
            const startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 30);
            
            const allAttendance = await api.get(
              `/attendance-records/class/${selectedClass}/range?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
            ).catch(() => []);
            
            if (mounted) {
              setAttendance(Array.isArray(allAttendance) ? allAttendance : []);
              
              // Group by date for graph
              const grouped = {};
              (Array.isArray(allAttendance) ? allAttendance : []).forEach(record => {
                const recordDate = record.date || record.attendance_date;
                if (!grouped[recordDate]) {
                  grouped[recordDate] = { present: 0, absent: 0, late: 0, total: 0 };
                }
                const status = record.status || 'Absent';
                if (status === 'Present') grouped[recordDate].present++;
                else if (status === 'Late') grouped[recordDate].late++;
                else grouped[recordDate].absent++;
                grouped[recordDate].total++;
              });
              
              // Get last 7 days for graph
              const graphData = Object.entries(grouped)
                .filter(([d]) => {
                  const recordDate = new Date(d);
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                  return recordDate >= sevenDaysAgo;
                })
                .sort(([a], [b]) => new Date(a) - new Date(b))
                .map(([date, stats]) => ({ date, ...stats }));
              
              setAttendanceHistory(graphData);
            }
          } else {
            // No class selected - fetch all students' attendance
            const students = await api.get('/students').catch(() => []);
            if (mounted && Array.isArray(students) && students.length > 0) {
              const allAttendancePromises = students.slice(0, 10).map(s => 
                api.get(`/attendance-records/?student_id=${s.student_id || s.id}&start_date=${new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]}&end_date=${new Date().toISOString().split('T')[0]}`).catch(() => [])
              );
              const results = await Promise.allSettled(allAttendancePromises);
              const allRecords = results
                .filter(r => r.status === 'fulfilled')
                .flatMap(r => Array.isArray(r.value) ? r.value : []);
              
              setAttendance(allRecords);
              
              // Group for graph
              const grouped = {};
              allRecords.forEach(record => {
                const recordDate = record.date || record.attendance_date;
                if (!grouped[recordDate]) {
                  grouped[recordDate] = { present: 0, absent: 0, late: 0, total: 0 };
                }
                const status = record.status || 'Absent';
                if (status === 'Present') grouped[recordDate].present++;
                else if (status === 'Late') grouped[recordDate].late++;
                else grouped[recordDate].absent++;
                grouped[recordDate].total++;
              });
              
              const graphData = Object.entries(grouped)
                .filter(([d]) => {
                  const recordDate = new Date(d);
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                  return recordDate >= sevenDaysAgo;
                })
                .sort(([a], [b]) => new Date(a) - new Date(b))
                .map(([date, stats]) => ({ date, ...stats }));
              
              setAttendanceHistory(graphData);
            }
          }
        } else {
          // Daily view - fetch for specific date
          if (selectedClass) {
            const classAttendance = await api.get(
              `/attendance-records/class/${selectedClass}/range?start_date=${date}&end_date=${date}`
            ).catch(() => []);
            
            if (mounted) {
              setAttendance(Array.isArray(classAttendance) ? classAttendance : []);
              
              // For daily view, get last 7 days for graph
              const endDate = new Date(date);
              const startDate = new Date(endDate);
              startDate.setDate(startDate.getDate() - 6);
              
              const historyData = await api.get(
                `/attendance-records/class/${selectedClass}/range?start_date=${startDate.toISOString().split('T')[0]}&end_date=${date}`
              ).catch(() => []);
              
              if (Array.isArray(historyData)) {
                const grouped = {};
                historyData.forEach(record => {
                  const recordDate = record.date || record.attendance_date;
                  if (!grouped[recordDate]) {
                    grouped[recordDate] = { present: 0, absent: 0, late: 0, total: 0 };
                  }
                  const status = record.status || 'Absent';
                  if (status === 'Present') grouped[recordDate].present++;
                  else if (status === 'Late') grouped[recordDate].late++;
                  else grouped[recordDate].absent++;
                  grouped[recordDate].total++;
                });
                setAttendanceHistory(Object.entries(grouped)
                  .sort(([a], [b]) => new Date(a) - new Date(b))
                  .map(([date, stats]) => ({ date, ...stats })));
              }
            }
          } else {
            setAttendance([]);
          }
        }
      } catch (e) {
        const errorMessage = e?.message || e?.toString() || 'Failed to load attendance';
        setError(errorMessage);
        setAttendance([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [date, schoolId, selectedClass, viewMode]);

  const stats = {
    present: attendance.filter(a => a.status === 'Present').length,
    absent: attendance.filter(a => a.status === 'Absent').length,
    late: attendance.filter(a => a.status === 'Late').length,
    total: attendance.length,
  };

  // Calculate max value for graph scaling
  const maxValue = attendanceHistory.length > 0 
    ? Math.max(...attendanceHistory.map(d => Math.max(d.present, d.absent, d.late, 1)))
    : 1;

  return (
    <div className="space-y-6">
      {/* Date Selector and Class Selector */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-semibold">Attendance Tracking</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-sm font-medium"
            >
              <option value="overall">Overall</option>
              <option value="daily">Daily View</option>
            </select>
            {viewMode === 'daily' && (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
              />
            )}
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-sm font-medium"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  Grade {cls.grade_level} - Section {cls.section}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-4 mb-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 rounded-lg border border-green-200"
          >
            <div className="text-sm text-green-700 mb-1">Present</div>
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-red-50 rounded-lg border border-red-200"
          >
            <div className="text-sm text-red-700 mb-1">Absent</div>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-orange-50 rounded-lg border border-orange-200"
          >
            <div className="text-sm text-orange-700 mb-1">Late</div>
            <div className="text-2xl font-bold text-orange-600">{stats.late}</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div className="text-sm text-slate-700 mb-1">Total</div>
            <div className="text-2xl font-bold text-slate-600">{stats.total}</div>
          </motion.div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
        )}
      </div>

      {/* Attendance Graph */}
      {attendanceHistory.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Attendance Trend (Last 7 Days)</h3>
          <div className="h-64 flex items-end gap-2">
            {attendanceHistory.map((day, index) => {
              const dateObj = new Date(day.date);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNumber = dateObj.getDate();
              const presentHeight = maxValue > 0 ? (day.present / maxValue) * 240 : 0;
              const absentHeight = maxValue > 0 ? (day.absent / maxValue) * 240 : 0;
              const lateHeight = maxValue > 0 ? (day.late / maxValue) * 240 : 0;
              
              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div className="w-full h-60 flex flex-col justify-end gap-0.5 relative">
                    {/* Stacked bars */}
                    {presentHeight > 0 && (
                      <div
                        className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600 hover:shadow-md"
                        style={{ height: `${presentHeight}px`, minHeight: presentHeight > 0 ? '2px' : '0' }}
                        title={`Present: ${day.present}`}
                      />
                    )}
                    {lateHeight > 0 && (
                      <div
                        className="w-full bg-orange-500 transition-all hover:bg-orange-600 hover:shadow-md"
                        style={{ height: `${lateHeight}px`, minHeight: lateHeight > 0 ? '2px' : '0' }}
                        title={`Late: ${day.late}`}
                      />
                    )}
                    {absentHeight > 0 && (
                      <div
                        className="w-full bg-red-500 rounded-b transition-all hover:bg-red-600 hover:shadow-md"
                        style={{ height: `${absentHeight}px`, minHeight: absentHeight > 0 ? '2px' : '0' }}
                        title={`Absent: ${day.absent}`}
                      />
                    )}
                    {day.total === 0 && (
                      <div className="w-full h-1 bg-slate-200 rounded" />
                    )}
                  </div>
                  <div className="text-xs text-slate-600 font-medium text-center">
                    <div>{dayName}</div>
                    <div className="text-xs text-slate-500">{dayNumber}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-xs text-slate-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span className="text-xs text-slate-600">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span className="text-xs text-slate-600">Absent</span>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Attendance Records {viewMode === 'overall' ? '(Last 30 Days)' : `(${new Date(date).toLocaleDateString()})`}</h2>
        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading attendance...</div>
        ) : !schoolId ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Please wait while loading school information...
          </div>
        ) : attendance.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            <p className="mb-2">No attendance records found</p>
            <p className="text-xs text-slate-400">Attendance records will appear here once created</p>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600 border-b border-slate-200">
                  <th className="px-2 py-3">Student</th>
                  <th className="px-2 py-3">Class</th>
                  <th className="px-2 py-3">Date</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 100).map((record, index) => (
                  <tr key={record.id || record.attendance_id || index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-2 py-3 font-medium">
                      {record.student?.profile?.first_name && record.student?.profile?.last_name
                        ? `${record.student.profile.first_name} ${record.student.profile.last_name}`
                        : record.student_name || 'Unknown'}
                    </td>
                    <td className="px-2 py-3">
                      {record.class_record 
                        ? `G${record.class_record.grade_level}-${record.class_record.section}`
                        : record.class_name || '—'}
                    </td>
                    <td className="px-2 py-3 text-slate-600">
                      {(record.date || record.attendance_date) ? new Date(record.date || record.attendance_date).toLocaleDateString() : '—'}
                    </td>
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
                      {record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : 
                       record.attendance_time ? record.attendance_time : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {attendance.length > 100 && (
              <div className="text-center py-4 text-sm text-slate-500">
                Showing first 100 of {attendance.length} records
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
