import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';

export function CommunicationPanel() {
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', target_audience: 'all' });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!currentUser?.school_id) {
      setError('School ID is required');
      return;
    }

    if (!announcementForm.title || !announcementForm.content) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      
      // Map target_audience to announcement targets
      // For now, we'll use SCHOOL target for all, but you can enhance this
      const targets = [{
        target_type: 'SCHOOL',
        target_id: currentUser.school_id
      }];

      const announcementData = {
        school_id: currentUser.school_id,
        title: announcementForm.title,
        content: announcementForm.content,
        targets: targets
      };

      const created = await api.post('/announcements', announcementData);
      
      setSuccess(true);
      setAnnouncementForm({ title: '', content: '', target_audience: 'all' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      const errorMessage = e?.message || e?.toString() || 'Failed to create announcement';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Announcement */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Send Announcement</h2>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
        )}
        {success && (
          <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
            Announcement created successfully!
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input
              type="text"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="Announcement title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
            <textarea
              value={announcementForm.content}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="Announcement content..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
            <select
              value={announcementForm.target_audience}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, target_audience: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="all">All Users</option>
              <option value="students">Students Only</option>
              <option value="parents">Parents Only</option>
              <option value="teachers">Teachers Only</option>
            </select>
          </div>
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-semibold shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Announcement'}
          </motion.button>
        </form>
      </div>

      {/* Recent Communications */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Communications</h2>
        <div className="text-center py-8 text-slate-500 text-sm">
          Communications history will appear here
        </div>
      </div>
    </div>
  );
}

