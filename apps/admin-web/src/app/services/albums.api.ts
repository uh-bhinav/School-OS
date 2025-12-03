// ============================================================================
// FILE: src/app/services/albums.api.ts
// PURPOSE: API service for Albums Management (using mock data)
// ============================================================================

import { mockAlbumsProvider } from "../mockDataProviders/mockAlbums";
import { mockAlbumImagesProvider } from "../mockDataProviders/mockAlbumImages";
import type {
  Album,
  AlbumCreate,
  AlbumUpdate,
  AlbumImage,
  AlbumKpi,
  AlbumVisibility,
  AlbumType,
} from "./albums.schema";

// ============================================================================
// CHECK DEMO MODE
// ============================================================================

function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === "true";
}

// ============================================================================
// ALBUMS API
// ============================================================================

/**
 * Get all albums with optional filtering
 */
export async function getAlbums(params?: {
  visibility?: AlbumVisibility;
  albumType?: AlbumType;
  eventId?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Album[]; total: number }> {
  if (isDemoMode()) {
    return mockAlbumsProvider.getAlbums(params);
  }
  return mockAlbumsProvider.getAlbums(params);
}

/**
 * Get a single album by ID
 */
export async function getAlbumById(albumId: string): Promise<Album | null> {
  if (isDemoMode()) {
    return mockAlbumsProvider.getAlbumById(albumId);
  }
  return mockAlbumsProvider.getAlbumById(albumId);
}

/**
 * Get album by event ID
 */
export async function getAlbumByEventId(eventId: string): Promise<Album | null> {
  if (isDemoMode()) {
    return mockAlbumsProvider.getAlbumByEventId(eventId);
  }
  return mockAlbumsProvider.getAlbumByEventId(eventId);
}

/**
 * Create a new album
 */
export async function createAlbum(data: AlbumCreate): Promise<Album> {
  if (isDemoMode()) {
    return mockAlbumsProvider.createAlbum(data);
  }
  return mockAlbumsProvider.createAlbum(data);
}

/**
 * Update an existing album
 */
export async function updateAlbum(albumId: string, data: AlbumUpdate): Promise<Album | null> {
  if (isDemoMode()) {
    return mockAlbumsProvider.updateAlbum(albumId, data);
  }
  return mockAlbumsProvider.updateAlbum(albumId, data);
}

/**
 * Delete an album
 */
export async function deleteAlbum(albumId: string): Promise<boolean> {
  if (isDemoMode()) {
    return mockAlbumsProvider.deleteAlbum(albumId);
  }
  return mockAlbumsProvider.deleteAlbum(albumId);
}

/**
 * Get album KPIs
 */
export async function getAlbumKpi(): Promise<AlbumKpi> {
  if (isDemoMode()) {
    return mockAlbumsProvider.getAlbumKpi();
  }
  return mockAlbumsProvider.getAlbumKpi();
}

// ============================================================================
// ALBUM IMAGES API
// ============================================================================

/**
 * Get all images for an album
 */
export async function getAlbumImages(albumId: string): Promise<AlbumImage[]> {
  if (isDemoMode()) {
    return mockAlbumImagesProvider.getAlbumImages(albumId);
  }
  return mockAlbumImagesProvider.getAlbumImages(albumId);
}

/**
 * Get a single image by ID
 */
export async function getImageById(imageId: string): Promise<AlbumImage | null> {
  if (isDemoMode()) {
    return mockAlbumImagesProvider.getImageById(imageId);
  }
  return mockAlbumImagesProvider.getImageById(imageId);
}

/**
 * Upload images to an album
 */
export async function uploadAlbumImages(
  albumId: string,
  files: File[],
  eventId?: string
): Promise<AlbumImage[]> {
  // Convert files to base64/blob URLs for local storage
  const fileData = await Promise.all(
    files.map(async (file) => {
      const url = await fileToDataUrl(file);
      return {
        url,
        fileName: file.name,
        fileSize: file.size,
      };
    })
  );

  // Upload to album images
  const albumImages = await mockAlbumImagesProvider.uploadAlbumImages(albumId, fileData, eventId);

  // Update album with new image IDs
  const imageIds = albumImages.map((img) => img.imageId);
  await mockAlbumsProvider.addImagesToAlbum(albumId, imageIds);

  return albumImages;
}

/**
 * Delete an image from an album
 */
export async function deleteAlbumImage(albumId: string, imageId: string): Promise<boolean> {
  const deleted = await mockAlbumImagesProvider.deleteAlbumImage(imageId);

  if (deleted) {
    // Remove from album's image list
    await mockAlbumsProvider.removeImageFromAlbum(albumId, imageId);
  }

  return deleted;
}

/**
 * Update image caption
 */
export async function updateImageCaption(imageId: string, caption: string): Promise<AlbumImage | null> {
  if (isDemoMode()) {
    return mockAlbumImagesProvider.updateAlbumImageCaption(imageId, caption);
  }
  return mockAlbumImagesProvider.updateAlbumImageCaption(imageId, caption);
}

/**
 * Update image tags
 */
export async function updateImageTags(imageId: string, tags: string[]): Promise<AlbumImage | null> {
  if (isDemoMode()) {
    return mockAlbumImagesProvider.updateAlbumImageTags(imageId, tags);
  }
  return mockAlbumImagesProvider.updateAlbumImageTags(imageId, tags);
}

/**
 * Get recent images across all albums
 */
export async function getRecentImages(limit: number = 20): Promise<AlbumImage[]> {
  if (isDemoMode()) {
    return mockAlbumImagesProvider.getRecentImages(limit);
  }
  return mockAlbumImagesProvider.getRecentImages(limit);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert a File to a data URL for local storage
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
