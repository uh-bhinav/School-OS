// ============================================================================
// FILE: src/app/services/announcements.hooks.ts
// PURPOSE: React Query hooks for announcements
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/useAuthStore";
import { useConfigStore } from "../stores/useConfigStore";
import {
  listAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  type AnnouncementCreate,
} from "./announcements.api";

// ============================================================================
// QUERY KEYS FACTORY
// ============================================================================

const announcementKeys = {
  all: ["announcements"] as const,
  lists: () => [...announcementKeys.all, "list"] as const,
  list: (filters: any) => [...announcementKeys.lists(), filters] as const,
  details: () => [...announcementKeys.all, "detail"] as const,
  detail: (id: number) => [...announcementKeys.details(), id] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Fetch announcements list
 *
 * CRITICAL SAFETY GUARDS:
 * - Gets school_id from cached useAuthStore (NEVER calls /profiles/me)
 * - Only runs when authenticated AND config is loaded
 * - Prevents unauthorized API calls before login
 */
export function useAnnouncementsList(params?: {
  target_role?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}) {
  // ✅ CRITICAL: Get auth state from cached store (NO API CALL)
  const schoolId = useAuthStore((state) => state.schoolId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: announcementKeys.list({ schoolId, ...params }),
    queryFn: () => listAnnouncements({ school_id: schoolId!, ...params }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ CRITICAL: Prevent auth spam
    retry: false, // ✅ CRITICAL: Don't retry on auth failure
    refetchInterval: false, // ✅ CRITICAL: No automatic refetch
    enabled: !!(schoolId && isAuthenticated && config), // ✅ CRITICAL: Only run when ready
  });
}

/**
 * Get single announcement by ID
 */
export function useAnnouncement(announcementId?: number) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const config = useConfigStore((state) => state.config);

  return useQuery({
    queryKey: announcementKeys.detail(announcementId!),
    queryFn: () => getAnnouncement(announcementId!),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: false,
    enabled: !!(announcementId && isAuthenticated && config),
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create new announcement
 */
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  const schoolId = useAuthStore((state) => state.schoolId);

  return useMutation({
    mutationFn: (payload: AnnouncementCreate) => createAnnouncement(schoolId!, payload),
    onSuccess: () => {
      // Invalidate all announcement lists
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
    },
  });
}

/**
 * Update announcement
 */
export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      announcementId,
      patch,
    }: {
      announcementId: number;
      patch: Partial<AnnouncementCreate>;
    }) => updateAnnouncement(announcementId, patch),
    onSuccess: (_, variables) => {
      // Invalidate specific announcement and all lists
      queryClient.invalidateQueries({ queryKey: announcementKeys.detail(variables.announcementId) });
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
    },
  });
}

/**
 * Delete announcement
 */
export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
    },
  });
}

/**
 * Publish announcement immediately
 */
export function usePublishAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishAnnouncement,
    onSuccess: (_, announcementId) => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.detail(announcementId) });
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
    },
  });
}
