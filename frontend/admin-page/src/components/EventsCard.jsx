import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';

export function AnnouncementsCard({ onCreateNew }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshAnnouncements = async () => {
    try {
      setError('');
      const data = await api.get('/announcements').catch(() => []);
      setAnnouncements(Array.isArray(data) ? data.slice(0, 5) : []);
      if (!Array.isArray(data) || data.length === 0) {
        // No error, just no data
        setError('');
      }
    } catch (e) {
      const errorMessage = e?.message || e?.toString() || 'Failed to load announcements';
      setError(errorMessage);
      setAnnouncements([]);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await refreshAnnouncements();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    
    // Refresh announcements every 30 seconds to show new ones
    const interval = setInterval(() => {
      refreshAnnouncements();
    }, 30000);
    
    return () => { 
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getColorClass = (index) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-orange-100 text-orange-700',
      'bg-violet-100 text-violet-700',
      'bg-green-100 text-green-700',
      'bg-pink-100 text-pink-700',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="card-title px-1">Announcements</h2>
        {loading && <span className="text-xs text-slate-400">Loading...</span>}
      </div>
      
      {error && (
        <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      )}

      {!loading && announcements.length === 0 && !error && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No announcements yet
        </div>
      )}

      <div className="space-y-3">
        {announcements.map((announcement, i) => (
          <motion.button 
            key={announcement.id || i} 
            whileTap={{ scale: 0.98 }} 
            whileHover={{ x: 2 }}
            className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-3">
              <span className={`badge ${getColorClass(i)} font-bold shrink-0`}>
                {formatDate(announcement.created_at || announcement.published_at)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 mb-1 line-clamp-1">
                  {announcement.title || 'Untitled Announcement'}
                </div>
                {announcement.content && (
                  <div className="text-xs text-slate-500 line-clamp-2">
                    {typeof announcement.content === 'string' 
                      ? announcement.content 
                      : (announcement.content?.message || announcement.content?.text || JSON.stringify(announcement.content))
                    }
                  </div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      
      <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={() => onCreateNew?.()}
        className="mt-4 w-full text-sm px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-400 hover:bg-orange-50/50 flex items-center justify-center gap-2 font-semibold text-slate-600 hover:text-orange-600 transition-all"
      >
        <span className="text-xl leading-none">＋</span>
        Add New Announcement
      </motion.button>
    </div>
  );
}
