// ============================================================================
// FILE: src/app/services/albums.schema.ts
// PURPOSE: Type definitions for Albums Management module
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export enum AlbumVisibility {
  Public = "public",
  Private = "private",
  ClassOnly = "class_only",
}

export enum AlbumType {
  Event = "event",
  General = "general",
  ClassPhotos = "class_photos",
  Sports = "sports",
  Cultural = "cultural",
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface Album {
  albumId: string;
  name: string;
  description?: string;
  coverImage?: string;
  images: string[]; // Array of image IDs
  eventId?: string; // Link to event if album is event-related
  eventName?: string;
  visibility: AlbumVisibility;
  albumType: AlbumType;
  schoolId: number;
  academicYearId: number;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  imageCount: number;
}

export interface AlbumCreate {
  name: string;
  description?: string;
  coverImage?: string;
  eventId?: string;
  visibility?: AlbumVisibility;
  albumType?: AlbumType;
}

export interface AlbumUpdate {
  name?: string;
  description?: string;
  coverImage?: string;
  visibility?: AlbumVisibility;
  albumType?: AlbumType;
}

export interface AlbumImage {
  imageId: string;
  albumId: string;
  eventId?: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  uploadedAt: string;
  uploadedBy?: string;
  uploadedByName?: string;
  fileSize?: number;
  fileName?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  tags?: string[];
}

export interface AlbumKpi {
  totalAlbums: number;
  totalImages: number;
  publicAlbums: number;
  privateAlbums: number;
  eventAlbums: number;
  recentUploads: number;
}

export interface AlbumListResponse {
  items: Album[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface ImageUploadResult {
  imageId: string;
  url: string;
  thumbnailUrl: string;
  fileName: string;
  fileSize: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getVisibilityLabel(visibility: AlbumVisibility): string {
  switch (visibility) {
    case AlbumVisibility.Public:
      return "Public";
    case AlbumVisibility.Private:
      return "Private";
    case AlbumVisibility.ClassOnly:
      return "Class Only";
    default:
      return visibility;
  }
}

export function getAlbumTypeLabel(type: AlbumType): string {
  switch (type) {
    case AlbumType.Event:
      return "Event";
    case AlbumType.General:
      return "General";
    case AlbumType.ClassPhotos:
      return "Class Photos";
    case AlbumType.Sports:
      return "Sports";
    case AlbumType.Cultural:
      return "Cultural";
    default:
      return type;
  }
}

export function getVisibilityColor(visibility: AlbumVisibility): string {
  switch (visibility) {
    case AlbumVisibility.Public:
      return "#4caf50";
    case AlbumVisibility.Private:
      return "#f44336";
    case AlbumVisibility.ClassOnly:
      return "#ff9800";
    default:
      return "#9e9e9e";
  }
}
