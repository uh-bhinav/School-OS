// ============================================================================
// FILE: src/app/services/events.api.ts
// PURPOSE: API service for Event Management (using mock data)
// ============================================================================

import { mockEventsProvider } from "../mockDataProviders/mockEvents";
import { mockEventImagesProvider } from "../mockDataProviders/mockEventImages";
import { mockAlbumsProvider } from "../mockDataProviders/mockAlbums";
import { mockAlbumImagesProvider } from "../mockDataProviders/mockAlbumImages";
import type {
  Event,
  EventCreate,
  EventUpdate,
  EventImage,
  EventKpi,
} from "./events.schema";

// ============================================================================
// CHECK DEMO MODE
// ============================================================================

function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === "true";
}

// ============================================================================
// EVENTS API
// ============================================================================

/**
 * Get all events with optional filtering
 */
export async function getEvents(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Event[]; total: number }> {
  if (isDemoMode()) {
    return mockEventsProvider.getEvents(params as any);
  }
  // Real API not implemented - always use mock
  return mockEventsProvider.getEvents(params as any);
}

/**
 * Get a single event by ID
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  if (isDemoMode()) {
    return mockEventsProvider.getEventById(eventId);
  }
  return mockEventsProvider.getEventById(eventId);
}

/**
 * Create a new event
 */
export async function createEvent(data: EventCreate): Promise<Event> {
  if (isDemoMode()) {
    return mockEventsProvider.createEvent(data);
  }
  return mockEventsProvider.createEvent(data);
}

/**
 * Update an existing event
 */
export async function updateEvent(eventId: string, data: EventUpdate): Promise<Event | null> {
  if (isDemoMode()) {
    return mockEventsProvider.updateEvent(eventId, data);
  }
  return mockEventsProvider.updateEvent(eventId, data);
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string): Promise<boolean> {
  if (isDemoMode()) {
    return mockEventsProvider.deleteEvent(eventId);
  }
  return mockEventsProvider.deleteEvent(eventId);
}

/**
 * Get event KPIs
 */
export async function getEventKpi(): Promise<EventKpi> {
  if (isDemoMode()) {
    return mockEventsProvider.getEventKpi();
  }
  return mockEventsProvider.getEventKpi();
}

// ============================================================================
// EVENT IMAGES API
// ============================================================================

/**
 * Get all images for an event
 */
export async function getEventImages(eventId: string): Promise<EventImage[]> {
  if (isDemoMode()) {
    return mockEventImagesProvider.getEventImages(eventId);
  }
  return mockEventImagesProvider.getEventImages(eventId);
}

/**
 * Upload images to an event (and optionally to an album)
 * If no albumId is provided, creates a new album for the event
 */
export async function uploadEventImages(
  eventId: string,
  files: File[],
  albumId?: string
): Promise<{ images: EventImage[]; albumId: string }> {
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

  // Get the event to use its name for album creation
  const event = await mockEventsProvider.getEventById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  // Create or get album for the event
  let targetAlbumId = albumId;
  if (!targetAlbumId) {
    // Check if album already exists for this event
    const existingAlbum = await mockAlbumsProvider.getAlbumByEventId(eventId);
    if (existingAlbum) {
      targetAlbumId = existingAlbum.albumId;
    } else {
      // Create new album
      const newAlbum = await mockAlbumsProvider.createEventAlbum(eventId, event.title);
      targetAlbumId = newAlbum.albumId;
    }
  }

  // Upload to event images
  const eventImages = await mockEventImagesProvider.uploadEventImages(eventId, targetAlbumId, fileData);

  // Also upload to album images
  await mockAlbumImagesProvider.uploadAlbumImages(targetAlbumId, fileData, eventId);

  // Update event with new image IDs
  const imageIds = eventImages.map((img) => img.imageId);
  await mockEventsProvider.addImagesToEvent(eventId, imageIds);

  // Update album with new image IDs
  await mockAlbumsProvider.addImagesToAlbum(targetAlbumId, imageIds);

  return {
    images: eventImages,
    albumId: targetAlbumId,
  };
}

/**
 * Delete an image from an event
 */
export async function deleteEventImage(_eventId: string, imageId: string): Promise<boolean> {
  if (isDemoMode()) {
    return mockEventImagesProvider.deleteEventImage(imageId);
  }
  return mockEventImagesProvider.deleteEventImage(imageId);
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
