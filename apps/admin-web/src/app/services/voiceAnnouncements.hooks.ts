// ============================================================================
// FILE: src/app/services/voiceAnnouncements.hooks.ts
// PURPOSE: React Query hooks for Voice Announcements
// ============================================================================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./voiceAnnouncements.api";
import type {
  VoiceAnnouncementCreate,
  AnnouncementPriority,
} from "./voiceAnnouncements.schema";

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to upload audio file
 */
export function useUploadAudio() {
  return useMutation({
    mutationFn: (file: File) => api.uploadAudio(file),
    onError: (error: any) => {
      console.error("Failed to upload audio:", error);
    },
  });
}

/**
 * Hook to create voice announcement
 */
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VoiceAnnouncementCreate) => api.createAnnouncement(data),
    onSuccess: () => {
      // Invalidate relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (error: any) => {
      console.error("Failed to create announcement:", error);
    },
  });
}

/**
 * Hook to send announcement via FCM
 */
export function useSendAnnouncement() {
  return useMutation({
    mutationFn: (announcementId: string) => api.sendAnnouncement(announcementId),
    onError: (error: any) => {
      console.error("Failed to send announcement:", error);
    },
  });
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch announcement deliveries
 */
export function useAnnouncementDeliveries(announcementId: string | null) {
  return useQuery({
    queryKey: ["announcement-deliveries", announcementId],
    queryFn: () => api.getAnnouncementDeliveries(announcementId!),
    enabled: !!announcementId,
  });
}

/**
 * Hook to fetch my announcements (for teachers)
 */
export function useMyAnnouncements() {
  return useQuery({
    queryKey: ["my-announcements"],
    queryFn: () => api.getMyAnnouncements(),
  });
}
