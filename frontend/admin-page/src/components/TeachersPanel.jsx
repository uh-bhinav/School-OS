import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';

export function TeachersPanel({ schoolId }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone_number: '' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!schoolId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api.get(`/teachers/school/${schoolId}`);
        if (mounted) setTeachers(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [schoolId]);

  const resetForm = () => {
    setForm({ first_name: '', last_name: '', email: '', phone_number: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const fullName = (t) => `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Unknown';

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Teachers Management</h2>
        <div className="flex items-center gap-2">
          {loading && <span className="text-sm text-slate-500">Loading…</span>}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-shadow"
          >
            {showForm ? 'Cancel' : '+ Add Teacher'}
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200"
        >
          <h3 className="font-semibold mb-3">{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h3>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <input
              className="border rounded-lg px-3 py-2 bg-white"
              placeholder="First name"
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              required
            />
            <input
              className="border rounded-lg px-3 py-2 bg-white"
              placeholder="Last name"
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              required
            />
            <input
              className="border rounded-lg px-3 py-2 bg-white sm:col-span-2"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <input
              className="border rounded-lg px-3 py-2 bg-white sm:col-span-2"
              placeholder="Phone number"
              value={form.phone_number}
              onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
            />
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={resetForm}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm"
            >
              Cancel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm shadow-md"
            >
              {editingId ? 'Update' : 'Add'} Teacher
            </motion.button>
          </div>
        </motion.div>
      )}

      <div className="overflow-auto -mx-2 sm:mx-0">
        {loading && teachers.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading teachers...</div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No teachers found</div>
        ) : (
          <table className="min-w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="px-2">Name</th>
                <th className="px-2">Email</th>
                <th className="px-2">Phone</th>
                <th className="px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.teacher_id} className="bg-white">
                  <td className="px-2 py-2 font-medium">{fullName(t)}</td>
                  <td className="px-2 py-2">{t.email || '—'}</td>
                  <td className="px-2 py-2">{t.phone_number || '—'}</td>
                  <td className="px-2 py-2 space-x-2">
                    <button className="text-blue-600 font-semibold text-xs">View</button>
                    <button className="text-red-600 font-semibold text-xs">Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

