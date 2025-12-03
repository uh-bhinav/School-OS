// ============================================================================
// MOCK ANNOUNCEMENTS DATA PROVIDER
// ============================================================================

export interface Announcement {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author_name: string;
  target_audience: "ALL" | "STUDENTS" | "TEACHERS" | "PARENTS" | "STAFF";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  attachments?: string[];
}

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================
let announcementIdCounter = 50;
const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "Annual Sports Day",
    content: "Annual sports day will be held on December 15th, 2025. All students are requested to participate actively.",
    author_id: 1,
    author_name: "Principal",
    target_audience: "ALL",
    priority: "HIGH",
    is_published: true,
    published_at: "2025-11-01T10:00:00Z",
    created_at: "2025-11-01T09:00:00Z",
    updated_at: "2025-11-01T10:00:00Z",
  },
  {
    id: 2,
    title: "Parent-Teacher Meeting",
    content: "Parent-teacher meeting scheduled for November 20th, 2025. Please mark your calendars.",
    author_id: 1,
    author_name: "Vice Principal",
    target_audience: "PARENTS",
    priority: "MEDIUM",
    is_published: true,
    published_at: "2025-11-05T14:00:00Z",
    created_at: "2025-11-05T13:00:00Z",
    updated_at: "2025-11-05T14:00:00Z",
  },
  {
    id: 3,
    title: "Mid-term Exam Schedule",
    content: "Mid-term examinations will commence from November 25th. Detailed schedule will be shared soon.",
    author_id: 2,
    author_name: "Academic Coordinator",
    target_audience: "STUDENTS",
    priority: "URGENT",
    is_published: true,
    published_at: "2025-11-10T09:00:00Z",
    created_at: "2025-11-10T08:00:00Z",
    updated_at: "2025-11-10T09:00:00Z",
  },
];

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getMockAnnouncements(filters?: {
  target_audience?: string;
  is_published?: boolean;
}): Promise<Announcement[]> {
  await simulateDelay();

  let filtered = [...mockAnnouncements];
  if (filters?.target_audience) {
    filtered = filtered.filter((a) => a.target_audience === filters.target_audience || a.target_audience === "ALL");
  }
  if (filters?.is_published !== undefined) {
    filtered = filtered.filter((a) => a.is_published === filters.is_published);
  }

  console.log(`[MOCK ANNOUNCEMENTS] getAnnouncements → ${filtered.length} announcements`);
  return filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getMockAnnouncementById(id: number): Promise<Announcement> {
  await simulateDelay();

  const announcement = mockAnnouncements.find((a) => a.id === id);
  if (!announcement) throw new Error(`Announcement #${id} not found`);

  console.log(`[MOCK ANNOUNCEMENTS] getById(${id})`);
  return announcement;
}

export async function createMockAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
  await simulateDelay(250);

  const now = new Date().toISOString();
  const newAnnouncement: Announcement = {
    id: ++announcementIdCounter,
    title: data.title || "Untitled Announcement",
    content: data.content || "",
    author_id: data.author_id || 1,
    author_name: data.author_name || "Admin",
    target_audience: data.target_audience || "ALL",
    priority: data.priority || "MEDIUM",
    is_published: data.is_published || false,
    published_at: data.is_published ? now : null,
    created_at: now,
    updated_at: now,
    attachments: data.attachments || [],
  };

  mockAnnouncements.push(newAnnouncement);
  console.log(`[MOCK ANNOUNCEMENTS] Created announcement #${newAnnouncement.id}`);
  return newAnnouncement;
}

export async function updateMockAnnouncement(id: number, patch: Partial<Announcement>): Promise<Announcement> {
  await simulateDelay(250);

  const announcement = mockAnnouncements.find((a) => a.id === id);
  if (!announcement) throw new Error(`Announcement #${id} not found`);

  Object.assign(announcement, patch);
  announcement.updated_at = new Date().toISOString();

  if (patch.is_published && !announcement.published_at) {
    announcement.published_at = new Date().toISOString();
  }

  console.log(`[MOCK ANNOUNCEMENTS] Updated announcement #${id}`);
  return announcement;
}

export async function deleteMockAnnouncement(id: number): Promise<void> {
  await simulateDelay(200);

  const index = mockAnnouncements.findIndex((a) => a.id === id);
  if (index === -1) throw new Error(`Announcement #${id} not found`);

  mockAnnouncements.splice(index, 1);
  console.log(`[MOCK ANNOUNCEMENTS] Deleted announcement #${id}`);
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
export const mockAnnouncementsProvider = {
  getAnnouncements: getMockAnnouncements,
  getById: getMockAnnouncementById,
  create: createMockAnnouncement,
  update: updateMockAnnouncement,
  delete: deleteMockAnnouncement,
};
