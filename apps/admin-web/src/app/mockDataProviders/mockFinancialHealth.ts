// ============================================================================
// SUPER ADMIN FINANCIAL HEALTH MOCK DATA - Group Level
// ============================================================================
// Mock data for Super Admin Financial Health pages:
// - Fee Collection (cash flow tracking)
// - Dues & Aging (receivables risk)
// - Capacity Forecast (future revenue protection)
// All data is frontend-only, no backend calls
// ============================================================================

import { mockSchools, mockRegions } from './mockSuperAdmin';

// ============================================================================
// TYPES - Fee Collection
// ============================================================================

export interface FeeCollectionTrend {
  month: string;
  expected: number;
  collected: number;
}

export interface SchoolFeeCollection {
  schoolId: number;
  schoolName: string;
  region: string;
  expectedFees: number;
  collectedFees: number;
  collectionPercent: number;
  status: 'healthy' | 'watch' | 'risk';
}

// ============================================================================
// TYPES - Dues & Aging
// ============================================================================

export interface AgingBucket {
  range: string;
  minDays: number;
  maxDays: number;
  amount: number;
  percent: number;
  schoolCount: number;
}

export interface SchoolDuesRecord {
  schoolId: number;
  schoolName: string;
  region: string;
  totalPending: number;
  oldestDueDays: number;
  percent90Plus: number;
  riskStatus: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// TYPES - Capacity Forecast
// ============================================================================

export interface GroupCapacity {
  totalSeats: number;
  filledSeats: number;
  utilizationPercent: number;
}

export interface CapacityForecast {
  expectedAdmissions: number;
  projectedEmptySeats: number;
  alertSchoolCount: number;
  alertThreshold: number;
}

export interface SchoolCapacityRisk {
  schoolId: number;
  schoolName: string;
  region: string;
  totalCapacity: number;
  currentEnrollment: number;
  projectedEnrollment: number;
  emptySeatsPercent: number;
  riskLevel: 'low' | 'medium' | 'high';
}

// ============================================================================
// TYPES - Saved Views & Filters
// ============================================================================

export interface FinancialSavedView {
  id: string;
  name: string;
  filters: {
    region?: string;
    timeframe?: string;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const TIMEFRAME_OPTIONS = [
  { value: '6months', label: 'Last 6 months' },
  { value: '12months', label: 'Last 12 months' },
  { value: 'custom', label: 'Custom' },
] as const;

export type TimeframeOption = typeof TIMEFRAME_OPTIONS[number]['value'];

// ============================================================================
// HELPER: Generate deterministic values based on school ID
// ============================================================================

function deterministicRandom(seed: number, min: number, max: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  const normalized = x - Math.floor(x);
  return Math.floor(min + normalized * (max - min));
}

// ============================================================================
// MOCK FEE COLLECTION DATA
// ============================================================================

const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getFeeCollectionTrend(region?: string): FeeCollectionTrend[] {
  // Base expected values per month (in lakhs)
  const baseExpected = [85, 92, 88, 95, 90, 98];
  const baseCollected = [78, 85, 84, 88, 82, 91];

  // Adjust by region if specified
  const regionMultiplier = region && region !== 'All'
    ? mockRegions.findIndex(r => r.name === region) * 0.1 + 0.8
    : 1;

  return months.map((month, index) => ({
    month,
    expected: Math.round(baseExpected[index] * regionMultiplier * 100000),
    collected: Math.round(baseCollected[index] * regionMultiplier * 100000),
  }));
}

export function getSchoolFeeCollections(region?: string): SchoolFeeCollection[] {
  const schools = region && region !== 'All'
    ? mockSchools.filter(s => s.region === region)
    : mockSchools;

  return schools.map(school => {
    // Use school's existing fee collection rate with some variation
    const baseRate = school.feeCollectionRate;
    const expectedFees = deterministicRandom(school.id * 7, 50, 150) * 100000;
    const collectedFees = Math.round(expectedFees * (baseRate / 100));
    const collectionPercent = Math.round((collectedFees / expectedFees) * 100);

    let status: 'healthy' | 'watch' | 'risk';
    if (collectionPercent >= 90) {
      status = 'healthy';
    } else if (collectionPercent >= 75) {
      status = 'watch';
    } else {
      status = 'risk';
    }

    return {
      schoolId: school.id,
      schoolName: school.name,
      region: school.region,
      expectedFees,
      collectedFees,
      collectionPercent,
      status,
    };
  });
}

export function getFeeCollectionSummary(collections: SchoolFeeCollection[]): {
  totalExpected: number;
  totalCollected: number;
  overallPercent: number;
  healthyCount: number;
  watchCount: number;
  riskCount: number;
} {
  const totalExpected = collections.reduce((sum, s) => sum + s.expectedFees, 0);
  const totalCollected = collections.reduce((sum, s) => sum + s.collectedFees, 0);

  return {
    totalExpected,
    totalCollected,
    overallPercent: Math.round((totalCollected / totalExpected) * 100),
    healthyCount: collections.filter(s => s.status === 'healthy').length,
    watchCount: collections.filter(s => s.status === 'watch').length,
    riskCount: collections.filter(s => s.status === 'risk').length,
  };
}

// ============================================================================
// MOCK DUES & AGING DATA
// ============================================================================

export function getTotalPendingDues(region?: string): number {
  const schools = region && region !== 'All'
    ? mockSchools.filter(s => s.region === region)
    : mockSchools;

  return schools.reduce((sum, school) => {
    // Calculate pending dues based on fee collection rate
    const expectedFees = deterministicRandom(school.id * 7, 50, 150) * 100000;
    const collectedFees = Math.round(expectedFees * (school.feeCollectionRate / 100));
    return sum + (expectedFees - collectedFees);
  }, 0);
}

export function getAgingBuckets(region?: string): AgingBucket[] {
  const totalDues = getTotalPendingDues(region);

  // Distribution percentages for aging buckets
  const distributions = [
    { range: '0-30 days', minDays: 0, maxDays: 30, percent: 35, schoolCount: 12 },
    { range: '31-60 days', minDays: 31, maxDays: 60, percent: 28, schoolCount: 8 },
    { range: '61-90 days', minDays: 61, maxDays: 90, percent: 22, schoolCount: 6 },
    { range: '90+ days', minDays: 91, maxDays: 999, percent: 15, schoolCount: 4 },
  ];

  return distributions.map(d => ({
    ...d,
    amount: Math.round(totalDues * (d.percent / 100)),
  }));
}

export function getSchoolDuesRecords(region?: string, bucket?: string): SchoolDuesRecord[] {
  const schools = region && region !== 'All'
    ? mockSchools.filter(s => s.region === region)
    : mockSchools;

  const records = schools.map(school => {
    const expectedFees = deterministicRandom(school.id * 7, 50, 150) * 100000;
    const collectedFees = Math.round(expectedFees * (school.feeCollectionRate / 100));
    const totalPending = expectedFees - collectedFees;

    // Generate oldest due days deterministically
    const oldestDueDays = deterministicRandom(school.id * 13, 5, 120);

    // Generate percent in 90+ bucket
    const percent90Plus = deterministicRandom(school.id * 17, 0, 40);

    // Determine risk status
    let riskStatus: 'low' | 'medium' | 'high' | 'critical';
    if (oldestDueDays > 90 || percent90Plus > 25) {
      riskStatus = 'critical';
    } else if (oldestDueDays > 60 || percent90Plus > 15) {
      riskStatus = 'high';
    } else if (oldestDueDays > 30 || percent90Plus > 5) {
      riskStatus = 'medium';
    } else {
      riskStatus = 'low';
    }

    return {
      schoolId: school.id,
      schoolName: school.name,
      region: school.region,
      totalPending,
      oldestDueDays,
      percent90Plus,
      riskStatus,
    };
  });

  // Filter by bucket if specified
  if (bucket) {
    const bucketRanges: Record<string, { min: number; max: number }> = {
      '0-30 days': { min: 0, max: 30 },
      '31-60 days': { min: 31, max: 60 },
      '61-90 days': { min: 61, max: 90 },
      '90+ days': { min: 91, max: 999 },
    };

    const range = bucketRanges[bucket];
    if (range) {
      return records.filter(r => r.oldestDueDays >= range.min && r.oldestDueDays <= range.max);
    }
  }

  return records;
}

// ============================================================================
// MOCK CAPACITY FORECAST DATA
// ============================================================================

export function getGroupCapacity(region?: string): GroupCapacity {
  const schools = region && region !== 'All'
    ? mockSchools.filter(s => s.region === region)
    : mockSchools;

  // Calculate total capacity and filled seats
  const totalSeats = schools.reduce((sum, school) => {
    // Estimate capacity as students + 15% headroom
    return sum + Math.round(school.totalStudents * 1.15);
  }, 0);

  const filledSeats = schools.reduce((sum, school) => sum + school.totalStudents, 0);

  return {
    totalSeats,
    filledSeats,
    utilizationPercent: Math.round((filledSeats / totalSeats) * 100),
  };
}

export function getCapacityForecast(region?: string): CapacityForecast {
  const schools = region && region !== 'All'
    ? mockSchools.filter(s => s.region === region)
    : mockSchools;

  const capacity = getGroupCapacity(region);

  // Project 8% growth in admissions next year
  const expectedAdmissions = Math.round(capacity.filledSeats * 0.08);

  // Some natural attrition (graduations, transfers)
  const projectedAttrition = Math.round(capacity.filledSeats * 0.12);

  const projectedEnrollment = capacity.filledSeats + expectedAdmissions - projectedAttrition;
  const projectedEmptySeats = capacity.totalSeats - projectedEnrollment;

  // Count schools with 20%+ projected empty seats
  const alertSchoolCount = schools.filter(school => {
    const schoolCapacity = Math.round(school.totalStudents * 1.15);
    const projectedSchoolEnrollment = Math.round(school.totalStudents * 0.96); // 4% net loss
    const emptyPercent = ((schoolCapacity - projectedSchoolEnrollment) / schoolCapacity) * 100;
    return emptyPercent >= 20;
  }).length;

  return {
    expectedAdmissions,
    projectedEmptySeats: Math.max(0, projectedEmptySeats),
    alertSchoolCount,
    alertThreshold: 20,
  };
}

export function getSchoolCapacityRisks(region?: string): SchoolCapacityRisk[] {
  const schools = region && region !== 'All'
    ? mockSchools.filter(s => s.region === region)
    : mockSchools;

  return schools.map(school => {
    const totalCapacity = Math.round(school.totalStudents * 1.15);
    const currentEnrollment = school.totalStudents;

    // Project enrollment with some variation
    const growthFactor = deterministicRandom(school.id * 19, 90, 105) / 100;
    const projectedEnrollment = Math.round(currentEnrollment * growthFactor);

    const emptySeats = totalCapacity - projectedEnrollment;
    const emptySeatsPercent = Math.round((emptySeats / totalCapacity) * 100);

    let riskLevel: 'low' | 'medium' | 'high';
    if (emptySeatsPercent >= 25) {
      riskLevel = 'high';
    } else if (emptySeatsPercent >= 15) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    return {
      schoolId: school.id,
      schoolName: school.name,
      region: school.region,
      totalCapacity,
      currentEnrollment,
      projectedEnrollment,
      emptySeatsPercent,
      riskLevel,
    };
  });
}

// ============================================================================
// SAVED VIEWS (Mock)
// ============================================================================

export const mockFinancialSavedViews: FinancialSavedView[] = [
  { id: 'view-all', name: 'All Schools', filters: {} },
  { id: 'view-south', name: 'South Region', filters: { region: 'South' } },
  { id: 'view-north', name: 'North Region', filters: { region: 'North' } },
  { id: 'view-west', name: 'West Region', filters: { region: 'West' } },
  { id: 'view-east', name: 'East Region', filters: { region: 'East' } },
];

// ============================================================================
// HELPER: Filter school records
// ============================================================================

export function filterByRegion<T extends { region: string }>(
  records: T[],
  region?: string
): T[] {
  if (!region || region === 'All') {
    return records;
  }
  return records.filter(r => r.region === region);
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

export function formatCurrency(value: number): string {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `${(value / 100000).toFixed(2)} L`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} K`;
  }
  return value.toLocaleString('en-IN');
}

export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
