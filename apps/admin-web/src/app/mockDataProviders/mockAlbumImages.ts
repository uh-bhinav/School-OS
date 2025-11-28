// ============================================================================
// FILE: src/app/mockDataProviders/mockAlbumImages.ts
// PURPOSE: Mock data provider for Album Images
// ============================================================================

import type { AlbumImage } from "../services/albums.schema";

// ============================================================================
// MOCK DATA STORAGE
// ============================================================================

let mockAlbumImages: AlbumImage[] = [];
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

function initializeMockAlbumImages(): void {
  if (initialized) return;

  // Generate sample images for each album
  const albumConfigs = [
    { albumId: "alb-1000", eventId: "evt-1000", count: 45, title: "Annual Day 2025" },
    { albumId: "alb-1001", eventId: "evt-1001", count: 62, title: "Sports Day 2025" },
    { albumId: "alb-1002", eventId: "evt-1002", count: 38, title: "Science Exhibition" },
    { albumId: "alb-1003", eventId: "evt-1003", count: 28, title: "Diwali Celebration" },
    { albumId: "alb-1004", eventId: "evt-1004", count: 35, title: "Independence Day" },
    { albumId: "alb-1005", count: 5, title: "Class 10 Batch Photo" },
    { albumId: "alb-1006", eventId: "evt-1005", count: 22, title: "Teacher's Day" },
    { albumId: "alb-1007", count: 15, title: "School Infrastructure" },
  ];

  albumConfigs.forEach((config, albumIndex) => {
    for (let i = 0; i < config.count; i++) {
      const imageId = `img-${config.albumId}-${i}`;
      const localImage = LOCAL_EVENT_IMAGES[(albumIndex + i) % LOCAL_EVENT_IMAGES.length];

      mockAlbumImages.push({
        imageId,
        albumId: config.albumId,
        eventId: config.eventId,
        url: localImage,
        thumbnailUrl: localImage,
        caption: `${config.title} - Photo ${i + 1}`,
        uploadedAt: new Date(Date.now() - (albumIndex * 7 + i) * 86400000).toISOString(),
        uploadedBy: "admin-1-uuid",
        uploadedByName: "Principal Admin",
        fileSize: 500000 + Math.floor(Math.random() * 2000000),
        fileName: `${config.title.toLowerCase().replace(/\s+/g, "_")}_${i + 1}.jpg`,
        mimeType: "image/jpeg",
        width: 1920,
        height: 1080,
        tags: [config.title.split(" ")[0]],
      });
    }
  });

  initialized = true;
  console.log(`[MOCK ALBUM IMAGES] Initialized ${mockAlbumImages.length} images`);
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function getAlbumImages(albumId: string): Promise<AlbumImage[]> {
  initializeMockAlbumImages();
  await simulateDelay(200);

  const images = mockAlbumImages.filter((img) => img.albumId === albumId);
  console.log(`[MOCK ALBUM IMAGES] getAlbumImages(${albumId}) → ${images.length} images`);
  return images;
}

export async function getImageById(imageId: string): Promise<AlbumImage | null> {
  initializeMockAlbumImages();
  await simulateDelay(150);

  const image = mockAlbumImages.find((img) => img.imageId === imageId);
  return image || null;
}

export async function uploadAlbumImages(
  albumId: string,
  files: Array<{ url: string; fileName: string; fileSize: number }>,
  eventId?: string
): Promise<AlbumImage[]> {
  initializeMockAlbumImages();
  await simulateDelay(500);

  const newImages: AlbumImage[] = files.map((file) => ({
    imageId: generateImageId(),
    albumId,
    eventId,
    url: file.url,
    thumbnailUrl: file.url,
    caption: "",
    uploadedAt: new Date().toISOString(),
    uploadedBy: "admin-1-uuid",
    uploadedByName: "Principal Admin",
    fileSize: file.fileSize,
    fileName: file.fileName,
    mimeType: "image/jpeg",
  }));

  mockAlbumImages.push(...newImages);
  console.log(`[MOCK ALBUM IMAGES] uploadAlbumImages → Added ${newImages.length} images to album ${albumId}`);
  return newImages;
}

export async function deleteAlbumImage(imageId: string): Promise<boolean> {
  initializeMockAlbumImages();
  await simulateDelay(250);

  const index = mockAlbumImages.findIndex((img) => img.imageId === imageId);
  if (index === -1) {
    console.log(`[MOCK ALBUM IMAGES] deleteAlbumImage → Image ${imageId} not found`);
    return false;
  }

  mockAlbumImages.splice(index, 1);
  console.log(`[MOCK ALBUM IMAGES] deleteAlbumImage → Deleted image ${imageId}`);
  return true;
}

export async function updateAlbumImageCaption(imageId: string, caption: string): Promise<AlbumImage | null> {
  initializeMockAlbumImages();
  await simulateDelay(200);

  const index = mockAlbumImages.findIndex((img) => img.imageId === imageId);
  if (index === -1) return null;

  mockAlbumImages[index].caption = caption;
  return mockAlbumImages[index];
}

export async function updateAlbumImageTags(imageId: string, tags: string[]): Promise<AlbumImage | null> {
  initializeMockAlbumImages();
  await simulateDelay(200);

  const index = mockAlbumImages.findIndex((img) => img.imageId === imageId);
  if (index === -1) return null;

  mockAlbumImages[index].tags = tags;
  return mockAlbumImages[index];
}

export async function getRecentImages(limit: number = 20): Promise<AlbumImage[]> {
  initializeMockAlbumImages();
  await simulateDelay(200);

  const sorted = [...mockAlbumImages].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  return sorted.slice(0, limit);
}

// ============================================================================
// EXPORT PROVIDER
// ============================================================================

export const mockAlbumImagesProvider = {
  getAlbumImages,
  getImageById,
  uploadAlbumImages,
  deleteAlbumImage,
  updateAlbumImageCaption,
  updateAlbumImageTags,
  getRecentImages,
  getAllAlbumImages: () => {
    initializeMockAlbumImages();
    return mockAlbumImages;
  },
};
