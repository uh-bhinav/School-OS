// ============================================================================
// MOCK PROGRAM OUTCOMES (PO) DATA
// ============================================================================
// School-level learning goals that COs map to
// These represent overarching educational objectives

import { ProgramOutcome } from "../services/obe.schema";

export const MOCK_PROGRAM_OUTCOMES: ProgramOutcome[] = [
  {
    id: 1,
    school_id: 1,
    code: "PO1",
    description: "Apply critical thinking and problem-solving skills to analyze complex situations",
    status: "approved",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    school_id: 1,
    code: "PO2",
    description: "Communicate effectively through written, verbal, and visual means",
    status: "approved",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    school_id: 1,
    code: "PO3",
    description: "Demonstrate ethical values and social responsibility in personal and professional conduct",
    status: "approved",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    school_id: 1,
    code: "PO4",
    description: "Work collaboratively in teams and demonstrate leadership qualities",
    status: "approved",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 5,
    school_id: 1,
    code: "PO5",
    description: "Apply scientific and mathematical reasoning to understand natural phenomena",
    status: "approved",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 6,
    school_id: 1,
    code: "PO6",
    description: "Use technology effectively for learning, communication, and problem-solving",
    status: "approved",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 7,
    school_id: 1,
    code: "PO7",
    description: "Appreciate cultural diversity and demonstrate global awareness",
    status: "approved",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 8,
    school_id: 1,
    code: "PO8",
    description: "Engage in lifelong learning and continuous self-improvement",
    status: "approved",
    created_at: "2024-01-01T00:00:00Z",
  },
];

// Mutable store
let programOutcomesStore = [...MOCK_PROGRAM_OUTCOMES];

export const getProgramOutcomes = (_schoolId: number): ProgramOutcome[] => {
  // Return all POs for demo - in real app would filter by schoolId
  return programOutcomesStore;
};

export const getProgramOutcomeById = (poId: number): ProgramOutcome | undefined => {
  return programOutcomesStore.find((po) => po.id === poId);
};

export const getAllProgramOutcomes = (): ProgramOutcome[] => {
  return programOutcomesStore;
};
