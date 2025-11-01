import { motion } from 'framer-motion';

const actions = [
  { color: 'from-orange-400 to-orange-600', icon: '🎓', label: 'Add Student', action: 'add-student' },
  { color: 'from-blue-400 to-blue-600', icon: '👩‍🏫', label: 'Add Teacher', action: 'add-teacher' },
  { color: 'from-emerald-400 to-emerald-600', icon: '🧾', label: 'Generate Invoice', action: 'generate-invoice' },
  { color: 'from-violet-400 to-fuchsia-600', icon: '📣', label: 'Send Announcement', action: 'send-announcement' },
];

export function QuickActions({ onAction }) {
  const handleClick = (action) => {
    if (onAction) {
      onAction(action);
    } else {
      // Default behavior - switch to appropriate module
      const moduleMap = {
        'add-student': 'students',
        'add-teacher': 'teachers',
        'generate-invoice': 'fees',
        'send-announcement': 'communication',
      };
      const module = moduleMap[action] || 'dashboard';
      window.location.hash = `#${module}`;
    }
  };

  return (
    <div className="card p-5">
      <h2 className="card-title px-1 mb-4">Quick Actions</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((a, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`h-28 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl bg-gradient-to-br ${a.color} flex flex-col items-center justify-center gap-2 transition-shadow`}
            onClick={() => handleClick(a.action)}
          >
            <span className="text-3xl">{a.icon}</span>
            <span className="text-sm">{a.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
