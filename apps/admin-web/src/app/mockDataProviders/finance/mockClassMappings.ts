// ============================================================================
// MOCK CLASS-TEMPLATE MAPPINGS - Mirrors backend class_fee_structure model
// ============================================================================

import type {
  ClassTemplateMapping,
  ClassTemplateMappingCreate,
} from '../../services/finance/types';
import { MOCK_CLASSES } from './mockClasses';
import { mockFeeTemplatesProvider } from './mockFeeTemplates';

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

let mappingIdCounter = 500;

// Generate initial mappings based on grade levels
function generateInitialMappings(): ClassTemplateMapping[] {
  const mappings: ClassTemplateMapping[] = [];

  MOCK_CLASSES.forEach((classInfo) => {
    let templateId: number;
    let templateName: string;
    let totalAmount: number;

    // Assign templates based on grade level
    if (classInfo.grade_level >= 1 && classInfo.grade_level <= 5) {
      templateId = 1; // Primary Classes template
      templateName = 'Primary Classes (1-5) - Annual Fee';
      totalAmount = 49000;
    } else if (classInfo.grade_level >= 6 && classInfo.grade_level <= 8) {
      templateId = 2; // Middle School template
      templateName = 'Middle School (6-8) - Annual Fee';
      totalAmount = 69500;
    } else {
      templateId = 3; // Secondary Classes template
      templateName = 'Secondary Classes (9-10) - Annual Fee';
      totalAmount = 84500;
    }

    mappings.push({
      mapping_id: ++mappingIdCounter,
      class_id: classInfo.class_id,
      class_name: classInfo.class_name,
      grade_level: classInfo.grade_level,
      section: classInfo.section,
      template_id: templateId,
      template_name: templateName,
      academic_year_id: 1,
      total_amount: totalAmount,
      student_count: classInfo.student_count,
      assigned_date: '2025-04-01',
    });
  });

  return mappings;
}

let mockClassMappings: ClassTemplateMapping[] = generateInitialMappings();

// ============================================================================
// DELAY SIMULATION
// ============================================================================

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getClassTemplateMappings(
  academicYearId: number = 1
): Promise<ClassTemplateMapping[]> {
  await simulateDelay();
  const mappings = mockClassMappings.filter((m) => m.academic_year_id === academicYearId);
  console.log(`[MOCK CLASS MAPPINGS] getMappings → ${mappings.length} mappings`);
  return mappings;
}

export async function getMappingsByClass(classId: number): Promise<ClassTemplateMapping[]> {
  await simulateDelay(100);
  return mockClassMappings.filter((m) => m.class_id === classId);
}

export async function getMappingsByTemplate(templateId: number): Promise<ClassTemplateMapping[]> {
  await simulateDelay(100);
  return mockClassMappings.filter((m) => m.template_id === templateId);
}

export async function createClassTemplateMapping(
  data: ClassTemplateMappingCreate
): Promise<ClassTemplateMapping> {
  await simulateDelay(300);

  // Check if mapping already exists
  const existingIndex = mockClassMappings.findIndex(
    (m) =>
      m.class_id === data.class_id &&
      m.template_id === data.template_id &&
      m.academic_year_id === data.academic_year_id
  );

  if (existingIndex !== -1) {
    // Return existing mapping
    return mockClassMappings[existingIndex];
  }

  // Get class and template info
  const classInfo = MOCK_CLASSES.find((c) => c.class_id === data.class_id);
  const template = await mockFeeTemplatesProvider.getFeeTemplateById(data.template_id);

  if (!classInfo || !template) {
    throw new Error('Class or template not found');
  }

  const newMapping: ClassTemplateMapping = {
    mapping_id: ++mappingIdCounter,
    class_id: data.class_id,
    class_name: classInfo.class_name,
    grade_level: classInfo.grade_level,
    section: classInfo.section,
    template_id: data.template_id,
    template_name: template.name,
    academic_year_id: data.academic_year_id,
    total_amount: template.total_amount,
    student_count: classInfo.student_count,
    assigned_date: new Date().toISOString().split('T')[0],
  };

  mockClassMappings.push(newMapping);
  console.log(
    `[MOCK CLASS MAPPINGS] Created mapping: Class ${classInfo.class_name} → ${template.name}`
  );
  return newMapping;
}

export async function deleteClassTemplateMapping(mappingId: number): Promise<boolean> {
  await simulateDelay(200);

  const index = mockClassMappings.findIndex((m) => m.mapping_id === mappingId);
  if (index === -1) return false;

  mockClassMappings.splice(index, 1);
  console.log(`[MOCK CLASS MAPPINGS] Deleted mapping ID: ${mappingId}`);
  return true;
}

export async function bulkAssignTemplate(
  classIds: number[],
  templateId: number,
  academicYearId: number
): Promise<ClassTemplateMapping[]> {
  await simulateDelay(500);

  const results: ClassTemplateMapping[] = [];

  for (const classId of classIds) {
    const mapping = await createClassTemplateMapping({
      class_id: classId,
      template_id: templateId,
      academic_year_id: academicYearId,
    });
    results.push(mapping);
  }

  console.log(`[MOCK CLASS MAPPINGS] Bulk assigned template ${templateId} to ${classIds.length} classes`);
  return results;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function resetClassMappings(): void {
  mockClassMappings = generateInitialMappings();
  mappingIdCounter = 500;
  console.log('[MOCK CLASS MAPPINGS] Reset to initial state');
}

export const mockClassMappingsProvider = {
  getClassTemplateMappings,
  getMappingsByClass,
  getMappingsByTemplate,
  createClassTemplateMapping,
  deleteClassTemplateMapping,
  bulkAssignTemplate,
  resetClassMappings,
};
