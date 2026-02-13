// ============================================================================
// FILE: src/app/services/voiceAnnouncements.schema.ts
// PURPOSE: TypeScript types for Voice Announcements
// ============================================================================

export enum AnnouncementPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
  Urgent = "urgent",
}

export enum DeliveryStatus {
  Pending = "pending",
  Delivered = "delivered",
  Opened = "opened",
  Played = "played",
  Completed = "completed",
}

export interface VoiceAnnouncementCreate {
  title: string;
  description?: string;
  audio_file_url: string;
  audio_duration?: number;
  target_audience: Record<string, any>;
  priority: AnnouncementPriority;
  scheduled_for?: string;
}

export interface VoiceAnnouncement {
  id: string;
  school_id: string;
  created_by: string;
  title: string;
  description?: string;
  audio_file_url: string;
  audio_duration?: number;
  target_audience: Record<string, any>;
  priority: AnnouncementPriority;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementDelivery {
  id: string;
  announcement_id: string;
  teacher_id: string;
  teacher_name: string;
  status: DeliveryStatus;
  delivered_at?: string;
  opened_at?: string;
  played_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface SendAnnouncementResponse {
  success: boolean;
  delivery_count: number;
  fcm_sent: number;
  fcm_failed: number;
  message: string;
}

export interface UploadAudioResponse {
  file_url: string;
  filename: string;
  message: string;
}
