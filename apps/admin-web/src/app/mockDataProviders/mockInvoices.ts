// ============================================================================
// MOCK INVOICES & PAYMENTS DATA PROVIDER
// ============================================================================

import { mockStudentsProvider } from "./mockStudents";

export interface InvoiceData {
  invoice_id: number;
  student_id: number;
  student_name?: string;
  academic_year_id: number;
  invoice_number: string;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "partially_paid" | "overdue" | "cancelled";
  payment_link?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface PaymentData {
  payment_id: number;
  invoice_id?: number | null;
  order_id?: number | null;
  amount: number;
  payment_method: "razorpay" | "cash" | "cheque" | "bank_transfer";
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  razorpay_payment_id?: string | null;
  razorpay_order_id?: string | null;
  transaction_date?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface FeeComponentData {
  fee_component_id: number;
  school_id: number;
  name: string;
  amount: number;
  is_mandatory: boolean;
  created_at: string;
}

function generateInvoices(): InvoiceData[] {
  const invoices: InvoiceData[] = [];
  const students = mockStudentsProvider.allStudents;
  const statuses: Array<"pending" | "paid" | "partially_paid" | "overdue"> = ["paid", "paid", "paid", "pending", "overdue", "partially_paid"];

  students.forEach((student, idx) => {
    const status = statuses[idx % statuses.length];
    const baseAmount = 25000; // Base fee
    const dueDate = new Date(2025, 10, 15); // Nov 15, 2025
    const isOverdue = status === "overdue";

    invoices.push({
      invoice_id: idx + 1,
      student_id: student.student_id,
      student_name: `${student.first_name} ${student.last_name}`,
      academic_year_id: 1,
      invoice_number: `INV-2025-${String(idx + 1).padStart(5, "0")}`,
      amount: baseAmount + Math.floor(Math.random() * 5000),
      due_date: dueDate.toISOString().split("T")[0],
      status,
      payment_link: status === "pending" || status === "overdue" ? `https://pay.razorpay.com/invoice_${idx + 1}` : null,
      notes: isOverdue ? "Payment overdue - please settle immediately" : null,
      created_at: "2025-09-01T00:00:00Z",
      updated_at: status === "paid" ? "2025-10-10T00:00:00Z" : null,
    });
  });

  return invoices;
}

function generatePayments(invoices: InvoiceData[]): PaymentData[] {
  const payments: PaymentData[] = [];
  let paymentId = 1;

  invoices.forEach((invoice) => {
    if (invoice.status === "paid") {
      payments.push({
        payment_id: paymentId++,
        invoice_id: invoice.invoice_id,
        order_id: null,
        amount: invoice.amount,
        payment_method: "razorpay",
        status: "completed",
        razorpay_payment_id: `pay_${Math.random().toString(36).substring(7)}`,
        razorpay_order_id: `order_${Math.random().toString(36).substring(7)}`,
        transaction_date: "2025-10-10T00:00:00Z",
        created_at: "2025-10-10T00:00:00Z",
        updated_at: "2025-10-10T00:00:00Z",
      });
    } else if (invoice.status === "partially_paid") {
      payments.push({
        payment_id: paymentId++,
        invoice_id: invoice.invoice_id,
        order_id: null,
        amount: Math.floor(invoice.amount * 0.5),
        payment_method: "cash",
        status: "completed",
        razorpay_payment_id: null,
        razorpay_order_id: null,
        transaction_date: "2025-10-05T00:00:00Z",
        created_at: "2025-10-05T00:00:00Z",
        updated_at: "2025-10-05T00:00:00Z",
      });
    }
  });

  return payments;
}

const MOCK_FEE_COMPONENTS: FeeComponentData[] = [
  {
    fee_component_id: 1,
    school_id: 1,
    name: "Tuition Fee",
    amount: 15000,
    is_mandatory: true,
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    fee_component_id: 2,
    school_id: 1,
    name: "Development Fee",
    amount: 5000,
    is_mandatory: true,
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    fee_component_id: 3,
    school_id: 1,
    name: "Sports Fee",
    amount: 2000,
    is_mandatory: false,
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    fee_component_id: 4,
    school_id: 1,
    name: "Library Fee",
    amount: 1500,
    is_mandatory: true,
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    fee_component_id: 5,
    school_id: 1,
    name: "Lab Fee",
    amount: 3000,
    is_mandatory: false,
    created_at: "2025-04-01T00:00:00Z",
  },
  {
    fee_component_id: 6,
    school_id: 1,
    name: "Transport Fee",
    amount: 4000,
    is_mandatory: false,
    created_at: "2025-04-01T00:00:00Z",
  },
];

const MOCK_INVOICES = generateInvoices();
const MOCK_PAYMENTS = generatePayments(MOCK_INVOICES);

async function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getInvoices(params?: {
  school_id?: number;
  student_id?: number;
  status?: string;
}): Promise<{ items: InvoiceData[]; total: number }> {
  await simulateDelay(300);

  let filtered = [...MOCK_INVOICES];

  if (params?.student_id) {
    filtered = filtered.filter(i => i.student_id === params.student_id);
  }

  if (params?.status) {
    filtered = filtered.filter(i => i.status === params.status);
  }

  console.log(`[MOCK INVOICES] getInvoices → ${filtered.length} invoices`);
  return {
    items: filtered,
    total: filtered.length,
  };
}

export async function getStudentInvoices(studentId: number): Promise<InvoiceData[]> {
  await simulateDelay(250);

  const filtered = MOCK_INVOICES.filter(i => i.student_id === studentId);
  console.log(`[MOCK INVOICES] getStudentInvoices(${studentId}) → ${filtered.length} invoices`);
  return filtered;
}

export async function generateInvoice(payload: {
  student_id: number;
  academic_year_id: number;
  amount: number;
  due_date: string;
  notes?: string;
}): Promise<InvoiceData> {
  await simulateDelay(200);

  const student = mockStudentsProvider.allStudents.find(s => s.student_id === payload.student_id);
  const newInvoice: InvoiceData = {
    invoice_id: MOCK_INVOICES.length + 1,
    student_id: payload.student_id,
    student_name: student ? `${student.first_name} ${student.last_name}` : "Unknown Student",
    academic_year_id: payload.academic_year_id,
    invoice_number: `INV-2025-${String(MOCK_INVOICES.length + 1).padStart(5, "0")}`,
    amount: payload.amount,
    due_date: payload.due_date,
    status: "pending",
    payment_link: `https://pay.razorpay.com/invoice_${MOCK_INVOICES.length + 1}`,
    notes: payload.notes || null,
    created_at: new Date().toISOString(),
    updated_at: null,
  };

  MOCK_INVOICES.push(newInvoice);
  console.log(`[MOCK INVOICES] generateInvoice → Created invoice ${newInvoice.invoice_number}`);
  return newInvoice;
}

export async function getPayments(params?: {
  invoice_id?: number;
  status?: string;
}): Promise<{ items: PaymentData[]; total: number }> {
  await simulateDelay(250);

  let filtered = [...MOCK_PAYMENTS];

  if (params?.invoice_id) {
    filtered = filtered.filter(p => p.invoice_id === params.invoice_id);
  }

  if (params?.status) {
    filtered = filtered.filter(p => p.status === params.status);
  }

  console.log(`[MOCK PAYMENTS] getPayments → ${filtered.length} payments`);
  return {
    items: filtered,
    total: filtered.length,
  };
}

export async function initiatePayment(payload: {
  invoice_id?: number;
  order_id?: number;
  amount: number;
  payment_method?: string;
}): Promise<{
  payment_id: number;
  razorpay_order_id?: string;
  razorpay_key_id?: string;
  amount: number;
  currency: string;
}> {
  await simulateDelay(300);

  const newPayment: PaymentData = {
    payment_id: MOCK_PAYMENTS.length + 1,
    invoice_id: payload.invoice_id || null,
    order_id: payload.order_id || null,
    amount: payload.amount,
    payment_method: "razorpay",
    status: "pending",
    razorpay_payment_id: null,
    razorpay_order_id: `order_${Math.random().toString(36).substring(7)}`,
    transaction_date: null,
    created_at: new Date().toISOString(),
    updated_at: null,
  };

  MOCK_PAYMENTS.push(newPayment);

  console.log(`[MOCK PAYMENTS] initiatePayment → Created payment ${newPayment.payment_id}`);
  return {
    payment_id: newPayment.payment_id,
    razorpay_order_id: newPayment.razorpay_order_id!,
    razorpay_key_id: "rzp_test_mock_key",
    amount: newPayment.amount,
    currency: "INR",
  };
}

export async function getFeeComponents(schoolId: number): Promise<FeeComponentData[]> {
  await simulateDelay(200);

  const filtered = MOCK_FEE_COMPONENTS.filter(fc => fc.school_id === schoolId);
  console.log(`[MOCK FEE COMPONENTS] getFeeComponents → ${filtered.length} components`);
  return filtered;
}

export const mockInvoicesProvider = {
  getInvoices,
  getStudentInvoices,
  generateInvoice,
  allInvoices: MOCK_INVOICES,
};

export const mockPaymentsProvider = {
  getPayments,
  initiatePayment,
  allPayments: MOCK_PAYMENTS,
};

export const mockFeeComponentsProvider = {
  getFeeComponents,
  allFeeComponents: MOCK_FEE_COMPONENTS,
};
