// ============================================================================
// FILE: src/app/services/albums.hooks.ts
// PURPOSE: React Query hooks for Albums Management
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAlbums,
  getAlbumById,
  getAlbumByEventId,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getAlbumKpi,
  getAlbumImages,
  uploadAlbumImages,
  deleteAlbumImage,
  updateImageCaption,
  getRecentImages,
} from "./albums.api";
import type { AlbumCreate, AlbumUpdate, AlbumVisibility, AlbumType } from "./albums.schema";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const albumKeys = {
  all: ["albums"] as const,
  lists: () => [...albumKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...albumKeys.lists(), filters] as const,
  details: () => [...albumKeys.all, "detail"] as const,
  detail: (id: string) => [...albumKeys.details(), id] as const,
  byEvent: (eventId: string) => [...albumKeys.all, "byEvent", eventId] as const,
  kpi: () => [...albumKeys.all, "kpi"] as const,
  images: (albumId: string) => [...albumKeys.all, "images", albumId] as const,
  recentImages: (limit: number) => [...albumKeys.all, "recentImages", limit] as const,
};

// ============================================================================
// ALBUMS QUERIES
// ============================================================================

/**
 * Hook to fetch all albums with optional filtering
 */
export function useAlbums(params?: {
  visibility?: AlbumVisibility;
  albumType?: AlbumType;
  eventId?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: albumKeys.list(params || {}),
    queryFn: () => getAlbums(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single album by ID
 */
export function useAlbumById(albumId: string | undefined) {
  return useQuery({
    queryKey: albumKeys.detail(albumId || ""),
    queryFn: () => getAlbumById(albumId!),
    enabled: !!albumId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch album by event ID
 */
export function useAlbumByEventId(eventId: string | undefined) {
  return useQuery({
    queryKey: albumKeys.byEvent(eventId || ""),
    queryFn: () => getAlbumByEventId(eventId!),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch album KPIs
 */
export function useAlbumKpi() {
  return useQuery({
    queryKey: albumKeys.kpi(),
    queryFn: getAlbumKpi,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch album images
 */
export function useAlbumImages(albumId: string | undefined) {
  return useQuery({
    queryKey: albumKeys.images(albumId || ""),
    queryFn: () => getAlbumImages(albumId!),
    enabled: !!albumId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch recent images across all albums
 */
export function useRecentImages(limit: number = 20) {
  return useQuery({
    queryKey: albumKeys.recentImages(limit),
    queryFn: () => getRecentImages(limit),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// ALBUMS MUTATIONS
// ============================================================================

/**
 * Hook to create a new album
 */
export function useCreateAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AlbumCreate) => createAlbum(data),
    onSuccess: () => {
      // Invalidate albums list and KPI
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      queryClient.invalidateQueries({ queryKey: albumKeys.kpi() });
    },
  });
}

/**
 * Hook to update an album
 */
export function useUpdateAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ albumId, data }: { albumId: string; data: AlbumUpdate }) =>
      updateAlbum(albumId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific album and list
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(variables.albumId) });
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
    },
  });
}

/**
 * Hook to delete an album
 */
export function useDeleteAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (albumId: string) => deleteAlbum(albumId),
    onSuccess: () => {
      // Invalidate albums list and KPI
      queryClient.invalidateQueries({ queryKey: albumKeys.lists() });
      queryClient.invalidateQueries({ queryKey: albumKeys.kpi() });
    },
  });
}

/**
 * Hook to upload images to an album
 */
export function useUploadAlbumImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      albumId,
      files,
      eventId,
    }: {
      albumId: string;
      files: File[];
      eventId?: string;
    }) => uploadAlbumImages(albumId, files, eventId),
    onSuccess: (_, variables) => {
      // Invalidate album detail and images
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(variables.albumId) });
      queryClient.invalidateQueries({ queryKey: albumKeys.images(variables.albumId) });
      queryClient.invalidateQueries({ queryKey: albumKeys.kpi() });
      queryClient.invalidateQueries({ queryKey: albumKeys.recentImages(20) });
    },
  });
}

/**
 * Hook to delete an album image
 */
export function useDeleteAlbumImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ albumId, imageId }: { albumId: string; imageId: string }) =>
      deleteAlbumImage(albumId, imageId),
    onSuccess: (_, variables) => {
      // Invalidate album images
      queryClient.invalidateQueries({ queryKey: albumKeys.images(variables.albumId) });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(variables.albumId) });
      queryClient.invalidateQueries({ queryKey: albumKeys.kpi() });
    },
  });
}

/**
 * Hook to update image caption
 */
export function useUpdateImageCaption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ imageId, caption }: { imageId: string; caption: string }) =>
      updateImageCaption(imageId, caption),
    onSuccess: () => {
      // Invalidate all album images
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
    },
  });
}
