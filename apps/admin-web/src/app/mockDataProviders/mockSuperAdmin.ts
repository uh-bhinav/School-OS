// ============================================================================
// SUPER ADMIN MOCK DATA PROVIDERS
// ============================================================================
// Mock data for Super Admin dashboard - Group Overview
// All data is frontend-only, no backend calls
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface School {
  id: number;
  name: string;
  code: string;
  city: string;
  region: string;
  state: string;
  principal: string;
  totalStudents: number;
  totalStaff: number;
  status: 'healthy' | 'attention' | 'critical';
  healthScore: number;
  avgAttendance: number;
  feeCollectionRate: number;
  tier: 'Premium' | 'Standard' | 'Basic';
  established: number;
  lastAuditDate: string;
  licenseExpiry: string;
  complianceScore: number;
  academicScore: number;
  financialScore: number;
  operationalScore: number;
  contactEmail: string;
  contactPhone: string;
  // Geographic coordinates for map view
  latitude: number;
  longitude: number;
  // Key contacts for inspection view
  principalEmail: string;
  principalPhone: string;
  board: 'CBSE' | 'ICSE' | 'State Board' | 'IB';
}

export interface Region {
  id: string;
  name: string;
  schoolCount: number;
  totalStudents: number;
  avgAttendance: number;
  avgFeeCollection: number;
  manager: string;
  managerEmail: string;
  managerPhone: string;
}

export interface FinancialTrend {
  month: string;
  feeCollection: number;
  expenses: number;
  target: number;
}

export interface Alert {
  id: string;
  type: 'urgent' | 'attention';
  title: string;
  description: string;
  school: string;
  schoolId: number;
  timestamp: string;
  category: 'finance' | 'compliance' | 'operations' | 'academic';
}

export interface InsightCard {
  id: string;
  title: string;
  description: string;
  actionText: string;
  actionRoute: string;
  category: 'finance' | 'compliance' | 'operations' | 'academic' | 'communication';
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

export interface GroupHealthMetrics {
  totalSchools: number;
  totalStudents: number;
  totalStaff: number;
  avgAttendance: number;
  feeCollectionRate: number;
  schoolsNeedingAttention: number;
  healthySchools: number;
  attentionSchools: number;
  criticalSchools: number;
}

// ============================================================================
// MOCK SCHOOLS DATA (20 schools across 4 regions)
// ============================================================================

export const mockSchools: School[] = [
  // South Region (6 schools)
  {
    id: 1,
    name: "Tapasya Vidyanikethan",
    code: "TVPS001",
    city: "Bangalore",
    region: "South",
    state: "Karnataka",
    principal: "Dr. Rajesh Kumar",
    totalStudents: 1250,
    totalStaff: 85,
    status: "healthy",
    healthScore: 92,
    avgAttendance: 94.5,
    feeCollectionRate: 96,
    tier: "Premium",
    established: 2015,
    lastAuditDate: "2025-08-15",
    licenseExpiry: "2026-03-31",
    complianceScore: 98,
    academicScore: 94,
    financialScore: 95,
    operationalScore: 88,
    contactEmail: "admin@tapasya.edu",
    contactPhone: "+91-9876543001",
    latitude: 12.9716,
    longitude: 77.5946,
    principalEmail: "rajesh.kumar@tapasya.edu",
    principalPhone: "+91-9876501001",
    board: "CBSE",
  },
  {
    id: 2,
    name: "Green Valley International",
    code: "GVI002",
    city: "Chennai",
    region: "South",
    state: "Tamil Nadu",
    principal: "Mrs. Lakshmi Iyer",
    totalStudents: 980,
    totalStaff: 72,
    status: "attention",
    healthScore: 76,
    avgAttendance: 88.3,
    feeCollectionRate: 82,
    tier: "Standard",
    established: 2018,
    lastAuditDate: "2025-06-20",
    licenseExpiry: "2025-12-15",
    complianceScore: 78,
    academicScore: 83,
    financialScore: 72,
    operationalScore: 70,
    contactEmail: "admin@greenvalley.edu",
    contactPhone: "+91-9876543002",
    latitude: 13.0827,
    longitude: 80.2707,
    principalEmail: "lakshmi.iyer@greenvalley.edu",
    principalPhone: "+91-9876501002",
    board: "CBSE",
  },
  {
    id: 3,
    name: "Sunrise Academy",
    code: "SRA003",
    city: "Hyderabad",
    region: "South",
    state: "Telangana",
    principal: "Mr. Venkat Rao",
    totalStudents: 1450,
    totalStaff: 95,
    status: "healthy",
    healthScore: 95,
    avgAttendance: 96.1,
    feeCollectionRate: 97,
    tier: "Premium",
    established: 2012,
    lastAuditDate: "2025-09-10",
    licenseExpiry: "2026-06-30",
    complianceScore: 100,
    academicScore: 96,
    financialScore: 97,
    operationalScore: 92,
    contactEmail: "admin@sunrise.edu",
    contactPhone: "+91-9876543003",
    latitude: 17.3850,
    longitude: 78.4867,
    principalEmail: "venkat.rao@sunrise.edu",
    principalPhone: "+91-9876501003",
    board: "ICSE",
  },
  {
    id: 4,
    name: "Kochi Public School",
    code: "KPS004",
    city: "Kochi",
    region: "South",
    state: "Kerala",
    principal: "Dr. Meera Nair",
    totalStudents: 890,
    totalStaff: 62,
    status: "healthy",
    healthScore: 88,
    avgAttendance: 92.4,
    feeCollectionRate: 91,
    tier: "Standard",
    established: 2016,
    lastAuditDate: "2025-07-25",
    licenseExpiry: "2026-01-15",
    complianceScore: 92,
    academicScore: 89,
    financialScore: 88,
    operationalScore: 84,
    contactEmail: "admin@kochips.edu",
    contactPhone: "+91-9876543004",
    latitude: 9.9312,
    longitude: 76.2673,
    principalEmail: "meera.nair@kochips.edu",
    principalPhone: "+91-9876501004",
    board: "State Board",
  },
  {
    id: 5,
    name: "Coimbatore Central",
    code: "CCS005",
    city: "Coimbatore",
    region: "South",
    state: "Tamil Nadu",
    principal: "Mr. Suresh Menon",
    totalStudents: 720,
    totalStaff: 48,
    status: "attention",
    healthScore: 72,
    avgAttendance: 85.2,
    feeCollectionRate: 78,
    tier: "Basic",
    established: 2019,
    lastAuditDate: "2025-05-18",
    licenseExpiry: "2025-11-30",
    complianceScore: 75,
    academicScore: 78,
    financialScore: 70,
    operationalScore: 68,
    contactEmail: "admin@coimbatorecentral.edu",
    contactPhone: "+91-9876543005",
    latitude: 11.0168,
    longitude: 76.9558,
    principalEmail: "suresh.menon@coimbatorecentral.edu",
    principalPhone: "+91-9876501005",
    board: "State Board",
  },
  {
    id: 6,
    name: "Madurai Heritage",
    code: "MHE006",
    city: "Madurai",
    region: "South",
    state: "Tamil Nadu",
    principal: "Mrs. Kamala Devi",
    totalStudents: 650,
    totalStaff: 45,
    status: "healthy",
    healthScore: 84,
    avgAttendance: 91.8,
    feeCollectionRate: 88,
    tier: "Standard",
    established: 2017,
    lastAuditDate: "2025-08-01",
    licenseExpiry: "2026-02-28",
    complianceScore: 88,
    academicScore: 85,
    financialScore: 82,
    operationalScore: 80,
    contactEmail: "admin@maduraiheritage.edu",
    contactPhone: "+91-9876543006",
    latitude: 9.9252,
    longitude: 78.1198,
    principalEmail: "kamala.devi@maduraiheritage.edu",
    principalPhone: "+91-9876501006",
    board: "CBSE",
  },

  // North Region (5 schools)
  {
    id: 7,
    name: "Delhi Modern School",
    code: "DMS007",
    city: "Delhi",
    region: "North",
    state: "Delhi",
    principal: "Mr. Rahul Gupta",
    totalStudents: 1650,
    totalStaff: 112,
    status: "healthy",
    healthScore: 91,
    avgAttendance: 93.8,
    feeCollectionRate: 94,
    tier: "Premium",
    established: 2010,
    lastAuditDate: "2025-09-20",
    licenseExpiry: "2026-05-31",
    complianceScore: 95,
    academicScore: 93,
    financialScore: 92,
    operationalScore: 86,
    contactEmail: "admin@delhimodern.edu",
    contactPhone: "+91-9876543007",
    latitude: 28.6139,
    longitude: 77.2090,
    principalEmail: "rahul.gupta@delhimodern.edu",
    principalPhone: "+91-9876501007",
    board: "CBSE",
  },
  {
    id: 8,
    name: "Bright Future School",
    code: "BFS008",
    city: "Noida",
    region: "North",
    state: "Uttar Pradesh",
    principal: "Mrs. Priya Sharma",
    totalStudents: 890,
    totalStaff: 62,
    status: "critical",
    healthScore: 45,
    avgAttendance: 68.5,
    feeCollectionRate: 55,
    tier: "Basic",
    established: 2019,
    lastAuditDate: "2024-08-10",
    licenseExpiry: "2025-01-31",
    complianceScore: 35,
    academicScore: 52,
    financialScore: 48,
    operationalScore: 42,
    contactEmail: "admin@brightfuture.edu",
    contactPhone: "+91-9876543008",
    latitude: 28.5355,
    longitude: 77.3910,
    principalEmail: "priya.sharma@brightfuture.edu",
    principalPhone: "+91-9876501008",
    board: "CBSE",
  },
  {
    id: 9,
    name: "Jaipur Royal Academy",
    code: "JRA009",
    city: "Jaipur",
    region: "North",
    state: "Rajasthan",
    principal: "Dr. Meera Joshi",
    totalStudents: 1100,
    totalStaff: 78,
    status: "healthy",
    healthScore: 86,
    avgAttendance: 90.2,
    feeCollectionRate: 89,
    tier: "Standard",
    established: 2014,
    lastAuditDate: "2025-07-15",
    licenseExpiry: "2026-04-15",
    complianceScore: 90,
    academicScore: 88,
    financialScore: 85,
    operationalScore: 82,
    contactEmail: "admin@jaipurroyal.edu",
    contactPhone: "+91-9876543009",
    latitude: 26.9124,
    longitude: 75.7873,
    principalEmail: "meera.joshi@jaipurroyal.edu",
    principalPhone: "+91-9876501009",
    board: "CBSE",
  },
  {
    id: 10,
    name: "Lucknow Public School",
    code: "LPS010",
    city: "Lucknow",
    region: "North",
    state: "Uttar Pradesh",
    principal: "Mr. Anil Verma",
    totalStudents: 780,
    totalStaff: 55,
    status: "attention",
    healthScore: 68,
    avgAttendance: 82.4,
    feeCollectionRate: 74,
    tier: "Basic",
    established: 2020,
    lastAuditDate: "2025-04-20",
    licenseExpiry: "2025-10-31",
    complianceScore: 72,
    academicScore: 70,
    financialScore: 65,
    operationalScore: 64,
    contactEmail: "admin@lucknowps.edu",
    contactPhone: "+91-9876543010",
    latitude: 26.8467,
    longitude: 80.9462,
    principalEmail: "anil.verma@lucknowps.edu",
    principalPhone: "+91-9876501010",
    board: "ICSE",
  },
  {
    id: 11,
    name: "Chandigarh Elite",
    code: "CEL011",
    city: "Chandigarh",
    region: "North",
    state: "Chandigarh",
    principal: "Dr. Harmeet Singh",
    totalStudents: 950,
    totalStaff: 68,
    status: "healthy",
    healthScore: 89,
    avgAttendance: 92.6,
    feeCollectionRate: 92,
    tier: "Premium",
    established: 2013,
    lastAuditDate: "2025-08-25",
    licenseExpiry: "2026-07-31",
    complianceScore: 94,
    academicScore: 91,
    financialScore: 90,
    operationalScore: 85,
    contactEmail: "admin@chandigarhelite.edu",
    contactPhone: "+91-9876543011",
    latitude: 30.7333,
    longitude: 76.7794,
    principalEmail: "harmeet.singh@chandigarhelite.edu",
    principalPhone: "+91-9876501011",
    board: "CBSE",
  },

  // West Region (5 schools)
  {
    id: 12,
    name: "Little Stars School",
    code: "LSS012",
    city: "Mumbai",
    region: "West",
    state: "Maharashtra",
    principal: "Mrs. Priya Desai",
    totalStudents: 650,
    totalStaff: 48,
    status: "critical",
    healthScore: 52,
    avgAttendance: 72.8,
    feeCollectionRate: 62,
    tier: "Basic",
    established: 2020,
    lastAuditDate: "2024-11-30",
    licenseExpiry: "2025-02-28",
    complianceScore: 45,
    academicScore: 58,
    financialScore: 55,
    operationalScore: 48,
    contactEmail: "admin@littlestars.edu",
    contactPhone: "+91-9876543012",
    latitude: 19.0760,
    longitude: 72.8777,
    principalEmail: "priya.desai@littlestars.edu",
    principalPhone: "+91-9876501012",
    board: "State Board",
  },
  {
    id: 13,
    name: "Knowledge Hub Academy",
    code: "KHA013",
    city: "Pune",
    region: "West",
    state: "Maharashtra",
    principal: "Dr. Amit Sharma",
    totalStudents: 1100,
    totalStaff: 78,
    status: "healthy",
    healthScore: 84,
    avgAttendance: 89.5,
    feeCollectionRate: 90,
    tier: "Standard",
    established: 2016,
    lastAuditDate: "2025-07-25",
    licenseExpiry: "2026-01-15",
    complianceScore: 88,
    academicScore: 86,
    financialScore: 85,
    operationalScore: 82,
    contactEmail: "admin@knowledgehub.edu",
    contactPhone: "+91-9876543013",
    latitude: 18.5204,
    longitude: 73.8567,
    principalEmail: "amit.sharma@knowledgehub.edu",
    principalPhone: "+91-9876501013",
    board: "CBSE",
  },
  {
    id: 14,
    name: "Ahmedabad International",
    code: "AIS014",
    city: "Ahmedabad",
    region: "West",
    state: "Gujarat",
    principal: "Mr. Vikram Patel",
    totalStudents: 1320,
    totalStaff: 88,
    status: "healthy",
    healthScore: 90,
    avgAttendance: 93.2,
    feeCollectionRate: 93,
    tier: "Premium",
    established: 2011,
    lastAuditDate: "2025-09-05",
    licenseExpiry: "2026-08-31",
    complianceScore: 96,
    academicScore: 92,
    financialScore: 91,
    operationalScore: 85,
    contactEmail: "admin@ahmedabadint.edu",
    contactPhone: "+91-9876543014",
    latitude: 23.0225,
    longitude: 72.5714,
    principalEmail: "vikram.patel@ahmedabadint.edu",
    principalPhone: "+91-9876501014",
    board: "IB",
  },
  {
    id: 15,
    name: "Surat Progressive",
    code: "SPR015",
    city: "Surat",
    region: "West",
    state: "Gujarat",
    principal: "Mrs. Rekha Shah",
    totalStudents: 780,
    totalStaff: 54,
    status: "healthy",
    healthScore: 82,
    avgAttendance: 88.9,
    feeCollectionRate: 86,
    tier: "Standard",
    established: 2018,
    lastAuditDate: "2025-06-15",
    licenseExpiry: "2026-03-15",
    complianceScore: 85,
    academicScore: 84,
    financialScore: 82,
    operationalScore: 78,
    contactEmail: "admin@suratprog.edu",
    contactPhone: "+91-9876543015",
    latitude: 21.1702,
    longitude: 72.8311,
    principalEmail: "rekha.shah@suratprog.edu",
    principalPhone: "+91-9876501015",
    board: "CBSE",
  },
  {
    id: 16,
    name: "Goa Central Academy",
    code: "GCA016",
    city: "Panaji",
    region: "West",
    state: "Goa",
    principal: "Mr. Antonio Fernandes",
    totalStudents: 520,
    totalStaff: 38,
    status: "attention",
    healthScore: 74,
    avgAttendance: 86.4,
    feeCollectionRate: 79,
    tier: "Basic",
    established: 2021,
    lastAuditDate: "2025-05-10",
    licenseExpiry: "2025-12-31",
    complianceScore: 76,
    academicScore: 78,
    financialScore: 72,
    operationalScore: 70,
    contactEmail: "admin@goacentral.edu",
    contactPhone: "+91-9876543016",
    latitude: 15.4909,
    longitude: 73.8278,
    principalEmail: "antonio.fernandes@goacentral.edu",
    principalPhone: "+91-9876501016",
    board: "ICSE",
  },

  // East Region (4 schools)
  {
    id: 17,
    name: "Excel International",
    code: "EXI017",
    city: "Kolkata",
    region: "East",
    state: "West Bengal",
    principal: "Mrs. Anjali Sen",
    totalStudents: 1320,
    totalStaff: 88,
    status: "healthy",
    healthScore: 93,
    avgAttendance: 95.8,
    feeCollectionRate: 95,
    tier: "Premium",
    established: 2014,
    lastAuditDate: "2025-10-05",
    licenseExpiry: "2026-09-30",
    complianceScore: 98,
    academicScore: 95,
    financialScore: 96,
    operationalScore: 90,
    contactEmail: "admin@excelint.edu",
    contactPhone: "+91-9876543017",
    latitude: 22.5726,
    longitude: 88.3639,
    principalEmail: "anjali.sen@excelint.edu",
    principalPhone: "+91-9876501017",
    board: "ICSE",
  },
  {
    id: 18,
    name: "Bhubaneswar Academy",
    code: "BBA018",
    city: "Bhubaneswar",
    region: "East",
    state: "Odisha",
    principal: "Dr. Sanjay Mohanty",
    totalStudents: 680,
    totalStaff: 46,
    status: "healthy",
    healthScore: 81,
    avgAttendance: 89.2,
    feeCollectionRate: 85,
    tier: "Standard",
    established: 2017,
    lastAuditDate: "2025-06-28",
    licenseExpiry: "2026-02-15",
    complianceScore: 84,
    academicScore: 82,
    financialScore: 80,
    operationalScore: 78,
    contactEmail: "admin@bhubaneswaracad.edu",
    contactPhone: "+91-9876543018",
    latitude: 20.2961,
    longitude: 85.8245,
    principalEmail: "sanjay.mohanty@bhubaneswaracad.edu",
    principalPhone: "+91-9876501018",
    board: "CBSE",
  },
  {
    id: 19,
    name: "Patna Model School",
    code: "PMS019",
    city: "Patna",
    region: "East",
    state: "Bihar",
    principal: "Mr. Rajiv Kumar",
    totalStudents: 920,
    totalStaff: 64,
    status: "attention",
    healthScore: 70,
    avgAttendance: 84.5,
    feeCollectionRate: 76,
    tier: "Basic",
    established: 2019,
    lastAuditDate: "2025-04-15",
    licenseExpiry: "2025-09-30",
    complianceScore: 74,
    academicScore: 72,
    financialScore: 68,
    operationalScore: 66,
    contactEmail: "admin@patnamodel.edu",
    contactPhone: "+91-9876543019",
    latitude: 25.5941,
    longitude: 85.1376,
    principalEmail: "rajiv.kumar@patnamodel.edu",
    principalPhone: "+91-9876501019",
    board: "State Board",
  },
  {
    id: 20,
    name: "Guwahati Progressive",
    code: "GPS020",
    city: "Guwahati",
    region: "East",
    state: "Assam",
    principal: "Mrs. Ranjita Bora",
    totalStudents: 550,
    totalStaff: 40,
    status: "healthy",
    healthScore: 79,
    avgAttendance: 87.8,
    feeCollectionRate: 83,
    tier: "Standard",
    established: 2018,
    lastAuditDate: "2025-07-10",
    licenseExpiry: "2026-04-30",
    complianceScore: 82,
    academicScore: 80,
    financialScore: 78,
    operationalScore: 76,
    contactEmail: "admin@guwahatiprog.edu",
    contactPhone: "+91-9876543020",
    latitude: 26.1445,
    longitude: 91.7362,
    principalEmail: "ranjita.bora@guwahatiprog.edu",
    principalPhone: "+91-9876501020",
    board: "State Board",
  },
];

// ============================================================================
// MOCK REGIONS DATA
// ============================================================================

export const mockRegions: Region[] = [
  {
    id: "south",
    name: "South",
    schoolCount: 6,
    totalStudents: 5940,
    avgAttendance: 91.4,
    avgFeeCollection: 88.7,
    manager: "Mr. Venkatesh Rao",
    managerEmail: "venkatesh.rao@tapasyagroup.edu",
    managerPhone: "+91-9900543001",
  },
  {
    id: "north",
    name: "North",
    schoolCount: 5,
    totalStudents: 5370,
    avgAttendance: 85.5,
    avgFeeCollection: 80.8,
    manager: "Mrs. Sunita Kapoor",
    managerEmail: "sunita.kapoor@tapasyagroup.edu",
    managerPhone: "+91-9900543002",
  },
  {
    id: "west",
    name: "West",
    schoolCount: 5,
    totalStudents: 4370,
    avgAttendance: 86.2,
    avgFeeCollection: 82.0,
    manager: "Mr. Nikhil Deshmukh",
    managerEmail: "nikhil.deshmukh@tapasyagroup.edu",
    managerPhone: "+91-9900543003",
  },
  {
    id: "east",
    name: "East",
    schoolCount: 4,
    totalStudents: 3470,
    avgAttendance: 89.3,
    avgFeeCollection: 84.8,
    manager: "Dr. Amit Roy",
    managerEmail: "amit.roy@tapasyagroup.edu",
    managerPhone: "+91-9900543004",
  },
];

// ============================================================================
// MOCK FINANCIAL TRENDS (Last 12 months)
// ============================================================================

export const mockFinancialTrends: FinancialTrend[] = [
  { month: "Jan", feeCollection: 42500000, expenses: 38200000, target: 45000000 },
  { month: "Feb", feeCollection: 38900000, expenses: 36800000, target: 42000000 },
  { month: "Mar", feeCollection: 51200000, expenses: 42500000, target: 50000000 },
  { month: "Apr", feeCollection: 68500000, expenses: 45800000, target: 65000000 },
  { month: "May", feeCollection: 45200000, expenses: 41200000, target: 48000000 },
  { month: "Jun", feeCollection: 32800000, expenses: 38500000, target: 35000000 },
  { month: "Jul", feeCollection: 55600000, expenses: 44200000, target: 52000000 },
  { month: "Aug", feeCollection: 48900000, expenses: 43800000, target: 50000000 },
  { month: "Sep", feeCollection: 52300000, expenses: 45200000, target: 55000000 },
  { month: "Oct", feeCollection: 58700000, expenses: 47500000, target: 58000000 },
  { month: "Nov", feeCollection: 61200000, expenses: 48900000, target: 60000000 },
  { month: "Dec", feeCollection: 64500000, expenses: 51200000, target: 62000000 },
];

// ============================================================================
// MOCK ALERTS
// ============================================================================

export const mockAlerts: Alert[] = [
  {
    id: "alert-001",
    type: "urgent",
    title: "License Expired",
    description: "Operating license has expired. Immediate renewal required.",
    school: "Bright Future School",
    schoolId: 8,
    timestamp: "2025-12-29T08:30:00Z",
    category: "compliance",
  },
  {
    id: "alert-002",
    type: "urgent",
    title: "Critical Fee Default",
    description: "Fee collection below 60%. Cash flow at risk.",
    school: "Bright Future School",
    schoolId: 8,
    timestamp: "2025-12-29T07:45:00Z",
    category: "finance",
  },
  {
    id: "alert-003",
    type: "urgent",
    title: "License Expiring Soon",
    description: "Operating license expires in 60 days. Initiate renewal.",
    school: "Little Stars School",
    schoolId: 12,
    timestamp: "2025-12-28T16:20:00Z",
    category: "compliance",
  },
  {
    id: "alert-004",
    type: "attention",
    title: "Low Attendance Trend",
    description: "Attendance dropped below 75% this week. Investigate causes.",
    school: "Little Stars School",
    schoolId: 12,
    timestamp: "2025-12-28T14:15:00Z",
    category: "academic",
  },
  {
    id: "alert-005",
    type: "attention",
    title: "Fee Collection Declining",
    description: "Fee collection rate dropped 8% month-over-month.",
    school: "Lucknow Public School",
    schoolId: 10,
    timestamp: "2025-12-28T11:30:00Z",
    category: "finance",
  },
  {
    id: "alert-006",
    type: "attention",
    title: "Audit Overdue",
    description: "Annual compliance audit is 45 days overdue.",
    school: "Bright Future School",
    schoolId: 8,
    timestamp: "2025-12-27T09:00:00Z",
    category: "compliance",
  },
  {
    id: "alert-007",
    type: "attention",
    title: "Staff Shortage",
    description: "Teacher-to-student ratio exceeds recommended limits.",
    school: "Coimbatore Central",
    schoolId: 5,
    timestamp: "2025-12-27T15:45:00Z",
    category: "operations",
  },
  {
    id: "alert-008",
    type: "attention",
    title: "License Expiring",
    description: "Operating license expires in 90 days.",
    school: "Goa Central Academy",
    schoolId: 16,
    timestamp: "2025-12-26T10:20:00Z",
    category: "compliance",
  },
  {
    id: "alert-009",
    type: "attention",
    title: "Low Parent Engagement",
    description: "Parent app adoption below 70%. Communication effectiveness at risk.",
    school: "Patna Model School",
    schoolId: 19,
    timestamp: "2025-12-26T08:30:00Z",
    category: "operations",
  },
  {
    id: "alert-010",
    type: "urgent",
    title: "Safety Compliance Issue",
    description: "Fire safety certificate expired. Immediate action required.",
    school: "Bright Future School",
    schoolId: 8,
    timestamp: "2025-12-25T14:00:00Z",
    category: "compliance",
  },
];

// ============================================================================
// MOCK INSIGHTS
// ============================================================================

export const mockInsights: InsightCard[] = [
  {
    id: "insight-001",
    title: "Consider reviewing fee collection at North region",
    description: "North region has the lowest average fee collection (80.8%). 3 schools below 85% threshold.",
    actionText: "View Region Details",
    actionRoute: "/schools?region=north",
    category: "finance",
    priority: "high",
    icon: "💰",
  },
  {
    id: "insight-002",
    title: "2 schools require immediate compliance action",
    description: "Bright Future School and Little Stars School have expired or expiring licenses within 90 days.",
    actionText: "View Compliance Issues",
    actionRoute: "/compliance-risk",
    category: "compliance",
    priority: "high",
    icon: "⚠️",
  },
  {
    id: "insight-003",
    title: "South region leads in performance",
    description: "South region maintains highest average attendance (91.4%) and fee collection (88.7%). Consider replicating best practices.",
    actionText: "View South Region",
    actionRoute: "/schools?region=south",
    category: "academic",
    priority: "medium",
    icon: "🏆",
  },
  {
    id: "insight-004",
    title: "3 schools showing declining attendance trends",
    description: "Bright Future, Little Stars, and Lucknow Public have attendance below 85%. Recommend intervention.",
    actionText: "View Attendance Report",
    actionRoute: "/academics/attendance",
    category: "academic",
    priority: "high",
    icon: "📉",
  },
  {
    id: "insight-005",
    title: "Parent communication needs improvement in East",
    description: "East region has lowest parent app adoption. Consider awareness campaigns.",
    actionText: "View Communication Stats",
    actionRoute: "/communication",
    category: "communication",
    priority: "medium",
    icon: "📱",
  },
  {
    id: "insight-006",
    title: "Premium tier schools exceeding targets",
    description: "All 5 Premium tier schools are meeting or exceeding financial and academic targets.",
    actionText: "View Premium Schools",
    actionRoute: "/schools?tier=premium",
    category: "operations",
    priority: "low",
    icon: "✅",
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getGroupHealthMetrics(): GroupHealthMetrics {
  const totalSchools = mockSchools.length;
  const totalStudents = mockSchools.reduce((sum, s) => sum + s.totalStudents, 0);
  const totalStaff = mockSchools.reduce((sum, s) => sum + s.totalStaff, 0);
  const avgAttendance = mockSchools.reduce((sum, s) => sum + s.avgAttendance, 0) / totalSchools;
  const feeCollectionRate = mockSchools.reduce((sum, s) => sum + s.feeCollectionRate, 0) / totalSchools;
  const healthySchools = mockSchools.filter((s) => s.status === "healthy").length;
  const attentionSchools = mockSchools.filter((s) => s.status === "attention").length;
  const criticalSchools = mockSchools.filter((s) => s.status === "critical").length;

  return {
    totalSchools,
    totalStudents,
    totalStaff,
    avgAttendance: Math.round(avgAttendance * 10) / 10,
    feeCollectionRate: Math.round(feeCollectionRate * 10) / 10,
    schoolsNeedingAttention: attentionSchools + criticalSchools,
    healthySchools,
    attentionSchools,
    criticalSchools,
  };
}

export function getSchoolById(id: number): School | undefined {
  return mockSchools.find((s) => s.id === id);
}

export function getSchoolsByRegion(region: string): School[] {
  return mockSchools.filter((s) => s.region.toLowerCase() === region.toLowerCase());
}

export function getSchoolsByStatus(status: School["status"]): School[] {
  return mockSchools.filter((s) => s.status === status);
}

export function getUrgentAlerts(): Alert[] {
  return mockAlerts.filter((a) => a.type === "urgent");
}

export function getAttentionAlerts(): Alert[] {
  return mockAlerts.filter((a) => a.type === "attention");
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function getRegionByName(regionName: string): Region | undefined {
  return mockRegions.find((r) => r.name.toLowerCase() === regionName.toLowerCase());
}

// ============================================================================
// MOCK DATA PROVIDER EXPORT
// ============================================================================

export const mockSuperAdminProvider = {
  schools: mockSchools,
  regions: mockRegions,
  financialTrends: mockFinancialTrends,
  alerts: mockAlerts,
  insights: mockInsights,
  getGroupHealthMetrics,
  getSchoolById,
  getSchoolsByRegion,
  getSchoolsByStatus,
  getUrgentAlerts,
  getAttentionAlerts,
  formatCurrency,
  formatNumber,
  getRegionByName,
};
