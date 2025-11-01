import { useState, useRef, useEffect } from 'react';
import { BellIcon, MagnifyingGlassIcon, ChevronDownIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api.js';

export function Topbar({ currentUser, loading }) {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);
  const notifRef = useRef(null);
  
  useEffect(() => {
    const onClick = (e) => { 
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotificationsOpen(false);
    };
    window.addEventListener('click', onClick); 
    return () => window.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch notifications - using announcements as notifications for now
        const announcements = await api.get('/announcements').catch(() => []);
        if (mounted && Array.isArray(announcements)) {
          const notifs = announcements
            .slice(0, 5)
            .map(a => ({
              id: a.id,
              message: a.title || a.content || 'New announcement',
              time: a.created_at || a.published_at,
            }))
            .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
          setNotifications(notifs);
        }
      } catch (e) {
        console.warn('Failed to load notifications:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);
  
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    const loginUrl = window.location.origin.replace(/\/admin-page\/?$/, '') + '/login-page/';
    window.location.href = loginUrl;
  };

  // Get display name from profile
  const getDisplayName = () => {
    if (loading) return 'Loading...';
    if (!currentUser) {
      // Check if we have a token but profile failed to load
      const token = localStorage.getItem('auth_token');
      if (token) return 'Loading...';
      return 'User';
    }
    
    const fullName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();
    if (fullName) return fullName;
    
    // If no name, try to get role name
    if (currentUser.roles && currentUser.roles.length > 0) {
      const roleName = currentUser.roles[0]?.role_definition?.role_name || currentUser.roles[0]?.role_name;
      if (roleName) return roleName;
    }
    
    return 'User';
  };

  const displayName = getDisplayName();
  
  // Email is not in profile - it's in auth user, so we'll show role or user ID
  const getDisplaySubtext = () => {
    if (loading) return 'Loading profile...';
    if (!currentUser) {
      const token = localStorage.getItem('auth_token');
      if (token) return 'Fetching...';
      return 'Not logged in';
    }
    
    // Try to get role name
    if (currentUser.roles && currentUser.roles.length > 0) {
      const roleName = currentUser.roles[0]?.role_definition?.role_name || currentUser.roles[0]?.role_name;
      if (roleName) return roleName;
    }
    
    // Fallback to user ID
    if (currentUser.user_id) {
      return `ID: ${String(currentUser.user_id).slice(0, 8)}...`;
    }
    
    return 'Administrator';
  };

  const displaySubtext = getDisplaySubtext();
  
  // Generate initials from name or use first letter of role
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 
                   (displaySubtext !== 'Loading...' && displaySubtext !== 'Fetching...' ? displaySubtext.charAt(0).toUpperCase() : 'U') || 'U';

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
      <div className="max-w-full px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:border-orange-400 bg-white/80 backdrop-blur transition-all placeholder:text-slate-400"
              placeholder="Search students, teachers, classes..."
              onChange={(e) => {/* hook search */}}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 pl-4">
          <div className="relative" ref={notifRef}>
            <motion.button 
              whileTap={{ scale: 0.95 }} 
              className="relative p-2.5 rounded-xl hover:bg-slate-100/70 text-slate-600 transition-colors" 
              onClick={() => setNotificationsOpen((v)=>!v)} 
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 inline-block w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </motion.button>
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -6 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-2 w-64 card overflow-hidden shadow-xl z-50"
                >
                  <div className="px-3 py-2.5 border-b border-slate-100 text-sm font-semibold bg-gradient-to-r from-orange-50 to-fuchsia-50">Notifications</div>
                  <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="px-3 py-2.5 text-sm text-slate-500 text-center">No notifications</li>
                    ) : (
                      notifications.map((notif) => (
                        <li key={notif.id} className="px-3 py-2.5 text-sm hover:bg-slate-50 cursor-pointer transition-colors">
                          {notif.message} • {formatTimeAgo(notif.time)}
                        </li>
                      ))
                    )}
                  </ul>
                  <button className="w-full text-sm font-semibold text-orange-600 hover:bg-orange-50 py-2.5 transition-colors">View all</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative" ref={ref}>
            <motion.button 
              whileTap={{ scale: 0.98 }} 
              onClick={() => setOpen((v)=>!v)} 
              className="flex items-center gap-2 pl-3 pr-2 py-1.5 border border-slate-200 rounded-full hover:bg-slate-50/70 transition-all shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white grid place-content-center text-xs font-bold shadow-md">
                {initials}
              </div>
              <div className="hidden sm:block text-left mr-1">
                <div className="text-xs font-semibold text-slate-800 leading-4">{displayName}</div>
                <div className="text-[10px] text-slate-500 leading-3">{displaySubtext}</div>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-slate-400" />
            </motion.button>
            <AnimatePresence>
              {open && (
                <motion.div 
                  initial={{ opacity: 0, y: -6 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-2 w-56 card overflow-hidden shadow-xl z-50"
                >
                  <div className="px-3 py-2.5 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-fuchsia-50">
                    <div className="text-sm font-semibold text-slate-800">{displayName}</div>
                    {displaySubtext && (
                      <div className="text-xs text-slate-600 mt-0.5">{displaySubtext}</div>
                    )}
                    {currentUser?.school_id && (
                      <div className="text-xs text-slate-500 mt-1">School ID: {currentUser.school_id}</div>
                    )}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
