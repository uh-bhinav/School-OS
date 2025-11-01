import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';

export function TeachersPanel({ schoolId }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    phone_number: '',
    subject_specialization: '',
    department: '',
    role_name: 'Teacher'
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!schoolId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await api.get(`/teachers/school/${schoolId}`).catch(() => []);
        if (mounted) {
          setTeachers(Array.isArray(data) ? data : []);
          if (!Array.isArray(data)) {
            console.warn('Teachers endpoint returned non-array:', data);
          }
        }
      } catch (e) {
        const errorMessage = e?.message || e?.toString() || 'Failed to load teachers';
        setError(errorMessage);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [schoolId]);

  const resetForm = () => {
    setForm({ 
      first_name: '', 
      last_name: '', 
      email: '', 
      phone_number: '',
      subject_specialization: '',
      department: '',
      role_name: 'Teacher'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!schoolId) {
      setError('School ID is required');
      return;
    }
    try {
      // Use user invite endpoint for teachers
      const inviteData = {
        email: form.email,
        school_id: schoolId,
        first_name: form.first_name,
        last_name: form.last_name,
        role_name: form.role_name || 'Teacher',
        phone_number: form.phone_number || null,
      };
      const invited = await api.post('/users/invite', inviteData);
      
      // After user is created, wait a moment for the teacher record to be created, then refresh
      if (schoolId) {
        // Wait a bit for the backend to create the teacher record
        setTimeout(async () => {
          try {
            const data = await api.get(`/teachers/school/${schoolId}`).catch(() => []);
            setTeachers(Array.isArray(data) ? data : []);
          } catch (e) {
            console.error('Failed to refresh teachers:', e);
          }
        }, 500);
        
        // Also try immediate refresh in case it's fast
        const data = await api.get(`/teachers/school/${schoolId}`).catch(() => []);
        setTeachers(Array.isArray(data) ? data : []);
      }
      resetForm();
    } catch (e) {
      const errorMessage = e?.message || e?.toString() || 'Failed to invite teacher';
      setError(errorMessage);
    }
  };

  const fullName = (t) => {
    if (t.profile) {
      return `${t.profile.first_name || ''} ${t.profile.last_name || ''}`.trim() || 'Unknown';
    }
    return `${t.first_name || ''} ${t.last_name || ''}`.trim() || 'Unknown';
  };

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
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200"
        >
          <h3 className="font-semibold mb-3">{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h3>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <input
              className="border rounded-lg px-3 py-2 bg-white"
              placeholder="First name *"
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              required
            />
            <input
              className="border rounded-lg px-3 py-2 bg-white"
              placeholder="Last name *"
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              required
            />
            <input
              className="border rounded-lg px-3 py-2 bg-white sm:col-span-2"
              placeholder="Email *"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <input
              className="border rounded-lg px-3 py-2 bg-white"
              placeholder="Phone number"
              value={form.phone_number}
              onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
            />
            <input
              className="border rounded-lg px-3 py-2 bg-white"
              placeholder="Subject Specialization"
              value={form.subject_specialization}
              onChange={(e) => setForm((f) => ({ ...f, subject_specialization: e.target.value }))}
            />
            <input
              className="border rounded-lg px-3 py-2 bg-white"
              placeholder="Department"
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            />
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={resetForm}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm shadow-md"
            >
              {editingId ? 'Update' : 'Add'} Teacher
            </motion.button>
          </div>
        </motion.form>
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
                <th className="px-2">ID</th>
                <th className="px-2">Name</th>
                <th className="px-2">Subject</th>
                <th className="px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.teacher_id} className="bg-white">
                  <td className="px-2 py-2 font-medium">#{t.teacher_id}</td>
                  <td className="px-2 py-2 font-medium">{fullName(t)}</td>
                  <td className="px-2 py-2">{t.subject_specialization || '—'}</td>
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

