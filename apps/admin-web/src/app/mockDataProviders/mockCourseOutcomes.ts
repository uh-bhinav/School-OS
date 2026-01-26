// ============================================================================
// MOCK COURSE OUTCOMES (CO) DATA
// ============================================================================
// Course Outcomes defined per subject per grade
// These are academically accurate and follow Bloom's taxonomy

import { CourseOutcome } from "../services/obe.schema";

let nextCOId = 100;

// Mathematics COs - Grade 10
const MATH_GRADE_10_COS: CourseOutcome[] = [
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 1,
    subject_name: "Mathematics",
    subject_code: "MATH",
    grade: 10,
    code: "CO1",
    description: "Apply algebraic techniques to solve linear and quadratic equations",
    bloom_level: "Apply",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 1,
    subject_name: "Mathematics",
    subject_code: "MATH",
    grade: 10,
    code: "CO2",
    description: "Analyze geometric properties of circles and construct proofs",
    bloom_level: "Analyze",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 1,
    subject_name: "Mathematics",
    subject_code: "MATH",
    grade: 10,
    code: "CO3",
    description: "Apply trigonometric ratios to solve real-world problems",
    bloom_level: "Apply",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 1,
    subject_name: "Mathematics",
    subject_code: "MATH",
    grade: 10,
    code: "CO4",
    description: "Evaluate statistical data and interpret probability distributions",
    bloom_level: "Evaluate",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 1,
    subject_name: "Mathematics",
    subject_code: "MATH",
    grade: 10,
    code: "CO5",
    description: "Understand and apply coordinate geometry concepts",
    bloom_level: "Apply",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 1,
    subject_name: "Mathematics",
    subject_code: "MATH",
    grade: 10,
    code: "CO6",
    description: "Create mathematical models for arithmetic progressions",
    bloom_level: "Create",
    status: "draft",
    created_at: "2024-06-15T00:00:00Z",
  },
];

// Physics COs - Grade 10
const PHYSICS_GRADE_10_COS: CourseOutcome[] = [
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 2,
    subject_name: "Physics",
    subject_code: "PHY",
    grade: 10,
    code: "CO1",
    description: "Apply Newton's laws of motion to analyze force and acceleration",
    bloom_level: "Apply",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 2,
    subject_name: "Physics",
    subject_code: "PHY",
    grade: 10,
    code: "CO2",
    description: "Understand the principles of work, energy, and power",
    bloom_level: "Understand",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 2,
    subject_name: "Physics",
    subject_code: "PHY",
    grade: 10,
    code: "CO3",
    description: "Analyze light reflection and refraction phenomena",
    bloom_level: "Analyze",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 2,
    subject_name: "Physics",
    subject_code: "PHY",
    grade: 10,
    code: "CO4",
    description: "Apply Ohm's law and Kirchhoff's laws to electrical circuits",
    bloom_level: "Apply",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 2,
    subject_name: "Physics",
    subject_code: "PHY",
    grade: 10,
    code: "CO5",
    description: "Evaluate the effects of magnetic fields on current-carrying conductors",
    bloom_level: "Evaluate",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
];

// Chemistry COs - Grade 10
const CHEMISTRY_GRADE_10_COS: CourseOutcome[] = [
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 3,
    subject_name: "Chemistry",
    subject_code: "CHEM",
    grade: 10,
    code: "CO1",
    description: "Understand chemical reactions and balance chemical equations",
    bloom_level: "Understand",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 3,
    subject_name: "Chemistry",
    subject_code: "CHEM",
    grade: 10,
    code: "CO2",
    description: "Apply the periodic table to predict element properties",
    bloom_level: "Apply",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 3,
    subject_name: "Chemistry",
    subject_code: "CHEM",
    grade: 10,
    code: "CO3",
    description: "Analyze acid-base reactions and pH concepts",
    bloom_level: "Analyze",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 3,
    subject_name: "Chemistry",
    subject_code: "CHEM",
    grade: 10,
    code: "CO4",
    description: "Understand carbon compounds and their properties",
    bloom_level: "Understand",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
];

// Biology COs - Grade 10
const BIOLOGY_GRADE_10_COS: CourseOutcome[] = [
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 4,
    subject_name: "Biology",
    subject_code: "BIO",
    grade: 10,
    code: "CO1",
    description: "Understand life processes including nutrition, respiration, and excretion",
    bloom_level: "Understand",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 4,
    subject_name: "Biology",
    subject_code: "BIO",
    grade: 10,
    code: "CO2",
    description: "Analyze control and coordination mechanisms in living organisms",
    bloom_level: "Analyze",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 4,
    subject_name: "Biology",
    subject_code: "BIO",
    grade: 10,
    code: "CO3",
    description: "Apply knowledge of heredity and evolution to genetic problems",
    bloom_level: "Apply",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 4,
    subject_name: "Biology",
    subject_code: "BIO",
    grade: 10,
    code: "CO4",
    description: "Evaluate environmental issues and conservation strategies",
    bloom_level: "Evaluate",
    status: "draft",
    created_at: "2024-06-15T00:00:00Z",
  },
];

// English COs - Grade 10
const ENGLISH_GRADE_10_COS: CourseOutcome[] = [
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 5,
    subject_name: "English",
    subject_code: "ENG",
    grade: 10,
    code: "CO1",
    description: "Analyze prose and poetry for themes, literary devices, and meaning",
    bloom_level: "Analyze",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 5,
    subject_name: "English",
    subject_code: "ENG",
    grade: 10,
    code: "CO2",
    description: "Apply grammar rules correctly in written and spoken communication",
    bloom_level: "Apply",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 5,
    subject_name: "English",
    subject_code: "ENG",
    grade: 10,
    code: "CO3",
    description: "Create well-structured essays and creative writing pieces",
    bloom_level: "Create",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 5,
    subject_name: "English",
    subject_code: "ENG",
    grade: 10,
    code: "CO4",
    description: "Understand and interpret unseen passages effectively",
    bloom_level: "Understand",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 5,
    subject_name: "English",
    subject_code: "ENG",
    grade: 10,
    code: "CO5",
    description: "Evaluate and respond critically to literary texts",
    bloom_level: "Evaluate",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
];

// Computer Science COs - Grade 10
const CS_GRADE_10_COS: CourseOutcome[] = [
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 9,
    subject_name: "Computer Science",
    subject_code: "CS",
    grade: 10,
    code: "CO1",
    description: "Apply programming concepts to solve computational problems",
    bloom_level: "Apply",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 9,
    subject_name: "Computer Science",
    subject_code: "CS",
    grade: 10,
    code: "CO2",
    description: "Understand data structures and their applications",
    bloom_level: "Understand",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 9,
    subject_name: "Computer Science",
    subject_code: "CS",
    grade: 10,
    code: "CO3",
    description: "Analyze algorithms for efficiency and correctness",
    bloom_level: "Analyze",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 9,
    subject_name: "Computer Science",
    subject_code: "CS",
    grade: 10,
    code: "CO4",
    description: "Create programs using functions, loops, and conditional statements",
    bloom_level: "Create",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: nextCOId++,
    school_id: 1,
    subject_id: 9,
    subject_name: "Computer Science",
    subject_code: "CS",
    grade: 10,
    code: "CO5",
    description: "Understand database concepts and SQL fundamentals",
    bloom_level: "Understand",
    status: "approved",
    created_at: "2024-06-01T00:00:00Z",
  },
];

// Combined all COs
export const MOCK_COURSE_OUTCOMES: CourseOutcome[] = [
  ...MATH_GRADE_10_COS,
  ...PHYSICS_GRADE_10_COS,
  ...CHEMISTRY_GRADE_10_COS,
  ...BIOLOGY_GRADE_10_COS,
  ...ENGLISH_GRADE_10_COS,
  ...CS_GRADE_10_COS,
];

// Mutable store for runtime additions
let courseOutcomesStore = [...MOCK_COURSE_OUTCOMES];

// Helper functions
export const getCOsBySubjectAndGrade = (subjectId: number, grade: number): CourseOutcome[] => {
  return courseOutcomesStore.filter(
    (co) => co.subject_id === subjectId && co.grade === grade
  );
};

export const getApprovedCOsBySubjectAndGrade = (subjectId: number, grade: number): CourseOutcome[] => {
  return courseOutcomesStore.filter(
    (co) => co.subject_id === subjectId && co.grade === grade && co.status === "approved"
  );
};

export const getCOById = (coId: number): CourseOutcome | undefined => {
  return courseOutcomesStore.find((co) => co.id === coId);
};

export const getCOsBySubject = (subjectId: number): CourseOutcome[] => {
  return courseOutcomesStore.filter((co) => co.subject_id === subjectId);
};

export const addCourseOutcome = (co: Omit<CourseOutcome, "id" | "created_at">): CourseOutcome => {
  const newCO: CourseOutcome = {
    ...co,
    id: nextCOId++,
    created_at: new Date().toISOString(),
  };
  courseOutcomesStore.push(newCO);
  return newCO;
};

export const updateCourseOutcome = (coId: number, updates: Partial<CourseOutcome>): CourseOutcome | undefined => {
  const index = courseOutcomesStore.findIndex((co) => co.id === coId);
  if (index !== -1) {
    courseOutcomesStore[index] = {
      ...courseOutcomesStore[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return courseOutcomesStore[index];
  }
  return undefined;
};

export const deleteCourseOutcome = (coId: number): boolean => {
  const index = courseOutcomesStore.findIndex((co) => co.id === coId);
  if (index !== -1) {
    courseOutcomesStore.splice(index, 1);
    return true;
  }
  return false;
};

export const bulkApproveCOs = (coIds: number[]): number => {
  let count = 0;
  coIds.forEach((id) => {
    const co = courseOutcomesStore.find((c) => c.id === id);
    if (co && co.status === "draft") {
      co.status = "approved";
      co.updated_at = new Date().toISOString();
      count++;
    }
  });
  return count;
};

export const resetCourseOutcomesStore = (): void => {
  courseOutcomesStore = [...MOCK_COURSE_OUTCOMES];
};

export const getAllCourseOutcomes = (): CourseOutcome[] => {
  return courseOutcomesStore;
};
