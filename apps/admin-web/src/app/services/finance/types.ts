// ============================================================================
// FINANCE MODULE - TYPE DEFINITIONS
// ============================================================================
// Mirrors backend data structures exactly for consistency

// ============================================================================
// FEE COMPONENTS (mirrors backend fee_component model)
// ============================================================================

export type FeeComponentType = 'recurring' | 'one-time';
export type FeeComponentCategory = 'Tuition' | 'Transport' | 'Lab' | 'Library' | 'Sports' | 'Uniform' | 'Books' | 'Activity' | 'Exam' | 'Other';
export type FeeComponentStatus = 'active' | 'inactive' | 'archived';

export interface FeeComponent {
  component_id: number;
  school_id: number;
  name: string;
  description?: string;
  base_amount: number;
  type: FeeComponentType;
  category: FeeComponentCategory;
  is_optional: boolean;
  status: FeeComponentStatus;
  created_at: string;
  updated_at?: string;
}

export interface FeeComponentCreate {
  name: string;
  description?: string;
  base_amount: number;
  type: FeeComponentType;
  category: FeeComponentCategory;
  is_optional: boolean;
}

export interface FeeComponentUpdate {
  name?: string;
  description?: string;
  base_amount?: number;
  type?: FeeComponentType;
  category?: FeeComponentCategory;
  is_optional?: boolean;
  status?: FeeComponentStatus;
}

// ============================================================================
// FEE TEMPLATES (mirrors backend fee_template model)
// ============================================================================

export type FeeTerm = 'Annual' | 'Term1' | 'Term2' | 'Term3' | 'Monthly' | 'Quarterly';
export type FeeTemplateStatus = 'active' | 'inactive' | 'draft';

export interface FeeTemplateComponent {
  template_component_id: number;
  template_id: number;
  component_id: number;
  component_name: string;
  amount: number;
  is_mandatory: boolean;
}

export interface FeeTemplate {
  template_id: number;
  school_id: number;
  name: string;
  description?: string;
  academic_year_id: number;
  term: FeeTerm;
  components: FeeTemplateComponent[];
  total_amount: number;
  status: FeeTemplateStatus;
  created_at: string;
  updated_at?: string;
}

export interface FeeTemplateCreate {
  name: string;
  description?: string;
  academic_year_id: number;
  term: FeeTerm;
  component_ids: number[];
}

export interface FeeTemplateUpdate {
  name?: string;
  description?: string;
  term?: FeeTerm;
  component_ids?: number[];
  status?: FeeTemplateStatus;
}

// ============================================================================
// CLASS-TEMPLATE MAPPING (mirrors backend class_fee_structure model)
// ============================================================================

export interface ClassTemplateMapping {
  mapping_id: number;
  class_id: number;
  class_name: string;
  grade_level: number;
  section: string;
  template_id: number;
  template_name: string;
  academic_year_id: number;
  total_amount: number;
  student_count: number;
  assigned_date: string;
}

export interface ClassTemplateMappingCreate {
  class_id: number;
  template_id: number;
  academic_year_id: number;
}

// ============================================================================
// STUDENT FEE OVERRIDES (mirrors backend student_fee_assignment model)
// ============================================================================

export interface StudentFeeOverride {
  override_id: number;
  student_id: number;
  student_name: string;
  roll_no: string;
  class_id: number;
  class_name: string;
  component_id: number;
  component_name: string;
  original_amount: number;
  override_amount: number;
  is_active: boolean;
  reason?: string;
  created_by_user_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface StudentFeeOverrideCreate {
  student_id: number;
  component_id: number;
  override_amount: number;
  is_active: boolean;
  reason?: string;
}

export interface StudentFeeOverrideUpdate {
  override_amount?: number;
  is_active?: boolean;
  reason?: string;
}

// ============================================================================
// DISCOUNT RULES (mirrors backend discount model)
// ============================================================================

export type DiscountType = 'percentage' | 'fixed';
export type DiscountApplicableTo = 'all' | 'class' | 'student' | 'sibling' | 'staff_child' | 'merit';

export interface DiscountRule {
  rule_id: number;
  school_id: number;
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  applicable_to: DiscountApplicableTo;
  conditions?: {
    min_siblings?: number;
    min_percentage?: number;
    applicable_component_ids?: number[];
  };
  is_active: boolean;
  valid_from?: string;
  valid_to?: string;
  created_at: string;
  updated_at?: string;
}

export interface DiscountRuleCreate {
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  applicable_to: DiscountApplicableTo;
  conditions?: DiscountRule['conditions'];
  valid_from?: string;
  valid_to?: string;
}

export interface DiscountRuleUpdate {
  name?: string;
  description?: string;
  type?: DiscountType;
  value?: number;
  applicable_to?: DiscountApplicableTo;
  conditions?: DiscountRule['conditions'];
  is_active?: boolean;
  valid_from?: string;
  valid_to?: string;
}

// ============================================================================
// STUDENT DISCOUNT ASSIGNMENTS (mirrors backend student_fee_discount model)
// ============================================================================

export interface StudentDiscountAssignment {
  assignment_id: number;
  student_id: number;
  student_name: string;
  roll_no: string;
  class_id: number;
  class_name: string;
  discount_id: number;
  discount_name: string;
  discount_type: DiscountType;
  discount_value: number;
  calculated_discount: number;
  applied_by_user_id?: string;
  applied_at: string;
  is_active: boolean;
}

export interface StudentDiscountAssignmentCreate {
  student_id: number;
  discount_id: number;
}

// ============================================================================
// INVOICES (mirrors backend invoice model)
// ============================================================================

export type InvoiceStatus = 'draft' | 'pending' | 'due' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  item_id: number;
  invoice_id: number;
  fee_component_id: number;
  component_name: string;
  original_amount: number;
  discount_amount: number;
  override_amount?: number;
  final_amount: number;
}

export interface Invoice {
  invoice_id: number;
  invoice_number: string;
  school_id: number;
  student_id: number;
  student_name: string;
  roll_no: string;
  class_id: number;
  class_name: string;
  fee_term_id: number;
  fee_structure_id?: number;
  issue_date: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  balance: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  discounts_applied: {
    discount_id: number;
    discount_name: string;
    amount: number;
  }[];
  payment_status: 'unpaid' | 'partially_paid' | 'paid';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BulkInvoiceCreate {
  class_id: number;
  fee_term_id: number;
  due_date: string;
}

export interface BulkInvoiceResult {
  successful: number;
  failed: number;
  invoices: Invoice[];
  errors?: string[];
}

// ============================================================================
// PAYMENTS (mirrors backend payment model)
// ============================================================================

export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'captured_allocation_failed';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'netbanking' | 'cheque' | 'bank_transfer' | 'razorpay';

export interface Payment {
  payment_id: number;
  school_id: number;
  student_id: number;
  student_name: string;
  invoice_id?: number;
  invoice_number?: string;
  order_id?: number;
  amount_paid: number;
  currency: string;
  payment_date: string;
  method?: PaymentMethod;
  status: PaymentStatus;
  gateway_name?: string;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  gateway_signature?: string;
  error_description?: string;
  metadata?: Record<string, unknown>;
  reconciliation_status: 'pending' | 'reconciled' | 'failed';
  created_at: string;
  updated_at?: string;
}

export interface PaymentCreate {
  invoice_id?: number;
  order_id?: number;
  amount: number;
  payment_method?: PaymentMethod;
}

// ============================================================================
// KPI / ANALYTICS TYPES
// ============================================================================

export interface FinanceKpi {
  total_revenue_ytd: number;
  total_revenue_mtd: number;
  outstanding_fees: number;
  overdue_count: number;
  collection_rate: number;
  average_days_to_pay: number;
}

export interface RevenueByCategory {
  category: FeeComponentCategory;
  amount: number;
  percentage: number;
}

export interface RevenueByClass {
  class_id: number;
  class_name: string;
  expected_amount: number;
  collected_amount: number;
  pending_amount: number;
  collection_rate: number;
}

export interface StudentDue {
  student_id: number;
  student_name: string;
  roll_no: string;
  class_id: number;
  class_name: string;
  total_due: number;
  total_paid: number;
  balance: number;
  overdue_days: number;
}

export interface FinanceReport {
  kpi: FinanceKpi;
  revenue_by_category: RevenueByCategory[];
  revenue_by_class: RevenueByClass[];
  top_defaulters: StudentDue[];
  payment_trends: {
    date: string;
    amount: number;
    count: number;
  }[];
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface FinanceFilters {
  academic_year_id?: number;
  class_id?: number;
  term?: FeeTerm;
  status?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface ClassInfo {
  class_id: number;
  class_name: string;
  grade_level: number;
  section: string;
  student_count: number;
}

export interface StudentInfo {
  student_id: number;
  student_name: string;
  roll_no: string;
  class_id: number;
  class_name: string;
  email?: string;
  phone?: string;
}
