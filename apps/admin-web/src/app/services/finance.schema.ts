// ============================================================================
// FINANCE SCHEMAS
// ============================================================================
// Type definitions for finance module including fees, invoices, payments, etc.

// ============================================================================
// FEE STRUCTURES
// ============================================================================

export interface FeeComponent {
  component_id: number;
  school_id: number;
  name: string;
  description?: string;
  default_amount: number;
  is_optional: boolean;
  is_active: boolean;
  category?: "Tuition" | "Transport" | "Lab" | "Library" | "Sports" | "Other";
}

export interface FeeTemplate {
  template_id: number;
  school_id: number;
  name: string;
  description?: string;
  academic_year_id: number;
  class_id?: number;
  term?: "Annual" | "Term1" | "Term2" | "Term3" | "Monthly";
  components: FeeTemplateComponent[];
  total_amount: number;
  is_active: boolean;
}

export interface FeeTemplateComponent {
  template_component_id: number;
  template_id: number;
  component_id: number;
  component_name: string;
  amount: number;
  is_mandatory: boolean;
}

// ============================================================================
// STUDENT FEE ASSIGNMENT
// ============================================================================

export interface StudentFeeAssignment {
  assignment_id: number;
  student_id: number;
  student_name: string;
  roll_no: string;
  class_id: number;
  class_name: string;
  section: string;
  template_id: number;
  template_name: string;
  academic_year_id: number;
  discount_id?: number;
  discount_name?: string;
  discount_percentage?: number;
  total_fee: number;
  discounted_fee: number;
  assigned_date: string;
}

export interface StudentFeeAssignmentCreate {
  student_id: number;
  template_id: number;
  academic_year_id: number;
  discount_id?: number;
}

// ============================================================================
// INVOICES
// ============================================================================

export interface Invoice {
  invoice_id: number;
  invoice_number: string;
  student_id: number;
  student_name: string;
  class_id: number;
  class_name: string;
  school_id: number;
  academic_year_id: number;
  issue_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  status: "Draft" | "Issued" | "Partially Paid" | "Paid" | "Overdue" | "Cancelled";
  items: InvoiceItem[];
  payments: InvoicePayment[];
  created_at: string;
  updated_at?: string;
}

export interface InvoiceItem {
  item_id: number;
  invoice_id: number;
  description: string;
  component_id?: number;
  component_name?: string;
  amount: number;
  quantity: number;
  total: number;
}

export interface InvoicePayment {
  payment_id: number;
  invoice_id: number;
  amount: number;
  payment_date: string;
  payment_mode: string;
  reference_number?: string;
}

export interface InvoiceKpi {
  total_invoices: number;
  total_amount: number;
  collected_amount: number;
  pending_amount: number;
  overdue_count: number;
  paid_percentage: number;
}

// ============================================================================
// PAYMENTS
// ============================================================================

export interface Payment {
  payment_id: number;
  school_id: number;
  student_id: number;
  student_name: string;
  invoice_id?: number;
  invoice_number?: string;
  amount: number;
  payment_date: string;
  payment_mode: "Cash" | "Online" | "Cheque" | "Bank Transfer" | "UPI" | "Card";
  reference_number?: string;
  status: "Pending" | "Completed" | "Failed" | "Refunded";
  allocated: boolean;
  remarks?: string;
  created_at: string;
}

export interface PaymentKpi {
  total_collected_month: number;
  online_percentage: number;
  offline_percentage: number;
  pending_count: number;
  failed_count: number;
  avg_payment_amount: number;
}

// ============================================================================
// CART & ORDERS (E-Commerce)
// ============================================================================

export interface CartItem {
  cart_item_id: number;
  product_id: number;
  product_name: string;
  product_description?: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  is_available: boolean;
  stock_quantity: number;
}

export interface Cart {
  cart_id: number;
  user_id: number;
  items: CartItem[];
  total_items: number;
  total_amount: number;
  updated_at: string;
}

export interface Order {
  order_id: number;
  order_number: string;
  school_id: number;
  user_id: number;
  student_id: number;
  student_name: string;
  total_amount: number;
  status: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  payment_status: "Pending" | "Paid" | "Failed" | "Refunded";
  items: OrderItem[];
  delivery_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderKpi {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  avg_order_value: number;
}

// ============================================================================
// DISCOUNTS
// ============================================================================

export interface Discount {
  discount_id: number;
  school_id: number;
  name: string;
  description?: string;
  discount_type: "Percentage" | "Fixed Amount";
  value: number;
  applicable_to?: "All" | "Class" | "Student" | "Sibling";
  is_active: boolean;
  valid_from?: string;
  valid_to?: string;
  created_at: string;
}

export interface DiscountApplication {
  application_id: number;
  discount_id: number;
  discount_name: string;
  student_id: number;
  student_name: string;
  invoice_id?: number;
  discount_amount: number;
  applied_date: string;
}

export interface DiscountKpi {
  total_discounts: number;
  active_discounts: number;
  total_amount_discounted: number;
  students_with_discounts: number;
}

// ============================================================================
// REFUNDS
// ============================================================================

export interface Refund {
  refund_id: number;
  school_id: number;
  payment_id: number;
  student_id: number;
  student_name: string;
  invoice_id?: number;
  amount: number;
  reason: string;
  status: "Pending" | "Approved" | "Processed" | "Rejected";
  requested_date: string;
  processed_date?: string;
  processed_by_user_id?: number;
  remarks?: string;
}

export interface RefundKpi {
  pending_refunds: number;
  approved_refunds: number;
  total_refunded_amount: number;
  avg_refund_amount: number;
}
