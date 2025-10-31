import { useState, useRef, useEffect } from 'react';
import { BellIcon, MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export function Topbar() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener('click', onClick); return () => window.removeEventListener('click', onClick);
  }, []);

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
          <motion.button whileTap={{ scale: 0.95 }} className="relative p-2.5 rounded-xl hover:bg-slate-100/70 text-slate-600 transition-colors" onClick={() => setOpen((v)=>!v)} aria-label="Notifications">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 inline-block w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </motion.button>
          <div className="relative" ref={ref}>
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setOpen((v)=>!v)} className="flex items-center gap-2 pl-3 pr-2 py-1.5 border border-slate-200 rounded-full hover:bg-slate-50/70 transition-all shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white grid place-content-center text-xs font-bold shadow-md">AD</div>
              <div className="hidden sm:block text-left mr-1">
                <div className="text-xs font-semibold text-slate-800 leading-4">Admin User</div>
                <div className="text-[10px] text-slate-500 leading-3">admin@school.com</div>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-slate-400" />
            </motion.button>
            <AnimatePresence>
              {open && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-2 w-64 card overflow-hidden shadow-xl">
                  <div className="px-3 py-2.5 border-b border-slate-100 text-sm font-semibold bg-gradient-to-r from-orange-50 to-fuchsia-50">Notifications</div>
                  <ul className="divide-y divide-slate-100">
                    <li className="px-3 py-2.5 text-sm hover:bg-slate-50 cursor-pointer transition-colors">New enrollment request • 2m ago</li>
                    <li className="px-3 py-2.5 text-sm hover:bg-slate-50 cursor-pointer transition-colors">Fee payment reminder sent • 1h ago</li>
                    <li className="px-3 py-2.5 text-sm hover:bg-slate-50 cursor-pointer transition-colors">Exam schedule published • 3h ago</li>
                  </ul>
                  <button className="w-full text-sm font-semibold text-orange-600 hover:bg-orange-50 py-2.5 transition-colors">View all</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
