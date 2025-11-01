import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';

export function ExamsPanel({ schoolId }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!schoolId) {
      setLoading(false);
      return;
    }
    
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api.get(`/exams/all/${schoolId}`).catch(() => []);
        if (mounted) setExams(Array.isArray(data) ? data : []);
      } catch (e) {
        const errorMessage = e?.message || e?.toString() || 'Failed to load exams';
        setError(errorMessage);
        setExams([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [schoolId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Exams & Results</h2>
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-shadow"
        >
          + Create Exam
        </motion.button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
      )}

      {loading && exams.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">Loading exams...</div>
      ) : exams.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">No exams found</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600 border-b border-slate-200">
                <th className="px-2 py-3">Exam Name</th>
                <th className="px-2 py-3">Class</th>
                <th className="px-2 py-3">Subject</th>
                <th className="px-2 py-3">Date</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id || exam.exam_id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-2 py-3 font-medium">{exam.name || exam.exam_name || 'Untitled Exam'}</td>
                  <td className="px-2 py-3">{exam.class_name || '—'}</td>
                  <td className="px-2 py-3">{exam.subject_name || '—'}</td>
                  <td className="px-2 py-3">{formatDate(exam.exam_date || exam.date)}</td>
                  <td className="px-2 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      exam.status === 'Published' ? 'bg-green-100 text-green-700' :
                      exam.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {exam.status || 'Scheduled'}
                    </span>
                  </td>
                  <td className="px-2 py-3 space-x-2">
                    <button className="text-blue-600 font-semibold text-xs">View</button>
                    <button className="text-green-600 font-semibold text-xs">Results</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

