import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar.jsx';
import { Topbar } from './components/Topbar.jsx';
import { StatCard } from './components/StatCard.jsx';
import { ActivityList } from './components/ActivityList.jsx';
import { AnnouncementsCard } from './components/EventsCard.jsx';
import { QuickActions } from './components/QuickActions.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { StudentsPanel } from './components/StudentsPanel.jsx';
import { TeachersPanel } from './components/TeachersPanel.jsx';
import { AttendancePanel } from './components/AttendancePanel.jsx';
import { ExamsPanel } from './components/ExamsPanel.jsx';
import { FeesPanel } from './components/FeesPanel.jsx';
import { CommunicationPanel } from './components/CommunicationPanel.jsx';
import { AgentBar } from './components/AgentBar.jsx';
import { 
  AcademicCapIcon,
  UserGroupIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { api } from './utils/api.js';
import { config } from './utils/config.js';

export default function App() {
  const [module, setModule] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [stats, setStats] = useState([
    { icon: null, color: 'from-orange-400 to-orange-600', label: 'Total Students', value: '—', trend: '' },
    { icon: null, color: 'from-blue-400 to-blue-600', label: 'Total Teachers', value: '—', trend: '' },
    { icon: null, color: 'from-green-400 to-green-600', label: 'Attendance Rate', value: '—', trend: '' },
    { icon: null, color: 'from-violet-400 to-violet-600', label: 'Revenue (Month)', value: '—', trend: '' },
  ]);

  // Fetch current user profile
  useEffect(() => {
    let mounted = true;
    setUserLoading(true);
    (async () => {
      try {
        // Check if token exists
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.warn('No auth token found');
          if (mounted) {
            setUserLoading(false);
          }
          return;
        }

        console.log('Fetching user profile...', { 
          apiUrl: config.API_URL, 
          hasToken: !!token,
          tokenPreview: token.substring(0, 20) + '...' 
        });

        const profile = await api.get('/profiles/me').catch((e) => {
          console.error('Failed to fetch profile:', e);
          throw e;
        });
        
        if (mounted) {
          if (profile && typeof profile === 'object') {
            console.log('Profile fetched successfully:', profile);
            setCurrentUser(profile);
          } else {
            console.warn('Invalid profile data received:', profile);
            setCurrentUser(null);
          }
          setUserLoading(false);
        }
      } catch (e) {
        console.error('Error fetching user profile:', e);
        if (mounted) {
          setUserLoading(false);
          // Only clear user if it's an auth error
          if (e.message.includes('Authentication') || e.message.includes('401')) {
            setCurrentUser(null);
          }
          // For network errors, don't set user to null - just keep trying
          // The Topbar will show "Loading..." state
          if (e.message.includes('Network error') || e.message.includes('Unable to connect')) {
            console.warn('Backend connection failed. Will retry on next render or user action.');
            // Keep currentUser as null but don't show error
            // Don't throw - just log and continue
          } else {
            // For other errors, log but don't crash
            console.error('Unexpected error fetching profile:', e);
          }
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Fetch dashboard stats
  useEffect(() => {
    if (!currentUser?.school_id) {
      // Wait for user to load before fetching stats
      return;
    }

    let mounted = true;
    (async () => {
      try {
        // Simplified stats fetching - avoid too many parallel requests
        const [studentsResult, teachersResult] = await Promise.allSettled([
          api.get('/students').catch(() => []),
          api.get(`/teachers/school/${currentUser.school_id}`).catch(() => []),
        ]);

        if (!mounted) return;

        const studentCount = studentsResult.status === 'fulfilled' && Array.isArray(studentsResult.value) 
          ? studentsResult.value.length 
          : 0;
        const teacherCount = teachersResult.status === 'fulfilled' && Array.isArray(teachersResult.value) 
          ? teachersResult.value.length 
          : 0;
        
        // Calculate attendance rate (mock for now - would need actual attendance data)
        const attendanceRate = studentCount > 0 ? '85%' : '—';

        // For revenue, try to get it but don't fail if it doesn't work
        let monthlyRevenue = 0;
        try {
          // Use admin endpoint if available
          const invoicesResult = await api.get('/finance/invoices/admin/all').catch(() => []);
          if (Array.isArray(invoicesResult)) {
            const now = new Date();
            const thisMonthInvoices = invoicesResult.filter(inv => {
              if (!inv.created_at && !inv.issue_date) return false;
              try {
                const invDate = new Date(inv.created_at || inv.issue_date);
                return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
              } catch {
                return false;
              }
            });
            monthlyRevenue = thisMonthInvoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
          }
        } catch (e) {
          console.warn('Could not fetch revenue data:', e);
          // Continue without revenue data
        }

        if (mounted) {
          setStats([
            { icon: AcademicCapIcon, color: 'from-orange-400 to-orange-600', label: 'Total Students', value: String(studentCount), trend: '' },
            { icon: UserGroupIcon, color: 'from-blue-400 to-blue-600', label: 'Total Teachers', value: String(teacherCount), trend: '' },
            { icon: CheckCircleIcon, color: 'from-green-400 to-green-600', label: 'Attendance Rate', value: attendanceRate, trend: '' },
            { icon: CurrencyDollarIcon, color: 'from-violet-400 to-violet-600', label: 'Revenue (Month)', value: monthlyRevenue > 0 ? `₹${(monthlyRevenue / 1000).toFixed(1)}K` : '₹0', trend: '' },
          ]);
        }
      } catch (e) {
        console.error('Error fetching stats:', e);
        // Set default stats on error
        if (mounted) {
          setStats([
            { icon: AcademicCapIcon, color: 'from-orange-400 to-orange-600', label: 'Total Students', value: '—', trend: '' },
            { icon: UserGroupIcon, color: 'from-blue-400 to-blue-600', label: 'Total Teachers', value: '—', trend: '' },
            { icon: CheckCircleIcon, color: 'from-green-400 to-green-600', label: 'Attendance Rate', value: '—', trend: '' },
            { icon: CurrencyDollarIcon, color: 'from-violet-400 to-violet-600', label: 'Revenue (Month)', value: '—', trend: '' },
          ]);
        }
      }
    })();
    return () => { mounted = false; };
  }, [currentUser?.school_id]);

  const handleQuickAction = (action) => {
    const moduleMap = {
      'add-student': 'students',
      'add-teacher': 'teachers',
      'generate-invoice': 'fees',
      'send-announcement': 'communication',
    };
    const targetModule = moduleMap[action];
    if (targetModule) {
      setModule(targetModule);
    }
  };

  const handleCreateAnnouncement = () => {
    setModule('communication');
  };

  return (
    <div className="h-full flex">
      <Sidebar active={module} onSelect={setModule} />
      <div className="flex-1 min-w-0">
        <Topbar currentUser={currentUser} loading={userLoading} />
        <main className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pb-24">
          <header className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
              {titleByModule(module)}
            </h1>
            <p className="text-slate-600 font-medium">
              {module === 'dashboard' ? `Welcome back${currentUser?.first_name ? `, ${currentUser.first_name}` : ''}! Here's what's happening today.` : `Manage ${titleByModule(module).toLowerCase()}`}
            </p>
          </header>

          {module === 'dashboard' && (
            <>
              <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <StatCard {...s} />
                  </motion.div>
                ))}
              </section>

              <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <ActivityList />
                <AnnouncementsCard onCreateNew={handleCreateAnnouncement} />
              </section>

              <QuickActions onAction={handleQuickAction} />
            </>
          )}

          <AnimatePresence>
            {module !== 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
                {module === 'students' && <StudentsPanel />}
                {module === 'teachers' && <TeachersPanel schoolId={currentUser?.school_id} />}
                {module === 'attendance' && <AttendancePanel schoolId={currentUser?.school_id} />}
                {module === 'exams' && <ExamsPanel schoolId={currentUser?.school_id} />}
                {module === 'fees' && <FeesPanel />}
                {module === 'communication' && <CommunicationPanel />}
                {!['students', 'teachers', 'attendance', 'exams', 'fees', 'communication'].includes(module) && (
                  <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-2">{titleByModule(module)}</h2>
                    <p className="text-slate-600">This module is coming soon. Connect your backend APIs here.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        <AgentBar />
      </div>
    </div>
  );
}

function titleByModule(m) {
  return {
    dashboard: 'Dashboard Overview',
    school: 'School Management',
    teachers: 'Teachers Management',
    students: 'Students Management',
    attendance: 'Attendance Tracking',
    exams: 'Exams & Results',
    fees: 'Fees & Finance',
    communication: 'Communication Center',
    settings: 'System Settings',
  }[m] || 'Dashboard Overview';
}
