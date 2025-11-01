import { motion } from 'framer-motion';

export function StatCard({ icon: IconComponent, color, value, label, trend }) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      className="card p-5 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-xl text-white grid place-content-center shadow-lg bg-gradient-to-br ${color} group-hover:shadow-xl transition-shadow`}>
          {IconComponent && <IconComponent className="w-7 h-7" />}
        </div>
        <div className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.894.553l6 12a1 1 0 11-1.788.894L10 5.618 4.894 16.447a1 1 0 11-1.788-.894l6-12A1 1 0 0110 3z" clipRule="evenodd" />
          </svg>
          {trend}
        </div>
      </div>
      <div className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{value}</div>
      <div className="text-sm text-slate-500 font-medium mt-1">{label}</div>
    </motion.div>
  );
}
