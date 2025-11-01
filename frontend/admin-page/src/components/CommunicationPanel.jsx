import { useState } from 'react';
import { motion } from 'framer-motion';

export function CommunicationPanel() {
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', target_audience: 'all' });

  return (
    <div className="space-y-6">
      {/* Create Announcement */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Send Announcement</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input
              type="text"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="Announcement title"
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
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            Send Announcement
          </motion.button>
        </div>
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

