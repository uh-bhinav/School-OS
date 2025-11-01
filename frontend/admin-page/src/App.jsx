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
import { api } from './utils/api.js';

export default function App() {
  const [module, setModule] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState([
    { icon: '🎓', color: 'from-orange-400 to-orange-600', label: 'Total Students', value: '—', trend: '' },
    { icon: '👩‍🏫', color: 'from-blue-400 to-blue-600', label: 'Total Teachers', value: '—', trend: '' },
    { icon: '✅', color: 'from-green-400 to-green-600', label: 'Attendance Rate', value: '—', trend: '' },
    { icon: '₹', color: 'from-violet-400 to-violet-600', label: 'Revenue (Month)', value: '—', trend: '' },
  ]);

  // Fetch current user profile
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await api.get('/profiles/me');
        if (mounted) {
          setCurrentUser(profile);
        }
      } catch (e) {
        console.error('Error fetching user profile:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Fetch dashboard stats
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [students, teachersData, invoicesData] = await Promise.allSettled([
          api.get('/students').catch(() => []),
          currentUser?.school_id ? api.get(`/teachers/school/${currentUser.school_id}`).catch(() => []) : Promise.resolve([]),
          api.get('/students').then(students => {
            if (!Array.isArray(students) || students.length === 0) return [];
            return Promise.allSettled(
              students.slice(0, 20).map(s => 
                api.get(`/finance/invoices/student/${s.student_id || s.id}`).catch(() => [])
              )
            );
          }).then(results => {
            return results
              .filter(r => r.status === 'fulfilled')
              .flatMap(r => Array.isArray(r.value) ? r.value : []);
          }).catch(() => []),
        ]);

        if (!mounted) return;

        const studentCount = students.status === 'fulfilled' && Array.isArray(students.value) ? students.value.length : 0;
        const teacherCount = teachersData.status === 'fulfilled' && Array.isArray(teachersData.value) ? teachersData.value.length : 0;
        
        // Calculate revenue (this month)
        const now = new Date();
        const thisMonthInvoices = Array.isArray(invoicesData) ? invoicesData.filter(inv => {
          const invDate = new Date(inv.created_at || inv.issue_date);
          return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
        }) : [];
        const monthlyRevenue = thisMonthInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
        
        // Calculate attendance rate (mock for now - would need actual attendance data)
        const attendanceRate = studentCount > 0 ? '85%' : '—';

        setStats([
          { icon: '🎓', color: 'from-orange-400 to-orange-600', label: 'Total Students', value: String(studentCount), trend: '' },
          { icon: '👩‍🏫', color: 'from-blue-400 to-blue-600', label: 'Total Teachers', value: String(teacherCount), trend: '' },
          { icon: '✅', color: 'from-green-400 to-green-600', label: 'Attendance Rate', value: attendanceRate, trend: '' },
          { icon: '₹', color: 'from-violet-400 to-violet-600', label: 'Revenue (Month)', value: `₹${(monthlyRevenue / 1000).toFixed(1)}K`, trend: '' },
        ]);
      } catch (e) {
        console.error('Error fetching stats:', e);
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
        <Topbar currentUser={currentUser} />
        <main className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
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
                {module === 'attendance' && <AttendancePanel />}
                {module === 'exams' && <ExamsPanel />}
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
