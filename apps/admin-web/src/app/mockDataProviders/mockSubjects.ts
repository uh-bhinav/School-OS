// ============================================================================
// MOCK SUBJECTS DATA
// ============================================================================
// Comprehensive subject data for the school with OBE metadata
// This extends the existing subject-teacher mapping data

import { Subject, SubjectDetail } from "../services/obe.schema";

// Core subjects available in the school
export const MOCK_SUBJECTS: Subject[] = [
  {
    subject_id: 1,
    school_id: 1,
    subject_name: "Mathematics",
    subject_code: "MATH",
    description: "Core mathematics including algebra, geometry, calculus, and statistics",
    is_included_in_exams: true,
    is_active: true,
    created_at: "2024-04-01T00:00:00Z",
  },
  {
    subject_id: 2,
    school_id: 1,
    subject_name: "Physics",
    subject_code: "PHY",
    description: "Study of matter, energy, and the fundamental forces of nature",
    is_included_in_exams: true,
    is_active: true,
    created_at: "2024-04-01T00:00:00Z",
  },
  {
    subject_id: 3,
    school_id: 1,
    subject_name: "Chemistry",
    subject_code: "CHEM",
    description: "Study of substances, their properties, and reactions",
    is_included_in_exams: true,
    is_active: true,
    created_at: "2024-04-01T00:00:00Z",
  },
  {
    subject_id: 4,
    school_id: 1,
    subject_name: "Biology",
    subject_code: "BIO",
    description: "Study of living organisms and life processes",
    is_included_in_exams: true,
    is_active: true,
    created_at: "2024-04-01T00:00:00Z",
  },
  {
    subject_id: 5,
    school_id: 1,
    subject_name: "English",
    subject_code: "ENG",
    description: "English language, literature, and communication skills",
    is_included_in_exams: true,
    is_active: true,
    created_at: "2024-04-01T00:00:00Z",
  },
  {
    subject_id: 6,
    school_id: 1,
    subject_name: "Hindi",
    subject_code: "HIN",
    description: "Hindi language and literature",
    is_included_in_exams: true,
    is_active: true,
    created_at: "2024-04-01T00:00:00Z",
  },
  {
    subject_id: 7,
    school_id: 1,
    subject_name: "History",
    subject_code: "HIST",
    description: "Study of past events and civilizations",
    is_included_in_exams: true,
    is_active: true,
    created_at: "2024-04-01T00:00:00Z",
  },
  {
    subject_id: 8,
    school_id: 1,
    subject_name: "Geography",
    subject_code: "GEO",
    description: "Study of places, environments, and human-environment interactions",
    is_included_in_exams: true,
    is_active: true,
    created_at: "2024-04-01T00:00:00Z",
  },
  {
    subject_id: 9,
    school_id: 1,
    subject_name: "Computer Science",
    subject_code: "CS",
    description: "Programming, algorithms, and computational thinking",
    is_included_in_exams: true,
    is_active: true,
    created_at: "2024-04-01T00:00:00Z",
  },
  {
    subject_id: 10,
    school_id: 1,
    subject_name: "Physical Education",
    subject_code: "PE",
    description: "Sports, fitness, and health education",
    is_included_in_exams: false, // Practical subject
    is_active: true,
    created_at: "2024-04-01T00:00:00Z",
  },
  {
    subject_id: 11,
    school_id: 1,
    subject_name: "Art & Craft",
    subject_code: "ART",
    description: "Visual arts, drawing, painting, and crafts",
    is_included_in_exams: false, // Practical subject
    is_active: true,
    created_at: "2024-04-01T00:00:00Z",
  },
  {
    subject_id: 12,
    school_id: 1,
    subject_name: "Music",
    subject_code: "MUS",
    description: "Vocal and instrumental music education",
    is_included_in_exams: false, // Practical subject
    is_active: true,
    created_at: "2024-04-01T00:00:00Z",
  },
];

// Subject details with aggregated OBE data
export const MOCK_SUBJECT_DETAILS: SubjectDetail[] = [
  {
    ...MOCK_SUBJECTS[0], // Mathematics
    cos_defined_count: 6,
    cos_approved_count: 5,
    total_classes: 8,
    total_teachers: 3,
    grades_taught: [6, 7, 8, 9, 10, 11, 12],
    classes: [
      { class_id: 1, class_name: "Class 6", section: "A", grade: 6, teacher_id: 101, teacher_name: "Mr. Ramesh Kumar", periods_per_week: 6 },
      { class_id: 2, class_name: "Class 6", section: "B", grade: 6, teacher_id: 101, teacher_name: "Mr. Ramesh Kumar", periods_per_week: 6 },
      { class_id: 3, class_name: "Class 7", section: "A", grade: 7, teacher_id: 102, teacher_name: "Mrs. Priya Sharma", periods_per_week: 6 },
      { class_id: 4, class_name: "Class 8", section: "A", grade: 8, teacher_id: 102, teacher_name: "Mrs. Priya Sharma", periods_per_week: 6 },
      { class_id: 5, class_name: "Class 9", section: "A", grade: 9, teacher_id: 103, teacher_name: "Dr. Suresh Patel", periods_per_week: 7 },
      { class_id: 6, class_name: "Class 10", section: "A", grade: 10, teacher_id: 103, teacher_name: "Dr. Suresh Patel", periods_per_week: 7 },
      { class_id: 7, class_name: "Class 11", section: "A", grade: 11, teacher_id: 103, teacher_name: "Dr. Suresh Patel", periods_per_week: 8 },
      { class_id: 8, class_name: "Class 12", section: "A", grade: 12, teacher_id: 103, teacher_name: "Dr. Suresh Patel", periods_per_week: 8 },
    ],
  },
  {
    ...MOCK_SUBJECTS[1], // Physics
    cos_defined_count: 5,
    cos_approved_count: 5,
    total_classes: 4,
    total_teachers: 2,
    grades_taught: [9, 10, 11, 12],
    classes: [
      { class_id: 5, class_name: "Class 9", section: "A", grade: 9, teacher_id: 104, teacher_name: "Mr. Vikram Singh", periods_per_week: 5 },
      { class_id: 6, class_name: "Class 10", section: "A", grade: 10, teacher_id: 104, teacher_name: "Mr. Vikram Singh", periods_per_week: 5 },
      { class_id: 7, class_name: "Class 11", section: "A", grade: 11, teacher_id: 105, teacher_name: "Dr. Anita Reddy", periods_per_week: 6 },
      { class_id: 8, class_name: "Class 12", section: "A", grade: 12, teacher_id: 105, teacher_name: "Dr. Anita Reddy", periods_per_week: 6 },
    ],
  },
  {
    ...MOCK_SUBJECTS[2], // Chemistry
    cos_defined_count: 4,
    cos_approved_count: 4,
    total_classes: 4,
    total_teachers: 2,
    grades_taught: [9, 10, 11, 12],
    classes: [
      { class_id: 5, class_name: "Class 9", section: "A", grade: 9, teacher_id: 106, teacher_name: "Mrs. Lakshmi Iyer", periods_per_week: 5 },
      { class_id: 6, class_name: "Class 10", section: "A", grade: 10, teacher_id: 106, teacher_name: "Mrs. Lakshmi Iyer", periods_per_week: 5 },
      { class_id: 7, class_name: "Class 11", section: "A", grade: 11, teacher_id: 107, teacher_name: "Mr. Rajesh Gupta", periods_per_week: 6 },
      { class_id: 8, class_name: "Class 12", section: "A", grade: 12, teacher_id: 107, teacher_name: "Mr. Rajesh Gupta", periods_per_week: 6 },
    ],
  },
  {
    ...MOCK_SUBJECTS[3], // Biology
    cos_defined_count: 4,
    cos_approved_count: 3,
    total_classes: 4,
    total_teachers: 1,
    grades_taught: [9, 10, 11, 12],
    classes: [
      { class_id: 5, class_name: "Class 9", section: "A", grade: 9, teacher_id: 108, teacher_name: "Dr. Meera Nair", periods_per_week: 5 },
      { class_id: 6, class_name: "Class 10", section: "A", grade: 10, teacher_id: 108, teacher_name: "Dr. Meera Nair", periods_per_week: 5 },
      { class_id: 7, class_name: "Class 11", section: "A", grade: 11, teacher_id: 108, teacher_name: "Dr. Meera Nair", periods_per_week: 6 },
      { class_id: 8, class_name: "Class 12", section: "A", grade: 12, teacher_id: 108, teacher_name: "Dr. Meera Nair", periods_per_week: 6 },
    ],
  },
  {
    ...MOCK_SUBJECTS[4], // English
    cos_defined_count: 5,
    cos_approved_count: 5,
    total_classes: 10,
    total_teachers: 4,
    grades_taught: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    classes: [
      { class_id: 1, class_name: "Class 6", section: "A", grade: 6, teacher_id: 109, teacher_name: "Ms. Sarah Johnson", periods_per_week: 6 },
      { class_id: 5, class_name: "Class 9", section: "A", grade: 9, teacher_id: 110, teacher_name: "Mr. David Brown", periods_per_week: 5 },
      { class_id: 6, class_name: "Class 10", section: "A", grade: 10, teacher_id: 110, teacher_name: "Mr. David Brown", periods_per_week: 5 },
    ],
  },
  {
    ...MOCK_SUBJECTS[5], // Hindi
    cos_defined_count: 4,
    cos_approved_count: 4,
    total_classes: 8,
    total_teachers: 2,
    grades_taught: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    classes: [
      { class_id: 1, class_name: "Class 6", section: "A", grade: 6, teacher_id: 111, teacher_name: "Mrs. Sunita Verma", periods_per_week: 5 },
      { class_id: 5, class_name: "Class 9", section: "A", grade: 9, teacher_id: 112, teacher_name: "Mr. Anil Mishra", periods_per_week: 4 },
    ],
  },
  {
    ...MOCK_SUBJECTS[6], // History
    cos_defined_count: 3,
    cos_approved_count: 2,
    total_classes: 6,
    total_teachers: 2,
    grades_taught: [6, 7, 8, 9, 10],
    classes: [
      { class_id: 1, class_name: "Class 6", section: "A", grade: 6, teacher_id: 113, teacher_name: "Mr. Prakash Rao", periods_per_week: 3 },
      { class_id: 5, class_name: "Class 9", section: "A", grade: 9, teacher_id: 113, teacher_name: "Mr. Prakash Rao", periods_per_week: 3 },
    ],
  },
  {
    ...MOCK_SUBJECTS[7], // Geography
    cos_defined_count: 3,
    cos_approved_count: 3,
    total_classes: 6,
    total_teachers: 1,
    grades_taught: [6, 7, 8, 9, 10],
    classes: [
      { class_id: 1, class_name: "Class 6", section: "A", grade: 6, teacher_id: 114, teacher_name: "Ms. Kavitha Menon", periods_per_week: 3 },
      { class_id: 5, class_name: "Class 9", section: "A", grade: 9, teacher_id: 114, teacher_name: "Ms. Kavitha Menon", periods_per_week: 3 },
    ],
  },
  {
    ...MOCK_SUBJECTS[8], // Computer Science
    cos_defined_count: 5,
    cos_approved_count: 5,
    total_classes: 6,
    total_teachers: 2,
    grades_taught: [6, 7, 8, 9, 10, 11, 12],
    classes: [
      { class_id: 1, class_name: "Class 6", section: "A", grade: 6, teacher_id: 115, teacher_name: "Mr. Arjun Pillai", periods_per_week: 3 },
      { class_id: 5, class_name: "Class 9", section: "A", grade: 9, teacher_id: 116, teacher_name: "Ms. Deepa Krishnan", periods_per_week: 4 },
      { class_id: 7, class_name: "Class 11", section: "A", grade: 11, teacher_id: 116, teacher_name: "Ms. Deepa Krishnan", periods_per_week: 5 },
    ],
  },
  {
    ...MOCK_SUBJECTS[9], // Physical Education
    cos_defined_count: 0,
    cos_approved_count: 0,
    total_classes: 12,
    total_teachers: 2,
    grades_taught: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    classes: [],
  },
  {
    ...MOCK_SUBJECTS[10], // Art & Craft
    cos_defined_count: 0,
    cos_approved_count: 0,
    total_classes: 8,
    total_teachers: 1,
    grades_taught: [1, 2, 3, 4, 5, 6, 7, 8],
    classes: [],
  },
  {
    ...MOCK_SUBJECTS[11], // Music
    cos_defined_count: 0,
    cos_approved_count: 0,
    total_classes: 8,
    total_teachers: 1,
    grades_taught: [1, 2, 3, 4, 5, 6, 7, 8],
    classes: [],
  },
];

// Helper to get subject by ID
export const getSubjectById = (subjectId: number): Subject | undefined => {
  return MOCK_SUBJECTS.find((s) => s.subject_id === subjectId);
};

// Helper to get subject detail by ID
export const getSubjectDetailById = (subjectId: number): SubjectDetail | undefined => {
  return MOCK_SUBJECT_DETAILS.find((s) => s.subject_id === subjectId);
};

// Helper to get subjects by school
export const getSubjectsBySchool = (schoolId: number): Subject[] => {
  return MOCK_SUBJECTS.filter((s) => s.school_id === schoolId);
};
