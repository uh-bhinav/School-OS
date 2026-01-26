// apps/admin-web/src/app/services/finance/fee-templates.ts
/**
 * Fee Template Service
 * Handles: Fee Components → Fee Templates → Class Assignment → Student Overrides
 * Ready for backend integration with demo data fallback
 */

import type {
  WizardFeeTemplate,
  WizardFeeComponent,
  ClassFeeMapping,
  StudentOverride,
  BulkInvoicePreview,
  BulkInvoiceRequest,
} from './types';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

// Demo Data: Fee Components (Building blocks of fees)
const DEMO_FEE_COMPONENTS: WizardFeeComponent[] = [
  {
    component_id: 1,
    component_name: 'Tuition Fee',
    description: 'Monthly tuition charges',
    amount: 5000,
    is_mandatory: true,
    category: 'Academic',
  },
  {
    component_id: 2,
    component_name: 'Computer Lab Fee',
    description: 'Access to computer labs',
    amount: 1500,
    is_mandatory: true,
    category: 'Facility',
  },
  {
    component_id: 3,
    component_name: 'Library Fee',
    description: 'Library access and maintenance',
    amount: 800,
    is_mandatory: true,
    category: 'Facility',
  },
  {
    component_id: 4,
    component_name: 'Sports Fee',
    description: 'Sports equipment and grounds maintenance',
    amount: 1200,
    is_mandatory: false,
    category: 'Sports',
  },
  {
    component_id: 5,
    component_name: 'Transport Fee',
    description: 'School bus service',
    amount: 2500,
    is_mandatory: false,
    category: 'Transport',
  },
];

// Demo Data: Fee Templates (Packages of components)
const DEMO_FEE_TEMPLATES: WizardFeeTemplate[] = [
  {
    template_id: 1,
    template_name: 'Monthly Standard Package',
    description: 'Standard monthly fee package with academic and facility charges',
    frequency: 'Monthly',
    academic_period: 'Term 1',
    total_amount: 8500,
    components: [
      DEMO_FEE_COMPONENTS[0], // Tuition
      DEMO_FEE_COMPONENTS[1], // Computer Lab
      DEMO_FEE_COMPONENTS[2], // Library
      DEMO_FEE_COMPONENTS[3], // Sports
    ],
    is_active: true,
  },
  {
    template_id: 2,
    template_name: 'Quarterly Premium Package',
    description: 'Quarterly fee package including transport and all facilities',
    frequency: 'Quarterly',
    academic_period: 'Term 1',
    total_amount: 27000,
    components: [
      { ...DEMO_FEE_COMPONENTS[0], amount: 15000 }, // Tuition (3 months)
      { ...DEMO_FEE_COMPONENTS[1], amount: 4500 }, // Computer Lab (3 months)
      { ...DEMO_FEE_COMPONENTS[2], amount: 2400 }, // Library (3 months)
      { ...DEMO_FEE_COMPONENTS[3], amount: 3600 }, // Sports (3 months)
      { ...DEMO_FEE_COMPONENTS[4], amount: 7500 }, // Transport (3 months)
    ],
    is_active: true,
  },
  {
    template_id: 3,
    template_name: 'Annual Complete Package',
    description: 'Full year payment with maximum discount',
    frequency: 'Annual',
    academic_period: '2025-2026',
    total_amount: 95000,
    components: [
      { ...DEMO_FEE_COMPONENTS[0], amount: 55000 }, // Tuition (12 months with discount)
      { ...DEMO_FEE_COMPONENTS[1], amount: 16000 }, // Computer Lab (12 months)
      { ...DEMO_FEE_COMPONENTS[2], amount: 8000 }, // Library (12 months)
      { ...DEMO_FEE_COMPONENTS[3], amount: 12000 }, // Sports (12 months)
      { ...DEMO_FEE_COMPONENTS[4], amount: 28000 }, // Transport (12 months with discount)
    ],
    is_active: true,
  },
];

// Demo Data: Class Fee Mappings
const DEMO_CLASS_MAPPINGS: ClassFeeMapping[] = [
  {
    class_id: 1,
    class_name: 'Grade 1 - A',
    student_count: 35,
    has_template_mapping: true,
    template_id: 1,
  },
  {
    class_id: 2,
    class_name: 'Grade 1 - B',
    student_count: 32,
    has_template_mapping: true,
    template_id: 1,
  },
  {
    class_id: 3,
    class_name: 'Grade 2 - A',
    student_count: 38,
    has_template_mapping: true,
    template_id: 1,
  },
  {
    class_id: 4,
    class_name: 'Grade 3 - A',
    student_count: 40,
    has_template_mapping: true,
    template_id: 2,
  },
  {
    class_id: 5,
    class_name: 'Grade 4 - A',
    student_count: 36,
    has_template_mapping: false, // No specific mapping, will use default
    template_id: 1,
  },
];

// Demo Data: Student Overrides (Scholarships, Discounts, Custom Amounts)
const DEMO_STUDENT_OVERRIDES: StudentOverride[] = [
  {
    student_id: 101,
    student_name: 'Rahul Sharma',
    override_type: 'scholarship',
    discount_percentage: 50,
    reason: 'Merit Scholarship',
  },
  {
    student_id: 205,
    student_name: 'Priya Patel',
    override_type: 'discount',
    discount_percentage: 25,
    reason: 'Sibling Discount',
  },
  {
    student_id: 308,
    student_name: 'Amit Kumar',
    override_type: 'custom_amount',
    custom_amount: 5000,
    reason: 'Financial Hardship',
  },
];

class WizardFeeTemplateService {
  /**
   * Get all fee templates
   * Endpoint: GET /api/v1/fee-templates
   */
  async getAll(): Promise<WizardFeeTemplate[]> {
    if (DEMO_MODE) {
      // Demo mode: return mock data
      await this.simulateDelay();
      return DEMO_FEE_TEMPLATES;
    }

    // Production: Call real API
    const response = await fetch('/api/v1/fee-templates');
    if (!response.ok) throw new Error('Failed to fetch fee templates');
    return response.json();
  }

  /**
   * Get class mappings for a template
   * Endpoint: GET /api/v1/fee-templates/:templateId/class-mappings
   */
  async getClassMappings(templateId: number): Promise<ClassFeeMapping[]> {
    if (DEMO_MODE) {
      await this.simulateDelay();
      // Return classes that use this template
      return DEMO_CLASS_MAPPINGS.filter(
        (c) => c.template_id === templateId || !c.has_template_mapping
      );
    }

    const response = await fetch(`/api/v1/fee-templates/${templateId}/class-mappings`);
    if (!response.ok) throw new Error('Failed to fetch class mappings');
    return response.json();
  }

  /**
   * Generate preview before creating invoices
   * Endpoint: POST /api/v1/fee-templates/preview
   */
  async generatePreview(request: BulkInvoiceRequest): Promise<BulkInvoicePreview> {
    if (DEMO_MODE) {
      await this.simulateDelay(1500);
      
      const selectedClasses = DEMO_CLASS_MAPPINGS.filter((c) =>
        request.class_ids.includes(c.class_id)
      );
      
      const totalStudents = selectedClasses.reduce((sum, c) => sum + c.student_count, 0);
      const template = DEMO_FEE_TEMPLATES.find((t) => t.template_id === request.template_id)!;
      
      // Calculate with overrides
      const studentsWithOverrides = Math.floor(totalStudents * 0.05); // 5% have overrides
      const studentsWithDiscounts = Math.floor(totalStudents * 0.1); // 10% have discounts
      
      const minAmount = template.total_amount * (totalStudents - studentsWithOverrides) + 
                       (template.total_amount * 0.5 * studentsWithOverrides); // 50% discount for overrides
      const maxAmount = template.total_amount * totalStudents;
      
      return {
        total_invoices: totalStudents,
        students_with_overrides: studentsWithOverrides,
        students_with_discounts: studentsWithDiscounts,
        total_amount_min: minAmount,
        total_amount_max: maxAmount,
        warnings: [
          studentsWithOverrides > 0
            ? `${studentsWithOverrides} students have custom fee overrides applied.`
            : '',
          studentsWithDiscounts > 0
            ? `${studentsWithDiscounts} students have discounts applied.`
            : '',
        ].filter(Boolean),
      };
    }

    const response = await fetch('/api/v1/fee-templates/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) throw new Error('Failed to generate preview');
    return response.json();
  }

  /**
   * Generate bulk invoices
   * Endpoint: POST /api/v1/fee-templates/bulk-invoices
   */
  async generateBulkInvoices(request: BulkInvoiceRequest): Promise<{ success: boolean; invoices_created: number }> {
    if (DEMO_MODE) {
      await this.simulateDelay(2000);
      
      const selectedClasses = DEMO_CLASS_MAPPINGS.filter((c) =>
        request.class_ids.includes(c.class_id)
      );
      const totalStudents = selectedClasses.reduce((sum, c) => sum + c.student_count, 0);
      
      console.log('Demo Mode: Bulk invoices generated', {
        template_id: request.template_id,
        classes: selectedClasses.length,
        students: totalStudents,
        due_date: request.due_date,
      });
      
      return {
        success: true,
        invoices_created: totalStudents,
      };
    }

    const response = await fetch('/api/v1/fee-templates/bulk-invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) throw new Error('Failed to generate invoices');
    return response.json();
  }

  /**
   * Get student overrides for a class
   * Endpoint: GET /api/v1/fee-templates/student-overrides?class_ids=1,2,3
   */
  async getStudentOverrides(classIds: number[]): Promise<StudentOverride[]> {
    if (DEMO_MODE) {
      await this.simulateDelay();
      return DEMO_STUDENT_OVERRIDES;
    }

    const response = await fetch(`/api/v1/fee-templates/student-overrides?class_ids=${classIds.join(',')}`);
    if (!response.ok) throw new Error('Failed to fetch student overrides');
    return response.json();
  }

  private simulateDelay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const wizardFeeTemplateService = new WizardFeeTemplateService();
