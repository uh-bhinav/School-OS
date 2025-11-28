// ============================================================================
// FILE: src/app/mockDataProviders/mockEvents.ts
// PURPOSE: Mock data provider for Event Management
// ============================================================================

import type { Event, EventKpi, EventCreate, EventUpdate } from "../services/events.schema";
import { EventStatus, EventTheme } from "../services/events.schema";

// ============================================================================
// MOCK DATA STORAGE
// ============================================================================

let mockEvents: Event[] = [];
let initialized = false;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function simulateDelay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Teacher name mapping
const teacherNames: Record<number, string> = {
  1: "Mrs. Priya Sharma",
  2: "Ms. Anjali Patel",
  3: "Mr. Rajesh Singh",
  4: "Mrs. Kavita Verma",
  5: "Mr. Amit Gupta",
  6: "Ms. Sneha Reddy",
  7: "Mrs. Fatima Khan",
  8: "Mr. Vikram Desai",
  9: "Mrs. Meera Joshi",
  10: "Mr. Suresh Nair",
  11: "Ms. Lakshmi Iyer",
  12: "Mr. Ravi Menon",
  13: "Mrs. Sunita Rao",
  14: "Mr. Manoj Pandey",
  15: "Ms. Pooja Kapoor",
};

// Class name mapping
const classNames: Record<number, string> = {
  1: "Class 1-A",
  2: "Class 1-B",
  3: "Class 2-A",
  4: "Class 2-B",
  5: "Class 3-A",
  6: "Class 3-B",
  7: "Class 4-A",
  8: "Class 4-B",
  9: "Class 5-A",
  10: "Class 5-B",
  11: "Class 6-A",
  12: "Class 6-B",
  13: "Class 7-A",
  14: "Class 7-B",
  15: "Class 8-A",
  16: "Class 8-B",
  17: "Class 9-A",
  18: "Class 9-B",
  19: "Class 10-A",
  20: "Class 10-B",
};

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializeMockEvents(): void {
  if (initialized) return;

  const now = new Date();
  const currentYear = now.getFullYear();

  // Sample events data
  const eventData = [
    {
      title: "Annual Day Celebration 2025",
      theme: EventTheme.Cultural,
      description: "The grand annual day celebration featuring cultural performances, awards ceremony, and special guest appearances. Students from all grades will participate in various cultural activities including dance, drama, and music performances.",
      date: `${currentYear}-12-15`,
      teacherInChargeId: 1,
      hostClasses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      estimatedBudget: 150000,
      budgetNote: "Includes stage setup, costumes, refreshments, and guest honorarium",
      venue: "School Auditorium",
      startTime: "10:00",
      endTime: "16:00",
      status: EventStatus.Upcoming,
    },
    {
      title: "Inter-House Sports Meet",
      theme: EventTheme.Sports,
      description: "Annual inter-house sports competition featuring track and field events, team sports, and individual championships. Houses compete for the coveted Sports Trophy.",
      date: `${currentYear}-11-20`,
      teacherInChargeId: 10,
      hostClasses: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      estimatedBudget: 75000,
      budgetNote: "Sports equipment, medals, refreshments, and first aid",
      venue: "School Sports Ground",
      startTime: "08:00",
      endTime: "17:00",
      status: EventStatus.Upcoming,
    },
    {
      title: "Science Exhibition",
      theme: EventTheme.Academic,
      description: "Showcasing innovative science projects by students across all grades. Includes working models, experiments, and research presentations.",
      date: `${currentYear}-10-25`,
      teacherInChargeId: 4,
      hostClasses: [15, 16, 17, 18, 19, 20],
      estimatedBudget: 50000,
      budgetNote: "Project materials, display boards, and certificates",
      venue: "School Exhibition Hall",
      startTime: "09:00",
      endTime: "15:00",
      status: EventStatus.Completed,
    },
    {
      title: "Diwali Celebration",
      theme: EventTheme.Festival,
      description: "Celebrating the festival of lights with rangoli competition, lamp decoration, cultural performances, and sweet distribution.",
      date: `${currentYear}-10-20`,
      teacherInChargeId: 9,
      hostClasses: [1, 2, 3, 4, 5, 6],
      estimatedBudget: 30000,
      budgetNote: "Decorations, sweets, prizes, and supplies",
      venue: "School Courtyard",
      startTime: "10:00",
      endTime: "13:00",
      status: EventStatus.Completed,
    },
    {
      title: "Independence Day Flag Hoisting",
      theme: EventTheme.Celebration,
      description: "Commemorating India's Independence Day with flag hoisting ceremony, patriotic songs, and speeches by students and teachers.",
      date: `${currentYear}-08-15`,
      teacherInChargeId: 5,
      hostClasses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      estimatedBudget: 15000,
      budgetNote: "Flag, decorations, sweets, and refreshments",
      venue: "School Main Ground",
      startTime: "08:00",
      endTime: "11:00",
      status: EventStatus.Completed,
    },
    {
      title: "Teacher's Day Program",
      theme: EventTheme.Celebration,
      description: "Students organizing special programs to honor and appreciate their teachers on Teacher's Day.",
      date: `${currentYear}-09-05`,
      teacherInChargeId: 13,
      hostClasses: [17, 18, 19, 20],
      estimatedBudget: 20000,
      budgetNote: "Gifts, decorations, and refreshments",
      venue: "School Auditorium",
      startTime: "10:00",
      endTime: "13:00",
      status: EventStatus.Completed,
    },
    {
      title: "Christmas Carnival",
      theme: EventTheme.Festival,
      description: "Fun-filled Christmas carnival with games, stalls, Santa's visit, carol singing, and gift distribution.",
      date: `${currentYear}-12-23`,
      teacherInChargeId: 7,
      hostClasses: [1, 2, 3, 4, 5, 6, 7, 8],
      estimatedBudget: 45000,
      budgetNote: "Games, prizes, decorations, Santa costume, and refreshments",
      venue: "School Courtyard",
      startTime: "09:00",
      endTime: "14:00",
      status: EventStatus.Upcoming,
    },
    {
      title: "Debate Competition",
      theme: EventTheme.Academic,
      description: "Inter-class debate competition on current affairs and relevant topics. Develops public speaking and critical thinking skills.",
      date: `${currentYear}-11-10`,
      teacherInChargeId: 1,
      hostClasses: [15, 16, 17, 18, 19, 20],
      estimatedBudget: 10000,
      budgetNote: "Trophies, certificates, and refreshments",
      venue: "School Library Hall",
      startTime: "11:00",
      endTime: "15:00",
      status: EventStatus.Upcoming,
    },
  ];

  // Generate mock events
  eventData.forEach((data, index) => {
    const eventId = `evt-${1000 + index}`;
    const event: Event = {
      eventId,
      title: data.title,
      theme: data.theme,
      description: data.description,
      date: data.date,
      teacherInChargeId: data.teacherInChargeId,
      teacherInChargeName: teacherNames[data.teacherInChargeId],
      hostClasses: data.hostClasses,
      hostClassNames: data.hostClasses.map((id) => classNames[id] || `Class ${id}`),
      estimatedBudget: data.estimatedBudget,
      budgetNote: data.budgetNote,
      venue: data.venue,
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status,
      images: data.status === EventStatus.Completed ? [`img-${eventId}-1`, `img-${eventId}-2`, `img-${eventId}-3`] : [],
      schoolId: 1,
      academicYearId: 1,
      createdAt: new Date(Date.now() - index * 86400000 * 10).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockEvents.push(event);
  });

  initialized = true;
  console.log(`[MOCK EVENTS] Initialized ${mockEvents.length} events`);
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function getEvents(params?: {
  status?: EventStatus;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Event[]; total: number }> {
  initializeMockEvents();
  await simulateDelay();

  let filtered = [...mockEvents];

  if (params?.status) {
    filtered = filtered.filter((e) => e.status === params.status);
  }

  // Sort by date descending (newest first for upcoming, oldest first for completed)
  filtered.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 50;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  console.log(`[MOCK EVENTS] getEvents → ${items.length} events`);
  return { items, total: filtered.length };
}

export async function getEventById(eventId: string): Promise<Event | null> {
  initializeMockEvents();
  await simulateDelay(200);

  const event = mockEvents.find((e) => e.eventId === eventId);
  console.log(`[MOCK EVENTS] getEventById(${eventId}) →`, event ? "found" : "not found");
  return event || null;
}

export async function createEvent(data: EventCreate): Promise<Event> {
  initializeMockEvents();
  await simulateDelay(400);

  const eventId = generateId();
  const now = new Date().toISOString();

  const newEvent: Event = {
    eventId,
    title: data.title,
    theme: data.theme,
    description: data.description,
    date: data.date,
    endDate: data.endDate,
    teacherInChargeId: data.teacherInChargeId,
    teacherInChargeName: teacherNames[data.teacherInChargeId] || `Teacher ${data.teacherInChargeId}`,
    hostClasses: data.hostClasses,
    hostClassNames: data.hostClasses.map((id) => classNames[id] || `Class ${id}`),
    estimatedBudget: data.estimatedBudget,
    budgetNote: data.budgetNote,
    venue: data.venue,
    startTime: data.startTime,
    endTime: data.endTime,
    status: EventStatus.Upcoming,
    images: [],
    schoolId: 1,
    academicYearId: 1,
    createdAt: now,
    updatedAt: now,
  };

  mockEvents.unshift(newEvent);
  console.log(`[MOCK EVENTS] createEvent → Created event ${eventId}`);
  return newEvent;
}

export async function updateEvent(eventId: string, data: EventUpdate): Promise<Event | null> {
  initializeMockEvents();
  await simulateDelay(350);

  const index = mockEvents.findIndex((e) => e.eventId === eventId);
  if (index === -1) {
    console.log(`[MOCK EVENTS] updateEvent → Event ${eventId} not found`);
    return null;
  }

  const existing = mockEvents[index];
  const updated: Event = {
    ...existing,
    ...data,
    teacherInChargeName: data.teacherInChargeId
      ? teacherNames[data.teacherInChargeId] || `Teacher ${data.teacherInChargeId}`
      : existing.teacherInChargeName,
    hostClassNames: data.hostClasses
      ? data.hostClasses.map((id) => classNames[id] || `Class ${id}`)
      : existing.hostClassNames,
    updatedAt: new Date().toISOString(),
  };

  mockEvents[index] = updated;
  console.log(`[MOCK EVENTS] updateEvent → Updated event ${eventId}`);
  return updated;
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  initializeMockEvents();
  await simulateDelay(300);

  const index = mockEvents.findIndex((e) => e.eventId === eventId);
  if (index === -1) {
    console.log(`[MOCK EVENTS] deleteEvent → Event ${eventId} not found`);
    return false;
  }

  mockEvents.splice(index, 1);
  console.log(`[MOCK EVENTS] deleteEvent → Deleted event ${eventId}`);
  return true;
}

export async function getEventKpi(): Promise<EventKpi> {
  initializeMockEvents();
  await simulateDelay(200);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const upcomingEvents = mockEvents.filter((e) => e.status === EventStatus.Upcoming).length;
  const completedEvents = mockEvents.filter((e) => e.status === EventStatus.Completed).length;
  const eventsThisMonth = mockEvents.filter((e) => {
    const eventDate = new Date(e.date);
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
  }).length;
  const totalPhotos = mockEvents.reduce((sum, e) => sum + e.images.length, 0);

  return {
    totalEvents: mockEvents.length,
    upcomingEvents,
    completedEvents,
    totalPhotos,
    eventsThisMonth,
  };
}

export async function addImagesToEvent(eventId: string, imageIds: string[]): Promise<Event | null> {
  initializeMockEvents();
  await simulateDelay(250);

  const index = mockEvents.findIndex((e) => e.eventId === eventId);
  if (index === -1) return null;

  mockEvents[index].images = [...mockEvents[index].images, ...imageIds];
  mockEvents[index].updatedAt = new Date().toISOString();

  console.log(`[MOCK EVENTS] addImagesToEvent → Added ${imageIds.length} images to event ${eventId}`);
  return mockEvents[index];
}

// ============================================================================
// EXPORT PROVIDER
// ============================================================================

export const mockEventsProvider = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventKpi,
  addImagesToEvent,
  getAllEvents: () => {
    initializeMockEvents();
    return mockEvents;
  },
};
