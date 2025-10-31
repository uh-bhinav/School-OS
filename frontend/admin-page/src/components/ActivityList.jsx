import { motion } from 'framer-motion';

const activities = [
  { icon: '🎓', color: 'bg-blue-500', title: 'New student enrolled', subtitle: 'Priya Sharma - Class 10A', time: '5 mins ago' },
  { icon: '₹', color: 'bg-green-500', title: 'Fee payment received', subtitle: 'Rahul Kumar - ₹15,000', time: '12 mins ago' },
  { icon: '👩‍🏫', color: 'bg-violet-500', title: 'Teacher assigned', subtitle: 'Ms. Anjali - Mathematics Class 9', time: '25 mins ago' },
  { icon: '🏆', color: 'bg-orange-500', title: 'Exam results published', subtitle: 'Class 12 - Term 1 Finals', time: '1 hour ago' },
];

export function ActivityList() {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Recent Activities</h2>
        <motion.button whileTap={{ scale: 0.96 }} className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium transition-colors">View All</motion.button>
      </div>
      <div className="px-4 pb-4 space-y-2">
        {activities.map((a, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.98 }}
            whileHover={{ x: 4 }}
            className="w-full flex items-center gap-3 text-left p-3 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent border border-transparent hover:border-slate-100 transition-all"
            onClick={() => {/* hook: open activity */}}
          >
            <div className={`w-11 h-11 rounded-xl grid place-content-center text-white shadow-md ${a.color}`}>{a.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate text-slate-800">{a.title}</div>
              <div className="text-sm text-slate-500 truncate">{a.subtitle}</div>
            </div>
            <div className="ml-auto text-xs text-slate-400 shrink-0 font-medium">{a.time}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
