// ============================================================================
// MOCK STUDENT FEE OVERRIDES - Mirrors backend student_fee_assignment model
// ============================================================================

import type {
  StudentFeeOverride,
  StudentFeeOverrideCreate,
  StudentFeeOverrideUpdate,
} from '../../services/finance/types';
import { MOCK_STUDENTS, getStudentsByClass } from './mockStudents';
import { MOCK_CLASSES } from './mockClasses';
import { mockFeeComponentsProvider } from './mockFeeComponents';

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

let overrideIdCounter = 3000;

// Generate some sample overrides (opt-outs and amount changes)
function generateInitialOverrides(): StudentFeeOverride[] {
  const overrides: StudentFeeOverride[] = [];

  // About 15% of students have overrides
  const studentsWithOverrides = MOCK_STUDENTS.filter(() => Math.random() < 0.15);

  studentsWithOverrides.forEach((student) => {
    const classInfo = MOCK_CLASSES.find((c) => c.class_id === student.class_id);
    if (!classInfo) return;

    // Randomly assign override types
    const overrideType = Math.random();

    if (overrideType < 0.4) {
      // Transport opt-out (component_id 2, 3, or 4)
      overrides.push({
        override_id: ++overrideIdCounter,
        student_id: student.student_id,
        student_name: student.student_name,
        roll_no: student.roll_no,
        class_id: student.class_id,
        class_name: student.class_name,
        component_id: 2,
        component_name: 'Transport Fee - Zone A',
        original_amount: 8000,
        override_amount: 0,
        is_active: false, // Opted out
        reason: 'Student uses own transport',
        created_at: '2025-04-15T00:00:00Z',
      });
    } else if (overrideType < 0.7) {
      // Sports fee opt-out
      overrides.push({
        override_id: ++overrideIdCounter,
        student_id: student.student_id,
        student_name: student.student_name,
        roll_no: student.roll_no,
        class_id: student.class_id,
        class_name: student.class_name,
        component_id: 8,
        component_name: 'Sports Fee',
        original_amount: 3500,
        override_amount: 0,
        is_active: false,
        reason: 'Medical exemption from sports activities',
        created_at: '2025-04-15T00:00:00Z',
      });
    } else {
      // Partial tuition waiver
      overrides.push({
        override_id: ++overrideIdCounter,
        student_id: student.student_id,
        student_name: student.student_name,
        roll_no: student.roll_no,
        class_id: student.class_id,
        class_name: student.class_name,
        component_id: 1,
        component_name: 'Tuition Fee',
        original_amount: classInfo.grade_level <= 5 ? 35000 : classInfo.grade_level <= 8 ? 45000 : 55000,
        override_amount: classInfo.grade_level <= 5 ? 28000 : classInfo.grade_level <= 8 ? 36000 : 44000,
        is_active: true,
        reason: 'Merit scholarship - 20% tuition waiver',
        created_at: '2025-04-15T00:00:00Z',
      });
    }
  });

  return overrides;
}

let mockOverrides: StudentFeeOverride[] = generateInitialOverrides();

// ============================================================================
// DELAY SIMULATION
// ============================================================================

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getStudentOverrides(
  filters?: { classId?: number; studentId?: number }
): Promise<StudentFeeOverride[]> {
  await simulateDelay();

  let filtered = [...mockOverrides];

  if (filters?.classId) {
    filtered = filtered.filter((o) => o.class_id === filters.classId);
  }
  if (filters?.studentId) {
    filtered = filtered.filter((o) => o.student_id === filters.studentId);
  }

  console.log(`[MOCK OVERRIDES] getOverrides → ${filtered.length} overrides`);
  return filtered;
}

export async function getOverrideById(overrideId: number): Promise<StudentFeeOverride | null> {
  await simulateDelay(100);
  return mockOverrides.find((o) => o.override_id === overrideId) || null;
}

export async function createStudentOverride(
  data: StudentFeeOverrideCreate
): Promise<StudentFeeOverride> {
  await simulateDelay(300);

  // Get student and component info
  const student = MOCK_STUDENTS.find((s) => s.student_id === data.student_id);
  const components = await mockFeeComponentsProvider.getFeeComponents(1);
  const component = components.find((c) => c.component_id === data.component_id);

  if (!student || !component) {
    throw new Error('Student or component not found');
  }

  // Check for existing override
  const existingIndex = mockOverrides.findIndex(
    (o) => o.student_id === data.student_id && o.component_id === data.component_id
  );

  if (existingIndex !== -1) {
    // Update existing override
    mockOverrides[existingIndex] = {
      ...mockOverrides[existingIndex],
      override_amount: data.override_amount,
      is_active: data.is_active,
      reason: data.reason,
      updated_at: new Date().toISOString(),
    };
    return mockOverrides[existingIndex];
  }

  const newOverride: StudentFeeOverride = {
    override_id: ++overrideIdCounter,
    student_id: data.student_id,
    student_name: student.student_name,
    roll_no: student.roll_no,
    class_id: student.class_id,
    class_name: student.class_name,
    component_id: data.component_id,
    component_name: component.name,
    original_amount: component.base_amount,
    override_amount: data.override_amount,
    is_active: data.is_active,
    reason: data.reason,
    created_at: new Date().toISOString(),
  };

  mockOverrides.push(newOverride);
  console.log(
    `[MOCK OVERRIDES] Created override for ${student.student_name} on ${component.name}`
  );
  return newOverride;
}

export async function updateStudentOverride(
  overrideId: number,
  data: StudentFeeOverrideUpdate
): Promise<StudentFeeOverride | null> {
  await simulateDelay(300);

  const index = mockOverrides.findIndex((o) => o.override_id === overrideId);
  if (index === -1) return null;

  mockOverrides[index] = {
    ...mockOverrides[index],
    ...data,
    updated_at: new Date().toISOString(),
  };

  console.log(`[MOCK OVERRIDES] Updated override ID: ${overrideId}`);
  return mockOverrides[index];
}

export async function deleteStudentOverride(overrideId: number): Promise<boolean> {
  await simulateDelay(200);

  const index = mockOverrides.findIndex((o) => o.override_id === overrideId);
  if (index === -1) return false;

  mockOverrides.splice(index, 1);
  console.log(`[MOCK OVERRIDES] Deleted override ID: ${overrideId}`);
  return true;
}

export async function getOverrideSummaryByClass(classId: number): Promise<{
  total_students: number;
  students_with_overrides: number;
  total_override_amount: number;
  opt_outs_count: number;
}> {
  await simulateDelay();

  const classStudents = getStudentsByClass(classId);
  const classOverrides = mockOverrides.filter((o) => o.class_id === classId);

  const studentsWithOverrides = new Set(classOverrides.map((o) => o.student_id)).size;
  const optOuts = classOverrides.filter((o) => !o.is_active).length;
  const totalOverrideAmount = classOverrides
    .filter((o) => o.is_active)
    .reduce((sum, o) => sum + (o.original_amount - o.override_amount), 0);

  return {
    total_students: classStudents.length,
    students_with_overrides: studentsWithOverrides,
    total_override_amount: totalOverrideAmount,
    opt_outs_count: optOuts,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function resetOverrides(): void {
  mockOverrides = generateInitialOverrides();
  overrideIdCounter = 3000;
  console.log('[MOCK OVERRIDES] Reset to initial state');
}

export const mockOverridesProvider = {
  getStudentOverrides,
  getOverrideById,
  createStudentOverride,
  updateStudentOverride,
  deleteStudentOverride,
  getOverrideSummaryByClass,
  resetOverrides,
};
