// ============================================================================
// FILE: src/app/services/communications.hooks.ts
// PURPOSE: React Query hooks for communications
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/useAuthStore";
import { useConfigStore } from "../stores/useConfigStore";
import {
  listCommunications,
  getCommunication,
  sendCommunication,
  markAsRead,
  deleteCommunication,
  type CommunicationCreate,
} from "./communications.api";

// ============================================================================
// QUERY KEYS FACTORY
// ============================================================================

const communicationKeys = {
  all: ["communications"] as const,
  lists: () => [...communicationKeys.all, "list"] as const,
  list: (filters: any) => [...communicationKeys.lists(), filters] as const,
  details: () => [...communicationKeys.all, "detail"] as const,
  detail: (id: number) => [...communicationKeys.details(), id] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Fetch communications list
 *
 * CRITICAL SAFETY GUARDS:
 * - Gets school_id from cached useAuthStore (NEVER calls /profiles/me)
 * - Only runs when authenticated AND config is loaded
 * - Prevents unauthorized API calls before login
 */
export function useCommunicationsList(params?: {
  message_type?: string;
  status?: string;
  page?: number;
  page_size?: number;
}) {
  // ✅ CRITICAL: Get auth state from cached store (NO API CALL)
  const schoolId = useAuthStore((state) => state.schoolId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: communicationKeys.list({ schoolId, ...params }),
    queryFn: () => listCommunications({ school_id: schoolId!, ...params }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ CRITICAL: Prevent auth spam
    retry: false, // ✅ CRITICAL: Don't retry on auth failure
    refetchInterval: false, // ✅ CRITICAL: No automatic refetch
    enabled: !!(schoolId && isAuthenticated && config), // ✅ CRITICAL: Only run when ready
  });
}

/**
 * Get single communication by ID
 */
export function useCommunication(communicationId?: number) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: communicationKeys.detail(communicationId!),
    queryFn: () => getCommunication(communicationId!),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: false,
    enabled: !!(communicationId && isAuthenticated && config),
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Send new communication
 */
export function useSendCommunication() {
  const queryClient = useQueryClient();
  const schoolId = useAuthStore((state) => state.schoolId);

  return useMutation({
    mutationFn: (payload: CommunicationCreate) => sendCommunication(schoolId!, payload),
    onSuccess: () => {
      // Invalidate all communication lists
      queryClient.invalidateQueries({ queryKey: communicationKeys.lists() });
    },
  });
}

/**
 * Mark communication as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: (_, communicationId) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.detail(communicationId) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.lists() });
    },
  });
}

/**
 * Delete communication
 */
export function useDeleteCommunication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCommunication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.lists() });
    },
  });
}
