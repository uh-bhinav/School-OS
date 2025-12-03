// ============================================================================
// FILE: src/app/mockDataProviders/mockAlbums.ts
// PURPOSE: Mock data provider for Albums Management
// ============================================================================

import type { Album, AlbumKpi, AlbumCreate, AlbumUpdate } from "../services/albums.schema";
import { AlbumVisibility, AlbumType } from "../services/albums.schema";

// ============================================================================
// MOCK DATA STORAGE
// ============================================================================

let mockAlbums: Album[] = [];
let initialized = false;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(): string {
  return `alb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function simulateDelay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializeMockAlbums(): void {
  if (initialized) return;

  const albumData = [
    {
      name: "Annual Day 2025",
      description: "Photos from the Annual Day celebration featuring cultural performances and award ceremony",
      eventId: "evt-1000",
      eventName: "Annual Day Celebration 2025",
      visibility: AlbumVisibility.Public,
      albumType: AlbumType.Event,
      imageCount: 45,
    },
    {
      name: "Sports Day 2025",
      description: "Capturing the spirit of competition during our Inter-House Sports Meet",
      eventId: "evt-1001",
      eventName: "Inter-House Sports Meet",
      visibility: AlbumVisibility.Public,
      albumType: AlbumType.Sports,
      imageCount: 62,
    },
    {
      name: "Science Exhibition",
      description: "Innovative projects showcased by our talented students",
      eventId: "evt-1002",
      eventName: "Science Exhibition",
      visibility: AlbumVisibility.Public,
      albumType: AlbumType.Event,
      imageCount: 38,
    },
    {
      name: "Diwali Celebration",
      description: "Rangoli, diyas, and festive fun from our Diwali celebration",
      eventId: "evt-1003",
      eventName: "Diwali Celebration",
      visibility: AlbumVisibility.Public,
      albumType: AlbumType.Cultural,
      imageCount: 28,
    },
    {
      name: "Independence Day 2025",
      description: "Patriotic celebration and flag hoisting ceremony",
      eventId: "evt-1004",
      eventName: "Independence Day Flag Hoisting",
      visibility: AlbumVisibility.Public,
      albumType: AlbumType.Event,
      imageCount: 35,
    },
    {
      name: "Class 10 Batch Photo",
      description: "Official batch photo of Class 10 students - 2024-25",
      visibility: AlbumVisibility.ClassOnly,
      albumType: AlbumType.ClassPhotos,
      imageCount: 5,
    },
    {
      name: "Teacher's Day Celebration",
      description: "Special moments from Teacher's Day program organized by students",
      eventId: "evt-1005",
      eventName: "Teacher's Day Program",
      visibility: AlbumVisibility.Public,
      albumType: AlbumType.Cultural,
      imageCount: 22,
    },
    {
      name: "School Infrastructure",
      description: "Photos of our school campus, facilities, and infrastructure",
      visibility: AlbumVisibility.Public,
      albumType: AlbumType.General,
      imageCount: 15,
    },
  ];

  // Generate mock albums
  albumData.forEach((data, index) => {
    const albumId = `alb-${1000 + index}`;
    const album: Album = {
      albumId,
      name: data.name,
      description: data.description,
      coverImage: `/event_${(index % 4) + 1}.jpeg`,
      images: Array.from({ length: data.imageCount }, (_, i) => `img-${albumId}-${i}`),
      eventId: data.eventId,
      eventName: data.eventName,
      visibility: data.visibility,
      albumType: data.albumType,
      schoolId: 1,
      academicYearId: 1,
      createdBy: "admin-1-uuid",
      createdByName: "Principal Admin",
      createdAt: new Date(Date.now() - index * 86400000 * 7).toISOString(),
      updatedAt: new Date().toISOString(),
      imageCount: data.imageCount,
    };

    mockAlbums.push(album);
  });

  initialized = true;
  console.log(`[MOCK ALBUMS] Initialized ${mockAlbums.length} albums`);
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function getAlbums(params?: {
  visibility?: AlbumVisibility;
  albumType?: AlbumType;
  eventId?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Album[]; total: number }> {
  initializeMockAlbums();
  await simulateDelay();

  let filtered = [...mockAlbums];

  if (params?.visibility) {
    filtered = filtered.filter((a) => a.visibility === params.visibility);
  }

  if (params?.albumType) {
    filtered = filtered.filter((a) => a.albumType === params.albumType);
  }

  if (params?.eventId) {
    filtered = filtered.filter((a) => a.eventId === params.eventId);
  }

  // Sort by creation date descending
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 50;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  console.log(`[MOCK ALBUMS] getAlbums → ${items.length} albums`);
  return { items, total: filtered.length };
}

export async function getAlbumById(albumId: string): Promise<Album | null> {
  initializeMockAlbums();
  await simulateDelay(200);

  const album = mockAlbums.find((a) => a.albumId === albumId);
  console.log(`[MOCK ALBUMS] getAlbumById(${albumId}) →`, album ? "found" : "not found");
  return album || null;
}

export async function getAlbumByEventId(eventId: string): Promise<Album | null> {
  initializeMockAlbums();
  await simulateDelay(200);

  const album = mockAlbums.find((a) => a.eventId === eventId);
  console.log(`[MOCK ALBUMS] getAlbumByEventId(${eventId}) →`, album ? "found" : "not found");
  return album || null;
}

export async function createAlbum(data: AlbumCreate): Promise<Album> {
  initializeMockAlbums();
  await simulateDelay(400);

  const albumId = generateId();
  const now = new Date().toISOString();

  const newAlbum: Album = {
    albumId,
    name: data.name,
    description: data.description,
    coverImage: data.coverImage,
    images: [],
    eventId: data.eventId,
    visibility: data.visibility || AlbumVisibility.Public,
    albumType: data.albumType || AlbumType.General,
    schoolId: 1,
    academicYearId: 1,
    createdBy: "admin-1-uuid",
    createdByName: "Principal Admin",
    createdAt: now,
    updatedAt: now,
    imageCount: 0,
  };

  mockAlbums.unshift(newAlbum);
  console.log(`[MOCK ALBUMS] createAlbum → Created album ${albumId}`);
  return newAlbum;
}

export async function updateAlbum(albumId: string, data: AlbumUpdate): Promise<Album | null> {
  initializeMockAlbums();
  await simulateDelay(350);

  const index = mockAlbums.findIndex((a) => a.albumId === albumId);
  if (index === -1) {
    console.log(`[MOCK ALBUMS] updateAlbum → Album ${albumId} not found`);
    return null;
  }

  const existing = mockAlbums[index];
  const updated: Album = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  mockAlbums[index] = updated;
  console.log(`[MOCK ALBUMS] updateAlbum → Updated album ${albumId}`);
  return updated;
}

export async function deleteAlbum(albumId: string): Promise<boolean> {
  initializeMockAlbums();
  await simulateDelay(300);

  const index = mockAlbums.findIndex((a) => a.albumId === albumId);
  if (index === -1) {
    console.log(`[MOCK ALBUMS] deleteAlbum → Album ${albumId} not found`);
    return false;
  }

  mockAlbums.splice(index, 1);
  console.log(`[MOCK ALBUMS] deleteAlbum → Deleted album ${albumId}`);
  return true;
}

export async function addImagesToAlbum(albumId: string, imageIds: string[]): Promise<Album | null> {
  initializeMockAlbums();
  await simulateDelay(250);

  const index = mockAlbums.findIndex((a) => a.albumId === albumId);
  if (index === -1) return null;

  mockAlbums[index].images = [...mockAlbums[index].images, ...imageIds];
  mockAlbums[index].imageCount = mockAlbums[index].images.length;
  mockAlbums[index].updatedAt = new Date().toISOString();

  // Update cover image if not set
  if (!mockAlbums[index].coverImage && imageIds.length > 0) {
    mockAlbums[index].coverImage = imageIds[0];
  }

  console.log(`[MOCK ALBUMS] addImagesToAlbum → Added ${imageIds.length} images to album ${albumId}`);
  return mockAlbums[index];
}

export async function removeImageFromAlbum(albumId: string, imageId: string): Promise<Album | null> {
  initializeMockAlbums();
  await simulateDelay(250);

  const index = mockAlbums.findIndex((a) => a.albumId === albumId);
  if (index === -1) return null;

  mockAlbums[index].images = mockAlbums[index].images.filter((id) => id !== imageId);
  mockAlbums[index].imageCount = mockAlbums[index].images.length;
  mockAlbums[index].updatedAt = new Date().toISOString();

  console.log(`[MOCK ALBUMS] removeImageFromAlbum → Removed image ${imageId} from album ${albumId}`);
  return mockAlbums[index];
}

export async function getAlbumKpi(): Promise<AlbumKpi> {
  initializeMockAlbums();
  await simulateDelay(200);

  const totalImages = mockAlbums.reduce((sum, a) => sum + a.imageCount, 0);
  const publicAlbums = mockAlbums.filter((a) => a.visibility === AlbumVisibility.Public).length;
  const privateAlbums = mockAlbums.filter((a) => a.visibility === AlbumVisibility.Private).length;
  const eventAlbums = mockAlbums.filter((a) => a.eventId).length;

  // Recent uploads (last 30 days)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentUploads = mockAlbums.filter(
    (a) => new Date(a.createdAt).getTime() > thirtyDaysAgo
  ).reduce((sum, a) => sum + a.imageCount, 0);

  return {
    totalAlbums: mockAlbums.length,
    totalImages,
    publicAlbums,
    privateAlbums,
    eventAlbums,
    recentUploads,
  };
}

export async function createEventAlbum(eventId: string, eventName: string): Promise<Album> {
  initializeMockAlbums();
  await simulateDelay(400);

  // Check if album already exists for this event
  const existing = mockAlbums.find((a) => a.eventId === eventId);
  if (existing) {
    console.log(`[MOCK ALBUMS] createEventAlbum → Album already exists for event ${eventId}`);
    return existing;
  }

  const albumId = generateId();
  const now = new Date().toISOString();

  const newAlbum: Album = {
    albumId,
    name: `Event - ${eventName}`,
    description: `Photos from ${eventName}`,
    coverImage: undefined,
    images: [],
    eventId,
    eventName,
    visibility: AlbumVisibility.Public,
    albumType: AlbumType.Event,
    schoolId: 1,
    academicYearId: 1,
    createdBy: "admin-1-uuid",
    createdByName: "Principal Admin",
    createdAt: now,
    updatedAt: now,
    imageCount: 0,
  };

  mockAlbums.unshift(newAlbum);
  console.log(`[MOCK ALBUMS] createEventAlbum → Created album ${albumId} for event ${eventId}`);
  return newAlbum;
}

// ============================================================================
// EXPORT PROVIDER
// ============================================================================

export const mockAlbumsProvider = {
  getAlbums,
  getAlbumById,
  getAlbumByEventId,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addImagesToAlbum,
  removeImageFromAlbum,
  getAlbumKpi,
  createEventAlbum,
  getAllAlbums: () => {
    initializeMockAlbums();
    return mockAlbums;
  },
};
