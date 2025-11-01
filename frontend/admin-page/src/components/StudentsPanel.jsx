import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';

export function StudentsPanel() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [editingId, setEditingId] = useState(null);

  const fullName = (s) => `${s.first_name || ''} ${s.last_name || ''}`.trim();

  const sorted = useMemo(
    () => [...students].sort((a, b) => fullName(a).localeCompare(fullName(b))),
    [students]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await api.get('/students').catch(() => []);
        if (mounted) {
          setStudents(Array.isArray(data) ? data : []);
          if (!Array.isArray(data)) {
            console.warn('Students endpoint returned non-array:', data);
          }
        }
      } catch (e) {
        const errorMessage = e?.message || e?.toString() || 'Failed to load students';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const resetForm = () => setForm({ first_name: '', last_name: '', email: '', password: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        const updated = await api.put(`/students/${editingId}`, form);
        setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        setEditingId(null);
      } else {
        const created = await api.post('/students', form);
        setStudents((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (e) {
      const errorMessage = e?.message || e?.toString() || 'Failed to save student';
      setError(errorMessage);
    }
  };

  const onEdit = (s) => {
    setEditingId(s.id);
    setForm({ first_name: s.first_name || '', last_name: s.last_name || '', email: s.email || '', password: '' });
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      const errorMessage = e?.message || e?.toString() || 'Failed to delete student';
      setError(errorMessage);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Students</h2>
        {loading && <span className="text-sm text-slate-500">Loading…</span>}
      </div>
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
      )}

      <form onSubmit={onSubmit} className="grid gap-3 grid-cols-1 sm:grid-cols-2 mb-6">
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="First name"
          value={form.first_name}
          onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
          required
        />
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Last name"
          value={form.last_name}
          onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
          required
        />
        <input
          className="border rounded-lg px-3 py-2 sm:col-span-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          className="border rounded-lg px-3 py-2 sm:col-span-2"
          placeholder="Password (new only)"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          minLength={6}
        />
        <motion.button whileTap={{ scale: 0.98 }} className="sm:col-span-2 rounded-lg bg-slate-900 text-white px-4 py-2 font-semibold">
          {editingId ? 'Update Student' : 'Add Student'}
        </motion.button>
      </form>

      <div className="overflow-auto -mx-2 sm:mx-0">
        <table className="min-w-full text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="px-2">Name</th>
              <th className="px-2">Email</th>
              <th className="px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.id} className="bg-white">
                <td className="px-2 py-2 font-medium">{fullName(s)}</td>
                <td className="px-2 py-2">{s.email}</td>
                <td className="px-2 py-2 space-x-2">
                  <button className="text-blue-600 font-semibold" onClick={() => onEdit(s)}>Edit</button>
                  <button className="text-red-600 font-semibold" onClick={() => onDelete(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


