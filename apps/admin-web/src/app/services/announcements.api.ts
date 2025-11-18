// ============================================================================
// FILE: src/app/services/announcements.api.ts
// PURPOSE: API service for announcements management
// ============================================================================

import { http } from "./http";
import { isDemoMode, mockAnnouncementsProvider } from "../mockDataProviders";

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface Announcement {
  announcement_id: number;
  school_id: number;
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  target_role?: "all" | "admin" | "teacher" | "student" | "parent" | null;
  target_class_id?: number | null;
  target_section?: string | null;
  scheduled_for?: string | null;
  published_at?: string | null;
  expires_at?: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
}

export interface AnnouncementCreate {
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  target_role?: "all" | "admin" | "teacher" | "student" | "parent" | null;
  target_class_id?: number | null;
  target_section?: string | null;
  scheduled_for?: string | null;
  expires_at?: string | null;
}

export interface AnnouncementListResponse {
  items: Announcement[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetch list of announcements with optional filters
 */
export async function listAnnouncements(params: {
  school_id: number;
  target_role?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}): Promise<AnnouncementListResponse> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    const announcements = await mockAnnouncementsProvider.getAnnouncements({
      target_audience: params.target_role,
      is_published: params.is_active,
    });

    return {
      items: announcements.map(a => ({
        announcement_id: a.id,
        school_id: params.school_id,
        title: a.title,
        content: a.content,
        priority: a.priority.toLowerCase() as "low" | "medium" | "high" | "urgent",
        target_role: a.target_audience === "ALL" ? "all" : a.target_audience.toLowerCase() as any,
        target_class_id: null,
        target_section: null,
        scheduled_for: null,
        published_at: a.published_at,
        expires_at: null,
        is_active: a.is_published,
        created_by: a.author_id.toString(),
        created_at: a.created_at,
        updated_at: a.updated_at,
      })),
      total: announcements.length,
      page: params.page || 1,
      page_size: params.page_size || 20,
      pages: Math.ceil(announcements.length / (params.page_size || 20)),
    };
  }

  const { data } = await http.get<AnnouncementListResponse>("/announcements/", { params });
  return data;
}

/**
 * Get a single announcement by ID
 */
export async function getAnnouncement(announcementId: number): Promise<Announcement> {
  const { data } = await http.get<Announcement>(`/announcements/${announcementId}`);
  return data;
}

/**
 * Create a new announcement
 */
export async function createAnnouncement(
  schoolId: number,
  payload: AnnouncementCreate
): Promise<Announcement> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    const newAnnouncement = await mockAnnouncementsProvider.create({
      title: payload.title,
      content: payload.content,
      priority: payload.priority.toUpperCase() as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      target_audience: payload.target_role?.toUpperCase() as any || "ALL",
    });

    return {
      announcement_id: newAnnouncement.id,
      school_id: schoolId,
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      priority: newAnnouncement.priority.toLowerCase() as "low" | "medium" | "high" | "urgent",
      target_role: newAnnouncement.target_audience === "ALL" ? "all" : newAnnouncement.target_audience.toLowerCase() as any,
      target_class_id: null,
      target_section: null,
      scheduled_for: null,
      published_at: newAnnouncement.published_at,
      expires_at: null,
      is_active: newAnnouncement.is_published,
      created_by: newAnnouncement.author_id.toString(),
      created_at: newAnnouncement.created_at,
      updated_at: newAnnouncement.updated_at,
    };
  }

  const { data } = await http.post<Announcement>("/announcements/", {
    ...payload,
    school_id: schoolId,
  });
  return data;
}

/**
 * Update an existing announcement
 */
export async function updateAnnouncement(
  announcementId: number,
  patch: Partial<AnnouncementCreate>
): Promise<Announcement> {
  const { data } = await http.put<Announcement>(`/announcements/${announcementId}`, patch);
  return data;
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(announcementId: number): Promise<void> {
  await http.delete(`/announcements/${announcementId}`);
}

/**
 * Publish a scheduled announcement immediately
 */
export async function publishAnnouncement(announcementId: number): Promise<Announcement> {
  const { data } = await http.post<Announcement>(`/announcements/${announcementId}/publish`);
  return data;
}
