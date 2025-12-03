// ============================================================================
// FILE: src/app/services/events.hooks.ts
// PURPOSE: React Query hooks for Event Management
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventKpi,
  getEventImages,
  uploadEventImages,
  deleteEventImage,
} from "./events.api";
import type { EventCreate, EventUpdate, EventStatus } from "./events.schema";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  kpi: () => [...eventKeys.all, "kpi"] as const,
  images: (eventId: string) => [...eventKeys.all, "images", eventId] as const,
};

// ============================================================================
// EVENTS QUERIES
// ============================================================================

/**
 * Hook to fetch all events with optional filtering
 */
export function useEvents(params?: { status?: EventStatus; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: eventKeys.list(params || {}),
    queryFn: () => getEvents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single event by ID
 */
export function useEventById(eventId: string | undefined) {
  return useQuery({
    queryKey: eventKeys.detail(eventId || ""),
    queryFn: () => getEventById(eventId!),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch event KPIs
 */
export function useEventKpi() {
  return useQuery({
    queryKey: eventKeys.kpi(),
    queryFn: getEventKpi,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch event images
 */
export function useEventImages(eventId: string | undefined) {
  return useQuery({
    queryKey: eventKeys.images(eventId || ""),
    queryFn: () => getEventImages(eventId!),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// EVENTS MUTATIONS
// ============================================================================

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EventCreate) => createEvent(data),
    onSuccess: () => {
      // Invalidate events list and KPI
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.kpi() });
    },
  });
}

/**
 * Hook to update an event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: EventUpdate }) =>
      updateEvent(eventId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific event and list
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.kpi() });
    },
  });
}

/**
 * Hook to delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      // Invalidate events list and KPI
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.kpi() });
    },
  });
}

/**
 * Hook to upload images to an event
 */
export function useUploadEventImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      files,
      albumId,
    }: {
      eventId: string;
      files: File[];
      albumId?: string;
    }) => uploadEventImages(eventId, files, albumId),
    onSuccess: (_, variables) => {
      // Invalidate event detail and images
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.images(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.kpi() });
      // Also invalidate albums since images are added there too
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
  });
}

/**
 * Hook to delete an event image
 */
export function useDeleteEventImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, imageId }: { eventId: string; imageId: string }) =>
      deleteEventImage(eventId, imageId),
    onSuccess: (_, variables) => {
      // Invalidate event images
      queryClient.invalidateQueries({ queryKey: eventKeys.images(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.eventId) });
    },
  });
}
