// ============================================================================
// FINANCE STORE - Zustand State Management
// ============================================================================
// Centralized state for all finance-related data

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  FeeComponent,
  FeeTemplate,
  ClassTemplateMapping,
  StudentFeeOverride,
  DiscountRule,
  StudentDiscountAssignment,
  Invoice,
  Payment,
  FinanceReport,
  FinanceKpi,
} from '../../services/finance/types';

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface FinanceState {
  // Data
  feeComponents: FeeComponent[];
  feeTemplates: FeeTemplate[];
  classMappings: ClassTemplateMapping[];
  studentOverrides: StudentFeeOverride[];
  discountRules: DiscountRule[];
  studentDiscounts: StudentDiscountAssignment[];
  invoices: Invoice[];
  payments: Payment[];
  financeKpi: FinanceKpi | null;
  financeReport: FinanceReport | null;

  // Loading States
  isLoadingComponents: boolean;
  isLoadingTemplates: boolean;
  isLoadingMappings: boolean;
  isLoadingOverrides: boolean;
  isLoadingDiscounts: boolean;
  isLoadingInvoices: boolean;
  isLoadingPayments: boolean;
  isLoadingReport: boolean;

  // Error States
  error: string | null;

  // Actions - Fee Components
  setFeeComponents: (components: FeeComponent[]) => void;
  addFeeComponent: (component: FeeComponent) => void;
  updateFeeComponent: (componentId: number, component: Partial<FeeComponent>) => void;
  removeFeeComponent: (componentId: number) => void;

  // Actions - Fee Templates
  setFeeTemplates: (templates: FeeTemplate[]) => void;
  addFeeTemplate: (template: FeeTemplate) => void;
  updateFeeTemplate: (templateId: number, template: Partial<FeeTemplate>) => void;
  removeFeeTemplate: (templateId: number) => void;

  // Actions - Class Mappings
  setClassMappings: (mappings: ClassTemplateMapping[]) => void;
  addClassMapping: (mapping: ClassTemplateMapping) => void;
  removeClassMapping: (mappingId: number) => void;

  // Actions - Overrides
  setStudentOverrides: (overrides: StudentFeeOverride[]) => void;
  addStudentOverride: (override: StudentFeeOverride) => void;
  updateStudentOverride: (overrideId: number, override: Partial<StudentFeeOverride>) => void;
  removeStudentOverride: (overrideId: number) => void;

  // Actions - Discount Rules
  setDiscountRules: (rules: DiscountRule[]) => void;
  addDiscountRule: (rule: DiscountRule) => void;
  updateDiscountRule: (ruleId: number, rule: Partial<DiscountRule>) => void;
  removeDiscountRule: (ruleId: number) => void;

  // Actions - Student Discounts
  setStudentDiscounts: (discounts: StudentDiscountAssignment[]) => void;
  addStudentDiscount: (discount: StudentDiscountAssignment) => void;
  removeStudentDiscount: (assignmentId: number) => void;

  // Actions - Invoices
  setInvoices: (invoices: Invoice[]) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoiceId: number, invoice: Partial<Invoice>) => void;
  addBulkInvoices: (invoices: Invoice[]) => void;

  // Actions - Payments
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (paymentId: number, payment: Partial<Payment>) => void;

  // Actions - Reports
  setFinanceKpi: (kpi: FinanceKpi) => void;
  setFinanceReport: (report: FinanceReport) => void;

  // Actions - Loading States
  setLoadingComponents: (loading: boolean) => void;
  setLoadingTemplates: (loading: boolean) => void;
  setLoadingMappings: (loading: boolean) => void;
  setLoadingOverrides: (loading: boolean) => void;
  setLoadingDiscounts: (loading: boolean) => void;
  setLoadingInvoices: (loading: boolean) => void;
  setLoadingPayments: (loading: boolean) => void;
  setLoadingReport: (loading: boolean) => void;

  // Actions - Error Handling
  setError: (error: string | null) => void;
  clearError: () => void;

  // Actions - Reset
  reset: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  feeComponents: [],
  feeTemplates: [],
  classMappings: [],
  studentOverrides: [],
  discountRules: [],
  studentDiscounts: [],
  invoices: [],
  payments: [],
  financeKpi: null,
  financeReport: null,
  isLoadingComponents: false,
  isLoadingTemplates: false,
  isLoadingMappings: false,
  isLoadingOverrides: false,
  isLoadingDiscounts: false,
  isLoadingInvoices: false,
  isLoadingPayments: false,
  isLoadingReport: false,
  error: null,
};

// ============================================================================
// STORE CREATION
// ============================================================================

export const useFinanceStore = create<FinanceState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Fee Components Actions
      setFeeComponents: (components) => set({ feeComponents: components }),
      addFeeComponent: (component) =>
        set((state) => ({ feeComponents: [...state.feeComponents, component] })),
      updateFeeComponent: (componentId, updates) =>
        set((state) => ({
          feeComponents: state.feeComponents.map((c) =>
            c.component_id === componentId ? { ...c, ...updates } : c
          ),
        })),
      removeFeeComponent: (componentId) =>
        set((state) => ({
          feeComponents: state.feeComponents.filter((c) => c.component_id !== componentId),
        })),

      // Fee Templates Actions
      setFeeTemplates: (templates) => set({ feeTemplates: templates }),
      addFeeTemplate: (template) =>
        set((state) => ({ feeTemplates: [...state.feeTemplates, template] })),
      updateFeeTemplate: (templateId, updates) =>
        set((state) => ({
          feeTemplates: state.feeTemplates.map((t) =>
            t.template_id === templateId ? { ...t, ...updates } : t
          ),
        })),
      removeFeeTemplate: (templateId) =>
        set((state) => ({
          feeTemplates: state.feeTemplates.filter((t) => t.template_id !== templateId),
        })),

      // Class Mappings Actions
      setClassMappings: (mappings) => set({ classMappings: mappings }),
      addClassMapping: (mapping) =>
        set((state) => ({ classMappings: [...state.classMappings, mapping] })),
      removeClassMapping: (mappingId) =>
        set((state) => ({
          classMappings: state.classMappings.filter((m) => m.mapping_id !== mappingId),
        })),

      // Student Overrides Actions
      setStudentOverrides: (overrides) => set({ studentOverrides: overrides }),
      addStudentOverride: (override) =>
        set((state) => ({ studentOverrides: [...state.studentOverrides, override] })),
      updateStudentOverride: (overrideId, updates) =>
        set((state) => ({
          studentOverrides: state.studentOverrides.map((o) =>
            o.override_id === overrideId ? { ...o, ...updates } : o
          ),
        })),
      removeStudentOverride: (overrideId) =>
        set((state) => ({
          studentOverrides: state.studentOverrides.filter((o) => o.override_id !== overrideId),
        })),

      // Discount Rules Actions
      setDiscountRules: (rules) => set({ discountRules: rules }),
      addDiscountRule: (rule) =>
        set((state) => ({ discountRules: [...state.discountRules, rule] })),
      updateDiscountRule: (ruleId, updates) =>
        set((state) => ({
          discountRules: state.discountRules.map((r) =>
            r.rule_id === ruleId ? { ...r, ...updates } : r
          ),
        })),
      removeDiscountRule: (ruleId) =>
        set((state) => ({
          discountRules: state.discountRules.filter((r) => r.rule_id !== ruleId),
        })),

      // Student Discounts Actions
      setStudentDiscounts: (discounts) => set({ studentDiscounts: discounts }),
      addStudentDiscount: (discount) =>
        set((state) => ({ studentDiscounts: [...state.studentDiscounts, discount] })),
      removeStudentDiscount: (assignmentId) =>
        set((state) => ({
          studentDiscounts: state.studentDiscounts.filter((d) => d.assignment_id !== assignmentId),
        })),

      // Invoices Actions
      setInvoices: (invoices) => set({ invoices }),
      addInvoice: (invoice) =>
        set((state) => ({ invoices: [...state.invoices, invoice] })),
      updateInvoice: (invoiceId, updates) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.invoice_id === invoiceId ? { ...inv, ...updates } : inv
          ),
        })),
      addBulkInvoices: (newInvoices) =>
        set((state) => ({ invoices: [...state.invoices, ...newInvoices] })),

      // Payments Actions
      setPayments: (payments) => set({ payments }),
      addPayment: (payment) =>
        set((state) => ({ payments: [...state.payments, payment] })),
      updatePayment: (paymentId, updates) =>
        set((state) => ({
          payments: state.payments.map((p) =>
            p.payment_id === paymentId ? { ...p, ...updates } : p
          ),
        })),

      // Reports Actions
      setFinanceKpi: (kpi) => set({ financeKpi: kpi }),
      setFinanceReport: (report) => set({ financeReport: report }),

      // Loading States Actions
      setLoadingComponents: (loading) => set({ isLoadingComponents: loading }),
      setLoadingTemplates: (loading) => set({ isLoadingTemplates: loading }),
      setLoadingMappings: (loading) => set({ isLoadingMappings: loading }),
      setLoadingOverrides: (loading) => set({ isLoadingOverrides: loading }),
      setLoadingDiscounts: (loading) => set({ isLoadingDiscounts: loading }),
      setLoadingInvoices: (loading) => set({ isLoadingInvoices: loading }),
      setLoadingPayments: (loading) => set({ isLoadingPayments: loading }),
      setLoadingReport: (loading) => set({ isLoadingReport: loading }),

      // Error Handling Actions
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Reset Action
      reset: () => set(initialState),
    }),
    { name: 'FinanceStore' }
  )
);

// ============================================================================
// SELECTORS (for optimized component rendering)
// ============================================================================

export const selectFeeComponents = (state: FinanceState) => state.feeComponents;
export const selectFeeTemplates = (state: FinanceState) => state.feeTemplates;
export const selectClassMappings = (state: FinanceState) => state.classMappings;
export const selectStudentOverrides = (state: FinanceState) => state.studentOverrides;
export const selectDiscountRules = (state: FinanceState) => state.discountRules;
export const selectStudentDiscounts = (state: FinanceState) => state.studentDiscounts;
export const selectInvoices = (state: FinanceState) => state.invoices;
export const selectPayments = (state: FinanceState) => state.payments;
export const selectFinanceKpi = (state: FinanceState) => state.financeKpi;
export const selectFinanceReport = (state: FinanceState) => state.financeReport;

// Computed Selectors
export const selectActiveFeeComponents = (state: FinanceState) =>
  state.feeComponents.filter((c) => c.status === 'active');

export const selectActiveTemplates = (state: FinanceState) =>
  state.feeTemplates.filter((t) => t.status === 'active');

export const selectActiveDiscountRules = (state: FinanceState) =>
  state.discountRules.filter((r) => r.is_active);

export const selectPendingInvoices = (state: FinanceState) =>
  state.invoices.filter((inv) => inv.status === 'pending' || inv.status === 'due');

export const selectOverdueInvoices = (state: FinanceState) =>
  state.invoices.filter((inv) => inv.status === 'overdue');

export const selectInvoicesByStudent = (studentId: number) => (state: FinanceState) =>
  state.invoices.filter((inv) => inv.student_id === studentId);

export const selectPaymentsByInvoice = (invoiceId: number) => (state: FinanceState) =>
  state.payments.filter((p) => p.invoice_id === invoiceId);
