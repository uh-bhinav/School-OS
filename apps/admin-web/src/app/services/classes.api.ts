/**
 * Classes API Service
 * Provides class management functions with demo mode support
 */

import type {
  Class,
  ClassDetail,
  ClassKpi,
  ClassStudent,
  ClassTimetableSlot,
  ClassSubjectMapping,
  ClassRankListEntry,
  ClassLeaderboardEntry,
} from "./classes.schema";
import {
  getAllClasses as mockGetAllClasses,
  getClassDetailById as mockGetClassDetailById,
  assignClassTeacher as mockAssignClassTeacher,
  getClassKpi as mockGetClassKpi,
} from "../mockDataProviders/mockClasses";
import { getClassStudents as mockGetClassStudents } from "../mockDataProviders/mockClassStudents";
import { getClassTimetable as mockGetClassTimetable } from "../mockDataProviders/mockClassTimetable";
import {
  getClassSubjectMappings as mockGetClassSubjectMappings,
  updateSubjectMapping as mockUpdateSubjectMapping,
} from "../mockDataProviders/mockClassMapping";
import { getClassRankList as mockGetClassRankList } from "../mockDataProviders/mockClassRanklist";
import { getClassLeaderboard as mockGetClassLeaderboard } from "../mockDataProviders/mockClassLeaderboard";

/**
 * Check if demo mode is enabled
 */
function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === "true";
}

/**
 * Get all classes
 */
export async function getClasses(schoolId: number = 1): Promise<Class[]> {
  if (isDemoMode()) {
    return mockGetAllClasses(schoolId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get class by ID with full details
 */
export async function getClassById(classId: number): Promise<ClassDetail | null> {
  if (isDemoMode()) {
    return mockGetClassDetailById(classId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get class KPIs
 */
export async function getClassKPI(schoolId: number = 1): Promise<ClassKpi> {
  if (isDemoMode()) {
    return mockGetClassKpi(schoolId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Assign class teacher
 */
export async function assignTeacherToClass(
  classId: number,
  teacherId: number
): Promise<{ success: boolean; message: string }> {
  if (isDemoMode()) {
    return mockAssignClassTeacher(classId, teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get students in a class
 */
export async function getClassStudents(classId: number): Promise<ClassStudent[]> {
  if (isDemoMode()) {
    return mockGetClassStudents(classId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get class timetable
 */
export async function getClassTimetable(classId: number): Promise<ClassTimetableSlot[]> {
  if (isDemoMode()) {
    return mockGetClassTimetable(classId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get class subject-teacher mappings
 */
export async function getClassSubjectMappings(
  classId: number
): Promise<ClassSubjectMapping[]> {
  if (isDemoMode()) {
    return mockGetClassSubjectMappings(classId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Update subject-teacher mapping
 */
export async function updateClassSubjectMapping(
  mappingId: number,
  teacherId: number
): Promise<{ success: boolean; message: string }> {
  if (isDemoMode()) {
    return mockUpdateSubjectMapping(mappingId, teacherId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get class rank list
 */
export async function getClassRankList(classId: number): Promise<ClassRankListEntry[]> {
  if (isDemoMode()) {
    return mockGetClassRankList(classId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}

/**
 * Get class holistic leaderboard
 */
export async function getClassLeaderboard(classId: number): Promise<ClassLeaderboardEntry[]> {
  if (isDemoMode()) {
    return mockGetClassLeaderboard(classId);
  }
  // TODO: Add real API call when backend is ready
  throw new Error("Real API not implemented yet");
}
