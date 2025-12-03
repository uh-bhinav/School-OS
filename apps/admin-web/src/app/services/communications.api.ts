// ============================================================================
// FILE: src/app/services/communications.api.ts
// PURPOSE: API service for communications/messaging management
// ============================================================================

import { isDemoMode, mockCommunicationsProvider } from "../mockDataProviders";

// Note: Backend uses a different communication model (conversations and messages)
// The backend endpoints are at /comms/* not /communication/*
// Available endpoints:
// POST /comms/conversations/ - start new conversation
// GET /comms/conversations/me/ - get my conversations
// POST /comms/conversations/{id}/messages/ - send message
// GET /comms/conversations/{id}/messages/ - get messages

export interface Communication {
  communication_id: number;
  school_id: number;
  sender_user_id: string;
  sender_name?: string;
  recipient_user_id?: string | null;
  recipient_role?: "admin" | "teacher" | "student" | "parent" | null;
  recipient_class_id?: number | null;
  subject: string;
  message: string;
  message_type: "email" | "sms" | "push" | "in-app";
  status: "pending" | "sent" | "delivered" | "failed";
  sent_at?: string | null;
  delivered_at?: string | null;
  read_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface CommunicationCreate {
  recipient_user_id?: string | null;
  recipient_role?: "admin" | "teacher" | "student" | "parent" | null;
  recipient_class_id?: number | null;
  subject: string;
  message: string;
  message_type: "email" | "sms" | "push" | "in-app";
}

export interface CommunicationListResponse {
  items: Communication[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetch list of communications with optional filters
 * Note: Backend uses conversations model, this returns empty array until proper mapping is implemented
 */
export async function listCommunications(params: {
  school_id: number;
  message_type?: string;
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<CommunicationListResponse> {
  // DEMO MODE: Return mock data
  if (isDemoMode()) {
    const communications = await mockCommunicationsProvider.getCommunications({});

    return {
      items: communications.map(c => ({
        communication_id: c.id,
        school_id: params.school_id,
        sender_user_id: c.sender_id.toString(),
        sender_name: c.sender_name,
        recipient_user_id: c.recipient_ids[0]?.toString() || null,
        recipient_role: null,
        recipient_class_id: null,
        subject: c.subject,
        message: c.message,
        message_type: "in-app",
        status: c.is_read ? "delivered" : "sent",
        sent_at: c.sent_at,
        delivered_at: c.sent_at,
        read_at: c.is_read ? c.sent_at : null,
        created_at: c.sent_at,
        updated_at: c.sent_at,
      })),
      total: communications.length,
      page: params.page || 1,
      page_size: params.page_size || 20,
      pages: Math.ceil(communications.length / (params.page_size || 20)),
    };
  }

  // Backend uses /comms/conversations/me/ endpoint
  // For now, return empty response to avoid 404 errors
  return {
    items: [],
    total: 0,
    page: 1,
    page_size: 20,
    pages: 0
  };
}

/**
 * Get a single communication by ID
 */
export async function getCommunication(_communicationId: number): Promise<Communication> {
  // Backend uses different model, return mock data
  throw new Error("Not implemented - backend uses conversation model");
}

/**
 * Send a new communication
 */
export async function sendCommunication(
  _schoolId: number,
  _payload: CommunicationCreate
): Promise<Communication> {
  // Backend uses /comms/conversations/ to start conversations
  throw new Error("Not implemented - use conversation API");
}

/**
 * Mark communication as read
 */
export async function markAsRead(_communicationId: number): Promise<Communication> {
  throw new Error("Not implemented - backend uses conversation model");
}

/**
 * Delete a communication
 */
export async function deleteCommunication(_communicationId: number): Promise<void> {
  throw new Error("Not implemented - backend uses conversation model");
}
