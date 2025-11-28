// ============================================================================
// MOCK INVOICES - Mirrors backend invoice model
// ============================================================================

import type {
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  BulkInvoiceCreate,
  BulkInvoiceResult,
} from '../../services/finance/types';
import { MOCK_STUDENTS, getStudentsByClass } from './mockStudents';
import { getClassById } from './mockClasses';
import { mockClassMappingsProvider } from './mockClassMappings';
import { mockOverridesProvider } from './mockOverrides';
import { mockDiscountsProvider } from './mockDiscounts';

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

let invoiceIdCounter = 10000;
let invoiceItemIdCounter = 50000;

// Generate realistic invoices for all students
function generateInitialInvoices(): Invoice[] {
  const invoices: Invoice[] = [];

  MOCK_STUDENTS.forEach((student) => {
    const classInfo = getClassById(student.class_id);
    if (!classInfo) return;

    // Determine base fee based on grade
    let baseFee: number;
    let items: InvoiceItem[];

    if (classInfo.grade_level <= 5) {
      baseFee = 49000;
      items = [
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 1, component_name: 'Tuition Fee', original_amount: 35000, discount_amount: 0, final_amount: 35000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 7, component_name: 'Library Fee', original_amount: 2000, discount_amount: 0, final_amount: 2000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 10, component_name: 'Text Books', original_amount: 4500, discount_amount: 0, final_amount: 4500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 11, component_name: 'Notebooks & Stationery', original_amount: 1500, discount_amount: 0, final_amount: 1500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 12, component_name: 'Activity Fee', original_amount: 2500, discount_amount: 0, final_amount: 2500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 9, component_name: 'School Uniform', original_amount: 3500, discount_amount: 0, final_amount: 3500 },
      ];
    } else if (classInfo.grade_level <= 8) {
      baseFee = 69500;
      items = [
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 1, component_name: 'Tuition Fee', original_amount: 45000, discount_amount: 0, final_amount: 45000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 5, component_name: 'Science Lab Fee', original_amount: 4000, discount_amount: 0, final_amount: 4000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 6, component_name: 'Computer Lab Fee', original_amount: 3500, discount_amount: 0, final_amount: 3500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 7, component_name: 'Library Fee', original_amount: 2500, discount_amount: 0, final_amount: 2500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 10, component_name: 'Text Books', original_amount: 5500, discount_amount: 0, final_amount: 5500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 11, component_name: 'Notebooks & Stationery', original_amount: 2000, discount_amount: 0, final_amount: 2000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 12, component_name: 'Activity Fee', original_amount: 3000, discount_amount: 0, final_amount: 3000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 9, component_name: 'School Uniform', original_amount: 4000, discount_amount: 0, final_amount: 4000 },
      ];
    } else {
      baseFee = 84500;
      items = [
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 1, component_name: 'Tuition Fee', original_amount: 55000, discount_amount: 0, final_amount: 55000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 5, component_name: 'Science Lab Fee', original_amount: 5000, discount_amount: 0, final_amount: 5000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 6, component_name: 'Computer Lab Fee', original_amount: 4000, discount_amount: 0, final_amount: 4000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 7, component_name: 'Library Fee', original_amount: 3000, discount_amount: 0, final_amount: 3000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 10, component_name: 'Text Books', original_amount: 7000, discount_amount: 0, final_amount: 7000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 11, component_name: 'Notebooks & Stationery', original_amount: 2500, discount_amount: 0, final_amount: 2500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 13, component_name: 'Annual Exam Fee', original_amount: 3500, discount_amount: 0, final_amount: 3500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 9, component_name: 'School Uniform', original_amount: 4500, discount_amount: 0, final_amount: 4500 },
      ];
    }

    // Random discount (about 25% of students)
    const hasDiscount = Math.random() < 0.25;
    let totalDiscount = 0;
    const discountsApplied: { discount_id: number; discount_name: string; amount: number }[] = [];

    if (hasDiscount) {
      const discountAmount = Math.floor(Math.random() * 4) * 1000 + 2000; // 2000-8000
      totalDiscount = discountAmount;
      discountsApplied.push({
        discount_id: Math.floor(Math.random() * 5) + 1,
        discount_name: ['Sibling Discount', 'Merit Scholarship', 'Staff Child', 'Early Bird', 'EWS'][Math.floor(Math.random() * 5)],
        amount: discountAmount,
      });

      // Apply discount to first item (tuition)
      items[0].discount_amount = Math.min(discountAmount, items[0].original_amount);
      items[0].final_amount = items[0].original_amount - items[0].discount_amount;
    }

    const amountDue = baseFee - totalDiscount;

    // Generate payment status with realistic distribution
    // 60% fully paid, 25% partially paid, 10% pending, 5% overdue
    const statusRoll = Math.random();
    let status: InvoiceStatus;
    let amountPaid: number;
    let paymentStatus: 'unpaid' | 'partially_paid' | 'paid';

    if (statusRoll < 0.60) {
      status = 'paid';
      amountPaid = amountDue;
      paymentStatus = 'paid';
    } else if (statusRoll < 0.85) {
      status = 'partially_paid';
      amountPaid = Math.round(amountDue * (0.3 + Math.random() * 0.5)); // 30-80% paid
      paymentStatus = 'partially_paid';
    } else if (statusRoll < 0.95) {
      status = 'pending';
      amountPaid = 0;
      paymentStatus = 'unpaid';
    } else {
      status = 'overdue';
      amountPaid = 0;
      paymentStatus = 'unpaid';
    }

    const invoiceId = ++invoiceIdCounter;

    // Update item invoice_id references
    items = items.map(item => ({ ...item, invoice_id: invoiceId }));

    invoices.push({
      invoice_id: invoiceId,
      invoice_number: `INV-2025-${String(invoiceId).padStart(6, '0')}`,
      school_id: 1,
      student_id: student.student_id,
      student_name: student.student_name,
      roll_no: student.roll_no,
      class_id: student.class_id,
      class_name: student.class_name,
      fee_term_id: 1,
      fee_structure_id: classInfo.grade_level <= 5 ? 1 : classInfo.grade_level <= 8 ? 2 : 3,
      issue_date: '2025-04-15',
      due_date: '2025-06-30',
      amount_due: amountDue,
      amount_paid: amountPaid,
      balance: amountDue - amountPaid,
      status,
      items,
      discounts_applied: discountsApplied,
      payment_status: paymentStatus,
      is_active: true,
      created_at: '2025-04-15T00:00:00Z',
    });
  });

  return invoices;
}

let mockInvoices: Invoice[] = generateInitialInvoices();

// ============================================================================
// DELAY SIMULATION
// ============================================================================

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getInvoices(
  filters?: {
    classId?: number;
    studentId?: number;
    status?: InvoiceStatus;
    fromDate?: string;
    toDate?: string;
  }
): Promise<Invoice[]> {
  await simulateDelay();

  let filtered = mockInvoices.filter((inv) => inv.is_active);

  if (filters?.classId) {
    filtered = filtered.filter((inv) => inv.class_id === filters.classId);
  }
  if (filters?.studentId) {
    filtered = filtered.filter((inv) => inv.student_id === filters.studentId);
  }
  if (filters?.status) {
    filtered = filtered.filter((inv) => inv.status === filters.status);
  }
  if (filters?.fromDate) {
    filtered = filtered.filter((inv) => inv.issue_date >= filters.fromDate!);
  }
  if (filters?.toDate) {
    filtered = filtered.filter((inv) => inv.issue_date <= filters.toDate!);
  }

  console.log(`[MOCK INVOICES] getInvoices → ${filtered.length} invoices`);
  return filtered;
}

export async function getInvoiceById(invoiceId: number): Promise<Invoice | null> {
  await simulateDelay(100);
  return mockInvoices.find((inv) => inv.invoice_id === invoiceId && inv.is_active) || null;
}

export async function getStudentInvoices(studentId: number): Promise<Invoice[]> {
  await simulateDelay();
  return mockInvoices.filter((inv) => inv.student_id === studentId && inv.is_active);
}

export async function generateBulkInvoices(data: BulkInvoiceCreate): Promise<BulkInvoiceResult> {
  await simulateDelay(800);

  const classStudents = getStudentsByClass(data.class_id);
  const classInfo = getClassById(data.class_id);

  if (!classInfo || classStudents.length === 0) {
    return {
      successful: 0,
      failed: 0,
      invoices: [],
      errors: ['No students found in the specified class'],
    };
  }

  // Get mappings and determine fee structure
  const mappings = await mockClassMappingsProvider.getMappingsByClass(data.class_id);
  const mainMapping = mappings[0];

  if (!mainMapping) {
    return {
      successful: 0,
      failed: 0,
      invoices: [],
      errors: ['No fee template mapped to this class'],
    };
  }

  const generatedInvoices: Invoice[] = [];

  for (const student of classStudents) {
    // Check if invoice already exists
    const existingInvoice = mockInvoices.find(
      (inv) => inv.student_id === student.student_id && inv.fee_term_id === data.fee_term_id && inv.is_active
    );

    if (existingInvoice) {
      continue; // Skip if already exists
    }

    // Get student overrides
    const overrides = await mockOverridesProvider.getStudentOverrides({ studentId: student.student_id });

    // Get student discounts
    const discounts = await mockDiscountsProvider.getStudentDiscountAssignments({ studentId: student.student_id });

    // Build invoice items
    let items: InvoiceItem[];

    if (classInfo.grade_level <= 5) {
      items = [
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 1, component_name: 'Tuition Fee', original_amount: 35000, discount_amount: 0, final_amount: 35000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 7, component_name: 'Library Fee', original_amount: 2000, discount_amount: 0, final_amount: 2000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 10, component_name: 'Text Books', original_amount: 4500, discount_amount: 0, final_amount: 4500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 11, component_name: 'Notebooks & Stationery', original_amount: 1500, discount_amount: 0, final_amount: 1500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 12, component_name: 'Activity Fee', original_amount: 2500, discount_amount: 0, final_amount: 2500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 9, component_name: 'School Uniform', original_amount: 3500, discount_amount: 0, final_amount: 3500 },
      ];
    } else if (classInfo.grade_level <= 8) {
      // Middle school fees (grades 6-8): total ~69,500
      items = [
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 1, component_name: 'Tuition Fee', original_amount: 45000, discount_amount: 0, final_amount: 45000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 5, component_name: 'Science Lab Fee', original_amount: 4000, discount_amount: 0, final_amount: 4000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 6, component_name: 'Computer Lab Fee', original_amount: 3500, discount_amount: 0, final_amount: 3500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 7, component_name: 'Library Fee', original_amount: 2500, discount_amount: 0, final_amount: 2500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 10, component_name: 'Text Books', original_amount: 5500, discount_amount: 0, final_amount: 5500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 11, component_name: 'Notebooks & Stationery', original_amount: 2000, discount_amount: 0, final_amount: 2000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 12, component_name: 'Activity Fee', original_amount: 3000, discount_amount: 0, final_amount: 3000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 9, component_name: 'School Uniform', original_amount: 4000, discount_amount: 0, final_amount: 4000 },
      ];
    } else {
      // Secondary school fees (grades 9-10): total ~84,500
      items = [
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 1, component_name: 'Tuition Fee', original_amount: 55000, discount_amount: 0, final_amount: 55000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 5, component_name: 'Science Lab Fee', original_amount: 5000, discount_amount: 0, final_amount: 5000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 6, component_name: 'Computer Lab Fee', original_amount: 4000, discount_amount: 0, final_amount: 4000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 7, component_name: 'Library Fee', original_amount: 3000, discount_amount: 0, final_amount: 3000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 10, component_name: 'Text Books', original_amount: 7000, discount_amount: 0, final_amount: 7000 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 11, component_name: 'Notebooks & Stationery', original_amount: 2500, discount_amount: 0, final_amount: 2500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 13, component_name: 'Annual Exam Fee', original_amount: 3500, discount_amount: 0, final_amount: 3500 },
        { item_id: ++invoiceItemIdCounter, invoice_id: 0, fee_component_id: 9, component_name: 'School Uniform', original_amount: 4500, discount_amount: 0, final_amount: 4500 },
      ];
    }

    // Apply overrides (opt-outs)
    overrides.forEach((override) => {
      if (!override.is_active) {
        // Remove component if opted out
        const itemIndex = items.findIndex((item) => item.fee_component_id === override.component_id);
        if (itemIndex !== -1) {
          items.splice(itemIndex, 1);
        }
      } else if (override.override_amount !== override.original_amount) {
        // Apply override amount
        const item = items.find((item) => item.fee_component_id === override.component_id);
        if (item) {
          item.override_amount = override.override_amount;
          item.final_amount = override.override_amount;
        }
      }
    });

    // Apply discounts
    let totalDiscount = 0;
    const discountsApplied: { discount_id: number; discount_name: string; amount: number }[] = [];

    discounts.filter(d => d.is_active).forEach((discount) => {
      totalDiscount += discount.calculated_discount;
      discountsApplied.push({
        discount_id: discount.discount_id,
        discount_name: discount.discount_name,
        amount: discount.calculated_discount,
      });
    });

    // Apply discount to items proportionally
    if (totalDiscount > 0 && items.length > 0) {
      const discountPerItem = Math.floor(totalDiscount / items.length);
      items.forEach((item) => {
        item.discount_amount = Math.min(discountPerItem, item.final_amount);
        item.final_amount -= item.discount_amount;
      });
    }

    const amountDue = items.reduce((sum, item) => sum + item.final_amount, 0);
    const invoiceId = ++invoiceIdCounter;

    // Update item invoice_id references
    items = items.map(item => ({ ...item, invoice_id: invoiceId }));

    const newInvoice: Invoice = {
      invoice_id: invoiceId,
      invoice_number: `INV-2025-${String(invoiceId).padStart(6, '0')}`,
      school_id: 1,
      student_id: student.student_id,
      student_name: student.student_name,
      roll_no: student.roll_no,
      class_id: student.class_id,
      class_name: student.class_name,
      fee_term_id: data.fee_term_id,
      fee_structure_id: mainMapping.template_id,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: data.due_date,
      amount_due: amountDue,
      amount_paid: 0,
      balance: amountDue,
      status: 'pending',
      items,
      discounts_applied: discountsApplied,
      payment_status: 'unpaid',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    mockInvoices.push(newInvoice);
    generatedInvoices.push(newInvoice);
  }

  console.log(`[MOCK INVOICES] Generated ${generatedInvoices.length} invoices for class ${data.class_id}`);

  return {
    successful: generatedInvoices.length,
    failed: 0,
    invoices: generatedInvoices,
  };
}

export async function updateInvoiceStatus(
  invoiceId: number,
  status: InvoiceStatus
): Promise<Invoice | null> {
  await simulateDelay(200);

  const invoice = mockInvoices.find((inv) => inv.invoice_id === invoiceId);
  if (!invoice) return null;

  invoice.status = status;
  invoice.updated_at = new Date().toISOString();

  console.log(`[MOCK INVOICES] Updated invoice ${invoiceId} status to ${status}`);
  return invoice;
}

export async function cancelInvoice(invoiceId: number): Promise<boolean> {
  await simulateDelay(200);

  const invoice = mockInvoices.find((inv) => inv.invoice_id === invoiceId);
  if (!invoice) return false;

  invoice.status = 'cancelled';
  invoice.is_active = false;
  invoice.updated_at = new Date().toISOString();

  console.log(`[MOCK INVOICES] Cancelled invoice ${invoiceId}`);
  return true;
}

export async function getInvoiceStats(): Promise<{
  total_invoices: number;
  total_amount: number;
  collected_amount: number;
  pending_amount: number;
  overdue_count: number;
  paid_percentage: number;
}> {
  await simulateDelay();

  const activeInvoices = mockInvoices.filter((inv) => inv.is_active);
  const totalAmount = activeInvoices.reduce((sum, inv) => sum + inv.amount_due, 0);
  const collectedAmount = activeInvoices.reduce((sum, inv) => sum + inv.amount_paid, 0);
  const overdueCount = activeInvoices.filter((inv) => inv.status === 'overdue').length;

  return {
    total_invoices: activeInvoices.length,
    total_amount: totalAmount,
    collected_amount: collectedAmount,
    pending_amount: totalAmount - collectedAmount,
    overdue_count: overdueCount,
    paid_percentage: totalAmount > 0 ? Math.round((collectedAmount / totalAmount) * 100) : 0,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function resetInvoices(): void {
  mockInvoices = generateInitialInvoices();
  invoiceIdCounter = 10000;
  invoiceItemIdCounter = 50000;
  console.log('[MOCK INVOICES] Reset to initial state');
}

export const mockInvoicesProvider = {
  getInvoices,
  getInvoiceById,
  getStudentInvoices,
  generateBulkInvoices,
  updateInvoiceStatus,
  cancelInvoice,
  getInvoiceStats,
  resetInvoices,
};
