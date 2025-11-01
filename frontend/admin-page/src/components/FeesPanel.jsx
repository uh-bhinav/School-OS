import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';

export function FeesPanel() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Fetch invoices - we'll need to get all students first, then their invoices
        const students = await api.get('/students').catch(() => []);
        
        if (Array.isArray(students) && students.length > 0) {
          // Get invoices for first few students as sample
          const invoicePromises = students.slice(0, 10).map(s => 
            api.get(`/finance/invoices/student/${s.student_id || s.id}`).catch(() => [])
          );
          const invoiceResults = await Promise.allSettled(invoicePromises);
          const allInvoices = invoiceResults
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => Array.isArray(r.value) ? r.value : []);
          
          if (mounted) {
            setInvoices(allInvoices.slice(0, 20));
            // Calculate stats
            const total = allInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
            const paid = allInvoices.filter(inv => inv.status === 'Paid' || inv.paid_amount >= inv.total_amount).length;
            setStats({ total, paid, pending: allInvoices.length - paid });
          }
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-slate-800">{formatCurrency(stats.total)}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-1">Paid Invoices</div>
          <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-1">Pending</div>
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Invoices</h2>
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-shadow"
          >
            Generate Invoice
          </motion.button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
        )}

        <div className="overflow-auto">
          {loading ? (
            <div className="text-center py-8 text-slate-500 text-sm">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No invoices found</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600 border-b border-slate-200">
                  <th className="px-2 py-3">Invoice ID</th>
                  <th className="px-2 py-3">Student</th>
                  <th className="px-2 py-3">Amount</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3">Due Date</th>
                  <th className="px-2 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-2 py-3 font-medium">#{inv.id}</td>
                    <td className="px-2 py-3">{inv.student_name || 'Unknown'}</td>
                    <td className="px-2 py-3 font-semibold">{formatCurrency(inv.total_amount)}</td>
                    <td className="px-2 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {inv.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-slate-600">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-2 py-3 space-x-2">
                      <button className="text-blue-600 font-semibold text-xs">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

