// ============================================================================
// MOCK LEAVE MANAGEMENT DATA PROVIDER
// ============================================================================
// Provides realistic mock data for Leave Management and Proxy Assignment
// Used for demo purposes - all operations work with in-memory storage
// ============================================================================

import type { DayOfWeek } from "../services/timetable.schema";
import type {
  LeaveRequest,
  LeaveManagementKPIs,
  LeaveProxyPeriod,
  LeaveProxyAssignment,
  AvailableSubstituteTeacher,
  ApproveLeaveRequest,
  RejectLeaveRequest,
  AssignLeaveProxyRequest,
  AssignLeaveProxyResponse,
  LeaveRequestFilters,
} from "../services/leaveManagement.schema";
import { MOCK_TEACHERS } from "./mockTeachers";

// ============================================================================
// CONSTANTS
// ============================================================================

const PERIOD_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: "08:00", end: "08:45" },
  2: { start: "08:50", end: "09:35" },
  3: { start: "09:40", end: "10:25" },
  4: { start: "10:45", end: "11:30" },
  5: { start: "11:35", end: "12:20" },
  6: { start: "12:25", end: "13:10" },
  7: { start: "14:00", end: "14:45" },
  8: { start: "14:50", end: "15:35" },
};

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

let proxyAssignmentIdCounter = 1000;

// Mock leave requests with realistic data
const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    leaveId: "LV001",
    teacherId: 2,
    teacherName: "Anjali Patel",
    teacherEmail: "anjali.patel@school.com",
    teacherPhone: "+91-9876543211",
    subject: "Mathematics",
    employeeCode: "EMP002",
    fromDate: "2025-11-26",
    toDate: "2025-11-26",
    totalDays: 1,
    leaveType: "SICK",
    reasonSummary: "Severe migraine",
    reasonDescription: "I have been experiencing severe migraine since yesterday evening. Doctor has advised complete bed rest for today. I have attached the medical prescription for your reference.",
    attachmentUrl: "/src/app/public/2tcj87po_doctor-neat-prescription-650_625x300_28_September_22.webp",
    attachmentName: "Medical_Certificate_Anjali.pdf",
    status: "PENDING",
    proxyAssigned: false,
    createdAt: "2025-11-25T20:30:00Z",
    updatedAt: "2025-11-25T20:30:00Z",
  },
  {
    leaveId: "LV002",
    teacherId: 5,
    teacherName: "Amit Gupta",
    teacherEmail: "amit.gupta@school.com",
    teacherPhone: "+91-9876543214",
    subject: "History",
    employeeCode: "EMP005",
    fromDate: "2025-11-27",
    toDate: "2025-11-28",
    totalDays: 2,
    leaveType: "EMERGENCY",
    reasonSummary: "Family emergency",
    reasonDescription: "My father has been hospitalized due to a cardiac issue. I need to be with him at the hospital in Mumbai. I will keep you updated about his condition and my availability.",
    status: "PENDING",
    proxyAssigned: false,
    createdAt: "2025-11-25T18:00:00Z",
    updatedAt: "2025-11-25T18:00:00Z",
  },
  {
    leaveId: "LV003",
    teacherId: 7,
    teacherName: "Fatima Khan",
    teacherEmail: "fatima.khan@school.com",
    teacherPhone: "+91-9876543216",
    subject: "Biology",
    employeeCode: "EMP007",
    fromDate: "2025-11-26",
    toDate: "2025-11-26",
    totalDays: 1,
    leaveType: "CASUAL",
    reasonSummary: "Personal work",
    reasonDescription: "I need to visit the passport office to complete some urgent documentation work. This can only be done during working hours.",
    status: "PENDING",
    proxyAssigned: false,
    createdAt: "2025-11-24T10:00:00Z",
    updatedAt: "2025-11-24T10:00:00Z",
  },
  {
    leaveId: "LV004",
    teacherId: 10,
    teacherName: "Suresh Nair",
    teacherEmail: "suresh.nair@school.com",
    teacherPhone: "+91-9876543219",
    subject: "Physical Education",
    employeeCode: "EMP010",
    fromDate: "2025-11-29",
    toDate: "2025-12-03",
    totalDays: 3,
    leaveType: "NATIONAL_DUTY",
    reasonSummary: "Election duty",
    reasonDescription: "I have been appointed as Presiding Officer for the upcoming municipal elections. This is a mandatory government duty.",
    status: "PENDING",
    proxyAssigned: false,
    createdAt: "2025-11-20T09:00:00Z",
    updatedAt: "2025-11-20T09:00:00Z",
  },
  {
    leaveId: "LV005",
    teacherId: 13,
    teacherName: "Sunita Rao",
    teacherEmail: "sunita.rao@school.com",
    teacherPhone: "+91-9876543222",
    subject: "Computer Science",
    employeeCode: "EMP013",
    fromDate: "2025-12-01",
    toDate: "2025-12-31",
    totalDays: 22,
    leaveType: "MATERNITY",
    reasonSummary: "Maternity leave",
    reasonDescription: "As per the maternity leave policy, I am applying for maternity leave starting from December 1st. My expected delivery date is December 10th. I have coordinated with the department head regarding my ongoing assignments.",
    attachmentUrl: "/src/app/public/2tcj87po_doctor-neat-prescription-650_625x300_28_September_22.webp",
    attachmentName: "Medical_Certificate_Maternity.pdf",
    status: "APPROVED",
    proxyAssigned: true,
    createdAt: "2025-11-15T11:00:00Z",
    updatedAt: "2025-11-18T14:30:00Z",
    approvedBy: "Principal Dr. Sharma",
    approvedAt: "2025-11-18T14:30:00Z",
  },
  {
    leaveId: "LV006",
    teacherId: 1,
    teacherName: "Priya Sharma",
    teacherEmail: "priya.sharma@school.com",
    teacherPhone: "+91-9876543210",
    subject: "English Literature",
    employeeCode: "EMP001",
    fromDate: "2025-11-26",
    toDate: "2025-11-26",
    totalDays: 1,
    leaveType: "SICK",
    reasonSummary: "Fever and cold",
    reasonDescription: "I am suffering from high fever and severe cold since last night. The doctor has advised rest for at least one day. I have attached the prescription.",
    attachmentUrl: "/src/app/public/2tcj87po_doctor-neat-prescription-650_625x300_28_September_22.webp",
    attachmentName: "Prescription_Priya.pdf",
    status: "APPROVED",
    proxyAssigned: false,
    createdAt: "2025-11-25T22:00:00Z",
    updatedAt: "2025-11-26T07:30:00Z",
    approvedBy: "Vice Principal Mr. Reddy",
    approvedAt: "2025-11-26T07:30:00Z",
  },
  {
    leaveId: "LV007",
    teacherId: 8,
    teacherName: "Vikram Desai",
    teacherEmail: "vikram.desai@school.com",
    teacherPhone: "+91-9876543217",
    subject: "Hindi",
    employeeCode: "EMP008",
    fromDate: "2025-11-22",
    toDate: "2025-11-22",
    totalDays: 1,
    leaveType: "CASUAL",
    reasonSummary: "Bank work",
    reasonDescription: "Need to complete some urgent banking formalities that can only be done during bank working hours.",
    status: "APPROVED",
    proxyAssigned: true,
    createdAt: "2025-11-20T16:00:00Z",
    updatedAt: "2025-11-21T09:00:00Z",
    approvedBy: "Principal Dr. Sharma",
    approvedAt: "2025-11-21T09:00:00Z",
  },
  {
    leaveId: "LV008",
    teacherId: 3,
    teacherName: "Rajesh Singh",
    teacherEmail: "rajesh.singh@school.com",
    teacherPhone: "+91-9876543212",
    subject: "Physics",
    employeeCode: "EMP003",
    fromDate: "2025-11-25",
    toDate: "2025-11-25",
    totalDays: 1,
    leaveType: "PERSONAL",
    reasonSummary: "Wedding anniversary",
    reasonDescription: "It's my 10th wedding anniversary and I have planned a surprise trip for my spouse. Request you to kindly approve this leave.",
    status: "REJECTED",
    proxyAssigned: false,
    createdAt: "2025-11-22T14:00:00Z",
    updatedAt: "2025-11-23T10:00:00Z",
    rejectedBy: "Principal Dr. Sharma",
    rejectedAt: "2025-11-23T10:00:00Z",
    rejectionReason: "Important board exam preparation classes scheduled. Please reschedule.",
  },
  {
    leaveId: "LV009",
    teacherId: 15,
    teacherName: "Pooja Kapoor",
    teacherEmail: "pooja.kapoor@school.com",
    teacherPhone: "+91-9876543224",
    subject: "Arts & Crafts",
    employeeCode: "EMP015",
    fromDate: "2025-11-27",
    toDate: "2025-11-27",
    totalDays: 1,
    leaveType: "SCHOOL_EVENT",
    reasonSummary: "Art exhibition",
    reasonDescription: "I have been invited as a judge for the Inter-School Art Exhibition organized by Delhi Public School. This will be a great networking opportunity for our school.",
    status: "PENDING",
    proxyAssigned: false,
    createdAt: "2025-11-23T12:00:00Z",
    updatedAt: "2025-11-23T12:00:00Z",
  },
  {
    leaveId: "LV010",
    teacherId: 11,
    teacherName: "Lakshmi Iyer",
    teacherEmail: "lakshmi.iyer@school.com",
    teacherPhone: "+91-9876543220",
    subject: "Economics",
    employeeCode: "EMP011",
    fromDate: "2025-12-05",
    toDate: "2025-12-06",
    totalDays: 2,
    leaveType: "STUDY",
    reasonSummary: "PhD viva preparation",
    reasonDescription: "My PhD viva is scheduled for December 7th. I need these two days to prepare for the final defense. I have been working on this thesis for the past 4 years.",
    status: "PENDING",
    proxyAssigned: false,
    createdAt: "2025-11-24T15:00:00Z",
    updatedAt: "2025-11-24T15:00:00Z",
  },
  {
    leaveId: "LV011",
    teacherId: 4,
    teacherName: "Kavita Verma",
    teacherEmail: "kavita.verma@school.com",
    teacherPhone: "+91-9876543213",
    subject: "Chemistry",
    employeeCode: "EMP004",
    fromDate: "2025-11-26",
    toDate: "2025-11-27",
    totalDays: 2,
    leaveType: "SICK",
    reasonSummary: "Dental surgery",
    reasonDescription: "I am scheduled for a wisdom tooth extraction surgery tomorrow. The dentist has advised two days rest post-surgery. Medical certificate attached.",
    attachmentUrl: "/src/app/public/2tcj87po_doctor-neat-prescription-650_625x300_28_September_22.webp",
    attachmentName: "Dental_Surgery_Certificate.pdf",
    status: "PENDING",
    proxyAssigned: false,
    createdAt: "2025-11-24T18:00:00Z",
    updatedAt: "2025-11-24T18:00:00Z",
  },
  {
    leaveId: "LV012",
    teacherId: 6,
    teacherName: "Sneha Reddy",
    teacherEmail: "sneha.reddy@school.com",
    teacherPhone: "+91-9876543215",
    subject: "Geography",
    employeeCode: "EMP006",
    fromDate: "2025-11-28",
    toDate: "2025-11-28",
    totalDays: 1,
    leaveType: "BEREAVEMENT",
    reasonSummary: "Funeral attendance",
    reasonDescription: "My uncle passed away yesterday. The funeral is scheduled for November 28th in Hyderabad. I need to be there with my family during this difficult time.",
    status: "PENDING",
    proxyAssigned: false,
    createdAt: "2025-11-25T08:00:00Z",
    updatedAt: "2025-11-25T08:00:00Z",
  },
  {
    leaveId: "LV013",
    teacherId: 16,
    teacherName: "Arun Malik",
    teacherEmail: "arun.malik@school.com",
    teacherPhone: "+91-9876543225",
    subject: "Music",
    employeeCode: "EMP016",
    fromDate: "2025-12-10",
    toDate: "2025-12-12",
    totalDays: 3,
    leaveType: "PERSONAL",
    reasonSummary: "Sister's wedding",
    reasonDescription: "My sister's wedding is on December 11th. I need leave for the pre-wedding ceremonies, wedding day, and reception. This is a family commitment I cannot miss.",
    status: "PENDING",
    proxyAssigned: false,
    createdAt: "2025-11-20T11:00:00Z",
    updatedAt: "2025-11-20T11:00:00Z",
  },
  {
    leaveId: "LV014",
    teacherId: 9,
    teacherName: "Meera Joshi",
    teacherEmail: "meera.joshi@school.com",
    teacherPhone: "+91-9876543218",
    subject: "Sanskrit",
    employeeCode: "EMP009",
    fromDate: "2025-11-21",
    toDate: "2025-11-21",
    totalDays: 1,
    leaveType: "SICK",
    reasonSummary: "Food poisoning",
    reasonDescription: "Severe food poisoning from last night. Unable to travel to school in this condition.",
    status: "APPROVED",
    proxyAssigned: true,
    createdAt: "2025-11-21T06:00:00Z",
    updatedAt: "2025-11-21T07:00:00Z",
    approvedBy: "Vice Principal Mr. Reddy",
    approvedAt: "2025-11-21T07:00:00Z",
  },
  {
    leaveId: "LV015",
    teacherId: 12,
    teacherName: "Ravi Menon",
    teacherEmail: "ravi.menon@school.com",
    teacherPhone: "+91-9876543221",
    subject: "Commerce",
    employeeCode: "EMP012",
    fromDate: "2025-12-15",
    toDate: "2025-12-20",
    totalDays: 5,
    leaveType: "PATERNITY",
    reasonSummary: "Paternity leave",
    reasonDescription: "My wife is expecting and the delivery is scheduled around December 15th. Applying for paternity leave to support my family during this important time.",
    status: "PENDING",
    proxyAssigned: false,
    createdAt: "2025-11-22T09:00:00Z",
    updatedAt: "2025-11-22T09:00:00Z",
  },
  {
    leaveId: "LV016",
    teacherId: 17,
    teacherName: "Divya Pillai",
    teacherEmail: "divya.pillai@school.com",
    teacherPhone: "+91-9876543226",
    subject: "Environmental Science",
    employeeCode: "EMP017",
    fromDate: "2025-11-26",
    toDate: "2025-11-26",
    totalDays: 1,
    leaveType: "SICK",
    reasonSummary: "Back pain",
    reasonDescription: "Experiencing severe lower back pain. Doctor has advised complete bed rest and physiotherapy. Cannot sit for long hours.",
    attachmentUrl: "/src/app/public/2tcj87po_doctor-neat-prescription-650_625x300_28_September_22.webp",
    attachmentName: "Ortho_Prescription.pdf",
    status: "PENDING",
    proxyAssigned: false,
    createdAt: "2025-11-25T21:00:00Z",
    updatedAt: "2025-11-25T21:00:00Z",
  },
  {
    leaveId: "LV017",
    teacherId: 14,
    teacherName: "Manoj Pandey",
    teacherEmail: "manoj.pandey@school.com",
    teacherPhone: "+91-9876543223",
    subject: "Political Science",
    employeeCode: "EMP014",
    fromDate: "2025-11-19",
    toDate: "2025-11-19",
    totalDays: 1,
    leaveType: "CASUAL",
    reasonSummary: "Home repair work",
    reasonDescription: "Major plumbing repair work at home. Need to be present for the contractors.",
    status: "APPROVED",
    proxyAssigned: true,
    createdAt: "2025-11-17T14:00:00Z",
    updatedAt: "2025-11-18T09:00:00Z",
    approvedBy: "Principal Dr. Sharma",
    approvedAt: "2025-11-18T09:00:00Z",
  },
  {
    leaveId: "LV018",
    teacherId: 18,
    teacherName: "Subhash Bose",
    teacherEmail: "subhash.bose@school.com",
    teacherPhone: "+91-9876543227",
    subject: "Sociology",
    employeeCode: "EMP018",
    fromDate: "2025-12-02",
    toDate: "2025-12-02",
    totalDays: 1,
    leaveType: "SCHOOL_EVENT",
    reasonSummary: "Conference presentation",
    reasonDescription: "Selected to present a paper at the National Education Conference in Bangalore. This will enhance the school's reputation in academic circles.",
    status: "PENDING",
    proxyAssigned: false,
    createdAt: "2025-11-23T16:00:00Z",
    updatedAt: "2025-11-23T16:00:00Z",
  },
  {
    leaveId: "LV019",
    teacherId: 19,
    teacherName: "Nandini Das",
    teacherEmail: "nandini.das@school.com",
    teacherPhone: "+91-9876543228",
    subject: "Psychology",
    employeeCode: "EMP019",
    fromDate: "2025-11-26",
    toDate: "2025-11-26",
    totalDays: 1,
    leaveType: "EMERGENCY",
    reasonSummary: "Child unwell",
    reasonDescription: "My 5-year-old has high fever since morning. Need to take her to the pediatrician and stay home to care for her.",
    status: "PENDING",
    proxyAssigned: false,
    createdAt: "2025-11-26T06:30:00Z",
    updatedAt: "2025-11-26T06:30:00Z",
  },
  {
    leaveId: "LV020",
    teacherId: 20,
    teacherName: "Rahul Saxena",
    teacherEmail: "rahul.saxena@school.com",
    teacherPhone: "+91-9876543229",
    subject: "Business Studies",
    employeeCode: "EMP020",
    fromDate: "2025-11-24",
    toDate: "2025-11-24",
    totalDays: 1,
    leaveType: "PERSONAL",
    reasonSummary: "Property registration",
    reasonDescription: "Need to complete property registration at the sub-registrar office. This can only be done on weekdays.",
    status: "REJECTED",
    proxyAssigned: false,
    createdAt: "2025-11-21T10:00:00Z",
    updatedAt: "2025-11-22T11:00:00Z",
    rejectedBy: "Principal Dr. Sharma",
    rejectedAt: "2025-11-22T11:00:00Z",
    rejectionReason: "Mid-term exams scheduled. Please apply for a different date.",
  },
];

// Mock proxy assignments storage
const mockLeaveProxyAssignments: LeaveProxyAssignment[] = [];

// ============================================================================
// TEACHER TIMETABLE DATA
// ============================================================================

// Teacher schedule mapping: which teacher teaches which class at which period
const TEACHER_SCHEDULES: Record<number, Record<DayOfWeek, { period: number; classId: number; section: string; subject: string; subjectId: number }[]>> = {
  1: { // Priya Sharma - English
    MON: [
      { period: 1, classId: 8, section: "A", subject: "English", subjectId: 3 },
      { period: 3, classId: 9, section: "B", subject: "English", subjectId: 3 },
      { period: 5, classId: 10, section: "A", subject: "English", subjectId: 3 },
    ],
    TUE: [
      { period: 2, classId: 8, section: "B", subject: "English", subjectId: 3 },
      { period: 4, classId: 9, section: "A", subject: "English", subjectId: 3 },
      { period: 7, classId: 7, section: "A", subject: "English", subjectId: 3 },
    ],
    WED: [
      { period: 1, classId: 10, section: "B", subject: "English", subjectId: 3 },
      { period: 3, classId: 8, section: "A", subject: "English", subjectId: 3 },
      { period: 6, classId: 9, section: "B", subject: "English", subjectId: 3 },
    ],
    THU: [
      { period: 2, classId: 7, section: "B", subject: "English", subjectId: 3 },
      { period: 4, classId: 8, section: "B", subject: "English", subjectId: 3 },
      { period: 8, classId: 10, section: "A", subject: "English", subjectId: 3 },
    ],
    FRI: [
      { period: 1, classId: 9, section: "A", subject: "English", subjectId: 3 },
      { period: 5, classId: 8, section: "A", subject: "English", subjectId: 3 },
      { period: 7, classId: 10, section: "B", subject: "English", subjectId: 3 },
    ],
    SAT: [],
    SUN: [],
  },
  2: { // Anjali Patel - Mathematics
    MON: [
      { period: 1, classId: 9, section: "A", subject: "Mathematics", subjectId: 1 },
      { period: 3, classId: 8, section: "A", subject: "Mathematics", subjectId: 1 },
      { period: 5, classId: 10, section: "B", subject: "Mathematics", subjectId: 1 },
      { period: 7, classId: 8, section: "B", subject: "Mathematics", subjectId: 1 },
    ],
    TUE: [
      { period: 2, classId: 9, section: "B", subject: "Mathematics", subjectId: 1 },
      { period: 4, classId: 10, section: "A", subject: "Mathematics", subjectId: 1 },
      { period: 6, classId: 8, section: "A", subject: "Mathematics", subjectId: 1 },
    ],
    WED: [
      { period: 1, classId: 8, section: "B", subject: "Mathematics", subjectId: 1 },
      { period: 4, classId: 9, section: "A", subject: "Mathematics", subjectId: 1 },
      { period: 6, classId: 10, section: "B", subject: "Mathematics", subjectId: 1 },
    ],
    THU: [
      { period: 1, classId: 10, section: "A", subject: "Mathematics", subjectId: 1 },
      { period: 3, classId: 8, section: "A", subject: "Mathematics", subjectId: 1 },
      { period: 5, classId: 9, section: "B", subject: "Mathematics", subjectId: 1 },
    ],
    FRI: [
      { period: 2, classId: 8, section: "B", subject: "Mathematics", subjectId: 1 },
      { period: 4, classId: 10, section: "B", subject: "Mathematics", subjectId: 1 },
      { period: 8, classId: 9, section: "A", subject: "Mathematics", subjectId: 1 },
    ],
    SAT: [],
    SUN: [],
  },
  3: { // Rajesh Singh - Physics
    MON: [
      { period: 2, classId: 9, section: "A", subject: "Physics", subjectId: 6 },
      { period: 4, classId: 10, section: "A", subject: "Physics", subjectId: 6 },
      { period: 6, classId: 9, section: "B", subject: "Physics", subjectId: 6 },
    ],
    TUE: [
      { period: 1, classId: 10, section: "B", subject: "Physics", subjectId: 6 },
      { period: 3, classId: 9, section: "B", subject: "Physics", subjectId: 6 },
      { period: 5, classId: 10, section: "A", subject: "Physics", subjectId: 6 },
    ],
    WED: [
      { period: 2, classId: 9, section: "A", subject: "Physics", subjectId: 6 },
      { period: 5, classId: 10, section: "B", subject: "Physics", subjectId: 6 },
      { period: 7, classId: 9, section: "B", subject: "Physics", subjectId: 6 },
    ],
    THU: [
      { period: 2, classId: 10, section: "A", subject: "Physics", subjectId: 6 },
      { period: 6, classId: 9, section: "A", subject: "Physics", subjectId: 6 },
      { period: 8, classId: 10, section: "B", subject: "Physics", subjectId: 6 },
    ],
    FRI: [
      { period: 3, classId: 9, section: "B", subject: "Physics", subjectId: 6 },
      { period: 6, classId: 10, section: "A", subject: "Physics", subjectId: 6 },
      { period: 8, classId: 9, section: "A", subject: "Physics", subjectId: 6 },
    ],
    SAT: [],
    SUN: [],
  },
  4: { // Kavita Verma - Chemistry
    MON: [
      { period: 2, classId: 10, section: "B", subject: "Chemistry", subjectId: 7 },
      { period: 4, classId: 9, section: "B", subject: "Chemistry", subjectId: 7 },
      { period: 8, classId: 10, section: "A", subject: "Chemistry", subjectId: 7 },
    ],
    TUE: [
      { period: 1, classId: 9, section: "A", subject: "Chemistry", subjectId: 7 },
      { period: 5, classId: 10, section: "B", subject: "Chemistry", subjectId: 7 },
      { period: 7, classId: 9, section: "B", subject: "Chemistry", subjectId: 7 },
    ],
    WED: [
      { period: 3, classId: 10, section: "A", subject: "Chemistry", subjectId: 7 },
      { period: 5, classId: 9, section: "A", subject: "Chemistry", subjectId: 7 },
      { period: 8, classId: 10, section: "B", subject: "Chemistry", subjectId: 7 },
    ],
    THU: [
      { period: 1, classId: 9, section: "B", subject: "Chemistry", subjectId: 7 },
      { period: 4, classId: 10, section: "A", subject: "Chemistry", subjectId: 7 },
      { period: 7, classId: 9, section: "A", subject: "Chemistry", subjectId: 7 },
    ],
    FRI: [
      { period: 1, classId: 10, section: "B", subject: "Chemistry", subjectId: 7 },
      { period: 4, classId: 9, section: "A", subject: "Chemistry", subjectId: 7 },
      { period: 6, classId: 9, section: "B", subject: "Chemistry", subjectId: 7 },
    ],
    SAT: [],
    SUN: [],
  },
  5: { // Amit Gupta - History
    MON: [
      { period: 3, classId: 8, section: "B", subject: "History", subjectId: 4 },
      { period: 6, classId: 9, section: "A", subject: "History", subjectId: 4 },
      { period: 8, classId: 7, section: "A", subject: "History", subjectId: 4 },
    ],
    TUE: [
      { period: 2, classId: 7, section: "B", subject: "History", subjectId: 4 },
      { period: 4, classId: 8, section: "A", subject: "History", subjectId: 4 },
      { period: 6, classId: 9, section: "B", subject: "History", subjectId: 4 },
    ],
    WED: [
      { period: 1, classId: 9, section: "A", subject: "History", subjectId: 4 },
      { period: 4, classId: 7, section: "A", subject: "History", subjectId: 4 },
      { period: 7, classId: 8, section: "B", subject: "History", subjectId: 4 },
    ],
    THU: [
      { period: 3, classId: 8, section: "A", subject: "History", subjectId: 4 },
      { period: 5, classId: 7, section: "B", subject: "History", subjectId: 4 },
      { period: 8, classId: 9, section: "A", subject: "History", subjectId: 4 },
    ],
    FRI: [
      { period: 2, classId: 9, section: "B", subject: "History", subjectId: 4 },
      { period: 5, classId: 8, section: "B", subject: "History", subjectId: 4 },
      { period: 7, classId: 7, section: "A", subject: "History", subjectId: 4 },
    ],
    SAT: [],
    SUN: [],
  },
  6: { // Sneha Reddy - Geography
    MON: [
      { period: 4, classId: 8, section: "A", subject: "Geography", subjectId: 4 },
      { period: 6, classId: 7, section: "B", subject: "Geography", subjectId: 4 },
    ],
    TUE: [
      { period: 3, classId: 8, section: "B", subject: "Geography", subjectId: 4 },
      { period: 7, classId: 9, section: "A", subject: "Geography", subjectId: 4 },
    ],
    WED: [
      { period: 2, classId: 7, section: "A", subject: "Geography", subjectId: 4 },
      { period: 6, classId: 8, section: "A", subject: "Geography", subjectId: 4 },
    ],
    THU: [
      { period: 4, classId: 9, section: "B", subject: "Geography", subjectId: 4 },
      { period: 6, classId: 7, section: "B", subject: "Geography", subjectId: 4 },
    ],
    FRI: [
      { period: 3, classId: 8, section: "B", subject: "Geography", subjectId: 4 },
      { period: 6, classId: 7, section: "A", subject: "Geography", subjectId: 4 },
    ],
    SAT: [],
    SUN: [],
  },
  7: { // Fatima Khan - Biology
    MON: [
      { period: 2, classId: 8, section: "A", subject: "Biology", subjectId: 8 },
      { period: 5, classId: 9, section: "B", subject: "Biology", subjectId: 8 },
      { period: 7, classId: 10, section: "A", subject: "Biology", subjectId: 8 },
    ],
    TUE: [
      { period: 1, classId: 8, section: "B", subject: "Biology", subjectId: 8 },
      { period: 4, classId: 9, section: "A", subject: "Biology", subjectId: 8 },
      { period: 8, classId: 10, section: "B", subject: "Biology", subjectId: 8 },
    ],
    WED: [
      { period: 3, classId: 8, section: "A", subject: "Biology", subjectId: 8 },
      { period: 5, classId: 10, section: "A", subject: "Biology", subjectId: 8 },
      { period: 7, classId: 9, section: "A", subject: "Biology", subjectId: 8 },
    ],
    THU: [
      { period: 2, classId: 9, section: "B", subject: "Biology", subjectId: 8 },
      { period: 5, classId: 8, section: "B", subject: "Biology", subjectId: 8 },
      { period: 7, classId: 10, section: "B", subject: "Biology", subjectId: 8 },
    ],
    FRI: [
      { period: 2, classId: 10, section: "A", subject: "Biology", subjectId: 8 },
      { period: 4, classId: 8, section: "A", subject: "Biology", subjectId: 8 },
      { period: 7, classId: 9, section: "B", subject: "Biology", subjectId: 8 },
    ],
    SAT: [],
    SUN: [],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDayFromDate(dateStr: string): DayOfWeek {
  const date = new Date(dateStr);
  const dayIndex = date.getDay();
  const days: DayOfWeek[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return days[dayIndex];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all leave requests with optional filters
 */
export async function getMockLeaveRequests(filters?: LeaveRequestFilters): Promise<LeaveRequest[]> {
  await simulateDelay(300);

  let results = [...MOCK_LEAVE_REQUESTS];

  if (filters?.status) {
    results = results.filter((r) => r.status === filters.status);
  }

  if (filters?.leaveType) {
    results = results.filter((r) => r.leaveType === filters.leaveType);
  }

  if (filters?.teacherId) {
    results = results.filter((r) => r.teacherId === filters.teacherId);
  }

  if (filters?.fromDate) {
    results = results.filter((r) => r.fromDate >= filters.fromDate!);
  }

  if (filters?.toDate) {
    results = results.filter((r) => r.toDate <= filters.toDate!);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    results = results.filter(
      (r) =>
        r.teacherName.toLowerCase().includes(searchLower) ||
        r.subject.toLowerCase().includes(searchLower) ||
        r.reasonSummary.toLowerCase().includes(searchLower)
    );
  }

  // Sort by created date descending
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  console.log(`[MOCK LEAVE] getLeaveRequests → ${results.length} requests`);
  return results;
}

/**
 * Get a single leave request by ID
 */
export async function getMockLeaveRequestById(leaveId: string): Promise<LeaveRequest | null> {
  await simulateDelay(200);

  const request = MOCK_LEAVE_REQUESTS.find((r) => r.leaveId === leaveId);
  console.log(`[MOCK LEAVE] getLeaveRequestById(${leaveId}) → ${request ? "found" : "not found"}`);
  return request || null;
}

/**
 * Get KPIs for leave management
 */
export async function getMockLeaveKPIs(): Promise<LeaveManagementKPIs> {
  await simulateDelay(200);

  const today = new Date().toISOString().split("T")[0];

  const pendingRequests = MOCK_LEAVE_REQUESTS.filter((r) => r.status === "PENDING").length;

  const approvedLeavesToday = MOCK_LEAVE_REQUESTS.filter(
    (r) => r.status === "APPROVED" && r.fromDate <= today && r.toDate >= today
  ).length;

  const teachersAbsentToday = MOCK_LEAVE_REQUESTS.filter(
    (r) => r.status === "APPROVED" && r.fromDate <= today && r.toDate >= today
  ).length;

  const proxyAssignmentsPending = MOCK_LEAVE_REQUESTS.filter(
    (r) => r.status === "APPROVED" && !r.proxyAssigned && r.fromDate <= today && r.toDate >= today
  ).length;

  const kpis: LeaveManagementKPIs = {
    pendingRequests,
    approvedLeavesToday,
    teachersAbsentToday,
    proxyAssignmentsPending,
  };

  console.log(`[MOCK LEAVE] getKPIs →`, kpis);
  return kpis;
}

/**
 * Approve a leave request
 */
export async function approveMockLeave(request: ApproveLeaveRequest): Promise<LeaveRequest> {
  await simulateDelay(300);

  const leaveRequest = MOCK_LEAVE_REQUESTS.find((r) => r.leaveId === request.leaveId);
  if (!leaveRequest) {
    throw new Error(`Leave request ${request.leaveId} not found`);
  }

  leaveRequest.status = "APPROVED";
  leaveRequest.approvedBy = request.approvedBy;
  leaveRequest.approvedAt = new Date().toISOString();
  leaveRequest.updatedAt = new Date().toISOString();

  console.log(`[MOCK LEAVE] approveMockLeave(${request.leaveId}) → approved`);
  return leaveRequest;
}

/**
 * Reject a leave request
 */
export async function rejectMockLeave(request: RejectLeaveRequest): Promise<LeaveRequest> {
  await simulateDelay(300);

  const leaveRequest = MOCK_LEAVE_REQUESTS.find((r) => r.leaveId === request.leaveId);
  if (!leaveRequest) {
    throw new Error(`Leave request ${request.leaveId} not found`);
  }

  leaveRequest.status = "REJECTED";
  leaveRequest.rejectedBy = request.rejectedBy;
  leaveRequest.rejectedAt = new Date().toISOString();
  leaveRequest.rejectionReason = request.rejectionReason;
  leaveRequest.updatedAt = new Date().toISOString();

  console.log(`[MOCK LEAVE] rejectMockLeave(${request.leaveId}) → rejected`);
  return leaveRequest;
}

/**
 * Get teacher's timetable for a specific date (for proxy assignment)
 */
export async function getMockTeacherTimetableForLeave(
  teacherId: number,
  date: string
): Promise<LeaveProxyPeriod[]> {
  await simulateDelay(250);

  const day = getDayFromDate(date);
  const teacherSchedule = TEACHER_SCHEDULES[teacherId]?.[day] || [];

  // Build full period list (8 periods)
  const periods: LeaveProxyPeriod[] = [];

  for (let periodNo = 1; periodNo <= 8; periodNo++) {
    const scheduledClass = teacherSchedule.find((s) => s.period === periodNo);
    const periodTime = PERIOD_TIMES[periodNo];

    // Check if proxy already assigned
    const existingProxy = mockLeaveProxyAssignments.find(
      (a) => a.teacherId === teacherId && a.date === date && a.periodNo === periodNo && a.status === "ACTIVE"
    );

    if (scheduledClass) {
      periods.push({
        periodNo,
        startTime: periodTime.start,
        endTime: periodTime.end,
        classId: scheduledClass.classId,
        section: scheduledClass.section,
        subject: scheduledClass.subject,
        subjectId: scheduledClass.subjectId,
        status: existingProxy ? "ASSIGNED" : "NEEDS_PROXY",
        substituteTeacherId: existingProxy?.substituteTeacherId,
        substituteTeacherName: existingProxy?.substituteTeacherName,
        assignedAt: existingProxy?.createdAt,
      });
    } else {
      periods.push({
        periodNo,
        startTime: periodTime.start,
        endTime: periodTime.end,
        classId: 0,
        section: "",
        subject: "Free Period",
        subjectId: 0,
        status: "FREE",
      });
    }
  }

  console.log(`[MOCK LEAVE] getTeacherTimetableForLeave(${teacherId}, ${date}) → ${periods.filter((p) => p.status === "NEEDS_PROXY").length} periods need proxy`);
  return periods;
}

/**
 * Get available substitute teachers for a specific period
 */
export async function getMockAvailableSubstitutes(
  periodNo: number,
  date: string,
  excludeTeacherId: number
): Promise<AvailableSubstituteTeacher[]> {
  await simulateDelay(250);

  const day = getDayFromDate(date);

  // Find teachers who are free during this period
  const availableTeachers: AvailableSubstituteTeacher[] = [];

  MOCK_TEACHERS.forEach((teacher) => {
    if (teacher.teacher_id === excludeTeacherId) return;
    if (!teacher.is_active) return;

    // Check if teacher has a class during this period
    const teacherSchedule = TEACHER_SCHEDULES[teacher.teacher_id]?.[day] || [];
    const hasClass = teacherSchedule.some((s) => s.period === periodNo);

    // Check if teacher is on leave
    const isOnLeave = MOCK_LEAVE_REQUESTS.some(
      (r) =>
        r.teacherId === teacher.teacher_id &&
        r.status === "APPROVED" &&
        r.fromDate <= date &&
        r.toDate >= date
    );

    if (!isOnLeave) {
      const experienceYears = Math.floor(
        (new Date().getTime() - new Date(teacher.date_of_joining).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );

      availableTeachers.push({
        teacherId: teacher.teacher_id,
        teacherName: `${teacher.first_name} ${teacher.last_name}`,
        employeeCode: teacher.employee_id,
        email: teacher.email,
        phone: teacher.phone,
        qualification: teacher.qualification,
        specialization: teacher.specialization,
        experienceYears,
        primarySubject: teacher.specialization,
        isFreeThisPeriod: !hasClass,
        currentLoad: teacherSchedule.length,
        maxLoad: 6,
      });
    }
  });

  // Sort: free teachers first, then by experience
  availableTeachers.sort((a, b) => {
    if (a.isFreeThisPeriod !== b.isFreeThisPeriod) {
      return a.isFreeThisPeriod ? -1 : 1;
    }
    return b.experienceYears - a.experienceYears;
  });

  console.log(`[MOCK LEAVE] getAvailableSubstitutes(period ${periodNo}, ${date}) → ${availableTeachers.filter((t) => t.isFreeThisPeriod).length} free teachers`);
  return availableTeachers;
}

/**
 * Assign proxy teacher for a leave period
 */
export async function assignMockLeaveProxy(
  request: AssignLeaveProxyRequest
): Promise<AssignLeaveProxyResponse> {
  await simulateDelay(300);

  const leaveRequest = MOCK_LEAVE_REQUESTS.find((r) => r.leaveId === request.leaveId);
  if (!leaveRequest) {
    throw new Error(`Leave request ${request.leaveId} not found`);
  }

  const day = getDayFromDate(request.date);
  const periodTime = PERIOD_TIMES[request.periodNo];
  const teacherSchedule = TEACHER_SCHEDULES[leaveRequest.teacherId]?.[day] || [];
  const scheduledClass = teacherSchedule.find((s) => s.period === request.periodNo);

  if (!scheduledClass) {
    throw new Error("No class scheduled for this period");
  }

  // Create proxy assignment
  const assignmentId = `LPA-${++proxyAssignmentIdCounter}`;
  const newAssignment: LeaveProxyAssignment = {
    assignmentId,
    leaveId: request.leaveId,
    teacherId: leaveRequest.teacherId,
    teacherName: leaveRequest.teacherName,
    date: request.date,
    day,
    periodNo: request.periodNo,
    periodTime: `${periodTime.start}–${periodTime.end}`,
    classId: scheduledClass.classId,
    section: scheduledClass.section,
    subject: scheduledClass.subject,
    subjectId: scheduledClass.subjectId,
    substituteTeacherId: request.substituteTeacherId,
    substituteTeacherName: request.substituteTeacherName,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };

  mockLeaveProxyAssignments.push(newAssignment);

  // Check if all periods for all leave days are assigned
  const allDatesInRange: string[] = [];
  const fromDate = new Date(leaveRequest.fromDate);
  const toDate = new Date(leaveRequest.toDate);
  for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = getDayFromDate(dateStr);
    if (dayOfWeek !== "SAT" && dayOfWeek !== "SUN") {
      allDatesInRange.push(dateStr);
    }
  }

  // Check if all teaching periods have proxies assigned
  let allAssigned = true;
  for (const dateStr of allDatesInRange) {
    const daySchedule = TEACHER_SCHEDULES[leaveRequest.teacherId]?.[getDayFromDate(dateStr)] || [];
    for (const slot of daySchedule) {
      const hasProxy = mockLeaveProxyAssignments.some(
        (a) =>
          a.leaveId === request.leaveId &&
          a.date === dateStr &&
          a.periodNo === slot.period &&
          a.status === "ACTIVE"
      );
      if (!hasProxy) {
        allAssigned = false;
        break;
      }
    }
    if (!allAssigned) break;
  }

  if (allAssigned) {
    leaveRequest.proxyAssigned = true;
    leaveRequest.updatedAt = new Date().toISOString();
  }

  console.log(`[MOCK LEAVE] assignLeaveProxy(${request.leaveId}, period ${request.periodNo}) → ${assignmentId}`);
  return {
    success: true,
    assignmentId,
    message: "Substitute teacher assigned successfully",
  };
}

/**
 * Get all proxy assignments for a leave
 */
export async function getMockLeaveProxyAssignments(leaveId: string): Promise<LeaveProxyAssignment[]> {
  await simulateDelay(200);

  const assignments = mockLeaveProxyAssignments.filter((a) => a.leaveId === leaveId && a.status === "ACTIVE");
  console.log(`[MOCK LEAVE] getLeaveProxyAssignments(${leaveId}) → ${assignments.length} assignments`);
  return assignments;
}

/**
 * Mark leave as fully proxy-assigned
 */
export async function markMockLeaveProxyComplete(leaveId: string): Promise<LeaveRequest> {
  await simulateDelay(200);

  const leaveRequest = MOCK_LEAVE_REQUESTS.find((r) => r.leaveId === leaveId);
  if (!leaveRequest) {
    throw new Error(`Leave request ${leaveId} not found`);
  }

  leaveRequest.proxyAssigned = true;
  leaveRequest.updatedAt = new Date().toISOString();

  console.log(`[MOCK LEAVE] markLeaveProxyComplete(${leaveId}) → marked`);
  return leaveRequest;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const mockLeaveManagementProvider = {
  getLeaveRequests: getMockLeaveRequests,
  getLeaveRequestById: getMockLeaveRequestById,
  getLeaveKPIs: getMockLeaveKPIs,
  approveLeave: approveMockLeave,
  rejectLeave: rejectMockLeave,
  getTeacherTimetableForLeave: getMockTeacherTimetableForLeave,
  getAvailableSubstitutes: getMockAvailableSubstitutes,
  assignLeaveProxy: assignMockLeaveProxy,
  getLeaveProxyAssignments: getMockLeaveProxyAssignments,
  markLeaveProxyComplete: markMockLeaveProxyComplete,
};
