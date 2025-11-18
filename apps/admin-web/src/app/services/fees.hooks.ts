// ============================================================================
// FILE: src/app/services/fees.hooks.ts
// PURPOSE: React Query hooks for fee management
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/useAuthStore";
import { useConfigStore } from "../stores/useConfigStore";
import {
  listInvoices,
  generateInvoice,
  getStudentInvoices,
  initiatePayment,
  listPayments,
  listFeeComponents,
  createFeeComponent,
  updateFeeComponent,
  deleteFeeComponent,
  createFeeTemplate,
  type PaymentInitiateRequest,
  type FeeComponentCreate,
  type FeeTemplateCreate,
} from "./fees.api";

// ============================================================================
// QUERY KEYS FACTORY
// ============================================================================

const feeKeys = {
  all: ["fees"] as const,
  invoices: () => [...feeKeys.all, "invoices"] as const,
  invoiceList: (filters: any) => [...feeKeys.invoices(), "list", filters] as const,
  studentInvoices: (studentId: number) => [...feeKeys.invoices(), "student", studentId] as const,
  payments: () => [...feeKeys.all, "payments"] as const,
  paymentList: (filters: any) => [...feeKeys.payments(), "list", filters] as const,
  components: () => [...feeKeys.all, "components"] as const,
  componentList: (schoolId?: number) => [...feeKeys.components(), "list", schoolId] as const,
  templates: () => [...feeKeys.all, "templates"] as const,
};

// ============================================================================
// INVOICE HOOKS
// ============================================================================

/**
 * Fetch invoices list
 *
 * CRITICAL SAFETY GUARDS:
 * - Only runs when authenticated AND config is loaded
 * - Prevents unauthorized API calls before login
 */
export function useInvoicesList(params?: {
  student_id?: number;
  status?: string;
  page?: number;
  page_size?: number;
}) {
  const schoolId = useAuthStore((state) => state.schoolId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: feeKeys.invoiceList({ schoolId, ...params }),
    queryFn: () => listInvoices({ school_id: schoolId!, ...params }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: false,
    enabled: !!(schoolId && isAuthenticated && config),
  });
}

/**
 * Get student invoices
 */
export function useStudentInvoices(studentId?: number) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: feeKeys.studentInvoices(studentId!),
    queryFn: () => getStudentInvoices(studentId!),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: false,
    enabled: !!(studentId && isAuthenticated && config),
  });
}

/**
 * Generate invoice
 */
export function useGenerateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.invoices() });
    },
  });
}

// ============================================================================
// PAYMENT HOOKS
// ============================================================================

/**
 * Fetch payments list
 */
export function usePaymentsList(params?: {
  invoice_id?: number;
  status?: string;
  page?: number;
  page_size?: number;
}) {
  const schoolId = useAuthStore((state) => state.schoolId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: feeKeys.paymentList({ schoolId, ...params }),
    queryFn: () => listPayments({ school_id: schoolId, ...params }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: false,
    enabled: !!(schoolId && isAuthenticated && config),
  });
}

/**
 * Initiate payment
 */
export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PaymentInitiateRequest) => initiatePayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.payments() });
      queryClient.invalidateQueries({ queryKey: feeKeys.invoices() });
    },
  });
}

// ============================================================================
// FEE COMPONENT HOOKS
// ============================================================================

/**
 * Fetch fee components list
 */
export function useFeeComponentsList() {
  const schoolId = useAuthStore((state) => state.schoolId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: feeKeys.componentList(schoolId),
    queryFn: () => listFeeComponents(schoolId!),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: false,
    enabled: !!(schoolId && isAuthenticated && config),
  });
}

/**
 * Create fee component
 */
export function useCreateFeeComponent() {
  const queryClient = useQueryClient();
  const schoolId = useAuthStore((state) => state.schoolId);

  return useMutation({
    mutationFn: (payload: FeeComponentCreate) => createFeeComponent(schoolId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.components() });
    },
  });
}

/**
 * Update fee component
 */
export function useUpdateFeeComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      componentId,
      patch,
    }: {
      componentId: number;
      patch: Partial<FeeComponentCreate>;
    }) => updateFeeComponent(componentId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.components() });
    },
  });
}

/**
 * Delete fee component
 */
export function useDeleteFeeComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFeeComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.components() });
    },
  });
}

/**
 * Create fee template
 */
export function useCreateFeeTemplate() {
  const queryClient = useQueryClient();
  const schoolId = useAuthStore((state) => state.schoolId);

  return useMutation({
    mutationFn: (payload: FeeTemplateCreate) => createFeeTemplate(schoolId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.templates() });
    },
  });
}
