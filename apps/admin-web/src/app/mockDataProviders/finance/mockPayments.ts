// ============================================================================
// MOCK PAYMENTS - Mirrors backend payment_service.py
// ============================================================================

import type {
  Payment,
  PaymentMethod,
  PaymentStatus,
  PaymentCreate,
} from '../../services/finance/types';
import { mockInvoicesProvider } from './mockInvoices';

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

let paymentIdCounter = 20000;

// Generate realistic payments for all invoices that have been paid
async function generateInitialPayments(): Promise<Payment[]> {
  const payments: Payment[] = [];
  const invoices = await mockInvoicesProvider.getInvoices();

  invoices.forEach((invoice) => {
    if (invoice.amount_paid === 0) return;

    const paymentMethods: PaymentMethod[] = ['upi', 'card', 'bank_transfer', 'cash', 'cheque', 'razorpay', 'netbanking'];
    const methodWeights = [0.35, 0.15, 0.10, 0.12, 0.08, 0.12, 0.08];

    // Select payment method based on weights
    const roll = Math.random();
    let cumulative = 0;
    let method: PaymentMethod = 'upi';
    for (let i = 0; i < paymentMethods.length; i++) {
      cumulative += methodWeights[i];
      if (roll <= cumulative) {
        method = paymentMethods[i];
        break;
      }
    }

    const paymentId = ++paymentIdCounter;

    // Generate payment date (before due date for most, after for some)
    const dueDate = new Date(invoice.due_date);
    const dayOffset = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
    const paymentDate = new Date(dueDate);
    paymentDate.setDate(paymentDate.getDate() + dayOffset);

    // Ensure it's not in the future
    const today = new Date();
    if (paymentDate > today) {
      paymentDate.setTime(today.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    }

    const transactionDate = paymentDate.toISOString();
    const gatewayPaymentId = generateGatewayPaymentId(method);

    const payment: Payment = {
      payment_id: paymentId,
      school_id: invoice.school_id,
      student_id: invoice.student_id,
      student_name: invoice.student_name,
      invoice_id: invoice.invoice_id,
      invoice_number: invoice.invoice_number,
      amount_paid: invoice.amount_paid,
      currency: 'INR',
      payment_date: transactionDate.split('T')[0],
      method: method,
      status: 'captured' as PaymentStatus,
      gateway_name: getGatewayName(method),
      gateway_order_id: `order_${Math.random().toString(36).substring(2, 15)}`,
      gateway_payment_id: gatewayPaymentId,
      metadata: generateMetadata(method, invoice),
      reconciliation_status: 'reconciled',
      created_at: transactionDate,
      updated_at: transactionDate,
    };

    payments.push(payment);

    // For partially paid invoices, might have multiple payments
    if (invoice.status === 'partially_paid' && Math.random() > 0.5) {
      // Add a second partial payment
      const secondPaymentId = ++paymentIdCounter;
      const secondAmount = Math.round(invoice.amount_paid * 0.4);
      const firstAmount = invoice.amount_paid - secondAmount;

      // Adjust first payment
      payments[payments.length - 1].amount_paid = firstAmount;
      payments[payments.length - 1].metadata = {
        ...payments[payments.length - 1].metadata,
        installment: 1,
        note: 'Partial payment - installment 1',
      };

      // Add second payment
      payments.push({
        ...payment,
        payment_id: secondPaymentId,
        amount_paid: secondAmount,
        gateway_payment_id: generateGatewayPaymentId(method),
        gateway_order_id: `order_${Math.random().toString(36).substring(2, 15)}`,
        metadata: {
          installment: 2,
          note: 'Partial payment - installment 2',
        },
        created_at: new Date(new Date(transactionDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  });

  return payments;
}

function generateGatewayPaymentId(method: PaymentMethod): string {
  const prefix: Record<PaymentMethod, string> = {
    upi: 'pay_upi_',
    card: 'pay_card_',
    bank_transfer: 'pay_neft_',
    cash: 'pay_cash_',
    cheque: 'pay_chq_',
    netbanking: 'pay_nb_',
    razorpay: 'pay_rzp_',
  };

  const random = Math.random().toString(36).substring(2, 14);
  return `${prefix[method]}${random}`;
}

function getGatewayName(method: PaymentMethod): string {
  const gateways: Record<PaymentMethod, string> = {
    upi: 'Razorpay',
    card: 'Razorpay',
    netbanking: 'Razorpay',
    razorpay: 'Razorpay',
    bank_transfer: 'Direct',
    cash: 'Manual',
    cheque: 'Manual',
  };
  return gateways[method];
}

function generateMetadata(method: PaymentMethod, invoice: { class_id: number; class_name: string }): Record<string, unknown> {
  const baseMetadata = {
    class_id: invoice.class_id,
    class_name: invoice.class_name,
  };

  const methodMetadata: Record<PaymentMethod, Record<string, unknown>> = {
    upi: {
      ...baseMetadata,
      upi_id: `parent${Math.floor(Math.random() * 1000)}@upi`,
      bank_code: 'HDFC',
    },
    card: {
      ...baseMetadata,
      card_last4: String(Math.floor(1000 + Math.random() * 9000)),
      card_type: Math.random() > 0.6 ? 'credit' : 'debit',
      card_network: ['VISA', 'Mastercard', 'Rupay'][Math.floor(Math.random() * 3)],
    },
    netbanking: {
      ...baseMetadata,
      bank_name: ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'][Math.floor(Math.random() * 4)],
    },
    bank_transfer: {
      ...baseMetadata,
      bank_name: ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'][Math.floor(Math.random() * 4)],
      utr_number: `UTR${Date.now()}${Math.floor(Math.random() * 1000)}`,
    },
    cash: {
      ...baseMetadata,
      received_by: 'Accounts Office',
    },
    cheque: {
      ...baseMetadata,
      cheque_number: String(100000 + Math.floor(Math.random() * 900000)),
      bank_name: ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'][Math.floor(Math.random() * 4)],
      cheque_date: new Date().toISOString().split('T')[0],
    },
    razorpay: {
      ...baseMetadata,
      razorpay_order_id: `order_${Math.random().toString(36).substring(2, 15)}`,
    },
  };

  return methodMetadata[method];
}

let mockPayments: Payment[] = [];

// Initialize payments asynchronously
(async () => {
  mockPayments = await generateInitialPayments();
  console.log(`[MOCK PAYMENTS] Initialized ${mockPayments.length} payments`);
})();

// ============================================================================
// DELAY SIMULATION
// ============================================================================

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getPayments(
  filters?: {
    invoiceId?: number;
    studentId?: number;
    classId?: number;
    paymentMethod?: PaymentMethod;
    status?: PaymentStatus;
    fromDate?: string;
    toDate?: string;
  }
): Promise<Payment[]> {
  await simulateDelay();

  // Ensure payments are initialized
  if (mockPayments.length === 0) {
    mockPayments = await generateInitialPayments();
  }

  let filtered = [...mockPayments];

  if (filters?.invoiceId) {
    filtered = filtered.filter((p) => p.invoice_id === filters.invoiceId);
  }
  if (filters?.studentId) {
    filtered = filtered.filter((p) => p.student_id === filters.studentId);
  }
  if (filters?.classId) {
    filtered = filtered.filter((p) => {
      const meta = p.metadata as { class_id?: number } | undefined;
      return meta?.class_id === filters.classId;
    });
  }
  if (filters?.paymentMethod) {
    filtered = filtered.filter((p) => p.method === filters.paymentMethod);
  }
  if (filters?.status) {
    filtered = filtered.filter((p) => p.status === filters.status);
  }
  if (filters?.fromDate) {
    filtered = filtered.filter((p) => p.payment_date >= filters.fromDate!);
  }
  if (filters?.toDate) {
    filtered = filtered.filter((p) => p.payment_date <= filters.toDate!);
  }

  console.log(`[MOCK PAYMENTS] getPayments → ${filtered.length} payments`);
  return filtered;
}

export async function getPaymentById(paymentId: number): Promise<Payment | null> {
  await simulateDelay(100);
  return mockPayments.find((p) => p.payment_id === paymentId) || null;
}

export async function getPaymentsByInvoice(invoiceId: number): Promise<Payment[]> {
  await simulateDelay();
  return mockPayments.filter((p) => p.invoice_id === invoiceId);
}

export async function getStudentPayments(studentId: number): Promise<Payment[]> {
  await simulateDelay();
  return mockPayments.filter((p) => p.student_id === studentId);
}

export async function recordPayment(data: PaymentCreate): Promise<Payment> {
  await simulateDelay(300);

  if (!data.invoice_id) {
    throw new Error('Invoice ID is required');
  }

  const invoice = await mockInvoicesProvider.getInvoiceById(data.invoice_id);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const method = data.payment_method || 'cash';
  const paymentId = ++paymentIdCounter;
  const gatewayPaymentId = generateGatewayPaymentId(method);

  const payment: Payment = {
    payment_id: paymentId,
    school_id: 1,
    student_id: invoice.student_id,
    student_name: invoice.student_name,
    invoice_id: data.invoice_id,
    invoice_number: invoice.invoice_number,
    amount_paid: data.amount,
    currency: 'INR',
    payment_date: new Date().toISOString().split('T')[0],
    method: method,
    status: 'captured',
    gateway_name: getGatewayName(method),
    gateway_order_id: `order_${Math.random().toString(36).substring(2, 15)}`,
    gateway_payment_id: gatewayPaymentId,
    metadata: {
      class_id: invoice.class_id,
      class_name: invoice.class_name,
      processed_by: 'Admin User',
    },
    reconciliation_status: 'reconciled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockPayments.push(payment);

  // Update invoice
  invoice.amount_paid += data.amount;
  invoice.balance = invoice.amount_due - invoice.amount_paid;

  if (invoice.balance <= 0) {
    invoice.status = 'paid';
    invoice.payment_status = 'paid';
  } else {
    invoice.status = 'partially_paid';
    invoice.payment_status = 'partially_paid';
  }

  console.log(`[MOCK PAYMENTS] Recorded payment ${paymentId} for invoice ${data.invoice_id}`);
  return payment;
}

export async function refundPayment(
  paymentId: number,
  reason: string
): Promise<Payment | null> {
  await simulateDelay(300);

  const payment = mockPayments.find((p) => p.payment_id === paymentId);
  if (!payment) return null;

  payment.status = 'refunded';
  payment.metadata = {
    ...payment.metadata,
    refund_reason: reason,
    refunded_at: new Date().toISOString(),
  };
  payment.updated_at = new Date().toISOString();

  // Update invoice balance
  if (payment.invoice_id) {
    const invoice = await mockInvoicesProvider.getInvoiceById(payment.invoice_id);
    if (invoice) {
      invoice.amount_paid -= payment.amount_paid;
      invoice.balance = invoice.amount_due - invoice.amount_paid;
      invoice.status = invoice.balance > 0 ? 'pending' : 'paid';
    }
  }

  console.log(`[MOCK PAYMENTS] Refunded payment ${paymentId}`);
  return payment;
}

export async function getPaymentStats(): Promise<{
  total_payments: number;
  total_collected: number;
  today_collected: number;
  this_month_collected: number;
  by_method: Record<PaymentMethod, { count: number; amount: number }>;
  recent_payments: Payment[];
}> {
  await simulateDelay();

  const activePayments = mockPayments.filter((p) => p.status === 'captured');
  const today = new Date().toISOString().split('T')[0];
  const monthStart = new Date().toISOString().slice(0, 7);

  const todayPayments = activePayments.filter((p) => p.payment_date === today);
  const monthPayments = activePayments.filter((p) => p.payment_date.startsWith(monthStart));

  const byMethod: Record<PaymentMethod, { count: number; amount: number }> = {
    upi: { count: 0, amount: 0 },
    card: { count: 0, amount: 0 },
    bank_transfer: { count: 0, amount: 0 },
    cash: { count: 0, amount: 0 },
    cheque: { count: 0, amount: 0 },
    netbanking: { count: 0, amount: 0 },
    razorpay: { count: 0, amount: 0 },
  };

  activePayments.forEach((p) => {
    if (p.method) {
      byMethod[p.method].count++;
      byMethod[p.method].amount += p.amount_paid;
    }
  });

  return {
    total_payments: activePayments.length,
    total_collected: activePayments.reduce((sum, p) => sum + p.amount_paid, 0),
    today_collected: todayPayments.reduce((sum, p) => sum + p.amount_paid, 0),
    this_month_collected: monthPayments.reduce((sum, p) => sum + p.amount_paid, 0),
    by_method: byMethod,
    recent_payments: activePayments.slice(-10).reverse(),
  };
}

export async function getDailyCollections(days: number = 30): Promise<
  Array<{ date: string; amount: number; count: number }>
> {
  await simulateDelay();

  const activePayments = mockPayments.filter((p) => p.status === 'captured');
  const collections: Record<string, { amount: number; count: number }> = {};

  // Initialize last N days
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    collections[dateStr] = { amount: 0, count: 0 };
  }

  activePayments.forEach((p) => {
    if (collections[p.payment_date]) {
      collections[p.payment_date].amount += p.amount_paid;
      collections[p.payment_date].count++;
    }
  });

  return Object.entries(collections)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function resetPayments(): Promise<void> {
  mockPayments = await generateInitialPayments();
  paymentIdCounter = 20000;
  console.log('[MOCK PAYMENTS] Reset to initial state');
}

export const mockPaymentsProvider = {
  getPayments,
  getPaymentById,
  getPaymentsByInvoice,
  getStudentPayments,
  recordPayment,
  refundPayment,
  getPaymentStats,
  getDailyCollections,
  resetPayments,
};
