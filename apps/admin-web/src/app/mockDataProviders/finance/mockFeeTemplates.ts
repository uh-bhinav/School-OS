// ============================================================================
// MOCK FEE TEMPLATES - Mirrors backend fee_template model
// ============================================================================

import type {
  FeeTemplate,
  FeeTemplateCreate,
  FeeTemplateUpdate,
  FeeTemplateComponent,
  FeeTerm,
} from '../../services/finance/types';
import { mockFeeComponentsProvider } from './mockFeeComponents';

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

let templateIdCounter = 200;
let templateComponentIdCounter = 1000;

const INITIAL_FEE_TEMPLATES: FeeTemplate[] = [
  {
    template_id: 1,
    school_id: 1,
    name: 'Primary Classes (1-5) - Annual Fee',
    description: 'Complete annual fee structure for classes 1 to 5',
    academic_year_id: 1,
    term: 'Annual',
    components: [
      { template_component_id: 1, template_id: 1, component_id: 1, component_name: 'Tuition Fee', amount: 35000, is_mandatory: true },
      { template_component_id: 2, template_id: 1, component_id: 7, component_name: 'Library Fee', amount: 2000, is_mandatory: true },
      { template_component_id: 3, template_id: 1, component_id: 10, component_name: 'Text Books', amount: 4500, is_mandatory: true },
      { template_component_id: 4, template_id: 1, component_id: 11, component_name: 'Notebooks & Stationery', amount: 1500, is_mandatory: true },
      { template_component_id: 5, template_id: 1, component_id: 12, component_name: 'Activity Fee', amount: 2500, is_mandatory: false },
      { template_component_id: 6, template_id: 1, component_id: 9, component_name: 'School Uniform', amount: 3500, is_mandatory: true },
    ],
    total_amount: 49000,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    template_id: 2,
    school_id: 1,
    name: 'Middle School (6-8) - Annual Fee',
    description: 'Complete annual fee structure for classes 6 to 8',
    academic_year_id: 1,
    term: 'Annual',
    components: [
      { template_component_id: 7, template_id: 2, component_id: 1, component_name: 'Tuition Fee', amount: 45000, is_mandatory: true },
      { template_component_id: 8, template_id: 2, component_id: 5, component_name: 'Science Lab Fee', amount: 4000, is_mandatory: true },
      { template_component_id: 9, template_id: 2, component_id: 6, component_name: 'Computer Lab Fee', amount: 3500, is_mandatory: true },
      { template_component_id: 10, template_id: 2, component_id: 7, component_name: 'Library Fee', amount: 2500, is_mandatory: true },
      { template_component_id: 11, template_id: 2, component_id: 10, component_name: 'Text Books', amount: 5500, is_mandatory: true },
      { template_component_id: 12, template_id: 2, component_id: 11, component_name: 'Notebooks & Stationery', amount: 2000, is_mandatory: true },
      { template_component_id: 13, template_id: 2, component_id: 12, component_name: 'Activity Fee', amount: 3000, is_mandatory: false },
      { template_component_id: 14, template_id: 2, component_id: 9, component_name: 'School Uniform', amount: 4000, is_mandatory: true },
    ],
    total_amount: 69500,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    template_id: 3,
    school_id: 1,
    name: 'Secondary Classes (9-10) - Annual Fee',
    description: 'Complete annual fee structure for classes 9 and 10 (Board classes)',
    academic_year_id: 1,
    term: 'Annual',
    components: [
      { template_component_id: 15, template_id: 3, component_id: 1, component_name: 'Tuition Fee', amount: 55000, is_mandatory: true },
      { template_component_id: 16, template_id: 3, component_id: 5, component_name: 'Science Lab Fee', amount: 5000, is_mandatory: true },
      { template_component_id: 17, template_id: 3, component_id: 6, component_name: 'Computer Lab Fee', amount: 4000, is_mandatory: true },
      { template_component_id: 18, template_id: 3, component_id: 7, component_name: 'Library Fee', amount: 3000, is_mandatory: true },
      { template_component_id: 19, template_id: 3, component_id: 10, component_name: 'Text Books', amount: 7000, is_mandatory: true },
      { template_component_id: 20, template_id: 3, component_id: 11, component_name: 'Notebooks & Stationery', amount: 2500, is_mandatory: true },
      { template_component_id: 21, template_id: 3, component_id: 13, component_name: 'Annual Exam Fee', amount: 3500, is_mandatory: true },
      { template_component_id: 22, template_id: 3, component_id: 9, component_name: 'School Uniform', amount: 4500, is_mandatory: true },
    ],
    total_amount: 84500,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    template_id: 4,
    school_id: 1,
    name: 'Transport Fee - Zone A',
    description: 'Transport charges for Zone A (0-5 km radius)',
    academic_year_id: 1,
    term: 'Annual',
    components: [
      { template_component_id: 23, template_id: 4, component_id: 2, component_name: 'Transport Fee - Zone A', amount: 8000, is_mandatory: true },
    ],
    total_amount: 8000,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    template_id: 5,
    school_id: 1,
    name: 'Transport Fee - Zone B',
    description: 'Transport charges for Zone B (5-10 km radius)',
    academic_year_id: 1,
    term: 'Annual',
    components: [
      { template_component_id: 24, template_id: 5, component_id: 3, component_name: 'Transport Fee - Zone B', amount: 12000, is_mandatory: true },
    ],
    total_amount: 12000,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    template_id: 6,
    school_id: 1,
    name: 'Transport Fee - Zone C',
    description: 'Transport charges for Zone C (10+ km radius)',
    academic_year_id: 1,
    term: 'Annual',
    components: [
      { template_component_id: 25, template_id: 6, component_id: 4, component_name: 'Transport Fee - Zone C', amount: 15000, is_mandatory: true },
    ],
    total_amount: 15000,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    template_id: 7,
    school_id: 1,
    name: 'Optional Add-ons Package',
    description: 'Optional activities and smart class facilities',
    academic_year_id: 1,
    term: 'Annual',
    components: [
      { template_component_id: 26, template_id: 7, component_id: 8, component_name: 'Sports Fee', amount: 3500, is_mandatory: false },
      { template_component_id: 27, template_id: 7, component_id: 15, component_name: 'Smart Class Fee', amount: 2000, is_mandatory: false },
      { template_component_id: 28, template_id: 7, component_id: 12, component_name: 'Activity Fee', amount: 3000, is_mandatory: false },
    ],
    total_amount: 8500,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
];

let mockFeeTemplates: FeeTemplate[] = [...INITIAL_FEE_TEMPLATES];

// ============================================================================
// DELAY SIMULATION
// ============================================================================

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getFeeTemplates(schoolId: number = 1): Promise<FeeTemplate[]> {
  await simulateDelay();
  const templates = mockFeeTemplates.filter(
    (t) => t.school_id === schoolId && t.status !== 'draft'
  );
  console.log(`[MOCK FEE TEMPLATES] getFeeTemplates → ${templates.length} templates`);
  return templates;
}

export async function getFeeTemplateById(templateId: number): Promise<FeeTemplate | null> {
  await simulateDelay(100);
  const template = mockFeeTemplates.find((t) => t.template_id === templateId);
  return template || null;
}

export async function createFeeTemplate(
  schoolId: number,
  data: FeeTemplateCreate
): Promise<FeeTemplate> {
  await simulateDelay(400);

  // Get components to build template
  const allComponents = await mockFeeComponentsProvider.getFeeComponents(schoolId);
  const selectedComponents = allComponents.filter((c) => data.component_ids.includes(c.component_id));

  const templateComponents: FeeTemplateComponent[] = selectedComponents.map((comp) => ({
    template_component_id: ++templateComponentIdCounter,
    template_id: templateIdCounter + 1,
    component_id: comp.component_id,
    component_name: comp.name,
    amount: comp.base_amount,
    is_mandatory: !comp.is_optional,
  }));

  const totalAmount = templateComponents.reduce((sum, c) => sum + c.amount, 0);

  const newTemplate: FeeTemplate = {
    template_id: ++templateIdCounter,
    school_id: schoolId,
    name: data.name,
    description: data.description,
    academic_year_id: data.academic_year_id,
    term: data.term,
    components: templateComponents,
    total_amount: totalAmount,
    status: 'active',
    created_at: new Date().toISOString(),
  };

  // Update component template_id references
  newTemplate.components = newTemplate.components.map((c) => ({
    ...c,
    template_id: newTemplate.template_id,
  }));

  mockFeeTemplates.push(newTemplate);
  console.log(`[MOCK FEE TEMPLATES] Created template: ${newTemplate.name} (ID: ${newTemplate.template_id})`);
  return newTemplate;
}

export async function updateFeeTemplate(
  templateId: number,
  data: FeeTemplateUpdate
): Promise<FeeTemplate | null> {
  await simulateDelay(300);

  const index = mockFeeTemplates.findIndex((t) => t.template_id === templateId);
  if (index === -1) return null;

  const existing = mockFeeTemplates[index];

  // If component_ids changed, rebuild the components list
  if (data.component_ids) {
    const allComponents = await mockFeeComponentsProvider.getFeeComponents(existing.school_id);
    const selectedComponents = allComponents.filter((c) => data.component_ids!.includes(c.component_id));

    const templateComponents: FeeTemplateComponent[] = selectedComponents.map((comp) => ({
      template_component_id: ++templateComponentIdCounter,
      template_id: templateId,
      component_id: comp.component_id,
      component_name: comp.name,
      amount: comp.base_amount,
      is_mandatory: !comp.is_optional,
    }));

    existing.components = templateComponents;
    existing.total_amount = templateComponents.reduce((sum, c) => sum + c.amount, 0);
  }

  mockFeeTemplates[index] = {
    ...existing,
    name: data.name ?? existing.name,
    description: data.description ?? existing.description,
    term: data.term ?? existing.term,
    status: data.status ?? existing.status,
    updated_at: new Date().toISOString(),
  };

  console.log(`[MOCK FEE TEMPLATES] Updated template ID: ${templateId}`);
  return mockFeeTemplates[index];
}

export async function deleteFeeTemplate(templateId: number): Promise<boolean> {
  await simulateDelay(200);

  const index = mockFeeTemplates.findIndex((t) => t.template_id === templateId);
  if (index === -1) return false;

  // Soft delete
  mockFeeTemplates[index].status = 'inactive';
  mockFeeTemplates[index].updated_at = new Date().toISOString();

  console.log(`[MOCK FEE TEMPLATES] Deactivated template ID: ${templateId}`);
  return true;
}

export async function getFeeTemplatesByTerm(
  schoolId: number,
  term: FeeTerm
): Promise<FeeTemplate[]> {
  await simulateDelay();
  return mockFeeTemplates.filter(
    (t) => t.school_id === schoolId && t.term === term && t.status === 'active'
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function resetFeeTemplates(): void {
  mockFeeTemplates = [...INITIAL_FEE_TEMPLATES];
  templateIdCounter = 200;
  templateComponentIdCounter = 1000;
  console.log('[MOCK FEE TEMPLATES] Reset to initial state');
}

export const mockFeeTemplatesProvider = {
  getFeeTemplates,
  getFeeTemplateById,
  createFeeTemplate,
  updateFeeTemplate,
  deleteFeeTemplate,
  getFeeTemplatesByTerm,
  resetFeeTemplates,
};
