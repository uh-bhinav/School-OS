// ============================================================================
// FILE: src/app/services/fees.api.ts
// PURPOSE: API service for fee management (invoices, payments, fee structures)
// ============================================================================

import { http } from "./http";
import { isDemoMode, mockInvoicesProvider, mockPaymentsProvider, mockFeeComponentsProvider } from "../mockDataProviders";

// ============================================================================
// TYPESCRIPT INTERFACES - INVOICES
// ============================================================================

export interface Invoice {
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

export interface InvoiceCreate {
  student_id: number;
  academic_year_id: number;
  amount: number;
  due_date: string;
  notes?: string | null;
}

export interface InvoiceListResponse {
  items: Invoice[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ============================================================================
// TYPESCRIPT INTERFACES - PAYMENTS
// ============================================================================

export interface Payment {
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

export interface PaymentInitiateRequest {
  invoice_id?: number | null;
  order_id?: number | null;
  amount: number;
  payment_method?: string;
}

export interface PaymentInitiateResponse {
  payment_id: number;
  razorpay_order_id?: string;
  razorpay_key_id?: string;
  amount: number;
  currency: string;
}

// ============================================================================
// TYPESCRIPT INTERFACES - FEE STRUCTURES
// ============================================================================

export interface FeeComponent {
  fee_component_id: number;
  school_id: number;
  name: string;
  amount: number;
  is_mandatory: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface FeeComponentCreate {
  name: string;
  amount: number;
  is_mandatory: boolean;
}

export interface FeeTemplate {
  fee_template_id: number;
  school_id: number;
  name: string;
  academic_year_id: number;
  created_at: string;
  updated_at?: string | null;
}

export interface FeeTemplateCreate {
  name: string;
  academic_year_id: number;
}

// ============================================================================
// API FUNCTIONS - INVOICES
// ============================================================================

/**
 * Fetch list of invoices
 * Backend endpoint: GET /api/v1/finance/admin/all (requires Admin role)
 */
export async function listInvoices(params: {
  school_id: number;
  student_id?: number;
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<InvoiceListResponse> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    const result = await mockInvoicesProvider.getInvoices(params);
    return {
      items: result.items,
      total: result.total,
      page: params.page || 1,
      page_size: params.page_size || 50,
      pages: Math.ceil(result.total / (params.page_size || 50)),
    };
  }

  // Backend endpoint is /finance/admin/all for all school invoices
  // Or /finance/invoices/student/{student_id} for specific student
  // For now return empty to avoid 404
  return {
    items: [],
    total: 0,
    page: 1,
    page_size: 50,
    pages: 0
  };
}

/**
 * Generate a new invoice
 * Backend endpoint: POST /api/v1/finance/invoices/generate
 */
export async function generateInvoice(payload: InvoiceCreate): Promise<Invoice> {
  const { data } = await http.post<Invoice>("/finance/invoices/generate", payload);
  return data;
}

/**
 * Get student's invoices
 * Backend endpoint: GET /api/v1/finance/invoices/student/{student_id}
 */
export async function getStudentInvoices(studentId: number): Promise<Invoice[]> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockInvoicesProvider.getStudentInvoices(studentId);
  }

  const { data } = await http.get<Invoice[]>(`/finance/invoices/student/${studentId}`);
  return data;
}

// ============================================================================
// API FUNCTIONS - PAYMENTS
// ============================================================================

/**
 * Initiate a payment
 * Backend endpoint: POST /api/v1/finance/payments/initiate (if exists)
 */
export async function initiatePayment(
  payload: PaymentInitiateRequest
): Promise<PaymentInitiateResponse> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockPaymentsProvider.initiatePayment({
      ...payload,
      invoice_id: payload.invoice_id || undefined,
      order_id: payload.order_id || undefined,
    });
  }

  // Backend may not have this endpoint, adjust as needed
  const { data } = await http.post<PaymentInitiateResponse>("/finance/payments/initiate", payload);
  return data;
}

/**
 * Fetch payment history
 * Backend endpoint: GET /api/v1/finance/payments/ (if exists)
 */
export async function listPayments(_params: {
  school_id?: number;
  invoice_id?: number;
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<{ items: Payment[]; total: number }> {
  // Backend may not have payments list endpoint, return empty for now
  return { items: [], total: 0 };
}

// ============================================================================
// API FUNCTIONS - FEE COMPONENTS
// ============================================================================

/**
 * Fetch fee components for a school
 * Backend endpoint: Needs to be implemented or uses different structure
 */
export async function listFeeComponents(schoolId: number): Promise<FeeComponent[]> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    return mockFeeComponentsProvider.getFeeComponents(schoolId);
  }

  // Backend doesn't have /fee-components/school/{id} endpoint
  // Return empty array to avoid 404 errors
  return [];
}

/**
 * Create a fee component
 */
export async function createFeeComponent(
  _schoolId: number,
  payload: FeeComponentCreate
): Promise<FeeComponent> {
  const { data } = await http.post<FeeComponent>("/finance/fee-components", payload);
  return data;
}

/**
 * Update a fee component
 */
export async function updateFeeComponent(
  componentId: number,
  patch: Partial<FeeComponentCreate>
): Promise<FeeComponent> {
  const { data } = await http.put<FeeComponent>(`/finance/fee-components/${componentId}`, patch);
  return data;
}

/**
 * Delete a fee component
 */
export async function deleteFeeComponent(componentId: number): Promise<void> {
  await http.delete(`/finance/fee-components/${componentId}`);
}

// ============================================================================
// API FUNCTIONS - FEE TEMPLATES
// ============================================================================

/**
 * Create a fee template
 */
export async function createFeeTemplate(
  _schoolId: number,
  payload: FeeTemplateCreate
): Promise<FeeTemplate> {
  const { data } = await http.post<FeeTemplate>("/finance/templates/fee-templates", payload);
  return data;
}
