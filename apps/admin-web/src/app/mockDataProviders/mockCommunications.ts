// ============================================================================
// MOCK COMMUNICATIONS DATA PROVIDER
// ============================================================================

export interface Communication {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_role: "ADMIN" | "TEACHER" | "PARENT" | "STUDENT";
  recipient_ids: number[];
  recipient_names: string[];
  subject: string;
  message: string;
  sent_at: string;
  is_read: boolean;
  attachments?: string[];
}

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================
let communicationIdCounter = 100;
const mockCommunications: Communication[] = [
  {
    id: 1,
    sender_id: 1,
    sender_name: "Principal",
    sender_role: "ADMIN",
    recipient_ids: [101, 102, 103],
    recipient_names: ["Parent 1", "Parent 2", "Parent 3"],
    subject: "Upcoming Parent-Teacher Meeting",
    message: "Dear Parents, We would like to inform you about the upcoming parent-teacher meeting scheduled for next week.",
    sent_at: "2025-11-10T14:30:00Z",
    is_read: true,
  },
  {
    id: 2,
    sender_id: 2,
    sender_name: "Mr. Sharma",
    sender_role: "TEACHER",
    recipient_ids: [201, 202],
    recipient_names: ["Student 1", "Student 2"],
    subject: "Assignment Submission Reminder",
    message: "This is a reminder to submit your mathematics assignment by Friday.",
    sent_at: "2025-11-12T10:00:00Z",
    is_read: false,
  },
];

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getMockCommunications(filters?: {
  sender_id?: number;
  recipient_id?: number;
  is_read?: boolean;
}): Promise<Communication[]> {
  await simulateDelay();

  let filtered = [...mockCommunications];
  if (filters?.sender_id) {
    filtered = filtered.filter((c) => c.sender_id === filters.sender_id);
  }
  if (filters?.recipient_id) {
    filtered = filtered.filter((c) => c.recipient_ids.includes(filters.recipient_id!));
  }
  if (filters?.is_read !== undefined) {
    filtered = filtered.filter((c) => c.is_read === filters.is_read);
  }

  console.log(`[MOCK COMMUNICATIONS] getCommunications → ${filtered.length} messages`);
  return filtered.sort((a, b) => b.sent_at.localeCompare(a.sent_at));
}

export async function getMockCommunicationById(id: number): Promise<Communication> {
  await simulateDelay();

  const communication = mockCommunications.find((c) => c.id === id);
  if (!communication) throw new Error(`Communication #${id} not found`);

  console.log(`[MOCK COMMUNICATIONS] getById(${id})`);
  return communication;
}

export async function sendMockCommunication(data: Partial<Communication>): Promise<Communication> {
  await simulateDelay(300);

  const newCommunication: Communication = {
    id: ++communicationIdCounter,
    sender_id: data.sender_id || 1,
    sender_name: data.sender_name || "Admin",
    sender_role: data.sender_role || "ADMIN",
    recipient_ids: data.recipient_ids || [],
    recipient_names: data.recipient_names || [],
    subject: data.subject || "No Subject",
    message: data.message || "",
    sent_at: new Date().toISOString(),
    is_read: false,
    attachments: data.attachments || [],
  };

  mockCommunications.push(newCommunication);
  console.log(`[MOCK COMMUNICATIONS] Sent communication #${newCommunication.id}`);
  return newCommunication;
}

export async function markMockCommunicationAsRead(id: number): Promise<Communication> {
  await simulateDelay(150);

  const communication = mockCommunications.find((c) => c.id === id);
  if (!communication) throw new Error(`Communication #${id} not found`);

  communication.is_read = true;
  console.log(`[MOCK COMMUNICATIONS] Marked #${id} as read`);
  return communication;
}

export async function deleteMockCommunication(id: number): Promise<void> {
  await simulateDelay(200);

  const index = mockCommunications.findIndex((c) => c.id === id);
  if (index === -1) throw new Error(`Communication #${id} not found`);

  mockCommunications.splice(index, 1);
  console.log(`[MOCK COMMUNICATIONS] Deleted communication #${id}`);
}

// ============================================================================
// UTILITIES
// ============================================================================
function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// EXPORTS
// ============================================================================
export const mockCommunicationsProvider = {
  getCommunications: getMockCommunications,
  getById: getMockCommunicationById,
  send: sendMockCommunication,
  markAsRead: markMockCommunicationAsRead,
  delete: deleteMockCommunication,
};
