// ============================================================================
// SUPER ADMIN COMMUNICATION MOCK DATA - Group Level
// ============================================================================
// Mock data for Super Admin communication pages:
// - Parent Engagement Monitor (engagement tracking)
// - Communication Effectiveness Summary (channel performance)
// All data is frontend-only, no backend calls
// ============================================================================

import { mockSchools, mockRegions } from './mockSuperAdmin';

// ============================================================================
// TYPES - Parent Engagement
// ============================================================================

export interface ParentEngagementRecord {
  schoolId: number;
  schoolName: string;
  region: string;
  parentReachPercent: number;     // % of parents receiving communications
  engagementPercent: number;      // % who open/read/respond
  trend: 'improving' | 'stable' | 'declining';
  status: 'healthy' | 'watch' | 'risk';
  lastUpdated: string;
}

export interface EngagementSavedView {
  id: string;
  name: string;
  filters: {
    region?: string;
    timeframe?: string;
    status?: string;
  };
}

// ============================================================================
// TYPES - Communication Effectiveness
// ============================================================================

export interface ChannelMetrics {
  circularDeliveryRate: number;
  smsOpenRate: number;
  emailOpenRate: number;
  responseRate: number;
}

export interface SchoolEffectivenessRecord {
  schoolId: number;
  schoolName: string;
  region: string;
  circularDeliveryPercent: number;
  smsOpenPercent: number;
  emailOpenPercent: number;
  responseRatePercent: number;
  overallEffectivenessScore: number;
}

export interface BestPracticeInsight {
  id: string;
  insight: string;
  category: 'timing' | 'content' | 'channel';
}

// ============================================================================
// CONSTANTS
// ============================================================================

export type TimeframeOption = '30days' | 'term' | 'custom';

export const TIMEFRAME_OPTIONS = [
  { value: '30days' as const, label: 'Last 30 days' },
  { value: 'term' as const, label: 'Current Term' },
  { value: 'custom' as const, label: 'Custom Range' },
];

export const ENGAGEMENT_THRESHOLD = 70; // Schools below this are at-risk

// ============================================================================
// HELPER: Deterministic metric generation based on school ID
// ============================================================================

function generateEngagementMetrics(school: typeof mockSchools[0]): {
  parentReach: number;
  engagement: number;
  trend: 'improving' | 'stable' | 'declining';
  status: 'healthy' | 'watch' | 'risk';
} {
  // Base metrics on school health indicators
  const baseMetric = (school.healthScore + school.operationalScore) / 2;
  const seed = school.id * 17;

  // Parent reach: 75-98% (higher for healthier schools)
  const parentReach = Math.min(98, Math.max(75, baseMetric - 2 + (seed % 10)));

  // Engagement: Correlated with parent reach but with variance
  const engagementBase = parentReach * 0.85;
  const engagementVariance = ((seed * 3) % 15) - 7;
  const engagement = Math.min(95, Math.max(45, engagementBase + engagementVariance));

  // Trend based on school status
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (school.status === 'critical') {
    trend = 'declining';
  } else if (school.status === 'healthy' && engagement > 75) {
    trend = seed % 3 === 0 ? 'improving' : 'stable';
  } else if (engagement < 65) {
    trend = 'declining';
  }

  // Status based on engagement threshold
  let status: 'healthy' | 'watch' | 'risk' = 'healthy';
  if (engagement < 60) {
    status = 'risk';
  } else if (engagement < ENGAGEMENT_THRESHOLD) {
    status = 'watch';
  }

  return {
    parentReach: Math.round(parentReach * 10) / 10,
    engagement: Math.round(engagement * 10) / 10,
    trend,
    status,
  };
}

function generateEffectivenessMetrics(school: typeof mockSchools[0]): {
  circular: number;
  sms: number;
  email: number;
  response: number;
  overall: number;
} {
  const baseMetric = school.operationalScore;
  const seed = school.id * 23;

  // Circular delivery: 85-99%
  const circular = Math.min(99, Math.max(85, baseMetric + (seed % 8)));

  // SMS open rate: 70-95%
  const sms = Math.min(95, Math.max(70, baseMetric - 5 + ((seed * 2) % 12)));

  // Email open rate: 40-75%
  const email = Math.min(75, Math.max(40, baseMetric - 25 + ((seed * 3) % 15)));

  // Response rate: 20-50%
  const response = Math.min(50, Math.max(20, baseMetric - 50 + ((seed * 5) % 12)));

  // Overall score: weighted average
  const overall = (circular * 0.2 + sms * 0.3 + email * 0.3 + response * 0.2);

  return {
    circular: Math.round(circular * 10) / 10,
    sms: Math.round(sms * 10) / 10,
    email: Math.round(email * 10) / 10,
    response: Math.round(response * 10) / 10,
    overall: Math.round(overall * 10) / 10,
  };
}

// ============================================================================
// MOCK PARENT ENGAGEMENT DATA
// ============================================================================

export const mockParentEngagementRecords: ParentEngagementRecord[] = mockSchools.map((school) => {
  const metrics = generateEngagementMetrics(school);

  return {
    schoolId: school.id,
    schoolName: school.name,
    region: school.region,
    parentReachPercent: metrics.parentReach,
    engagementPercent: metrics.engagement,
    trend: metrics.trend,
    status: metrics.status,
    lastUpdated: '2026-01-02',
  };
});

// ============================================================================
// MOCK COMMUNICATION EFFECTIVENESS DATA
// ============================================================================

export const mockSchoolEffectivenessRecords: SchoolEffectivenessRecord[] = mockSchools.map((school) => {
  const metrics = generateEffectivenessMetrics(school);

  return {
    schoolId: school.id,
    schoolName: school.name,
    region: school.region,
    circularDeliveryPercent: metrics.circular,
    smsOpenPercent: metrics.sms,
    emailOpenPercent: metrics.email,
    responseRatePercent: metrics.response,
    overallEffectivenessScore: metrics.overall,
  };
});

// ============================================================================
// SAVED VIEWS - Parent Engagement
// ============================================================================

export const mockEngagementSavedViews: EngagementSavedView[] = [
  { id: 'view-all', name: 'All Schools', filters: {} },
  { id: 'view-below-70', name: 'Below 70% Engagement', filters: { status: 'risk' } },
  { id: 'view-declining', name: 'Declining Trend', filters: {} },
  { id: 'view-east-region', name: 'East Region', filters: { region: 'East' } },
];

// ============================================================================
// DATA ACCESSOR FUNCTIONS
// ============================================================================

/**
 * Get engagement chart data for visualization
 */
export function getEngagementChartData(regionFilter?: string): Array<{
  schoolId: number;
  schoolName: string;
  engagement: number;
  status: string;
}> {
  let records = mockParentEngagementRecords;

  if (regionFilter && regionFilter !== 'All') {
    records = records.filter(r => r.region === regionFilter);
  }

  return records
    .map(r => ({
      schoolId: r.schoolId,
      schoolName: r.schoolName,
      engagement: r.engagementPercent,
      status: r.status,
    }))
    .sort((a, b) => a.engagement - b.engagement);
}

/**
 * Get engagement summary statistics
 */
export function getEngagementSummary(regionFilter?: string): {
  averageEngagement: number;
  schoolsBelowThreshold: number;
  totalSchools: number;
} {
  let records = mockParentEngagementRecords;

  if (regionFilter && regionFilter !== 'All') {
    records = records.filter(r => r.region === regionFilter);
  }

  const totalSchools = records.length;
  const averageEngagement = records.reduce((sum, r) => sum + r.engagementPercent, 0) / totalSchools;
  const schoolsBelowThreshold = records.filter(r => r.engagementPercent < ENGAGEMENT_THRESHOLD).length;

  return {
    averageEngagement: Math.round(averageEngagement * 10) / 10,
    schoolsBelowThreshold,
    totalSchools,
  };
}

/**
 * Get at-risk schools (below engagement threshold)
 */
export function getAtRiskSchools(regionFilter?: string): ParentEngagementRecord[] {
  let records = mockParentEngagementRecords;

  if (regionFilter && regionFilter !== 'All') {
    records = records.filter(r => r.region === regionFilter);
  }

  return records
    .filter(r => r.engagementPercent < ENGAGEMENT_THRESHOLD)
    .sort((a, b) => a.engagementPercent - b.engagementPercent);
}

/**
 * Filter parent engagement records
 */
export function filterEngagementRecords(
  records: ParentEngagementRecord[],
  filters: {
    region?: string;
    status?: string;
    schoolId?: number;
  }
): ParentEngagementRecord[] {
  let filtered = [...records];

  if (filters.region) {
    filtered = filtered.filter(r => r.region === filters.region);
  }

  if (filters.status) {
    filtered = filtered.filter(r => r.status === filters.status);
  }

  if (filters.schoolId) {
    filtered = filtered.filter(r => r.schoolId === filters.schoolId);
  }

  return filtered;
}

/**
 * Get channel performance overview
 */
export function getChannelPerformanceOverview(): ChannelMetrics {
  const records = mockSchoolEffectivenessRecords;
  const count = records.length;

  return {
    circularDeliveryRate: Math.round(records.reduce((sum, r) => sum + r.circularDeliveryPercent, 0) / count * 10) / 10,
    smsOpenRate: Math.round(records.reduce((sum, r) => sum + r.smsOpenPercent, 0) / count * 10) / 10,
    emailOpenRate: Math.round(records.reduce((sum, r) => sum + r.emailOpenPercent, 0) / count * 10) / 10,
    responseRate: Math.round(records.reduce((sum, r) => sum + r.responseRatePercent, 0) / count * 10) / 10,
  };
}

/**
 * Filter effectiveness records
 */
export function filterEffectivenessRecords(
  records: SchoolEffectivenessRecord[],
  regionFilter?: string
): SchoolEffectivenessRecord[] {
  if (!regionFilter || regionFilter === 'All') {
    return records;
  }
  return records.filter(r => r.region === regionFilter);
}

// ============================================================================
// BEST PRACTICES INSIGHTS
// ============================================================================

export const mockBestPracticeInsights: BestPracticeInsight[] = [
  {
    id: 'bp-1',
    insight: 'Schools sending reminders between 6-8 PM see 18% higher response rates.',
    category: 'timing',
  },
  {
    id: 'bp-2',
    insight: 'Circulars under 200 words have 25% better completion rates.',
    category: 'content',
  },
  {
    id: 'bp-3',
    insight: 'SMS notifications for urgent updates show 40% faster parent acknowledgment.',
    category: 'channel',
  },
  {
    id: 'bp-4',
    insight: 'Schools using bilingual communications report 15% higher engagement.',
    category: 'content',
  },
  {
    id: 'bp-5',
    insight: 'Weekly summary digests reduce communication fatigue while maintaining awareness.',
    category: 'timing',
  },
];

// ============================================================================
// EXPORT ALL
// ============================================================================

export {
  mockRegions,
};
