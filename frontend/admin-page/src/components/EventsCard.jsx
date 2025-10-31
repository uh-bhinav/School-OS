import { motion } from 'framer-motion';

const events = [
  { date: 'Nov 5, 2025', title: 'Parent-Teacher Meeting', time: '10:00 AM', color: 'bg-blue-100 text-blue-700' },
  { date: 'Nov 12, 2025', title: 'Annual Sports Day', time: '8:00 AM', color: 'bg-orange-100 text-orange-700' },
  { date: 'Nov 18, 2025', title: 'Mid-Term Exams Begin', time: '9:00 AM', color: 'bg-violet-100 text-violet-700' },
];

export function EventsCard() {
  return (
    <div className="card p-5">
      <h2 className="card-title px-1 mb-4">Upcoming Events</h2>
      <div className="space-y-3">
        {events.map((e, i) => (
          <motion.button 
            key={i} 
            whileTap={{ scale: 0.98 }} 
            whileHover={{ x: 2 }}
            className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`badge ${e.color} font-bold`}>{e.date}</span>
              <div className="font-semibold text-slate-800 flex-1 min-w-0">{e.title}</div>
              <div className="text-sm text-slate-500 flex items-center gap-1 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                {e.time}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      <motion.button 
        whileTap={{ scale: 0.98 }}
        className="mt-4 w-full text-sm px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-400 hover:bg-orange-50/50 flex items-center justify-center gap-2 font-semibold text-slate-600 hover:text-orange-600 transition-all"
      >
        <span className="text-xl leading-none">＋</span>
        Add New Event
      </motion.button>
    </div>
  );
}
