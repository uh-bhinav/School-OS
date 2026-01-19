// ============================================================================
// ADMISSIONS API - Lead management for Front Office
// ============================================================================
// Currently uses mock data provider
// Future: Will connect to backend /api/v1/admissions/leads endpoints
// ============================================================================

import { mockAdmissionsProvider } from '../mockDataProviders/mockAdmissionLeads';
import type {
  AdmissionLead,
  LeadStats,
  InteractionLog
} from '../mockDataProviders/mockAdmissionLeads';
import { useDemoModeStore } from '../stores/useDemoModeStore';

const isDemoMode = () => useDemoModeStore.getState().isDemoMode;

/**
 * Get all admission leads (with optional filters)
 */
export async function getLeads(filters?: {
  status?: string;
  score?: string
}): Promise<AdmissionLead[]> {
  if (isDemoMode()) {
    return mockAdmissionsProvider.getLeads(filters);
  }
  // TODO: Real API call
  return mockAdmissionsProvider.getLeads(filters);
}

/**
 * Get lead statistics
 */
export async function getLeadStats(): Promise<LeadStats> {
  if (isDemoMode()) {
    return mockAdmissionsProvider.getLeadStats();
  }
  // TODO: Real API call
  return mockAdmissionsProvider.getLeadStats();
}

/**
 * Capture a new admission lead (Flash Form)
 */
export async function captureLead(lead: Partial<AdmissionLead>): Promise<AdmissionLead> {
  if (isDemoMode()) {
    return mockAdmissionsProvider.captureLead(lead);
  }
  // TODO: Real API call
  return mockAdmissionsProvider.captureLead(lead);
}

/**
 * Update lead score (Hot/Warm/Cold)
 */
export async function updateLeadScore(
  leadId: string,
  score: AdmissionLead['score']
): Promise<AdmissionLead> {
  if (isDemoMode()) {
    return mockAdmissionsProvider.updateLeadScore(leadId, score);
  }
  // TODO: Real API call
  return mockAdmissionsProvider.updateLeadScore(leadId, score);
}

/**
 * Add interaction to lead timeline
 */
export async function addInteraction(
  leadId: string,
  interaction: Partial<InteractionLog>
): Promise<AdmissionLead> {
  if (isDemoMode()) {
    return mockAdmissionsProvider.addInteraction(leadId, interaction);
  }
  // TODO: Real API call
  return mockAdmissionsProvider.addInteraction(leadId, interaction);
}
