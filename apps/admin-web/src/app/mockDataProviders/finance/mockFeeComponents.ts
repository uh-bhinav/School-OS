// ============================================================================
// MOCK FEE COMPONENTS - Mirrors backend fee_component model
// ============================================================================

import type {
  FeeComponent,
  FeeComponentCreate,
  FeeComponentUpdate,
  FeeComponentCategory,
} from '../../services/finance/types';

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

let componentIdCounter = 100;

const INITIAL_FEE_COMPONENTS: FeeComponent[] = [
  {
    component_id: 1,
    school_id: 1,
    name: 'Tuition Fee',
    description: 'Core academic tuition charges for the academic session',
    base_amount: 45000,
    type: 'recurring',
    category: 'Tuition',
    is_optional: false,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    component_id: 2,
    school_id: 1,
    name: 'Transport Fee - Zone A',
    description: 'School bus service for Zone A (0-5 km)',
    base_amount: 8000,
    type: 'recurring',
    category: 'Transport',
    is_optional: true,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    component_id: 3,
    school_id: 1,
    name: 'Transport Fee - Zone B',
    description: 'School bus service for Zone B (5-10 km)',
    base_amount: 12000,
    type: 'recurring',
    category: 'Transport',
    is_optional: true,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    component_id: 4,
    school_id: 1,
    name: 'Transport Fee - Zone C',
    description: 'School bus service for Zone C (10+ km)',
    base_amount: 15000,
    type: 'recurring',
    category: 'Transport',
    is_optional: true,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    component_id: 5,
    school_id: 1,
    name: 'Science Lab Fee',
    description: 'Laboratory equipment and consumables for Science practicals',
    base_amount: 5000,
    type: 'recurring',
    category: 'Lab',
    is_optional: false,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    component_id: 6,
    school_id: 1,
    name: 'Computer Lab Fee',
    description: 'Computer and IT infrastructure usage',
    base_amount: 4000,
    type: 'recurring',
    category: 'Lab',
    is_optional: false,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    component_id: 7,
    school_id: 1,
    name: 'Library Fee',
    description: 'Library access and book lending facility',
    base_amount: 2500,
    type: 'recurring',
    category: 'Library',
    is_optional: false,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    component_id: 8,
    school_id: 1,
    name: 'Sports Fee',
    description: 'Sports equipment, grounds maintenance, and coaching',
    base_amount: 3500,
    type: 'recurring',
    category: 'Sports',
    is_optional: true,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    component_id: 9,
    school_id: 1,
    name: 'School Uniform',
    description: 'Complete uniform set including winter and summer wear',
    base_amount: 4500,
    type: 'one-time',
    category: 'Uniform',
    is_optional: false,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    component_id: 10,
    school_id: 1,
    name: 'Text Books',
    description: 'NCERT and supplementary textbooks for the session',
    base_amount: 6000,
    type: 'one-time',
    category: 'Books',
    is_optional: false,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    component_id: 11,
    school_id: 1,
    name: 'Notebooks & Stationery',
    description: 'Annual notebook set and essential stationery',
    base_amount: 2000,
    type: 'one-time',
    category: 'Books',
    is_optional: false,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    component_id: 12,
    school_id: 1,
    name: 'Activity Fee',
    description: 'Extra-curricular activities, clubs, and events',
    base_amount: 3000,
    type: 'recurring',
    category: 'Activity',
    is_optional: true,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    component_id: 13,
    school_id: 1,
    name: 'Annual Exam Fee',
    description: 'Board exam registration and internal exam charges',
    base_amount: 2500,
    type: 'one-time',
    category: 'Exam',
    is_optional: false,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    component_id: 14,
    school_id: 1,
    name: 'Development Fund',
    description: 'Infrastructure development and school improvement',
    base_amount: 5000,
    type: 'one-time',
    category: 'Other',
    is_optional: false,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    component_id: 15,
    school_id: 1,
    name: 'Smart Class Fee',
    description: 'Digital learning resources and smart classroom technology',
    base_amount: 2000,
    type: 'recurring',
    category: 'Other',
    is_optional: true,
    status: 'active',
    created_at: '2025-04-01T00:00:00Z',
  },
];

let mockFeeComponents: FeeComponent[] = [...INITIAL_FEE_COMPONENTS];

// ============================================================================
// DELAY SIMULATION
// ============================================================================

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getFeeComponents(schoolId: number = 1): Promise<FeeComponent[]> {
  await simulateDelay();
  const components = mockFeeComponents.filter(
    (c) => c.school_id === schoolId && c.status !== 'archived'
  );
  console.log(`[MOCK FEE COMPONENTS] getFeeComponents → ${components.length} components`);
  return components;
}

export async function getFeeComponentById(componentId: number): Promise<FeeComponent | null> {
  await simulateDelay(100);
  const component = mockFeeComponents.find((c) => c.component_id === componentId);
  return component || null;
}

export async function createFeeComponent(
  schoolId: number,
  data: FeeComponentCreate
): Promise<FeeComponent> {
  await simulateDelay(300);

  const newComponent: FeeComponent = {
    component_id: ++componentIdCounter,
    school_id: schoolId,
    name: data.name,
    description: data.description,
    base_amount: data.base_amount,
    type: data.type,
    category: data.category,
    is_optional: data.is_optional,
    status: 'active',
    created_at: new Date().toISOString(),
  };

  mockFeeComponents.push(newComponent);
  console.log(`[MOCK FEE COMPONENTS] Created component: ${newComponent.name} (ID: ${newComponent.component_id})`);
  return newComponent;
}

export async function updateFeeComponent(
  componentId: number,
  data: FeeComponentUpdate
): Promise<FeeComponent | null> {
  await simulateDelay(300);

  const index = mockFeeComponents.findIndex((c) => c.component_id === componentId);
  if (index === -1) return null;

  mockFeeComponents[index] = {
    ...mockFeeComponents[index],
    ...data,
    updated_at: new Date().toISOString(),
  };

  console.log(`[MOCK FEE COMPONENTS] Updated component ID: ${componentId}`);
  return mockFeeComponents[index];
}

export async function deleteFeeComponent(componentId: number): Promise<boolean> {
  await simulateDelay(200);

  const index = mockFeeComponents.findIndex((c) => c.component_id === componentId);
  if (index === -1) return false;

  // Soft delete - set status to archived
  mockFeeComponents[index].status = 'archived';
  mockFeeComponents[index].updated_at = new Date().toISOString();

  console.log(`[MOCK FEE COMPONENTS] Archived component ID: ${componentId}`);
  return true;
}

export async function getFeeComponentsByCategory(
  schoolId: number,
  category: FeeComponentCategory
): Promise<FeeComponent[]> {
  await simulateDelay();
  return mockFeeComponents.filter(
    (c) => c.school_id === schoolId && c.category === category && c.status === 'active'
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function resetFeeComponents(): void {
  mockFeeComponents = [...INITIAL_FEE_COMPONENTS];
  componentIdCounter = 100;
  console.log('[MOCK FEE COMPONENTS] Reset to initial state');
}

export const mockFeeComponentsProvider = {
  getFeeComponents,
  getFeeComponentById,
  createFeeComponent,
  updateFeeComponent,
  deleteFeeComponent,
  getFeeComponentsByCategory,
  resetFeeComponents,
};
