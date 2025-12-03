// ============================================================================
// MOCK REPORTS - Finance Analytics & KPI Data
// ============================================================================

import type {
  FinanceKpi,
  FinanceReport,
  RevenueByCategory,
  RevenueByClass,
  StudentDue,
  FeeComponentCategory,
} from '../../services/finance/types';
import { mockInvoicesProvider } from './mockInvoices';
import { mockPaymentsProvider } from './mockPayments';
import { MOCK_CLASSES } from './mockClasses';

// ============================================================================
// DELAY SIMULATION
// ============================================================================

function simulateDelay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// KPI CALCULATIONS
// ============================================================================

export async function getFinanceKpi(): Promise<FinanceKpi> {
  await simulateDelay();

  const invoices = await mockInvoicesProvider.getInvoices();
  const payments = await mockPaymentsProvider.getPayments();

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Year-to-date revenue
  const ytdPayments = payments.filter((p) => {
    const paymentDate = new Date(p.payment_date);
    return paymentDate >= yearStart && p.status === 'captured';
  });
  const total_revenue_ytd = ytdPayments.reduce((sum, p) => sum + p.amount_paid, 0);

  // Month-to-date revenue
  const mtdPayments = payments.filter((p) => {
    const paymentDate = new Date(p.payment_date);
    return paymentDate >= monthStart && p.status === 'captured';
  });
  const total_revenue_mtd = mtdPayments.reduce((sum, p) => sum + p.amount_paid, 0);

  // Outstanding fees
  const activeInvoices = invoices.filter((inv) => inv.is_active);
  const outstanding_fees = activeInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  // Overdue count
  const today = now.toISOString().split('T')[0];
  const overdue_count = activeInvoices.filter(
    (inv) => inv.due_date < today && inv.balance > 0
  ).length;

  // Collection rate
  const totalDue = activeInvoices.reduce((sum, inv) => sum + inv.amount_due, 0);
  const totalCollected = activeInvoices.reduce((sum, inv) => sum + inv.amount_paid, 0);
  const collection_rate = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;

  // Average days to pay (calculated from paid invoices)
  const paidInvoices = activeInvoices.filter((inv) => inv.status === 'paid');
  let totalDays = 0;
  paidInvoices.forEach((inv) => {
    const issueDate = new Date(inv.issue_date);
    const paymentDate = new Date(inv.updated_at || inv.created_at);
    const daysDiff = Math.floor((paymentDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
    totalDays += daysDiff;
  });
  const average_days_to_pay = paidInvoices.length > 0 ? Math.round(totalDays / paidInvoices.length) : 0;

  return {
    total_revenue_ytd,
    total_revenue_mtd,
    outstanding_fees,
    overdue_count,
    collection_rate,
    average_days_to_pay,
  };
}

// ============================================================================
// REVENUE BY CATEGORY
// ============================================================================

export async function getRevenueByCategory(): Promise<RevenueByCategory[]> {
  await simulateDelay();

  const invoices = await mockInvoicesProvider.getInvoices();
  const categoryMap: Record<FeeComponentCategory, number> = {
    Tuition: 0,
    Transport: 0,
    Lab: 0,
    Library: 0,
    Sports: 0,
    Uniform: 0,
    Books: 0,
    Activity: 0,
    Exam: 0,
    Other: 0,
  };

  // Aggregate by category (simplified - map component names to categories)
  const categoryMapping: Record<string, FeeComponentCategory> = {
    'Tuition Fee': 'Tuition',
    'Science Lab Fee': 'Lab',
    'Computer Lab Fee': 'Lab',
    'Library Fee': 'Library',
    'Text Books': 'Books',
    'Notebooks & Stationery': 'Books',
    'Activity Fee': 'Activity',
    'Annual Exam Fee': 'Exam',
    'School Uniform': 'Uniform',
  };

  invoices.forEach((invoice) => {
    invoice.items.forEach((item) => {
      const category = categoryMapping[item.component_name] || 'Other';
      categoryMap[category] += item.final_amount;
    });
  });

  const totalRevenue = Object.values(categoryMap).reduce((sum, amt) => sum + amt, 0);

  return Object.entries(categoryMap)
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({
      category: category as FeeComponentCategory,
      amount,
      percentage: totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

// ============================================================================
// REVENUE BY CLASS
// ============================================================================

export async function getRevenueByClass(): Promise<RevenueByClass[]> {
  await simulateDelay();

  const invoices = await mockInvoicesProvider.getInvoices();
  const classRevenueMap: Record<number, {
    class_name: string;
    expected_amount: number;
    collected_amount: number;
  }> = {};

  // Initialize with all classes
  MOCK_CLASSES.forEach((cls) => {
    classRevenueMap[cls.class_id] = {
      class_name: cls.class_name,
      expected_amount: 0,
      collected_amount: 0,
    };
  });

  // Aggregate revenue by class
  invoices.forEach((invoice) => {
    if (classRevenueMap[invoice.class_id]) {
      classRevenueMap[invoice.class_id].expected_amount += invoice.amount_due;
      classRevenueMap[invoice.class_id].collected_amount += invoice.amount_paid;
    }
  });

  return Object.entries(classRevenueMap)
    .filter(([, data]) => data.expected_amount > 0)
    .map(([classId, data]) => ({
      class_id: parseInt(classId),
      class_name: data.class_name,
      expected_amount: data.expected_amount,
      collected_amount: data.collected_amount,
      pending_amount: data.expected_amount - data.collected_amount,
      collection_rate: data.expected_amount > 0
        ? Math.round((data.collected_amount / data.expected_amount) * 100)
        : 0,
    }))
    .sort((a, b) => b.expected_amount - a.expected_amount);
}

// ============================================================================
// TOP DEFAULTERS
// ============================================================================

export async function getTopDefaulters(limit: number = 20): Promise<StudentDue[]> {
  await simulateDelay();

  const invoices = await mockInvoicesProvider.getInvoices();
  const studentDuesMap: Record<number, StudentDue> = {};

  const today = new Date();

  invoices.forEach((invoice) => {
    if (invoice.balance <= 0) return;

    if (!studentDuesMap[invoice.student_id]) {
      studentDuesMap[invoice.student_id] = {
        student_id: invoice.student_id,
        student_name: invoice.student_name,
        roll_no: invoice.roll_no,
        class_id: invoice.class_id,
        class_name: invoice.class_name,
        total_due: 0,
        total_paid: 0,
        balance: 0,
        overdue_days: 0,
      };
    }

    const studentDue = studentDuesMap[invoice.student_id];
    studentDue.total_due += invoice.amount_due;
    studentDue.total_paid += invoice.amount_paid;
    studentDue.balance += invoice.balance;

    // Calculate overdue days from oldest overdue invoice
    const dueDate = new Date(invoice.due_date);
    if (dueDate < today && invoice.balance > 0) {
      const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      studentDue.overdue_days = Math.max(studentDue.overdue_days, daysDiff);
    }
  });

  return Object.values(studentDuesMap)
    .filter((due) => due.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, limit);
}

// ============================================================================
// PAYMENT TRENDS
// ============================================================================

export async function getPaymentTrends(days: number = 30): Promise<
  Array<{ date: string; amount: number; count: number }>
> {
  await simulateDelay();
  return await mockPaymentsProvider.getDailyCollections(days);
}

// ============================================================================
// COMPREHENSIVE FINANCE REPORT
// ============================================================================

export async function getFinanceReport(): Promise<FinanceReport> {
  await simulateDelay(500);

  const [kpi, revenue_by_category, revenue_by_class, top_defaulters, payment_trends] = await Promise.all([
    getFinanceKpi(),
    getRevenueByCategory(),
    getRevenueByClass(),
    getTopDefaulters(15),
    getPaymentTrends(30),
  ]);

  return {
    kpi,
    revenue_by_category,
    revenue_by_class,
    top_defaulters,
    payment_trends,
  };
}

// ============================================================================
// CLASS-WISE DETAILED REPORT
// ============================================================================

export async function getClassFinanceReport(classId: number): Promise<{
  class_info: RevenueByClass;
  students: StudentDue[];
  payment_timeline: Array<{ date: string; amount: number; count: number }>;
}> {
  await simulateDelay();

  const invoices = await mockInvoicesProvider.getInvoices({ classId });
  const payments = await mockPaymentsProvider.getPayments({ classId });

  // Class info
  const classInfo = MOCK_CLASSES.find((c) => c.class_id === classId);
  const totalExpected = invoices.reduce((sum, inv) => sum + inv.amount_due, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.amount_paid, 0);

  const class_info: RevenueByClass = {
    class_id: classId,
    class_name: classInfo?.class_name || 'Unknown',
    expected_amount: totalExpected,
    collected_amount: totalCollected,
    pending_amount: totalExpected - totalCollected,
    collection_rate: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0,
  };

  // Student-wise dues
  const studentDuesMap: Record<number, StudentDue> = {};
  const today = new Date();

  invoices.forEach((invoice) => {
    if (!studentDuesMap[invoice.student_id]) {
      studentDuesMap[invoice.student_id] = {
        student_id: invoice.student_id,
        student_name: invoice.student_name,
        roll_no: invoice.roll_no,
        class_id: invoice.class_id,
        class_name: invoice.class_name,
        total_due: 0,
        total_paid: 0,
        balance: 0,
        overdue_days: 0,
      };
    }

    const studentDue = studentDuesMap[invoice.student_id];
    studentDue.total_due += invoice.amount_due;
    studentDue.total_paid += invoice.amount_paid;
    studentDue.balance += invoice.balance;

    const dueDate = new Date(invoice.due_date);
    if (dueDate < today && invoice.balance > 0) {
      const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      studentDue.overdue_days = Math.max(studentDue.overdue_days, daysDiff);
    }
  });

  const students = Object.values(studentDuesMap).sort((a, b) => b.balance - a.balance);

  // Payment timeline
  const timelineMap: Record<string, { amount: number; count: number }> = {};
  payments.filter(p => p.status === 'captured').forEach((payment) => {
    const date = payment.payment_date;
    if (!timelineMap[date]) {
      timelineMap[date] = { amount: 0, count: 0 };
    }
    timelineMap[date].amount += payment.amount_paid;
    timelineMap[date].count++;
  });

  const payment_timeline = Object.entries(timelineMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    class_info,
    students,
    payment_timeline,
  };
}

// ============================================================================
// MONTHLY COLLECTION REPORT
// ============================================================================

export async function getMonthlyCollectionReport(year: number = new Date().getFullYear()): Promise<
  Array<{ month: string; expected: number; collected: number; collection_rate: number }>
> {
  await simulateDelay();

  const payments = await mockPaymentsProvider.getPayments();
  const invoices = await mockInvoicesProvider.getInvoices();

  const monthlyData: Record<string, { expected: number; collected: number }> = {};

  // Initialize all months
  for (let month = 1; month <= 12; month++) {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    monthlyData[monthKey] = { expected: 0, collected: 0 };
  }

  // Aggregate expected amounts from invoices
  invoices.forEach((invoice) => {
    const invoiceMonth = invoice.issue_date.slice(0, 7);
    if (invoiceMonth.startsWith(String(year)) && monthlyData[invoiceMonth]) {
      monthlyData[invoiceMonth].expected += invoice.amount_due;
    }
  });

  // Aggregate collected amounts from payments
  payments.filter(p => p.status === 'captured').forEach((payment) => {
    const paymentMonth = payment.payment_date.slice(0, 7);
    if (paymentMonth.startsWith(String(year)) && monthlyData[paymentMonth]) {
      monthlyData[paymentMonth].collected += payment.amount_paid;
    }
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    expected: data.expected,
    collected: data.collected,
    collection_rate: data.expected > 0 ? Math.round((data.collected / data.expected) * 100) : 0,
  }));
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockReportsProvider = {
  getFinanceKpi,
  getRevenueByCategory,
  getRevenueByClass,
  getTopDefaulters,
  getPaymentTrends,
  getFinanceReport,
  getClassFinanceReport,
  getMonthlyCollectionReport,
};
