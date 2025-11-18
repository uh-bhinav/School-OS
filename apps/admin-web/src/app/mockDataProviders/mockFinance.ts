// ============================================================================
// MOCK FINANCE DATA PROVIDER
// ============================================================================
// Comprehensive mock data for all finance-related features

import type {
  FeeComponent,
  FeeTemplate,
  StudentFeeAssignment,
  Invoice,
  InvoiceKpi,
  Payment,
  PaymentKpi,
  Order,
  OrderKpi,
  Discount,
  DiscountKpi,
  Refund,
  RefundKpi,
} from "../services/finance.schema";

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================
let mockFeeComponents: FeeComponent[] = [];
let mockFeeTemplates: FeeTemplate[] = [];
let mockStudentFeeAssignments: StudentFeeAssignment[] = [];
let mockInvoices: Invoice[] = [];
let mockPayments: Payment[] = [];
let mockOrders: Order[] = [];
let mockDiscounts: Discount[] = [];
let mockRefunds: Refund[] = [];

// ============================================================================
// INITIALIZATION
// ============================================================================
function initializeMockFinance() {
  if (mockFeeComponents.length > 0) return;

  // Fee Components
  mockFeeComponents = [
    { component_id: 1, school_id: 1, name: "Tuition Fee", description: "Annual tuition", default_amount: 50000, is_optional: false, is_active: true, category: "Tuition" },
    { component_id: 2, school_id: 1, name: "Transport Fee", description: "School bus", default_amount: 12000, is_optional: true, is_active: true, category: "Transport" },
    { component_id: 3, school_id: 1, name: "Lab Fee", description: "Science lab usage", default_amount: 5000, is_optional: false, is_active: true, category: "Lab" },
    { component_id: 4, school_id: 1, name: "Library Fee", description: "Library access", default_amount: 2000, is_optional: false, is_active: true, category: "Library" },
    { component_id: 5, school_id: 1, name: "Sports Fee", description: "Sports facilities", default_amount: 3000, is_optional: true, is_active: true, category: "Sports" },
    { component_id: 6, school_id: 1, name: "Exam Fee", description: "Annual exams", default_amount: 1500, is_optional: false, is_active: true, category: "Other" },
  ];

  // Fee Templates
  mockFeeTemplates = [
    {
      template_id: 1,
      school_id: 1,
      name: "Class 1-5 Annual Fee",
      academic_year_id: 1,
      term: "Annual",
      components: [
        { template_component_id: 1, template_id: 1, component_id: 1, component_name: "Tuition Fee", amount: 40000, is_mandatory: true },
        { template_component_id: 2, template_id: 1, component_id: 3, component_name: "Lab Fee", amount: 3000, is_mandatory: true },
        { template_component_id: 3, template_id: 1, component_id: 4, component_name: "Library Fee", amount: 1500, is_mandatory: true },
      ],
      total_amount: 44500,
      is_active: true,
    },
    {
      template_id: 2,
      school_id: 1,
      name: "Class 6-10 Annual Fee",
      academic_year_id: 1,
      term: "Annual",
      components: [
        { template_component_id: 4, template_id: 2, component_id: 1, component_name: "Tuition Fee", amount: 50000, is_mandatory: true },
        { template_component_id: 5, template_id: 2, component_id: 3, component_name: "Lab Fee", amount: 5000, is_mandatory: true },
        { template_component_id: 6, template_id: 2, component_id: 4, component_name: "Library Fee", amount: 2000, is_mandatory: true },
        { template_component_id: 7, template_id: 2, component_id: 6, component_name: "Exam Fee", amount: 1500, is_mandatory: true },
      ],
      total_amount: 58500,
      is_active: true,
    },
  ];

  // Discounts
  mockDiscounts = [
    { discount_id: 1, school_id: 1, name: "Sibling Discount", description: "10% off for second child", discount_type: "Percentage", value: 10, applicable_to: "Sibling", is_active: true, created_at: "2025-04-01T00:00:00Z" },
    { discount_id: 2, school_id: 1, name: "Merit Scholarship", description: "15% off for top scorers", discount_type: "Percentage", value: 15, applicable_to: "Student", is_active: true, created_at: "2025-04-01T00:00:00Z" },
    { discount_id: 3, school_id: 1, name: "Early Bird Discount", description: "₹2000 off for early payment", discount_type: "Fixed Amount", value: 2000, applicable_to: "All", is_active: true, valid_from: "2025-04-01", valid_to: "2025-05-31", created_at: "2025-04-01T00:00:00Z" },
  ];

  // Generate student fee assignments and invoices
  const classIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const studentsPerClass = 40;
  let invoiceCounter = 1000;

  classIds.forEach((classId) => {
    const templateId = classId <= 5 ? 1 : 2;
    const template = mockFeeTemplates.find((t) => t.template_id === templateId)!;

    for (let studentNum = 1; studentNum <= studentsPerClass; studentNum++) {
      const studentId = classId * 1000 + studentNum;
      const hasDiscount = Math.random() > 0.7; // 30% have discounts
      const discountId = hasDiscount ? mockDiscounts[Math.floor(Math.random() * mockDiscounts.length)].discount_id : undefined;
      const discount = mockDiscounts.find((d) => d.discount_id === discountId);

      let discountedFee = template.total_amount;
      if (discount) {
        if (discount.discount_type === "Percentage") {
          discountedFee = template.total_amount * (1 - discount.value / 100);
        } else {
          discountedFee = template.total_amount - discount.value;
        }
      }

      mockStudentFeeAssignments.push({
        assignment_id: studentId,
        student_id: studentId,
        student_name: `Student ${studentId}`,
        roll_no: String(studentNum).padStart(3, "0"),
        class_id: classId,
        class_name: `Class ${classId}`,
        section: ["A", "B", "C"][studentNum % 3],
        template_id: templateId,
        template_name: template.name,
        academic_year_id: 1,
        discount_id: discountId,
        discount_name: discount?.name,
        discount_percentage: discount?.discount_type === "Percentage" ? discount.value : undefined,
        total_fee: template.total_amount,
        discounted_fee: Math.round(discountedFee),
        assigned_date: "2025-04-01",
      });

      // Generate invoice
      const paidPercentage = Math.random();
      const paidAmount = Math.round(discountedFee * paidPercentage);
      const balance = discountedFee - paidAmount;

      let status: Invoice["status"];
      if (balance === 0) status = "Paid";
      else if (paidAmount > 0) status = "Partially Paid";
      else if (new Date() > new Date("2025-06-30")) status = "Overdue";
      else status = "Issued";

      mockInvoices.push({
        invoice_id: invoiceCounter,
        invoice_number: `INV-2025-${String(invoiceCounter).padStart(6, "0")}`,
        student_id: studentId,
        student_name: `Student ${studentId}`,
        class_id: classId,
        class_name: `Class ${classId}`,
        school_id: 1,
        academic_year_id: 1,
        issue_date: "2025-04-15",
        due_date: "2025-06-30",
        total_amount: discountedFee,
        paid_amount: paidAmount,
        balance: balance,
        status: status,
        items: template.components.map((comp) => ({
          item_id: invoiceCounter * 100 + comp.component_id,
          invoice_id: invoiceCounter,
          description: comp.component_name,
          component_id: comp.component_id,
          component_name: comp.component_name,
          amount: comp.amount,
          quantity: 1,
          total: comp.amount,
        })),
        payments: [],
        created_at: "2025-04-15T00:00:00Z",
      });

      // Generate payments if invoice has paid amount
      if (paidAmount > 0) {
        const paymentId = invoiceCounter * 10;
        const paymentMode: Payment["payment_mode"] = Math.random() > 0.5 ? "Online" : "Cash";

        mockPayments.push({
          payment_id: paymentId,
          school_id: 1,
          student_id: studentId,
          student_name: `Student ${studentId}`,
          invoice_id: invoiceCounter,
          invoice_number: `INV-2025-${String(invoiceCounter).padStart(6, "0")}`,
          amount: paidAmount,
          payment_date: "2025-05-01",
          payment_mode: paymentMode,
          reference_number: `REF-${paymentId}`,
          status: "Completed",
          allocated: true,
          created_at: "2025-05-01T00:00:00Z",
        });
      }

      invoiceCounter++;
    }
  });

  // Generate a few orders and cart items
  for (let i = 1; i <= 10; i++) {
    const studentId = 1000 + i;
    const orderTotal = Math.floor(Math.random() * 5000) + 1000;
    const statuses: Order["status"][] = ["Pending", "Confirmed", "Processing", "Delivered", "Cancelled"];

    mockOrders.push({
      order_id: i,
      order_number: `ORD-2025-${String(i).padStart(6, "0")}`,
      school_id: 1,
      user_id: 10000 + i,
      student_id: studentId,
      student_name: `Student ${studentId}`,
      total_amount: orderTotal,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      payment_status: Math.random() > 0.3 ? "Paid" : "Pending",
      items: [
        { order_item_id: i * 10, order_id: i, product_id: 1, product_name: "School Uniform", unit_price: 1500, quantity: 2, subtotal: 3000 },
        { order_item_id: i * 10 + 1, order_id: i, product_id: 2, product_name: "Text Books Set", unit_price: 2000, quantity: 1, subtotal: 2000 },
      ],
      delivery_notes: "Deliver to school",
      created_at: "2025-10-01T00:00:00Z",
    });
  }

  // Generate a few refunds
  for (let i = 1; i <= 5; i++) {
    const statuses: Refund["status"][] = ["Pending", "Approved", "Processed", "Rejected"];
    mockRefunds.push({
      refund_id: i,
      school_id: 1,
      payment_id: i * 10,
      student_id: 1000 + i,
      student_name: `Student ${1000 + i}`,
      invoice_id: 1000 + i,
      amount: 5000,
      reason: "Student transferred to another school",
      status: statuses[Math.floor(Math.random() * statuses.length)],
      requested_date: "2025-10-15",
    });
  }

  console.log(`[MOCK FINANCE] Initialized complete finance data`);
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function getMockFeeComponents(schoolId: number): Promise<FeeComponent[]> {
  initializeMockFinance();
  await simulateDelay();
  return mockFeeComponents.filter((c) => c.school_id === schoolId && c.is_active);
}

export async function getMockFeeTemplates(schoolId: number): Promise<FeeTemplate[]> {
  initializeMockFinance();
  await simulateDelay();
  return mockFeeTemplates.filter((t) => t.school_id === schoolId && t.is_active);
}

export async function getMockStudentFeeAssignments(classId?: number): Promise<StudentFeeAssignment[]> {
  initializeMockFinance();
  await simulateDelay();
  if (classId) {
    return mockStudentFeeAssignments.filter((a) => a.class_id === classId);
  }
  return mockStudentFeeAssignments;
}

export async function getMockInvoices(params?: { studentId?: number; status?: string }): Promise<Invoice[]> {
  initializeMockFinance();
  await simulateDelay();

  let filtered = mockInvoices;
  if (params?.studentId) {
    filtered = filtered.filter((inv) => inv.student_id === params.studentId);
  }
  if (params?.status) {
    filtered = filtered.filter((inv) => inv.status === params.status);
  }
  return filtered;
}

export async function getMockInvoiceKpi(): Promise<InvoiceKpi> {
  initializeMockFinance();
  await simulateDelay();

  const totalInvoices = mockInvoices.length;
  const totalAmount = mockInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const collectedAmount = mockInvoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
  const pendingAmount = totalAmount - collectedAmount;
  const overdueCount = mockInvoices.filter((inv) => inv.status === "Overdue").length;
  const paidPercentage = (collectedAmount / totalAmount) * 100;

  return {
    total_invoices: totalInvoices,
    total_amount: Math.round(totalAmount),
    collected_amount: Math.round(collectedAmount),
    pending_amount: Math.round(pendingAmount),
    overdue_count: overdueCount,
    paid_percentage: Math.round(paidPercentage),
  };
}

export async function getMockPayments(): Promise<Payment[]> {
  initializeMockFinance();
  await simulateDelay();
  return mockPayments;
}

export async function getMockPaymentKpi(): Promise<PaymentKpi> {
  initializeMockFinance();
  await simulateDelay();

  const currentMonth = new Date().getMonth();
  const currentMonthPayments = mockPayments.filter((p) => {
    const paymentMonth = new Date(p.payment_date).getMonth();
    return paymentMonth === currentMonth;
  });

  const totalCollected = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const onlinePayments = currentMonthPayments.filter((p) => p.payment_mode === "Online" || p.payment_mode === "UPI" || p.payment_mode === "Card");
  const onlinePercentage = (onlinePayments.length / currentMonthPayments.length) * 100;
  const offlinePercentage = 100 - onlinePercentage;
  const pendingCount = mockPayments.filter((p) => p.status === "Pending").length;
  const failedCount = mockPayments.filter((p) => p.status === "Failed").length;
  const avgAmount = totalCollected / currentMonthPayments.length;

  return {
    total_collected_month: Math.round(totalCollected),
    online_percentage: Math.round(onlinePercentage),
    offline_percentage: Math.round(offlinePercentage),
    pending_count: pendingCount,
    failed_count: failedCount,
    avg_payment_amount: Math.round(avgAmount),
  };
}

export async function getMockOrders(): Promise<Order[]> {
  initializeMockFinance();
  await simulateDelay();
  return mockOrders;
}

export async function getMockOrderKpi(): Promise<OrderKpi> {
  initializeMockFinance();
  await simulateDelay();

  const totalOrders = mockOrders.length;
  const pendingOrders = mockOrders.filter((o) => o.status === "Pending").length;
  const completedOrders = mockOrders.filter((o) => o.status === "Delivered").length;
  const cancelledOrders = mockOrders.filter((o) => o.status === "Cancelled").length;
  const totalRevenue = mockOrders.filter((o) => o.payment_status === "Paid").reduce((sum, o) => sum + o.total_amount, 0);
  const avgOrderValue = totalRevenue / completedOrders;

  return {
    total_orders: totalOrders,
    pending_orders: pendingOrders,
    completed_orders: completedOrders,
    cancelled_orders: cancelledOrders,
    total_revenue: Math.round(totalRevenue),
    avg_order_value: Math.round(avgOrderValue),
  };
}

export async function getMockDiscounts(): Promise<Discount[]> {
  initializeMockFinance();
  await simulateDelay();
  return mockDiscounts.filter((d) => d.is_active);
}

export async function getMockDiscountKpi(): Promise<DiscountKpi> {
  initializeMockFinance();
  await simulateDelay();

  const totalDiscounts = mockDiscounts.length;
  const activeDiscounts = mockDiscounts.filter((d) => d.is_active).length;
  const studentsWithDiscounts = mockStudentFeeAssignments.filter((a) => a.discount_id).length;
  const totalAmountDiscounted = mockStudentFeeAssignments.reduce((sum, a) => sum + (a.total_fee - a.discounted_fee), 0);

  return {
    total_discounts: totalDiscounts,
    active_discounts: activeDiscounts,
    total_amount_discounted: Math.round(totalAmountDiscounted),
    students_with_discounts: studentsWithDiscounts,
  };
}

export async function getMockRefunds(): Promise<Refund[]> {
  initializeMockFinance();
  await simulateDelay();
  return mockRefunds;
}

export async function getMockRefundKpi(): Promise<RefundKpi> {
  initializeMockFinance();
  await simulateDelay();

  const pendingRefunds = mockRefunds.filter((r) => r.status === "Pending").length;
  const approvedRefunds = mockRefunds.filter((r) => r.status === "Approved" || r.status === "Processed").length;
  const totalRefundedAmount = mockRefunds.filter((r) => r.status === "Processed").reduce((sum, r) => sum + r.amount, 0);
  const avgRefundAmount = totalRefundedAmount / approvedRefunds || 0;

  return {
    pending_refunds: pendingRefunds,
    approved_refunds: approvedRefunds,
    total_refunded_amount: Math.round(totalRefundedAmount),
    avg_refund_amount: Math.round(avgRefundAmount),
  };
}

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockFinanceProvider = {
  getFeeComponents: getMockFeeComponents,
  getFeeTemplates: getMockFeeTemplates,
  getStudentFeeAssignments: getMockStudentFeeAssignments,
  getInvoices: getMockInvoices,
  getInvoiceKpi: getMockInvoiceKpi,
  getPayments: getMockPayments,
  getPaymentKpi: getMockPaymentKpi,
  getOrders: getMockOrders,
  getOrderKpi: getMockOrderKpi,
  getDiscounts: getMockDiscounts,
  getDiscountKpi: getMockDiscountKpi,
  getRefunds: getMockRefunds,
  getRefundKpi: getMockRefundKpi,
};
