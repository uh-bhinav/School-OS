import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';

export function FeesPanel() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });
  const [studentsMap, setStudentsMap] = useState({}); // Map student_id -> student info

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        
        // First, fetch all students to build a map
        const students = await api.get('/students').catch(() => []);
        if (Array.isArray(students) && mounted) {
          const map = {};
          students.forEach(s => {
            const studentId = s.student_id || s.id;
            const firstName = s.profile?.first_name || s.first_name || '';
            const lastName = s.profile?.last_name || s.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'Unknown';
            map[studentId] = { id: studentId, name: fullName };
          });
          setStudentsMap(map);
        }
        
        // Try admin endpoint first
        try {
          const allInvoices = await api.get('/finance/invoices/admin/all').catch(() => null);
          if (allInvoices && Array.isArray(allInvoices)) {
            if (mounted) {
              setInvoices(allInvoices.slice(0, 50));
              // Calculate revenue from PAID invoices only
              const paidInvoices = allInvoices.filter(inv => {
                const paymentStatus = inv.payment_status || '';
                const status = inv.status || '';
                const amountPaid = Number(inv.amount_paid) || 0;
                const totalAmount = Number(inv.total_amount) || Number(inv.amount_due) || 0;
                return paymentStatus.toLowerCase() === 'paid' || 
                       status.toLowerCase() === 'paid' ||
                       (totalAmount > 0 && amountPaid >= totalAmount);
              });
              
              const total = paidInvoices.reduce((sum, inv) => sum + (Number(inv.amount_paid) || Number(inv.total_amount) || Number(inv.amount_due) || 0), 0);
              const paid = paidInvoices.length;
              setStats({ total, paid, pending: allInvoices.length - paid });
            }
            return;
          }
        } catch (e) {
          console.warn('Admin invoices endpoint failed, trying alternative:', e);
        }

        // Fallback: fetch invoices for students
        if (Array.isArray(students) && students.length > 0 && mounted) {
          // Get invoices for first few students only
          const invoicePromises = students.slice(0, 5).map(s => 
            api.get(`/finance/invoices/student/${s.student_id || s.id}`).catch(() => [])
          );
          const invoiceResults = await Promise.allSettled(invoicePromises);
          const allInvoices = invoiceResults
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => Array.isArray(r.value) ? r.value : []);
          
          if (mounted) {
            setInvoices(allInvoices.slice(0, 20));
            // Calculate revenue from PAID invoices only
            const paidInvoices = allInvoices.filter(inv => {
              const paymentStatus = inv.payment_status || '';
              const status = inv.status || '';
              const amountPaid = Number(inv.amount_paid) || 0;
              const totalAmount = Number(inv.total_amount) || 0;
              return paymentStatus.toLowerCase() === 'paid' || 
                     status.toLowerCase() === 'paid' ||
                     (totalAmount > 0 && amountPaid >= totalAmount);
            });
            
            const total = paidInvoices.reduce((sum, inv) => sum + (Number(inv.amount_paid) || Number(inv.total_amount) || 0), 0);
            const paid = paidInvoices.length;
            setStats({ total, paid, pending: allInvoices.length - paid });
          }
        } else if (mounted) {
          setInvoices([]);
          setStats({ total: 0, paid: 0, pending: 0 });
        }
      } catch (e) {
        const errorMessage = e?.message || e?.toString() || 'Failed to load invoices';
        setError(errorMessage);
        if (mounted) {
          setInvoices([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);
  
  const getStudentName = (invoice) => {
    const studentId = invoice.student_id;
    if (studentsMap[studentId]) {
      return studentsMap[studentId].name;
    }
    // Fallback to invoice.student_name if available
    return invoice.student_name || 'Unknown';
  };

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
                    <td className="px-2 py-3">{getStudentName(inv)}</td>
                    <td className="px-2 py-3 font-semibold">{formatCurrency(inv.total_amount || inv.amount_due)}</td>
                    <td className="px-2 py-3">
                      {(() => {
                        // Check payment_status first, then status, then calculate from amounts
                        const paymentStatus = inv.payment_status || '';
                        const status = inv.status || '';
                        const amountPaid = Number(inv.amount_paid) || 0;
                        const totalAmount = Number(inv.total_amount) || Number(inv.amount_due) || 0;
                        
                        let displayStatus = paymentStatus || status || 'Pending';
                        let isPaid = false;
                        
                        if (paymentStatus.toLowerCase() === 'paid' || status.toLowerCase() === 'paid') {
                          isPaid = true;
                          displayStatus = 'Paid';
                        } else if (totalAmount > 0 && amountPaid >= totalAmount) {
                          isPaid = true;
                          displayStatus = 'Paid';
                        } else if (paymentStatus.toLowerCase() === 'unpaid' || status.toLowerCase() === 'due') {
                          isPaid = false;
                          displayStatus = 'Due';
                        }
                        
                        return (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {displayStatus}
                          </span>
                        );
                      })()}
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

