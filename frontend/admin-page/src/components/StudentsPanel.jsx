import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';

export function StudentsPanel() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    password: '',
    phone_number: '',
    current_class_id: '',
    enrollment_date: '',
    date_of_birth: '',
    gender: '',
    roll_number: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const fullName = (s) => {
    if (s.profile) {
      return `${s.profile.first_name || ''} ${s.profile.last_name || ''}`.trim();
    }
    return `${s.first_name || ''} ${s.last_name || ''}`.trim();
  };

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
        const [studentsData, classesData, userData] = await Promise.all([
          api.get('/students').catch(() => []),
          api.get('/classes').catch(() => []),
          api.get('/profiles/me').catch(() => null)
        ]);
        if (mounted) {
          setStudents(Array.isArray(studentsData) ? studentsData : []);
          setClasses(Array.isArray(classesData) ? classesData : []);
          setCurrentUser(userData);
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

  const resetForm = () => setForm({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    password: '',
    phone_number: '',
    current_class_id: '',
    enrollment_date: '',
    date_of_birth: '',
    gender: '',
    roll_number: ''
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!currentUser?.school_id) {
      setError('School ID is required');
      return;
    }
    try {
      if (editingId) {
        const updated = await api.put(`/students/${editingId}`, form);
        setStudents((prev) => prev.map((s) => ((s.student_id || s.id) === updated.student_id ? updated : s)));
        setEditingId(null);
      } else {
        const studentData = {
          ...form,
          school_id: currentUser.school_id,
          current_class_id: parseInt(form.current_class_id) || null,
          enrollment_date: form.enrollment_date || new Date().toISOString().split('T')[0],
          date_of_birth: form.date_of_birth || null,
        };
        const created = await api.post('/students', studentData);
        setStudents((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (e) {
      const errorMessage = e?.message || e?.toString() || 'Failed to save student';
      setError(errorMessage);
    }
  };

  const onEdit = (s) => {
    const studentId = s.student_id || s.id;
    setEditingId(studentId);
    const firstName = s.profile?.first_name || s.first_name || '';
    const lastName = s.profile?.last_name || s.last_name || '';
    const email = s.profile?.email || s.email || '';
    setForm({ first_name: firstName, last_name: lastName, email: email, password: '' });
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => (s.student_id || s.id) !== id));
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
          placeholder="First name *"
          value={form.first_name}
          onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
          required
        />
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Last name *"
          value={form.last_name}
          onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
          required
        />
        <input
          className="border rounded-lg px-3 py-2 sm:col-span-2"
          placeholder="Email *"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        {!editingId && (
          <input
            className="border rounded-lg px-3 py-2 sm:col-span-2"
            placeholder="Password *"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            minLength={6}
            required
          />
        )}
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Phone number"
          type="tel"
          value={form.phone_number}
          onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
        />
        <select
          className="border rounded-lg px-3 py-2"
          value={form.current_class_id}
          onChange={(e) => setForm((f) => ({ ...f, current_class_id: e.target.value }))}
          required
        >
          <option value="">Select Class *</option>
          {classes.map((c) => (
            <option key={c.class_id || c.id} value={c.class_id || c.id}>
              {c.class_name || c.name || `Class ${c.class_id || c.id}`}
            </option>
          ))}
        </select>
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Enrollment Date *"
          type="date"
          value={form.enrollment_date}
          onChange={(e) => setForm((f) => ({ ...f, enrollment_date: e.target.value }))}
          required
        />
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Date of Birth"
          type="date"
          value={form.date_of_birth}
          onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
        />
        <select
          className="border rounded-lg px-3 py-2"
          value={form.gender}
          onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Roll Number"
          value={form.roll_number}
          onChange={(e) => setForm((f) => ({ ...f, roll_number: e.target.value }))}
        />
        <motion.button type="submit" whileTap={{ scale: 0.98 }} className="sm:col-span-2 rounded-lg bg-slate-900 text-white px-4 py-2 font-semibold">
          {editingId ? 'Update Student' : 'Add Student'}
        </motion.button>
      </form>

      <div className="overflow-auto -mx-2 sm:mx-0">
        <table className="min-w-full text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="px-2">ID</th>
              <th className="px-2">Name</th>
              <th className="px-2">Phone Number</th>
              <th className="px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => {
              const studentId = s.student_id || s.id;
              const phoneNumber = s.profile?.phone_number || s.phone_number || '—';
              return (
                <tr key={studentId} className="bg-white">
                  <td className="px-2 py-2 font-medium">#{studentId}</td>
                  <td className="px-2 py-2 font-medium">{fullName(s) || 'Unknown'}</td>
                  <td className="px-2 py-2">{phoneNumber}</td>
                  <td className="px-2 py-2 space-x-2">
                    <button className="text-blue-600 font-semibold" onClick={() => onEdit(s)}>Edit</button>
                    <button className="text-red-600 font-semibold" onClick={() => onDelete(studentId)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


