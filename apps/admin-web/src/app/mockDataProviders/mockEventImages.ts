// ============================================================================
// FILE: src/app/mockDataProviders/mockEventImages.ts
// PURPOSE: Mock data provider for Event Images
// ============================================================================

import type { EventImage } from "../services/events.schema";

// ============================================================================
// MOCK DATA STORAGE
// ============================================================================

let mockEventImages: EventImage[] = [];
let initialized = false;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateImageId(): string {
  return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function simulateDelay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Local placeholder images
const LOCAL_EVENT_IMAGES = [
  "/event_1.jpeg",
  "/event_2.jpeg",
  "/event_3.jpeg",
  "/event_4.jpeg",
];

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializeMockEventImages(): void {
  if (initialized) return;

  // Generate sample images for completed events
  const eventIds = ["evt-1002", "evt-1003", "evt-1004", "evt-1005"];
  const albumMapping: Record<string, string> = {
    "evt-1002": "alb-1002",
    "evt-1003": "alb-1003",
    "evt-1004": "alb-1004",
    "evt-1005": "alb-1006",
  };

  eventIds.forEach((eventId, eventIndex) => {
    const imageCount = 8 + Math.floor(Math.random() * 10);

    for (let i = 0; i < imageCount; i++) {
      const imageId = `img-${eventId}-${i}`;
      const localImage = LOCAL_EVENT_IMAGES[(eventIndex + i) % LOCAL_EVENT_IMAGES.length];

      mockEventImages.push({
        imageId,
        eventId,
        albumId: albumMapping[eventId] || `alb-${eventId.replace("evt-", "")}`,
        url: localImage,
        thumbnailUrl: localImage,
        caption: `Event photo ${i + 1}`,
        uploadedAt: new Date(Date.now() - (eventIndex * 7 + i) * 86400000).toISOString(),
        uploadedBy: "admin-1-uuid",
        fileSize: 500000 + Math.floor(Math.random() * 2000000),
        fileName: `event_photo_${eventIndex}_${i}.jpg`,
      });
    }
  });

  initialized = true;
  console.log(`[MOCK EVENT IMAGES] Initialized ${mockEventImages.length} images`);
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function getEventImages(eventId: string): Promise<EventImage[]> {
  initializeMockEventImages();
  await simulateDelay(200);

  const images = mockEventImages.filter((img) => img.eventId === eventId);
  console.log(`[MOCK EVENT IMAGES] getEventImages(${eventId}) → ${images.length} images`);
  return images;
}

export async function uploadEventImages(
  eventId: string,
  albumId: string,
  files: Array<{ url: string; fileName: string; fileSize: number }>
): Promise<EventImage[]> {
  initializeMockEventImages();
  await simulateDelay(500);

  const newImages: EventImage[] = files.map((file) => ({
    imageId: generateImageId(),
    eventId,
    albumId,
    url: file.url,
    thumbnailUrl: file.url,
    caption: "",
    uploadedAt: new Date().toISOString(),
    uploadedBy: "admin-1-uuid",
    fileSize: file.fileSize,
    fileName: file.fileName,
  }));

  mockEventImages.push(...newImages);
  console.log(`[MOCK EVENT IMAGES] uploadEventImages → Added ${newImages.length} images to event ${eventId}`);
  return newImages;
}

export async function deleteEventImage(imageId: string): Promise<boolean> {
  initializeMockEventImages();
  await simulateDelay(250);

  const index = mockEventImages.findIndex((img) => img.imageId === imageId);
  if (index === -1) {
    console.log(`[MOCK EVENT IMAGES] deleteEventImage → Image ${imageId} not found`);
    return false;
  }

  mockEventImages.splice(index, 1);
  console.log(`[MOCK EVENT IMAGES] deleteEventImage → Deleted image ${imageId}`);
  return true;
}

export async function updateEventImageCaption(imageId: string, caption: string): Promise<EventImage | null> {
  initializeMockEventImages();
  await simulateDelay(200);

  const index = mockEventImages.findIndex((img) => img.imageId === imageId);
  if (index === -1) return null;

  mockEventImages[index].caption = caption;
  return mockEventImages[index];
}

// ============================================================================
// EXPORT PROVIDER
// ============================================================================

export const mockEventImagesProvider = {
  getEventImages,
  uploadEventImages,
  deleteEventImage,
  updateEventImageCaption,
  getAllEventImages: () => {
    initializeMockEventImages();
    return mockEventImages;
  },
};
