// ============================================================================
// FILE: src/app/services/voiceAnnouncements.api.ts
// PURPOSE: API service for Voice Announcements
// ============================================================================

import { http } from "./http";
import type {
  VoiceAnnouncementCreate,
  VoiceAnnouncement,
  AnnouncementDelivery,
  SendAnnouncementResponse,
  UploadAudioResponse,
} from "./voiceAnnouncements.schema";

const BASE_PATH = "/voice-announcements";

// ============================================================================
// VOICE ANNOUNCEMENTS API
// ============================================================================

/**
 * Upload audio file to Supabase Storage
 */
export async function uploadAudio(file: File): Promise<UploadAudioResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await http.post<UploadAudioResponse>(
    `${BASE_PATH}/upload-audio`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

/**
 * Create a new voice announcement
 */
export async function createAnnouncement(
  data: VoiceAnnouncementCreate
): Promise<VoiceAnnouncement> {
  const response = await http.post<VoiceAnnouncement>(`${BASE_PATH}`, data);
  return response.data;
}

/**
 * Send voice announcement to teachers via FCM
 */
export async function sendAnnouncement(
  announcementId: string
): Promise<SendAnnouncementResponse> {
  const response = await http.post<SendAnnouncementResponse>(
    `${BASE_PATH}/${announcementId}/send`
  );
  return response.data;
}

/**
 * Get delivery status for an announcement
 */
export async function getAnnouncementDeliveries(
  announcementId: string
): Promise<AnnouncementDelivery[]> {
  const response = await http.get<AnnouncementDelivery[]>(
    `${BASE_PATH}/${announcementId}/deliveries`
  );
  return response.data;
}

/**
 * Get announcements for current teacher (for Flutter app later)
 */
export async function getMyAnnouncements(): Promise<VoiceAnnouncement[]> {
  const response = await http.get<VoiceAnnouncement[]>(
    `${BASE_PATH}/my-announcements`
  );
  return response.data;
}

/**
 * Update delivery status (for Flutter app later)
 */
export async function updateDeliveryStatus(
  deliveryId: string,
  status: string
): Promise<{ success: boolean; status: string }> {
  const response = await http.put(
    `${BASE_PATH}/deliveries/${deliveryId}/status`,
    { status }
  );
  return response.data;
}

/**
 * Register device token for FCM (for Flutter app later)
 */
export async function registerDeviceToken(data: {
  device_id: string;
  fcm_token: string;
  platform: string;
  app_version?: string;
}): Promise<{ success: boolean; message: string }> {
  const response = await http.post(`${BASE_PATH}/device-tokens`, data);
  return response.data;
}
