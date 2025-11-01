import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon, 
  MegaphoneIcon,
  CurrencyDollarIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { api } from '../utils/api.js';

export function ActivityList() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Fetch recent students, payments, announcements, etc.
        const [students, announcements] = await Promise.allSettled([
          api.get('/students').catch(() => []),
          api.get('/announcements').catch(() => []),
        ]);

        const activityList = [];
        
        // Add recent students
        if (students.status === 'fulfilled' && Array.isArray(students.value)) {
          const recentStudents = students.value
            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
            .slice(0, 2)
            .map(s => ({
              icon: AcademicCapIcon,
              color: 'bg-blue-500',
              title: 'New student enrolled',
              subtitle: `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email,
              time: formatTimeAgo(s.created_at),
              type: 'student',
              id: s.id,
            }));
          activityList.push(...recentStudents);
        }

        // Add recent announcements
        if (announcements.status === 'fulfilled' && Array.isArray(announcements.value)) {
          const recentAnnouncements = announcements.value
            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
            .slice(0, 2)
            .map(a => {
              // Handle content that might be a string or object
              const contentText = typeof a.content === 'string' 
                ? a.content 
                : (a.content?.message || a.content?.text || a.title || 'Untitled');
              
              return {
                icon: MegaphoneIcon,
                color: 'bg-orange-500',
                title: 'New announcement',
                subtitle: a.title || contentText || 'Untitled',
                time: formatTimeAgo(a.created_at || a.published_at),
                type: 'announcement',
                id: a.id,
              };
            });
          activityList.push(...recentAnnouncements);
        }

        // Sort by time
        activityList.sort((a, b) => {
          const timeA = parseTimeAgo(a.time);
          const timeB = parseTimeAgo(b.time);
          return timeA - timeB;
        });

        if (mounted) {
          setActivities(activityList.slice(0, 6));
        }
      } catch (e) {
        console.error('Error loading activities:', e);
        // Don't crash - just log the error
        if (mounted) {
          setActivities([]);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
      if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const parseTimeAgo = (timeStr) => {
    if (!timeStr || timeStr === 'Just now') return 0;
    const match = timeStr.match(/(\d+)\s*(min|hour|day)/);
    if (!match) return Infinity;
    const value = parseInt(match[1]);
    const unit = match[2];
    if (unit === 'min') return value;
    if (unit === 'hour') return value * 60;
    if (unit === 'day') return value * 1440;
    return Infinity;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Activities</h2>
        </div>
        <div className="px-4 pb-4 text-center py-8 text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Activities</h2>
        </div>
        <div className="px-4 pb-4 text-center py-8 text-slate-500 text-sm">No recent activities</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Recent Activities</h2>
        <motion.button whileTap={{ scale: 0.96 }} className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium transition-colors">View All</motion.button>
      </div>
      <div className="px-4 pb-4 space-y-2">
        {activities.map((a, i) => {
          const IconComponent = a.icon;
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
              whileHover={{ x: 4 }}
              className="w-full flex items-center gap-3 text-left p-3 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent border border-transparent hover:border-slate-100 transition-all"
              onClick={() => {/* hook: open activity */}}
            >
              <div className={`w-11 h-11 rounded-xl grid place-content-center text-white shadow-md ${a.color}`}>
                {IconComponent && <IconComponent className="w-6 h-6" />}
              </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate text-slate-800">{a.title}</div>
              <div className="text-sm text-slate-500 truncate">{a.subtitle}</div>
            </div>
            <div className="ml-auto text-xs text-slate-400 shrink-0 font-medium">{a.time}</div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
