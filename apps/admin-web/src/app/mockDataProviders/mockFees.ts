// ============================================================================
// MOCK FEES DATA PROVIDER
// ============================================================================

export interface FeeStructure {
  id: number;
  school_id: number;
  class_id: number;
  section: string;
  academic_year_id: number;
  fee_type: string;
  amount: number;
  due_date: string;
  is_mandatory: boolean;
}

export interface Invoice {
  id: number;
  student_id: number;
  student_name: string;
  class_id: number;
  section: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";
  due_date: string;
  created_at: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: number;
  fee_type: string;
  description: string;
  amount: number;
  discount: number;
  final_amount: number;
}

export interface Payment {
  id: number;
  invoice_id: number;
  student_id: number;
  amount: number;
  payment_method: "CASH" | "CARD" | "ONLINE" | "CHEQUE";
  transaction_id: string;
  payment_date: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
}

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================
let invoiceIdCounter = 1000;
let paymentIdCounter = 5000;

const mockFeeStructures: FeeStructure[] = [
  { id: 1, school_id: 1, class_id: 1, section: "A", academic_year_id: 2025, fee_type: "Tuition Fee", amount: 5000, due_date: "2025-04-30", is_mandatory: true },
  { id: 2, school_id: 1, class_id: 1, section: "A", academic_year_id: 2025, fee_type: "Library Fee", amount: 500, due_date: "2025-04-30", is_mandatory: true },
  { id: 3, school_id: 1, class_id: 1, section: "A", academic_year_id: 2025, fee_type: "Sports Fee", amount: 300, due_date: "2025-04-30", is_mandatory: false },
  { id: 4, school_id: 1, class_id: 1, section: "A", academic_year_id: 2025, fee_type: "Lab Fee", amount: 700, due_date: "2025-04-30", is_mandatory: true },
];

const mockInvoices: Invoice[] = [];
const mockPayments: Payment[] = [];

// ============================================================================
// INITIALIZATION
// ============================================================================
function initializeMockFees() {
  if (mockInvoices.length > 0) return;

  // Generate invoices for student IDs 1-700 (matching mockStudents pattern)
  for (let studentId = 1; studentId <= 700; studentId++) {
    const classId = Math.ceil(studentId / 70); // Approx 70 students per class (classes 1-10)
    const totalAmount = 6500; // Sum of all fees
    const paidAmount = Math.random() > 0.3 ? totalAmount : Math.floor(Math.random() * totalAmount);
    const pendingAmount = totalAmount - paidAmount;

    let status: Invoice["status"];
    if (paidAmount === totalAmount) status = "PAID";
    else if (paidAmount > 0) status = "PARTIAL";
    else if (new Date() > new Date("2025-04-30")) status = "OVERDUE";
    else status = "PENDING";

    const invoice: Invoice = {
      id: ++invoiceIdCounter,
      student_id: studentId,
      student_name: `Student ${studentId}`,
      class_id: classId,
      section: studentId % 2 === 0 ? "A" : "B",
      invoice_number: `INV-2025-${String(invoiceIdCounter).padStart(6, "0")}`,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      pending_amount: pendingAmount,
      status,
      due_date: "2025-04-30",
      created_at: "2025-03-01T10:00:00Z",
      items: [
        { id: 1, fee_type: "Tuition Fee", description: "Annual tuition fee", amount: 5000, discount: 0, final_amount: 5000 },
        { id: 2, fee_type: "Library Fee", description: "Annual library fee", amount: 500, discount: 0, final_amount: 500 },
        { id: 3, fee_type: "Sports Fee", description: "Annual sports fee", amount: 300, discount: 0, final_amount: 300 },
        { id: 4, fee_type: "Lab Fee", description: "Annual lab fee", amount: 700, discount: 0, final_amount: 700 },
      ],
    };

    mockInvoices.push(invoice);
  }

  console.log(`[MOCK FEES] Initialized ${mockInvoices.length} invoices`);
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getMockFeeStructures(filters?: {
  class_id?: number;
  academic_year_id?: number;
}): Promise<FeeStructure[]> {
  await simulateDelay();

  let filtered = mockFeeStructures;
  if (filters?.class_id) filtered = filtered.filter((f) => f.class_id === filters.class_id);
  if (filters?.academic_year_id) filtered = filtered.filter((f) => f.academic_year_id === filters.academic_year_id);

  console.log(`[MOCK FEES] getFeeStructures → ${filtered.length} structures`);
  return filtered;
}

export async function getMockInvoices(filters?: {
  student_id?: number;
  class_id?: number;
  status?: string;
}): Promise<Invoice[]> {
  initializeMockFees();
  await simulateDelay();

  let filtered = mockInvoices;
  if (filters?.student_id) filtered = filtered.filter((i) => i.student_id === filters.student_id);
  if (filters?.class_id) filtered = filtered.filter((i) => i.class_id === filters.class_id);
  if (filters?.status) filtered = filtered.filter((i) => i.status === filters.status);

  console.log(`[MOCK FEES] getInvoices → ${filtered.length} invoices`);
  return filtered;
}

export async function getMockInvoiceById(id: number): Promise<Invoice> {
  initializeMockFees();
  await simulateDelay();

  const invoice = mockInvoices.find((i) => i.id === id);
  if (!invoice) throw new Error(`Invoice #${id} not found`);

  console.log(`[MOCK FEES] getInvoiceById(${id})`);
  return invoice;
}

export async function generateMockInvoice(studentId: number): Promise<Invoice> {
  initializeMockFees();
  await simulateDelay(400);

  const totalAmount = 6500;
  const invoice: Invoice = {
    id: ++invoiceIdCounter,
    student_id: studentId,
    student_name: `Student ${studentId % 1000}`,
    class_id: Math.floor(studentId / 1000),
    section: "A",
    invoice_number: `INV-2025-${String(invoiceIdCounter).padStart(6, "0")}`,
    total_amount: totalAmount,
    paid_amount: 0,
    pending_amount: totalAmount,
    status: "PENDING",
    due_date: "2025-04-30",
    created_at: new Date().toISOString(),
    items: [
      { id: 1, fee_type: "Tuition Fee", description: "Annual tuition fee", amount: 5000, discount: 0, final_amount: 5000 },
      { id: 2, fee_type: "Library Fee", description: "Annual library fee", amount: 500, discount: 0, final_amount: 500 },
      { id: 3, fee_type: "Sports Fee", description: "Annual sports fee", amount: 300, discount: 0, final_amount: 300 },
      { id: 4, fee_type: "Lab Fee", description: "Annual lab fee", amount: 700, discount: 0, final_amount: 700 },
    ],
  };

  mockInvoices.push(invoice);
  console.log(`[MOCK FEES] Generated invoice #${invoice.id}`);
  return invoice;
}

export async function recordMockPayment(data: {
  invoice_id: number;
  amount: number;
  payment_method: Payment["payment_method"];
}): Promise<Payment> {
  initializeMockFees();
  await simulateDelay(300);

  const invoice = mockInvoices.find((i) => i.id === data.invoice_id);
  if (!invoice) throw new Error(`Invoice #${data.invoice_id} not found`);

  const payment: Payment = {
    id: ++paymentIdCounter,
    invoice_id: data.invoice_id,
    student_id: invoice.student_id,
    amount: data.amount,
    payment_method: data.payment_method,
    transaction_id: `TXN-${Date.now()}-${paymentIdCounter}`,
    payment_date: new Date().toISOString(),
    status: "SUCCESS",
  };

  mockPayments.push(payment);

  // Update invoice
  invoice.paid_amount += data.amount;
  invoice.pending_amount = invoice.total_amount - invoice.paid_amount;
  invoice.status = invoice.pending_amount === 0 ? "PAID" : "PARTIAL";

  console.log(`[MOCK FEES] Recorded payment #${payment.id}`);
  return payment;
}

export async function getMockPayments(invoiceId: number): Promise<Payment[]> {
  await simulateDelay();

  const payments = mockPayments.filter((p) => p.invoice_id === invoiceId);
  console.log(`[MOCK FEES] getPayments(${invoiceId}) → ${payments.length} payments`);
  return payments;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export async function getMockFeeAnalytics(_filters: { academic_year_id: number }): Promise<{
  total_revenue: number;
  pending_revenue: number;
  collection_rate: number;
  overdue_count: number;
}> {
  initializeMockFees();
  await simulateDelay();

  const total_revenue = mockInvoices.reduce((sum, i) => sum + i.paid_amount, 0);
  const pending_revenue = mockInvoices.reduce((sum, i) => sum + i.pending_amount, 0);
  const total_expected = mockInvoices.reduce((sum, i) => sum + i.total_amount, 0);
  const collection_rate = total_expected > 0 ? (total_revenue / total_expected) * 100 : 0;
  const overdue_count = mockInvoices.filter((i) => i.status === "OVERDUE").length;

  console.log(`[MOCK FEES] getFeeAnalytics → revenue: ${total_revenue}`);
  return {
    total_revenue: Math.round(total_revenue),
    pending_revenue: Math.round(pending_revenue),
    collection_rate: Math.round(collection_rate * 10) / 10,
    overdue_count,
  };
}

// ============================================================================
// UTILITIES
// ============================================================================
function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// EXPORTS
// ============================================================================
export const mockFeesProvider = {
  getFeeStructures: getMockFeeStructures,
  getInvoices: getMockInvoices,
  getInvoiceById: getMockInvoiceById,
  generateInvoice: generateMockInvoice,
  recordPayment: recordMockPayment,
  getPayments: getMockPayments,
  getFeeAnalytics: getMockFeeAnalytics,
};
