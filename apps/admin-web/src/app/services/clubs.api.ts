/**
 * Clubs API Service
 * Provides clubs and activities management with demo mode support
 */

import type { Club, ClubActivity, ClubMembership, ClubKpi } from './club.schema';
import { mockClubProvider } from '../mockDataProviders/mockClubs';

/**
 * Check if demo mode is enabled
 */
function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true';
}

/**
 * Get all clubs
 */
export async function getClubs(academicYearId: number, isActive?: boolean): Promise<Club[]> {
  if (isDemoMode()) {
    return await mockClubProvider.getClubs(academicYearId, isActive);
  }
  throw new Error('Real API not implemented yet');
}

/**
 * Get club by ID
 */
export async function getClubById(clubId: number): Promise<Club | null> {
  if (isDemoMode()) {
    return await mockClubProvider.getClubById(clubId);
  }
  throw new Error('Real API not implemented yet');
}

/**
 * Get club activities
 */
export async function getClubActivities(clubId?: number): Promise<ClubActivity[]> {
  if (isDemoMode()) {
    return await mockClubProvider.getClubActivities(clubId);
  }
  throw new Error('Real API not implemented yet');
}

/**
 * Get club memberships
 */
export async function getClubMemberships(clubId: number): Promise<ClubMembership[]> {
  if (isDemoMode()) {
    return await mockClubProvider.getClubMemberships(clubId);
  }
  throw new Error('Real API not implemented yet');
}

/**
 * Get club KPI
 */
export async function getClubKPI(): Promise<ClubKpi> {
  if (isDemoMode()) {
    return await mockClubProvider.getClubKpi();
  }
  throw new Error('Real API not implemented yet');
}
