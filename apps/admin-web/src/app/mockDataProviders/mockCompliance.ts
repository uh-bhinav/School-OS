// ============================================================================
// COMPLIANCE & RISK MOCK DATA PROVIDER - Super Admin Only
// ============================================================================
// Mock data for Super Admin Compliance & Risk Dashboard
// All data is frontend-only, no backend calls
// This is NOT shared with Principal dashboard
// ============================================================================

import { mockSchools } from './mockSuperAdmin';

// ============================================================================
// TYPES
// ============================================================================

export type ComplianceSeverity = 'urgent' | 'attention' | 'on-track';
export type CertificateCategory =
  | 'board-affiliation'
  | 'fire-safety'
  | 'staff-verification'
  | 'building-occupancy'
  | 'health-sanitation';

export type CategoryStatus = 'critical' | 'warning' | 'good';

export interface Certificate {
  id: string;
  schoolId: number;
  schoolName: string;
  region: string;
  type: CertificateCategory;
  typeName: string;
  expiryDate: string;
  daysRemaining: number;
  severity: ComplianceSeverity;
  certificateNumber: string;
  issuingAuthority: string;
  lastRenewalDate: string;
}

export interface ComplianceCategory {
  id: CertificateCategory;
  name: string;
  description: string;
  whyItMatters: string;
  status: CategoryStatus;
  schoolsAffected: number;
  urgentCount: number;
  attentionCount: number;
  onTrackCount: number;
}

export interface ComplianceAlert {
  id: string;
  type: 'expiry' | 'renewal' | 'inspection' | 'penalty';
  title: string;
  description: string;
  schoolId: number;
  schoolName: string;
  certificateType: CertificateCategory;
  daysUntil: number;
  severity: ComplianceSeverity;
  date: string;
}

export interface NotificationConfig {
  certificateType: CertificateCategory;
  typeName: string;
  recipients: string[];
  alertDays: number[];
  enabled: boolean;
}

export interface HistoricalEvent {
  id: string;
  date: string;
  schoolId: number;
  schoolName: string;
  eventType: 'late-renewal' | 'penalty' | 'warning' | 'inspection-failed' | 'license-lapse';
  title: string;
  description: string;
  resolution?: string;
  financialImpact?: number;
}

export interface ComplianceSummary {
  urgentSchools: number;
  attentionSchools: number;
  onTrackSchools: number;
  totalCertificates: number;
  expiringWithin30: number;
  expiringWithin60: number;
  expiringWithin90: number;
}

// ============================================================================
// CERTIFICATE CATEGORY CONFIGURATION
// ============================================================================

export const certificateCategoryConfig: Record<CertificateCategory, { name: string; description: string; whyItMatters: string }> = {
  'board-affiliation': {
    name: 'Board / Affiliation Certificates',
    description: 'CBSE, ICSE, State Board affiliation certificates required for school operation',
    whyItMatters: 'Without valid board affiliation, schools cannot conduct recognized examinations or issue valid certificates to students.',
  },
  'fire-safety': {
    name: 'Fire Safety',
    description: 'Fire NOC and safety compliance certificates from local fire department',
    whyItMatters: 'Fire safety lapses can result in immediate school closure and significant legal liability in case of incidents.',
  },
  'staff-verification': {
    name: 'Staff Background Verification',
    description: 'Police verification and background checks for all teaching and non-teaching staff',
    whyItMatters: 'Mandatory for child safety compliance. Non-compliance can result in license revocation and legal action.',
  },
  'building-occupancy': {
    name: 'Building / Occupancy',
    description: 'Building stability, occupancy, and structural safety certificates',
    whyItMatters: 'Ensures structural integrity of school buildings. Expired certificates can lead to forced closure by authorities.',
  },
  'health-sanitation': {
    name: 'Health & Sanitation',
    description: 'Health department certificates for canteen, water quality, and sanitation',
    whyItMatters: 'Critical for student health. Non-compliance can result in disease outbreaks and immediate closure orders.',
  },
};

// ============================================================================
// MOCK CERTIFICATES DATA
// ============================================================================

const today = new Date();

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper to calculate days remaining from expiry date
export function getDaysRemaining(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Helper to determine severity based on days remaining
export function getSeverityFromDays(daysRemaining: number): ComplianceSeverity {
  if (daysRemaining <= 30) return 'urgent';
  if (daysRemaining <= 60) return 'attention';
  return 'on-track';
}

// Generate certificates for each school
export const mockCertificates: Certificate[] = [
  // ==========================================
  // URGENT CERTIFICATES (Expiring within 30 days)
  // ==========================================

  // Bright Future School - Critical school with multiple issues
  {
    id: 'cert-001',
    schoolId: 8,
    schoolName: 'Bright Future School',
    region: 'North',
    type: 'board-affiliation',
    typeName: 'CBSE Affiliation',
    expiryDate: formatDate(addDays(today, 15)),
    daysRemaining: 15,
    severity: 'urgent',
    certificateNumber: 'CBSE/AFF/2019/8834',
    issuingAuthority: 'Central Board of Secondary Education',
    lastRenewalDate: '2022-01-15',
  },
  {
    id: 'cert-002',
    schoolId: 8,
    schoolName: 'Bright Future School',
    region: 'North',
    type: 'fire-safety',
    typeName: 'Fire NOC',
    expiryDate: formatDate(addDays(today, 8)),
    daysRemaining: 8,
    severity: 'urgent',
    certificateNumber: 'FIRE/NOC/UP/2023/1245',
    issuingAuthority: 'UP Fire Services',
    lastRenewalDate: '2023-01-20',
  },

  // Little Stars School - Another critical school
  {
    id: 'cert-003',
    schoolId: 12,
    schoolName: 'Little Stars School',
    region: 'West',
    type: 'building-occupancy',
    typeName: 'Occupancy Certificate',
    expiryDate: formatDate(addDays(today, 22)),
    daysRemaining: 22,
    severity: 'urgent',
    certificateNumber: 'BMC/OC/2022/7892',
    issuingAuthority: 'BMC Mumbai',
    lastRenewalDate: '2022-02-28',
  },
  {
    id: 'cert-004',
    schoolId: 12,
    schoolName: 'Little Stars School',
    region: 'West',
    type: 'health-sanitation',
    typeName: 'Health Certificate',
    expiryDate: formatDate(addDays(today, 12)),
    daysRemaining: 12,
    severity: 'urgent',
    certificateNumber: 'HC/MUM/2023/4521',
    issuingAuthority: 'Municipal Health Department',
    lastRenewalDate: '2023-01-12',
  },

  // Green Valley International - Attention school
  {
    id: 'cert-005',
    schoolId: 2,
    schoolName: 'Green Valley International',
    region: 'South',
    type: 'fire-safety',
    typeName: 'Fire NOC',
    expiryDate: formatDate(addDays(today, 28)),
    daysRemaining: 28,
    severity: 'urgent',
    certificateNumber: 'FIRE/TN/2023/3344',
    issuingAuthority: 'Tamil Nadu Fire Services',
    lastRenewalDate: '2023-01-28',
  },

  // Coimbatore Central
  {
    id: 'cert-006',
    schoolId: 5,
    schoolName: 'Coimbatore Central',
    region: 'South',
    type: 'staff-verification',
    typeName: 'Staff Background Verification',
    expiryDate: formatDate(addDays(today, 18)),
    daysRemaining: 18,
    severity: 'urgent',
    certificateNumber: 'PV/TN/2022/8876',
    issuingAuthority: 'Tamil Nadu Police',
    lastRenewalDate: '2022-01-18',
  },

  // ==========================================
  // ATTENTION CERTIFICATES (Expiring within 60 days)
  // ==========================================

  {
    id: 'cert-007',
    schoolId: 10,
    schoolName: 'Lucknow Public School',
    region: 'North',
    type: 'board-affiliation',
    typeName: 'ICSE Affiliation',
    expiryDate: formatDate(addDays(today, 45)),
    daysRemaining: 45,
    severity: 'attention',
    certificateNumber: 'ICSE/AFF/2020/4421',
    issuingAuthority: 'Council for Indian School Certificate Examinations',
    lastRenewalDate: '2022-02-15',
  },
  {
    id: 'cert-008',
    schoolId: 16,
    schoolName: 'Goa Central Academy',
    region: 'West',
    type: 'health-sanitation',
    typeName: 'Canteen License',
    expiryDate: formatDate(addDays(today, 52)),
    daysRemaining: 52,
    severity: 'attention',
    certificateNumber: 'FSSAI/GOA/2023/1122',
    issuingAuthority: 'FSSAI',
    lastRenewalDate: '2023-02-20',
  },
  {
    id: 'cert-009',
    schoolId: 19,
    schoolName: 'Patna Model School',
    region: 'East',
    type: 'fire-safety',
    typeName: 'Fire NOC',
    expiryDate: formatDate(addDays(today, 38)),
    daysRemaining: 38,
    severity: 'attention',
    certificateNumber: 'FIRE/BH/2023/2234',
    issuingAuthority: 'Bihar Fire Services',
    lastRenewalDate: '2023-02-08',
  },
  {
    id: 'cert-010',
    schoolId: 2,
    schoolName: 'Green Valley International',
    region: 'South',
    type: 'building-occupancy',
    typeName: 'Building Stability',
    expiryDate: formatDate(addDays(today, 55)),
    daysRemaining: 55,
    severity: 'attention',
    certificateNumber: 'PWD/TN/2022/6678',
    issuingAuthority: 'PWD Tamil Nadu',
    lastRenewalDate: '2022-03-01',
  },
  {
    id: 'cert-011',
    schoolId: 5,
    schoolName: 'Coimbatore Central',
    region: 'South',
    type: 'health-sanitation',
    typeName: 'Water Quality Certificate',
    expiryDate: formatDate(addDays(today, 48)),
    daysRemaining: 48,
    severity: 'attention',
    certificateNumber: 'WQ/TN/2023/9912',
    issuingAuthority: 'Tamil Nadu Pollution Control',
    lastRenewalDate: '2023-02-18',
  },
  {
    id: 'cert-012',
    schoolId: 10,
    schoolName: 'Lucknow Public School',
    region: 'North',
    type: 'staff-verification',
    typeName: 'Police Verification',
    expiryDate: formatDate(addDays(today, 42)),
    daysRemaining: 42,
    severity: 'attention',
    certificateNumber: 'PV/UP/2022/7765',
    issuingAuthority: 'UP Police',
    lastRenewalDate: '2022-02-12',
  },

  // ==========================================
  // ON-TRACK CERTIFICATES (90+ days remaining)
  // ==========================================

  // Tapasya Vidyanikethan - Healthy school
  {
    id: 'cert-013',
    schoolId: 1,
    schoolName: 'Tapasya Vidyanikethan',
    region: 'South',
    type: 'board-affiliation',
    typeName: 'CBSE Affiliation',
    expiryDate: formatDate(addDays(today, 450)),
    daysRemaining: 450,
    severity: 'on-track',
    certificateNumber: 'CBSE/AFF/2021/1234',
    issuingAuthority: 'Central Board of Secondary Education',
    lastRenewalDate: '2024-01-15',
  },
  {
    id: 'cert-014',
    schoolId: 1,
    schoolName: 'Tapasya Vidyanikethan',
    region: 'South',
    type: 'fire-safety',
    typeName: 'Fire NOC',
    expiryDate: formatDate(addDays(today, 280)),
    daysRemaining: 280,
    severity: 'on-track',
    certificateNumber: 'FIRE/KA/2024/5567',
    issuingAuthority: 'Karnataka Fire Services',
    lastRenewalDate: '2024-03-10',
  },
  {
    id: 'cert-015',
    schoolId: 1,
    schoolName: 'Tapasya Vidyanikethan',
    region: 'South',
    type: 'building-occupancy',
    typeName: 'Occupancy Certificate',
    expiryDate: formatDate(addDays(today, 520)),
    daysRemaining: 520,
    severity: 'on-track',
    certificateNumber: 'BBMP/OC/2023/8890',
    issuingAuthority: 'BBMP Bangalore',
    lastRenewalDate: '2023-06-15',
  },
  {
    id: 'cert-016',
    schoolId: 1,
    schoolName: 'Tapasya Vidyanikethan',
    region: 'South',
    type: 'staff-verification',
    typeName: 'Staff Verification',
    expiryDate: formatDate(addDays(today, 180)),
    daysRemaining: 180,
    severity: 'on-track',
    certificateNumber: 'PV/KA/2024/4456',
    issuingAuthority: 'Karnataka Police',
    lastRenewalDate: '2024-06-01',
  },
  {
    id: 'cert-017',
    schoolId: 1,
    schoolName: 'Tapasya Vidyanikethan',
    region: 'South',
    type: 'health-sanitation',
    typeName: 'Health Certificate',
    expiryDate: formatDate(addDays(today, 240)),
    daysRemaining: 240,
    severity: 'on-track',
    certificateNumber: 'HC/BLR/2024/2234',
    issuingAuthority: 'BBMP Health Department',
    lastRenewalDate: '2024-04-20',
  },

  // Sunrise Academy
  {
    id: 'cert-018',
    schoolId: 3,
    schoolName: 'Sunrise Academy',
    region: 'South',
    type: 'board-affiliation',
    typeName: 'ICSE Affiliation',
    expiryDate: formatDate(addDays(today, 540)),
    daysRemaining: 540,
    severity: 'on-track',
    certificateNumber: 'ICSE/AFF/2022/5567',
    issuingAuthority: 'CISCE',
    lastRenewalDate: '2023-06-30',
  },
  {
    id: 'cert-019',
    schoolId: 3,
    schoolName: 'Sunrise Academy',
    region: 'South',
    type: 'fire-safety',
    typeName: 'Fire NOC',
    expiryDate: formatDate(addDays(today, 320)),
    daysRemaining: 320,
    severity: 'on-track',
    certificateNumber: 'FIRE/TS/2024/7789',
    issuingAuthority: 'Telangana Fire Services',
    lastRenewalDate: '2024-02-15',
  },

  // Delhi Modern School
  {
    id: 'cert-020',
    schoolId: 7,
    schoolName: 'Delhi Modern School',
    region: 'North',
    type: 'board-affiliation',
    typeName: 'CBSE Affiliation',
    expiryDate: formatDate(addDays(today, 480)),
    daysRemaining: 480,
    severity: 'on-track',
    certificateNumber: 'CBSE/AFF/2022/9901',
    issuingAuthority: 'Central Board of Secondary Education',
    lastRenewalDate: '2023-05-31',
  },
  {
    id: 'cert-021',
    schoolId: 7,
    schoolName: 'Delhi Modern School',
    region: 'North',
    type: 'fire-safety',
    typeName: 'Fire NOC',
    expiryDate: formatDate(addDays(today, 290)),
    daysRemaining: 290,
    severity: 'on-track',
    certificateNumber: 'FIRE/DL/2024/1123',
    issuingAuthority: 'Delhi Fire Services',
    lastRenewalDate: '2024-03-20',
  },
  {
    id: 'cert-022',
    schoolId: 7,
    schoolName: 'Delhi Modern School',
    region: 'North',
    type: 'building-occupancy',
    typeName: 'Occupancy Certificate',
    expiryDate: formatDate(addDays(today, 600)),
    daysRemaining: 600,
    severity: 'on-track',
    certificateNumber: 'MCD/OC/2022/3345',
    issuingAuthority: 'MCD Delhi',
    lastRenewalDate: '2022-08-15',
  },

  // Excel International
  {
    id: 'cert-023',
    schoolId: 17,
    schoolName: 'Excel International',
    region: 'East',
    type: 'board-affiliation',
    typeName: 'ICSE Affiliation',
    expiryDate: formatDate(addDays(today, 520)),
    daysRemaining: 520,
    severity: 'on-track',
    certificateNumber: 'ICSE/AFF/2022/6678',
    issuingAuthority: 'CISCE',
    lastRenewalDate: '2023-09-30',
  },
  {
    id: 'cert-024',
    schoolId: 17,
    schoolName: 'Excel International',
    region: 'East',
    type: 'fire-safety',
    typeName: 'Fire NOC',
    expiryDate: formatDate(addDays(today, 340)),
    daysRemaining: 340,
    severity: 'on-track',
    certificateNumber: 'FIRE/WB/2024/4456',
    issuingAuthority: 'West Bengal Fire Services',
    lastRenewalDate: '2024-01-25',
  },

  // Ahmedabad International
  {
    id: 'cert-025',
    schoolId: 14,
    schoolName: 'Ahmedabad International',
    region: 'West',
    type: 'board-affiliation',
    typeName: 'IB Affiliation',
    expiryDate: formatDate(addDays(today, 720)),
    daysRemaining: 720,
    severity: 'on-track',
    certificateNumber: 'IBO/AFF/2023/IN-445',
    issuingAuthority: 'International Baccalaureate Organization',
    lastRenewalDate: '2023-08-31',
  },
  {
    id: 'cert-026',
    schoolId: 14,
    schoolName: 'Ahmedabad International',
    region: 'West',
    type: 'fire-safety',
    typeName: 'Fire NOC',
    expiryDate: formatDate(addDays(today, 310)),
    daysRemaining: 310,
    severity: 'on-track',
    certificateNumber: 'FIRE/GJ/2024/2234',
    issuingAuthority: 'Gujarat Fire Services',
    lastRenewalDate: '2024-02-28',
  },

  // Additional on-track certificates for other schools
  {
    id: 'cert-027',
    schoolId: 4,
    schoolName: 'Kochi Public School',
    region: 'South',
    type: 'board-affiliation',
    typeName: 'State Board Affiliation',
    expiryDate: formatDate(addDays(today, 380)),
    daysRemaining: 380,
    severity: 'on-track',
    certificateNumber: 'KSB/AFF/2023/4456',
    issuingAuthority: 'Kerala State Board',
    lastRenewalDate: '2023-01-15',
  },
  {
    id: 'cert-028',
    schoolId: 6,
    schoolName: 'Madurai Heritage',
    region: 'South',
    type: 'board-affiliation',
    typeName: 'CBSE Affiliation',
    expiryDate: formatDate(addDays(today, 420)),
    daysRemaining: 420,
    severity: 'on-track',
    certificateNumber: 'CBSE/AFF/2023/7789',
    issuingAuthority: 'Central Board of Secondary Education',
    lastRenewalDate: '2023-02-28',
  },
  {
    id: 'cert-029',
    schoolId: 9,
    schoolName: 'Jaipur Royal Academy',
    region: 'North',
    type: 'board-affiliation',
    typeName: 'CBSE Affiliation',
    expiryDate: formatDate(addDays(today, 460)),
    daysRemaining: 460,
    severity: 'on-track',
    certificateNumber: 'CBSE/AFF/2023/1122',
    issuingAuthority: 'Central Board of Secondary Education',
    lastRenewalDate: '2023-04-15',
  },
  {
    id: 'cert-030',
    schoolId: 11,
    schoolName: 'Chandigarh Elite',
    region: 'North',
    type: 'board-affiliation',
    typeName: 'CBSE Affiliation',
    expiryDate: formatDate(addDays(today, 500)),
    daysRemaining: 500,
    severity: 'on-track',
    certificateNumber: 'CBSE/AFF/2023/3344',
    issuingAuthority: 'Central Board of Secondary Education',
    lastRenewalDate: '2023-07-31',
  },
  {
    id: 'cert-031',
    schoolId: 13,
    schoolName: 'Knowledge Hub Academy',
    region: 'West',
    type: 'board-affiliation',
    typeName: 'CBSE Affiliation',
    expiryDate: formatDate(addDays(today, 440)),
    daysRemaining: 440,
    severity: 'on-track',
    certificateNumber: 'CBSE/AFF/2023/5567',
    issuingAuthority: 'Central Board of Secondary Education',
    lastRenewalDate: '2023-01-15',
  },
  {
    id: 'cert-032',
    schoolId: 15,
    schoolName: 'Surat Progressive',
    region: 'West',
    type: 'board-affiliation',
    typeName: 'CBSE Affiliation',
    expiryDate: formatDate(addDays(today, 400)),
    daysRemaining: 400,
    severity: 'on-track',
    certificateNumber: 'CBSE/AFF/2023/7890',
    issuingAuthority: 'Central Board of Secondary Education',
    lastRenewalDate: '2023-03-15',
  },
  {
    id: 'cert-033',
    schoolId: 18,
    schoolName: 'Bhubaneswar Academy',
    region: 'East',
    type: 'board-affiliation',
    typeName: 'CBSE Affiliation',
    expiryDate: formatDate(addDays(today, 360)),
    daysRemaining: 360,
    severity: 'on-track',
    certificateNumber: 'CBSE/AFF/2023/2345',
    issuingAuthority: 'Central Board of Secondary Education',
    lastRenewalDate: '2023-02-15',
  },
  {
    id: 'cert-034',
    schoolId: 20,
    schoolName: 'Guwahati Progressive',
    region: 'East',
    type: 'board-affiliation',
    typeName: 'State Board Affiliation',
    expiryDate: formatDate(addDays(today, 380)),
    daysRemaining: 380,
    severity: 'on-track',
    certificateNumber: 'ASB/AFF/2023/6789',
    issuingAuthority: 'Assam State Board',
    lastRenewalDate: '2023-04-30',
  },
];

// ============================================================================
// COMPLIANCE ALERTS (Upcoming Deadlines)
// ============================================================================

export const mockComplianceAlerts: ComplianceAlert[] = [
  // Week 1 (Next 7 days)
  {
    id: 'alert-001',
    type: 'expiry',
    title: 'Fire NOC Expiring',
    description: 'Fire safety certificate requires immediate renewal to avoid penalties',
    schoolId: 8,
    schoolName: 'Bright Future School',
    certificateType: 'fire-safety',
    daysUntil: 8,
    severity: 'urgent',
    date: formatDate(addDays(today, 8)),
  },

  // Week 2 (8-14 days)
  {
    id: 'alert-002',
    type: 'expiry',
    title: 'Health Certificate Expiring',
    description: 'Canteen and sanitation certificate needs renewal',
    schoolId: 12,
    schoolName: 'Little Stars School',
    certificateType: 'health-sanitation',
    daysUntil: 12,
    severity: 'urgent',
    date: formatDate(addDays(today, 12)),
  },
  {
    id: 'alert-003',
    type: 'expiry',
    title: 'CBSE Affiliation Expiring',
    description: 'Board affiliation certificate renewal deadline approaching',
    schoolId: 8,
    schoolName: 'Bright Future School',
    certificateType: 'board-affiliation',
    daysUntil: 15,
    severity: 'urgent',
    date: formatDate(addDays(today, 15)),
  },

  // Week 3 (15-21 days)
  {
    id: 'alert-004',
    type: 'expiry',
    title: 'Staff Verification Expiring',
    description: 'Background verification certificates need renewal',
    schoolId: 5,
    schoolName: 'Coimbatore Central',
    certificateType: 'staff-verification',
    daysUntil: 18,
    severity: 'urgent',
    date: formatDate(addDays(today, 18)),
  },
  {
    id: 'alert-005',
    type: 'expiry',
    title: 'Building Occupancy Expiring',
    description: 'Occupancy certificate requires immediate attention',
    schoolId: 12,
    schoolName: 'Little Stars School',
    certificateType: 'building-occupancy',
    daysUntil: 22,
    severity: 'urgent',
    date: formatDate(addDays(today, 22)),
  },

  // Week 4 (22-28 days)
  {
    id: 'alert-006',
    type: 'expiry',
    title: 'Fire NOC Expiring',
    description: 'Fire safety certificate approaching expiry',
    schoolId: 2,
    schoolName: 'Green Valley International',
    certificateType: 'fire-safety',
    daysUntil: 28,
    severity: 'urgent',
    date: formatDate(addDays(today, 28)),
  },

  // Month 2 (31-60 days)
  {
    id: 'alert-007',
    type: 'expiry',
    title: 'Fire NOC Expiring',
    description: 'Fire safety certificate needs renewal planning',
    schoolId: 19,
    schoolName: 'Patna Model School',
    certificateType: 'fire-safety',
    daysUntil: 38,
    severity: 'attention',
    date: formatDate(addDays(today, 38)),
  },
  {
    id: 'alert-008',
    type: 'expiry',
    title: 'Police Verification Expiring',
    description: 'Staff background verification renewal due',
    schoolId: 10,
    schoolName: 'Lucknow Public School',
    certificateType: 'staff-verification',
    daysUntil: 42,
    severity: 'attention',
    date: formatDate(addDays(today, 42)),
  },
  {
    id: 'alert-009',
    type: 'expiry',
    title: 'ICSE Affiliation Expiring',
    description: 'Board affiliation renewal process should begin',
    schoolId: 10,
    schoolName: 'Lucknow Public School',
    certificateType: 'board-affiliation',
    daysUntil: 45,
    severity: 'attention',
    date: formatDate(addDays(today, 45)),
  },
  {
    id: 'alert-010',
    type: 'expiry',
    title: 'Water Quality Certificate Expiring',
    description: 'Water quality testing and certification due',
    schoolId: 5,
    schoolName: 'Coimbatore Central',
    certificateType: 'health-sanitation',
    daysUntil: 48,
    severity: 'attention',
    date: formatDate(addDays(today, 48)),
  },
  {
    id: 'alert-011',
    type: 'expiry',
    title: 'Canteen License Expiring',
    description: 'FSSAI license renewal required',
    schoolId: 16,
    schoolName: 'Goa Central Academy',
    certificateType: 'health-sanitation',
    daysUntil: 52,
    severity: 'attention',
    date: formatDate(addDays(today, 52)),
  },
  {
    id: 'alert-012',
    type: 'expiry',
    title: 'Building Stability Certificate Expiring',
    description: 'Structural assessment and certification due',
    schoolId: 2,
    schoolName: 'Green Valley International',
    certificateType: 'building-occupancy',
    daysUntil: 55,
    severity: 'attention',
    date: formatDate(addDays(today, 55)),
  },

  // Upcoming inspections (informational)
  {
    id: 'alert-013',
    type: 'inspection',
    title: 'Scheduled Fire Safety Inspection',
    description: 'Annual fire safety inspection scheduled',
    schoolId: 1,
    schoolName: 'Tapasya Vidyanikethan',
    certificateType: 'fire-safety',
    daysUntil: 75,
    severity: 'on-track',
    date: formatDate(addDays(today, 75)),
  },
  {
    id: 'alert-014',
    type: 'inspection',
    title: 'CBSE Inspection Due',
    description: 'Routine CBSE affiliation inspection',
    schoolId: 7,
    schoolName: 'Delhi Modern School',
    certificateType: 'board-affiliation',
    daysUntil: 90,
    severity: 'on-track',
    date: formatDate(addDays(today, 90)),
  },
];

// ============================================================================
// NOTIFICATION CONFIGURATION (Read-Only Display)
// ============================================================================

export const mockNotificationConfig: NotificationConfig[] = [
  {
    certificateType: 'board-affiliation',
    typeName: 'Board Affiliation',
    recipients: ['Principal', 'Academic Director', 'Super Admin'],
    alertDays: [90, 60, 30, 15, 7],
    enabled: true,
  },
  {
    certificateType: 'fire-safety',
    typeName: 'Fire Safety',
    recipients: ['Principal', 'Operations Manager', 'Super Admin'],
    alertDays: [60, 30, 15, 7, 3],
    enabled: true,
  },
  {
    certificateType: 'staff-verification',
    typeName: 'Staff Verification',
    recipients: ['HR Manager', 'Principal', 'Super Admin'],
    alertDays: [60, 30, 14, 7],
    enabled: true,
  },
  {
    certificateType: 'building-occupancy',
    typeName: 'Building Occupancy',
    recipients: ['Principal', 'Facilities Manager', 'Super Admin'],
    alertDays: [90, 60, 30, 15],
    enabled: true,
  },
  {
    certificateType: 'health-sanitation',
    typeName: 'Health & Sanitation',
    recipients: ['Principal', 'Canteen Manager', 'Super Admin'],
    alertDays: [60, 30, 15, 7],
    enabled: true,
  },
];

// ============================================================================
// HISTORICAL COMPLIANCE LOG
// ============================================================================

export const mockHistoricalEvents: HistoricalEvent[] = [
  {
    id: 'hist-001',
    date: '2025-08-15',
    schoolId: 8,
    schoolName: 'Bright Future School',
    eventType: 'late-renewal',
    title: 'Late Fire NOC Renewal',
    description: 'Fire safety certificate renewed 12 days after expiry. School received warning notice.',
    resolution: 'Certificate renewed with late fee penalty',
    financialImpact: 25000,
  },
  {
    id: 'hist-002',
    date: '2025-06-20',
    schoolId: 12,
    schoolName: 'Little Stars School',
    eventType: 'penalty',
    title: 'Health Inspection Penalty',
    description: 'Failed surprise health inspection. Canteen operations suspended for 3 days.',
    resolution: 'Corrective measures implemented, operations resumed',
    financialImpact: 50000,
  },
  {
    id: 'hist-003',
    date: '2025-04-10',
    schoolId: 10,
    schoolName: 'Lucknow Public School',
    eventType: 'warning',
    title: 'Staff Verification Warning',
    description: 'Two staff members found without valid background verification. Warning issued.',
    resolution: 'Verification completed within 7 days, warning cleared',
    financialImpact: 0,
  },
  {
    id: 'hist-004',
    date: '2025-02-28',
    schoolId: 8,
    schoolName: 'Bright Future School',
    eventType: 'inspection-failed',
    title: 'Failed Building Safety Inspection',
    description: 'Building stability inspection revealed structural concerns. Partial closure ordered.',
    resolution: 'Structural repairs completed, re-inspection passed',
    financialImpact: 150000,
  },
  {
    id: 'hist-005',
    date: '2024-11-15',
    schoolId: 12,
    schoolName: 'Little Stars School',
    eventType: 'late-renewal',
    title: 'Delayed FSSAI License Renewal',
    description: 'Food safety license renewed 8 days after expiry.',
    resolution: 'License renewed with late fee',
    financialImpact: 15000,
  },
  {
    id: 'hist-006',
    date: '2024-09-05',
    schoolId: 19,
    schoolName: 'Patna Model School',
    eventType: 'warning',
    title: 'Fire Safety Equipment Warning',
    description: 'Expired fire extinguishers found during routine inspection.',
    resolution: 'All equipment replaced within 48 hours',
    financialImpact: 8000,
  },
  {
    id: 'hist-007',
    date: '2024-07-20',
    schoolId: 5,
    schoolName: 'Coimbatore Central',
    eventType: 'late-renewal',
    title: 'Late Board Affiliation Renewal',
    description: 'State board affiliation renewed 5 days past deadline.',
    resolution: 'Affiliation restored after submitting compliance documents',
    financialImpact: 10000,
  },
  {
    id: 'hist-008',
    date: '2024-05-12',
    schoolId: 16,
    schoolName: 'Goa Central Academy',
    eventType: 'inspection-failed',
    title: 'Water Quality Test Failure',
    description: 'Water quality test showed elevated contamination levels.',
    resolution: 'Water filtration system upgraded, re-test passed',
    financialImpact: 75000,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getComplianceSummary(): ComplianceSummary {
  const urgentCerts = mockCertificates.filter(c => c.severity === 'urgent');
  const attentionCerts = mockCertificates.filter(c => c.severity === 'attention');

  const urgentSchoolIds = new Set(urgentCerts.map(c => c.schoolId));
  const attentionSchoolIds = new Set(
    attentionCerts
      .filter(c => !urgentSchoolIds.has(c.schoolId))
      .map(c => c.schoolId)
  );

  const totalSchools = mockSchools.length;
  const onTrackSchools = totalSchools - urgentSchoolIds.size - attentionSchoolIds.size;

  return {
    urgentSchools: urgentSchoolIds.size,
    attentionSchools: attentionSchoolIds.size,
    onTrackSchools,
    totalCertificates: mockCertificates.length,
    expiringWithin30: mockCertificates.filter(c => c.daysRemaining <= 30).length,
    expiringWithin60: mockCertificates.filter(c => c.daysRemaining <= 60).length,
    expiringWithin90: mockCertificates.filter(c => c.daysRemaining <= 90).length,
  };
}

export function getComplianceCategories(): ComplianceCategory[] {
  const categories: CertificateCategory[] = [
    'board-affiliation',
    'fire-safety',
    'staff-verification',
    'building-occupancy',
    'health-sanitation',
  ];

  return categories.map(categoryId => {
    const config = certificateCategoryConfig[categoryId];
    const categoryCerts = mockCertificates.filter(c => c.type === categoryId);

    const urgentCount = categoryCerts.filter(c => c.severity === 'urgent').length;
    const attentionCount = categoryCerts.filter(c => c.severity === 'attention').length;
    const onTrackCount = categoryCerts.filter(c => c.severity === 'on-track').length;

    const urgentSchools = new Set(categoryCerts.filter(c => c.severity === 'urgent').map(c => c.schoolId));
    const attentionSchools = new Set(categoryCerts.filter(c => c.severity === 'attention').map(c => c.schoolId));

    let status: CategoryStatus = 'good';
    if (urgentCount > 0) {
      status = 'critical';
    } else if (attentionCount > 0) {
      status = 'warning';
    }

    return {
      id: categoryId,
      name: config.name,
      description: config.description,
      whyItMatters: config.whyItMatters,
      status,
      schoolsAffected: urgentSchools.size + attentionSchools.size,
      urgentCount,
      attentionCount,
      onTrackCount,
    };
  });
}

export function getCertificatesByFilter(
  type?: CertificateCategory,
  region?: string,
  expiryWindow?: 30 | 60 | 90,
): Certificate[] {
  let filtered = [...mockCertificates];

  if (type) {
    filtered = filtered.filter(c => c.type === type);
  }

  if (region && region !== 'All') {
    filtered = filtered.filter(c => c.region === region);
  }

  if (expiryWindow) {
    filtered = filtered.filter(c => c.daysRemaining <= expiryWindow);
  }

  // Sort by days remaining (most urgent first)
  return filtered.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function getAlertsByTimeframe(
  weeks?: number,
): ComplianceAlert[] {
  if (!weeks) return mockComplianceAlerts;

  const maxDays = weeks * 7;
  return mockComplianceAlerts
    .filter(a => a.daysUntil <= maxDays)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

export function getSchoolComplianceStatus(schoolId: number): ComplianceSeverity {
  const schoolCerts = mockCertificates.filter(c => c.schoolId === schoolId);

  if (schoolCerts.some(c => c.severity === 'urgent')) {
    return 'urgent';
  }
  if (schoolCerts.some(c => c.severity === 'attention')) {
    return 'attention';
  }
  return 'on-track';
}

export function getSchoolsByComplianceSeverity(severity: ComplianceSeverity): number[] {
  const schoolSeverities = new Map<number, ComplianceSeverity>();

  mockCertificates.forEach(cert => {
    const currentSeverity = schoolSeverities.get(cert.schoolId);
    if (!currentSeverity) {
      schoolSeverities.set(cert.schoolId, cert.severity);
    } else if (cert.severity === 'urgent') {
      schoolSeverities.set(cert.schoolId, 'urgent');
    } else if (cert.severity === 'attention' && currentSeverity !== 'urgent') {
      schoolSeverities.set(cert.schoolId, 'attention');
    }
  });

  return Array.from(schoolSeverities.entries())
    .filter(([, s]) => s === severity)
    .map(([id]) => id);
}

export function formatDaysRemaining(days: number): string {
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month' : `${months} months`;
  }
  const years = Math.floor(days / 365);
  return years === 1 ? '1 year' : `${years} years`;
}

// ============================================================================
// MOCK DATA PROVIDER EXPORT
// ============================================================================

export const mockComplianceProvider = {
  certificates: mockCertificates,
  alerts: mockComplianceAlerts,
  notificationConfig: mockNotificationConfig,
  historicalEvents: mockHistoricalEvents,
  categoryConfig: certificateCategoryConfig,
  getComplianceSummary,
  getComplianceCategories,
  getCertificatesByFilter,
  getAlertsByTimeframe,
  getSchoolComplianceStatus,
  getSchoolsByComplianceSeverity,
  formatDaysRemaining,
};
