// ============================================================================
// MOCK DISCOUNT RULES & ASSIGNMENTS - Mirrors backend discount models
// ============================================================================

import type {
  DiscountRule,
  DiscountRuleCreate,
  DiscountRuleUpdate,
  StudentDiscountAssignment,
  StudentDiscountAssignmentCreate,
} from '../../services/finance/types';
import { MOCK_STUDENTS } from './mockStudents';

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

let discountIdCounter = 100;
let assignmentIdCounter = 5000;

const INITIAL_DISCOUNT_RULES: DiscountRule[] = [
  {
    rule_id: 1,
    school_id: 1,
    name: 'Sibling Discount',
    description: 'Flat ₹5,000 discount for second and subsequent siblings studying in the school',
    type: 'fixed',
    value: 5000,
    applicable_to: 'sibling',
    conditions: {
      min_siblings: 2,
    },
    is_active: true,
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    rule_id: 2,
    school_id: 1,
    name: 'Staff Child Discount',
    description: '10% discount on total fees for children of school staff members',
    type: 'percentage',
    value: 10,
    applicable_to: 'staff_child',
    is_active: true,
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    rule_id: 3,
    school_id: 1,
    name: 'Merit Scholarship',
    description: '15% scholarship for students scoring above 90% in previous academics',
    type: 'percentage',
    value: 15,
    applicable_to: 'merit',
    conditions: {
      min_percentage: 90,
    },
    is_active: true,
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    rule_id: 4,
    school_id: 1,
    name: 'Single Parent Support',
    description: 'Flat ₹3,000 support for students from single-parent families',
    type: 'fixed',
    value: 3000,
    applicable_to: 'student',
    is_active: true,
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    rule_id: 5,
    school_id: 1,
    name: 'Early Bird Discount',
    description: '₹2,000 off for fee payment before April 30th',
    type: 'fixed',
    value: 2000,
    applicable_to: 'all',
    is_active: true,
    valid_from: '2025-04-01',
    valid_to: '2025-04-30',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    rule_id: 6,
    school_id: 1,
    name: 'Excellence Award',
    description: '20% fee waiver for students representing school at state/national level',
    type: 'percentage',
    value: 20,
    applicable_to: 'merit',
    is_active: true,
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    rule_id: 7,
    school_id: 1,
    name: 'EWS Category',
    description: '25% concession for Economically Weaker Section students',
    type: 'percentage',
    value: 25,
    applicable_to: 'student',
    is_active: true,
    created_at: '2025-04-01T00:00:00Z',
  },
];

// Generate student discount assignments
function generateStudentDiscountAssignments(): StudentDiscountAssignment[] {
  const assignments: StudentDiscountAssignment[] = [];

  // Assign discounts to about 25% of students
  const studentsWithDiscounts = MOCK_STUDENTS.filter(() => Math.random() < 0.25);

  studentsWithDiscounts.forEach((student) => {
    // Randomly pick 1-2 discounts
    const numDiscounts = Math.random() < 0.7 ? 1 : 2;
    const availableDiscounts = [...INITIAL_DISCOUNT_RULES].filter((d) => d.is_active);

    for (let i = 0; i < numDiscounts && availableDiscounts.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableDiscounts.length);
      const discount = availableDiscounts.splice(randomIndex, 1)[0];

      // Calculate discount amount based on type
      // Assuming average fee of 60000 for calculation
      const baseFee = 60000;
      const calculatedDiscount = discount.type === 'percentage'
        ? Math.round((baseFee * discount.value) / 100)
        : discount.value;

      assignments.push({
        assignment_id: ++assignmentIdCounter,
        student_id: student.student_id,
        student_name: student.student_name,
        roll_no: student.roll_no,
        class_id: student.class_id,
        class_name: student.class_name,
        discount_id: discount.rule_id,
        discount_name: discount.name,
        discount_type: discount.type,
        discount_value: discount.value,
        calculated_discount: calculatedDiscount,
        applied_at: '2025-04-15T00:00:00Z',
        is_active: true,
      });
    }
  });

  return assignments;
}

let mockDiscountRules: DiscountRule[] = [...INITIAL_DISCOUNT_RULES];
let mockDiscountAssignments: StudentDiscountAssignment[] = generateStudentDiscountAssignments();

// ============================================================================
// DELAY SIMULATION
// ============================================================================

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// DISCOUNT RULES CRUD
// ============================================================================

export async function getDiscountRules(schoolId: number = 1): Promise<DiscountRule[]> {
  await simulateDelay();
  const rules = mockDiscountRules.filter((r) => r.school_id === schoolId);
  console.log(`[MOCK DISCOUNTS] getDiscountRules → ${rules.length} rules`);
  return rules;
}

export async function getDiscountRuleById(ruleId: number): Promise<DiscountRule | null> {
  await simulateDelay(100);
  return mockDiscountRules.find((r) => r.rule_id === ruleId) || null;
}

export async function createDiscountRule(
  schoolId: number,
  data: DiscountRuleCreate
): Promise<DiscountRule> {
  await simulateDelay(300);

  const newRule: DiscountRule = {
    rule_id: ++discountIdCounter,
    school_id: schoolId,
    name: data.name,
    description: data.description,
    type: data.type,
    value: data.value,
    applicable_to: data.applicable_to,
    conditions: data.conditions,
    is_active: true,
    valid_from: data.valid_from,
    valid_to: data.valid_to,
    created_at: new Date().toISOString(),
  };

  mockDiscountRules.push(newRule);
  console.log(`[MOCK DISCOUNTS] Created discount rule: ${newRule.name} (ID: ${newRule.rule_id})`);
  return newRule;
}

export async function updateDiscountRule(
  ruleId: number,
  data: DiscountRuleUpdate
): Promise<DiscountRule | null> {
  await simulateDelay(300);

  const index = mockDiscountRules.findIndex((r) => r.rule_id === ruleId);
  if (index === -1) return null;

  mockDiscountRules[index] = {
    ...mockDiscountRules[index],
    ...data,
    updated_at: new Date().toISOString(),
  };

  console.log(`[MOCK DISCOUNTS] Updated discount rule ID: ${ruleId}`);
  return mockDiscountRules[index];
}

export async function deleteDiscountRule(ruleId: number): Promise<boolean> {
  await simulateDelay(200);

  const index = mockDiscountRules.findIndex((r) => r.rule_id === ruleId);
  if (index === -1) return false;

  // Soft delete
  mockDiscountRules[index].is_active = false;
  mockDiscountRules[index].updated_at = new Date().toISOString();

  console.log(`[MOCK DISCOUNTS] Deactivated discount rule ID: ${ruleId}`);
  return true;
}

// ============================================================================
// STUDENT DISCOUNT ASSIGNMENTS CRUD
// ============================================================================

export async function getStudentDiscountAssignments(
  filters?: { studentId?: number; classId?: number; discountId?: number }
): Promise<StudentDiscountAssignment[]> {
  await simulateDelay();

  let filtered = [...mockDiscountAssignments];

  if (filters?.studentId) {
    filtered = filtered.filter((a) => a.student_id === filters.studentId);
  }
  if (filters?.classId) {
    filtered = filtered.filter((a) => a.class_id === filters.classId);
  }
  if (filters?.discountId) {
    filtered = filtered.filter((a) => a.discount_id === filters.discountId);
  }

  console.log(`[MOCK DISCOUNTS] getStudentDiscountAssignments → ${filtered.length} assignments`);
  return filtered;
}

export async function assignDiscountToStudent(
  data: StudentDiscountAssignmentCreate
): Promise<StudentDiscountAssignment> {
  await simulateDelay(300);

  // Check for existing assignment
  const exists = mockDiscountAssignments.find(
    (a) => a.student_id === data.student_id && a.discount_id === data.discount_id && a.is_active
  );

  if (exists) {
    throw new Error('This discount is already applied to this student');
  }

  const student = MOCK_STUDENTS.find((s) => s.student_id === data.student_id);
  const discount = mockDiscountRules.find((r) => r.rule_id === data.discount_id);

  if (!student || !discount) {
    throw new Error('Student or discount rule not found');
  }

  // Calculate discount (using base fee of 60000)
  const baseFee = 60000;
  const calculatedDiscount = discount.type === 'percentage'
    ? Math.round((baseFee * discount.value) / 100)
    : discount.value;

  const newAssignment: StudentDiscountAssignment = {
    assignment_id: ++assignmentIdCounter,
    student_id: data.student_id,
    student_name: student.student_name,
    roll_no: student.roll_no,
    class_id: student.class_id,
    class_name: student.class_name,
    discount_id: data.discount_id,
    discount_name: discount.name,
    discount_type: discount.type,
    discount_value: discount.value,
    calculated_discount: calculatedDiscount,
    applied_at: new Date().toISOString(),
    is_active: true,
  };

  mockDiscountAssignments.push(newAssignment);
  console.log(`[MOCK DISCOUNTS] Assigned ${discount.name} to ${student.student_name}`);
  return newAssignment;
}

export async function removeDiscountFromStudent(assignmentId: number): Promise<boolean> {
  await simulateDelay(200);

  const index = mockDiscountAssignments.findIndex((a) => a.assignment_id === assignmentId);
  if (index === -1) return false;

  mockDiscountAssignments[index].is_active = false;
  console.log(`[MOCK DISCOUNTS] Removed discount assignment ID: ${assignmentId}`);
  return true;
}

export async function getDiscountStats(): Promise<{
  total_rules: number;
  active_rules: number;
  students_with_discounts: number;
  total_discount_amount: number;
}> {
  await simulateDelay();

  const activeRules = mockDiscountRules.filter((r) => r.is_active);
  const activeAssignments = mockDiscountAssignments.filter((a) => a.is_active);
  const uniqueStudents = new Set(activeAssignments.map((a) => a.student_id)).size;
  const totalDiscount = activeAssignments.reduce((sum, a) => sum + a.calculated_discount, 0);

  return {
    total_rules: mockDiscountRules.length,
    active_rules: activeRules.length,
    students_with_discounts: uniqueStudents,
    total_discount_amount: totalDiscount,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function resetDiscounts(): void {
  mockDiscountRules = [...INITIAL_DISCOUNT_RULES];
  mockDiscountAssignments = generateStudentDiscountAssignments();
  discountIdCounter = 100;
  assignmentIdCounter = 5000;
  console.log('[MOCK DISCOUNTS] Reset to initial state');
}

export const mockDiscountsProvider = {
  // Rules
  getDiscountRules,
  getDiscountRuleById,
  createDiscountRule,
  updateDiscountRule,
  deleteDiscountRule,
  // Assignments
  getStudentDiscountAssignments,
  assignDiscountToStudent,
  removeDiscountFromStudent,
  // Stats
  getDiscountStats,
  // Utils
  resetDiscounts,
};
