// ============================================================================
// SUPER ADMIN ACADEMICS MOCK DATA - Group Level
// ============================================================================
// Mock data for Super Admin academics pages:
// - Attendance Health (group-level oversight)
// - Curriculum Pacing (syllabus consistency tracking)
// All data is frontend-only, no backend calls
// ============================================================================

import { mockSchools, mockRegions } from './mockSuperAdmin';

// ============================================================================
// TYPES - Attendance Health
// ============================================================================

export interface AttendanceRecord {
  schoolId: number;
  schoolName: string;
  region: string;
  currentAttendance: number;
  weeklyTrend: number[]; // Last 7 weeks of attendance %
  weeksBelowThreshold: number;
  status: 'healthy' | 'watch' | 'risk';
  lastUpdated: string;
  monthlyDrop?: number; // Drop from last month
}

export interface AttendanceBucket {
  range: string;
  min: number;
  max: number;
  count: number;
  schools: number[];
}

export interface AttendanceInsight {
  id: string;
  type: 'positive' | 'warning' | 'critical';
  metric: string;
  value: string;
  schoolName?: string;
  filterAction?: string;
}

export interface SavedView {
  id: string;
  name: string;
  filters: {
    region?: string;
    timeframe?: string;
    status?: string;
  };
}

// ============================================================================
// TYPES - Curriculum Pacing
// ============================================================================

export interface CurriculumPacingRecord {
  schoolId: number;
  schoolName: string;
  region: string;
  gradesAffected: string[];
  lagPercent: number;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
  status: 'on-track' | 'lagging';
}

export interface PacingStatusCounts {
  onTrack: number;
  lagging: number;
}

// ============================================================================
// HELPER: Generate deterministic weekly trend data
// ============================================================================
function generateWeeklyTrend(baseAttendance: number, schoolId: number): number[] {
  const trend: number[] = [];
  const seed = schoolId * 7;
  for (let i = 0; i < 7; i++) {
    // Deterministic variation based on school ID and week
    const variation = ((seed + i * 13) % 10) - 5;
    const value = Math.max(60, Math.min(100, baseAttendance + variation));
    trend.push(Math.round(value * 10) / 10);
  }
  return trend;
}

// ============================================================================
// MOCK ATTENDANCE DATA
// ============================================================================

export const mockAttendanceRecords: AttendanceRecord[] = mockSchools.map((school) => {
  const weeklyTrend = generateWeeklyTrend(school.avgAttendance, school.id);
  const avgRecent = weeklyTrend.slice(-4).reduce((a, b) => a + b, 0) / 4;
  const avgPrevious = weeklyTrend.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const monthlyDrop = Math.round((avgPrevious - avgRecent) * 10) / 10;

  // Count weeks below 85% threshold
  const weeksBelowThreshold = weeklyTrend.filter(w => w < 85).length;

  // Determine status
  let status: 'healthy' | 'watch' | 'risk' = 'healthy';
  if (school.avgAttendance < 80 || weeksBelowThreshold >= 4) {
    status = 'risk';
  } else if (school.avgAttendance < 88 || weeksBelowThreshold >= 2) {
    status = 'watch';
  }

  return {
    schoolId: school.id,
    schoolName: school.name,
    region: school.region,
    currentAttendance: school.avgAttendance,
    weeklyTrend,
    weeksBelowThreshold,
    status,
    lastUpdated: '2025-12-30',
    monthlyDrop: monthlyDrop > 0 ? monthlyDrop : undefined,
  };
});

// ============================================================================
// ATTENDANCE DISTRIBUTION BUCKETS
// ============================================================================

export function getAttendanceBuckets(): AttendanceBucket[] {
  const buckets: AttendanceBucket[] = [
    { range: '95–100%', min: 95, max: 100, count: 0, schools: [] },
    { range: '90–94%', min: 90, max: 94.99, count: 0, schools: [] },
    { range: '85–89%', min: 85, max: 89.99, count: 0, schools: [] },
    { range: '<85%', min: 0, max: 84.99, count: 0, schools: [] },
  ];

  mockAttendanceRecords.forEach((record) => {
    const bucket = buckets.find(
      (b) => record.currentAttendance >= b.min && record.currentAttendance <= b.max
    );
    if (bucket) {
      bucket.count++;
      bucket.schools.push(record.schoolId);
    }
  });

  return buckets;
}

// ============================================================================
// ATTENDANCE INSIGHTS
// ============================================================================

export function getAttendanceInsights(): AttendanceInsight[] {
  const records = mockAttendanceRecords;
  const totalSchools = records.length;

  // Schools above target (90%)
  const aboveTarget = records.filter(r => r.currentAttendance >= 90).length;
  const aboveTargetPercent = Math.round((aboveTarget / totalSchools) * 100);

  // Schools below 85%
  const below85 = records.filter(r => r.currentAttendance < 85).length;
  const below85Percent = Math.round((below85 / totalSchools) * 100);

  // Find school with largest monthly drop
  const withDrops = records.filter(r => r.monthlyDrop && r.monthlyDrop > 0);
  const largestDrop = withDrops.sort((a, b) => (b.monthlyDrop || 0) - (a.monthlyDrop || 0))[0];

  return [
    {
      id: 'insight-above-target',
      type: aboveTargetPercent >= 70 ? 'positive' : 'warning',
      metric: 'Above 90% Target',
      value: `${aboveTargetPercent}%`,
      filterAction: 'above-90',
    },
    {
      id: 'insight-below-85',
      type: below85Percent > 15 ? 'critical' : below85Percent > 0 ? 'warning' : 'positive',
      metric: 'Below 85% Threshold',
      value: `${below85Percent}%`,
      filterAction: 'below-85',
    },
    {
      id: 'insight-largest-drop',
      type: largestDrop?.monthlyDrop && largestDrop.monthlyDrop > 3 ? 'critical' : 'warning',
      metric: 'Largest Monthly Drop',
      value: largestDrop ? `-${largestDrop.monthlyDrop}%` : 'None',
      schoolName: largestDrop?.schoolName,
      filterAction: largestDrop ? `school-${largestDrop.schoolId}` : undefined,
    },
  ];
}

// ============================================================================
// MOCK CURRICULUM PACING DATA
// ============================================================================

export const mockCurriculumPacingRecords: CurriculumPacingRecord[] = mockSchools.map((school) => {
  // Deterministic lag calculation based on school metrics
  const baseLag = 100 - school.academicScore;
  const variation = (school.id * 3) % 10;
  const lagPercent = Math.max(0, Math.min(35, baseLag + variation - 5));

  // Determine trend based on school status
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (school.status === 'critical') {
    trend = 'declining';
  } else if (school.academicScore >= 90) {
    trend = 'improving';
  }

  // Determine affected grades based on lag
  let gradesAffected: string[] = [];
  if (lagPercent > 0) {
    const gradeOptions = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];
    const numGrades = Math.ceil(lagPercent / 10);
    const startIdx = school.id % (gradeOptions.length - numGrades);
    gradesAffected = gradeOptions.slice(startIdx, startIdx + numGrades);
  }

  return {
    schoolId: school.id,
    schoolName: school.name,
    region: school.region,
    gradesAffected,
    lagPercent: Math.round(lagPercent * 10) / 10,
    trend,
    lastUpdated: '2025-12-30',
    status: lagPercent <= 10 ? 'on-track' : 'lagging',
  };
});

// ============================================================================
// CURRICULUM PACING STATUS COUNTS
// ============================================================================

export function getPacingStatusCounts(): PacingStatusCounts {
  const records = mockCurriculumPacingRecords;
  return {
    onTrack: records.filter(r => r.status === 'on-track').length,
    lagging: records.filter(r => r.status === 'lagging').length,
  };
}

// ============================================================================
// GET SCHOOLS SIGNIFICANTLY BEHIND (>15% lag)
// ============================================================================

export function getSchoolsSignificantlyBehind(): CurriculumPacingRecord[] {
  return mockCurriculumPacingRecords.filter(r => r.lagPercent > 15);
}

// ============================================================================
// SAVED VIEWS (Mocked - selectable but not editable)
// ============================================================================

export const mockSavedViews: SavedView[] = [
  {
    id: 'view-all',
    name: 'All Schools',
    filters: {},
  },
  {
    id: 'view-risk',
    name: 'At Risk Schools',
    filters: { status: 'risk' },
  },
  {
    id: 'view-south',
    name: 'South Region',
    filters: { region: 'South' },
  },
  {
    id: 'view-north',
    name: 'North Region',
    filters: { region: 'North' },
  },
  {
    id: 'view-30days',
    name: 'Last 30 Days View',
    filters: { timeframe: '30days' },
  },
];

// ============================================================================
// FILTER HELPERS
// ============================================================================

export function filterAttendanceRecords(
  records: AttendanceRecord[],
  filters: {
    region?: string;
    status?: string;
    bucket?: string;
    schoolId?: number;
  }
): AttendanceRecord[] {
  let filtered = [...records];

  if (filters.region && filters.region !== 'All') {
    filtered = filtered.filter(r => r.region === filters.region);
  }

  if (filters.status) {
    filtered = filtered.filter(r => r.status === filters.status);
  }

  if (filters.bucket) {
    const buckets = getAttendanceBuckets();
    const bucket = buckets.find(b => b.range === filters.bucket);
    if (bucket) {
      filtered = filtered.filter(r => bucket.schools.includes(r.schoolId));
    }
  }

  if (filters.schoolId) {
    filtered = filtered.filter(r => r.schoolId === filters.schoolId);
  }

  return filtered;
}

export function filterCurriculumRecords(
  records: CurriculumPacingRecord[],
  filters: {
    region?: string;
    grade?: string;
    status?: string;
  }
): CurriculumPacingRecord[] {
  let filtered = [...records];

  if (filters.region && filters.region !== 'All') {
    filtered = filtered.filter(r => r.region === filters.region);
  }

  if (filters.grade && filters.grade !== 'All') {
    const grade = filters.grade;
    filtered = filtered.filter(r => r.gradesAffected.includes(grade));
  }

  if (filters.status) {
    filtered = filtered.filter(r => r.status === filters.status);
  }

  return filtered;
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const mockAcademicsGroupProvider = {
  // Attendance
  attendanceRecords: mockAttendanceRecords,
  getAttendanceBuckets,
  getAttendanceInsights,
  filterAttendanceRecords,

  // Curriculum Pacing
  curriculumPacingRecords: mockCurriculumPacingRecords,
  getPacingStatusCounts,
  getSchoolsSignificantlyBehind,
  filterCurriculumRecords,

  // Shared
  savedViews: mockSavedViews,
  regions: mockRegions,
};
