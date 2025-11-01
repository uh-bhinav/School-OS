import { useState } from 'react';
import { motion } from 'framer-motion';
import Logo from '../assets/school-logo.png';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  TrophyIcon,
  CurrencyRupeeIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { key: 'school', label: 'School', icon: BuildingOfficeIcon },
  { key: 'teachers', label: 'Teachers', icon: UserGroupIcon },
  { key: 'students', label: 'Students', icon: AcademicCapIcon },
  { key: 'attendance', label: 'Attendance', icon: CheckCircleIcon },
  { key: 'exams', label: 'Exams', icon: TrophyIcon },
  { key: 'fees', label: 'Fees', icon: CurrencyRupeeIcon },
  { key: 'communication', label: 'Communication', icon: ChatBubbleOvalLeftEllipsisIcon },
  { key: 'settings', label: 'Settings', icon: Cog6ToothIcon },
];

export function Sidebar({ active, onSelect }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`h-full bg-white/80 backdrop-blur-md border-r border-slate-200/60 shadow-lg transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between px-3 py-4 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <img src={Logo} alt="SchoolOS" className="w-10 h-10 drop-shadow-md object-contain" />
          {!collapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-fuchsia-600 bg-clip-text text-transparent">School OS</span>
          )}
        </div>
        <button
          className="p-2 rounded-lg hover:bg-slate-100/70 text-slate-600 transition-colors"
          onClick={() => setCollapsed(v => !v)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <Bars3Icon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
        </button>
      </div>

      <nav className="p-3 space-y-1.5">
        {items.map(({ key, label, icon: Icon }) => {
          const isActive = key === active;
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelect?.(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'text-white bg-gradient-to-r from-orange-400 to-fuchsia-500 shadow-lg shadow-orange-200/50'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </motion.button>
          );
        })}
      </nav>
    </aside>
  );
}
