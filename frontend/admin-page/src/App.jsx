import { useState } from 'react';
import { Sidebar } from './components/Sidebar.jsx';
import { Topbar } from './components/Topbar.jsx';
import { StatCard } from './components/StatCard.jsx';
import { ActivityList } from './components/ActivityList.jsx';
import { EventsCard } from './components/EventsCard.jsx';
import { QuickActions } from './components/QuickActions.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [module, setModule] = useState('dashboard');
  const stats = [
    { icon: '🎓', color: 'from-orange-400 to-orange-600', label: 'Total Students', value: '2,847', trend: '+12%' },
    { icon: '👩‍🏫', color: 'from-blue-400 to-blue-600', label: 'Total Teachers', value: '142', trend: '+5%' },
    { icon: '✅', color: 'from-green-400 to-green-600', label: 'Attendance Rate', value: '94.2%', trend: '+2.1%' },
    { icon: '₹', color: 'from-violet-400 to-violet-600', label: 'Revenue (Month)', value: '₹8.4L', trend: '+18%' },
  ];

  return (
    <div className="h-full flex">
      <Sidebar active={module} onSelect={setModule} />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="p-6 space-y-6 min-h-screen">
          <header className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent">{titleByModule(module)}</h1>
            <p className="text-slate-600 font-medium">Welcome back! Here's what's happening today.</p>
          </header>

          <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <StatCard {...s} />
              </motion.div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <ActivityList />
            <EventsCard />
          </section>

          <QuickActions />

          <AnimatePresence>
            {module !== 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="card p-6">
                <h2 className="text-lg font-semibold mb-2">{titleByModule(module)}</h2>
                <p className="text-slate-600">Hook your backend APIs here for the {module} module.</p>
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
