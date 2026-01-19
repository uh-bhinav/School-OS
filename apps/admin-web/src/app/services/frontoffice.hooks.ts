// ============================================================================
// FRONT OFFICE QUERY HOOKS - React Query hooks for caching
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as visitorsApi from './visitors.api';
import * as couriersApi from './couriers.api';
import * as admissionsApi from './admissions.api';

// ============================================================================
// VISITORS HOOKS
// ============================================================================

export function useVisitors(status?: string) {
  return useQuery({
    queryKey: ['visitors', status],
    queryFn: () => visitorsApi.getVisitors(status as any),
    staleTime: 30000, // 30 seconds
  });
}

export function useVisitorStats() {
  return useQuery({
    queryKey: ['visitor-stats'],
    queryFn: () => visitorsApi.getVisitorStats(),
    staleTime: 60000, // 1 minute
  });
}

export function useCheckInVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: visitorsApi.checkInVisitor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      queryClient.invalidateQueries({ queryKey: ['visitor-stats'] });
    },
  });
}

export function useCheckOutVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: visitorsApi.checkOutVisitor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      queryClient.invalidateQueries({ queryKey: ['visitor-stats'] });
    },
  });
}

// ============================================================================
// COURIERS HOOKS
// ============================================================================

export function useCouriers(status?: string) {
  return useQuery({
    queryKey: ['couriers', status],
    queryFn: () => couriersApi.getCouriers(status as any),
    staleTime: 30000,
  });
}

export function useCourierStats() {
  return useQuery({
    queryKey: ['courier-stats'],
    queryFn: () => couriersApi.getCourierStats(),
    staleTime: 60000,
  });
}

export function useLogCourier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: couriersApi.logCourier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couriers'] });
      queryClient.invalidateQueries({ queryKey: ['courier-stats'] });
    },
  });
}

export function useNotifyRecipient() {
  return useMutation({
    mutationFn: couriersApi.notifyRecipient,
  });
}

// ✅ ADD THIS NEW HOOK
// ✅ FIXED: Accept object parameter to match mutation type
export function useMarkCourierDelivered() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ courierId, signature }: { courierId: string; signature?: string }) =>
        couriersApi.markCourierDelivered(courierId, signature),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['couriers'] });
        queryClient.invalidateQueries({ queryKey: ['courier-stats'] });
      },
    });
  }

// ============================================================================
// ADMISSIONS HOOKS
// ============================================================================

export function useLeads(filters?: { status?: string; score?: string }) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => admissionsApi.getLeads(filters),
    staleTime: 30000,
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: ['lead-stats'],
    queryFn: () => admissionsApi.getLeadStats(),
    staleTime: 60000,
  });
}

export function useCaptureLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: admissionsApi.captureLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
    },
  });
}

export function useUpdateLeadScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, score }: { leadId: string; score: any }) =>
      admissionsApi.updateLeadScore(leadId, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
