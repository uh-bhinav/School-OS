// ============================================================================
// FILE: src/app/services/events.schema.ts
// PURPOSE: Type definitions for Event Management module
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export enum EventTheme {
  Cultural = "Cultural",
  Sports = "Sports",
  Celebration = "Celebration",
  Academic = "Academic",
  Festival = "Festival",
  Custom = "Custom",
}

export enum EventStatus {
  Upcoming = "upcoming",
  Ongoing = "ongoing",
  Completed = "completed",
  Cancelled = "cancelled",
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface Event {
  eventId: string;
  title: string;
  theme: EventTheme | string;
  description: string;
  date: string;
  endDate?: string;
  teacherInChargeId: number;
  teacherInChargeName?: string;
  hostClasses: number[];
  hostClassNames?: string[];
  estimatedBudget?: number;
  budgetNote?: string;
  images: string[]; // Array of image IDs
  status: EventStatus;
  venue?: string;
  startTime?: string;
  endTime?: string;
  schoolId: number;
  academicYearId: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventCreate {
  title: string;
  theme: EventTheme | string;
  description: string;
  date: string;
  endDate?: string;
  teacherInChargeId: number;
  hostClasses: number[];
  estimatedBudget?: number;
  budgetNote?: string;
  venue?: string;
  startTime?: string;
  endTime?: string;
}

export interface EventUpdate {
  title?: string;
  theme?: EventTheme | string;
  description?: string;
  date?: string;
  endDate?: string;
  teacherInChargeId?: number;
  hostClasses?: number[];
  estimatedBudget?: number;
  budgetNote?: string;
  venue?: string;
  startTime?: string;
  endTime?: string;
  status?: EventStatus;
}

export interface EventImage {
  imageId: string;
  eventId: string;
  albumId: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  uploadedAt: string;
  uploadedBy?: string;
  fileSize?: number;
  fileName?: string;
}

export interface EventKpi {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalPhotos: number;
  eventsThisMonth: number;
}

export interface EventListResponse {
  items: Event[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

// ============================================================================
// PREDEFINED THEMES
// ============================================================================

export const PREDEFINED_THEMES = [
  { value: EventTheme.Cultural, label: "Cultural", color: "#9c27b0" },
  { value: EventTheme.Sports, label: "Sports", color: "#f44336" },
  { value: EventTheme.Celebration, label: "Celebration", color: "#ff9800" },
  { value: EventTheme.Academic, label: "Academic", color: "#2196f3" },
  { value: EventTheme.Festival, label: "Festival", color: "#4caf50" },
  { value: EventTheme.Custom, label: "Custom", color: "#607d8b" },
];

export function getThemeColor(theme: string): string {
  const found = PREDEFINED_THEMES.find((t) => t.value === theme || t.label === theme);
  return found?.color || "#607d8b";
}

export function getThemeLabel(theme: string): string {
  const found = PREDEFINED_THEMES.find((t) => t.value === theme);
  return found?.label || theme;
}
