// ============================================================================
// FINANCE SERVICE - Business Logic Layer
// ============================================================================
// Interfaces with mock data providers and manages finance operations

import {
  mockFeeComponentsProvider,
  mockFeeTemplatesProvider,
  mockClassMappingsProvider,
  mockOverridesProvider,
  mockDiscountsProvider,
  mockInvoicesProvider,
  mockPaymentsProvider,
  mockReportsProvider,
} from '../../mockDataProviders/finance';

import type {
  FeeComponent,
  FeeComponentCreate,
  FeeComponentUpdate,
  FeeTemplate,
  FeeTemplateCreate,
  FeeTemplateUpdate,
  ClassTemplateMapping,
  ClassTemplateMappingCreate,
  StudentFeeOverride,
  StudentFeeOverrideCreate,
  StudentFeeOverrideUpdate,
  DiscountRule,
  DiscountRuleCreate,
  DiscountRuleUpdate,
  StudentDiscountAssignment,
  StudentDiscountAssignmentCreate,
  Invoice,
  BulkInvoiceCreate,
  BulkInvoiceResult,
  Payment,
  PaymentCreate,
  FinanceReport,
  FinanceKpi,
  InvoiceStatus,
} from './types';

// ============================================================================
// FEE COMPONENTS SERVICE
// ============================================================================

export class FeeComponentService {
  async getAll(): Promise<FeeComponent[]> {
    return await mockFeeComponentsProvider.getFeeComponents();
  }

  async getById(id: number): Promise<FeeComponent | null> {
    return await mockFeeComponentsProvider.getFeeComponentById(id);
  }

  async create(data: FeeComponentCreate): Promise<FeeComponent> {
    return await mockFeeComponentsProvider.createFeeComponent(1, data);
  }

  async update(id: number, data: FeeComponentUpdate): Promise<FeeComponent | null> {
    return await mockFeeComponentsProvider.updateFeeComponent(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return await mockFeeComponentsProvider.deleteFeeComponent(id);
  }
}

// ============================================================================
// FEE TEMPLATES SERVICE
// ============================================================================

export class FeeTemplateService {
  async getAll(_filters?: { academicYearId?: number }): Promise<FeeTemplate[]> {
    return await mockFeeTemplatesProvider.getFeeTemplates(1);
  }

  async getById(id: number): Promise<FeeTemplate | null> {
    return await mockFeeTemplatesProvider.getFeeTemplateById(id);
  }

  async create(data: FeeTemplateCreate): Promise<FeeTemplate> {
    return await mockFeeTemplatesProvider.createFeeTemplate(1, data);
  }

  async update(id: number, data: FeeTemplateUpdate): Promise<FeeTemplate | null> {
    return await mockFeeTemplatesProvider.updateFeeTemplate(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return await mockFeeTemplatesProvider.deleteFeeTemplate(id);
  }

  async addComponents(templateId: number, componentIds: number[]): Promise<FeeTemplate | null> {
    // Add components by updating the template
    const template = await mockFeeTemplatesProvider.getFeeTemplateById(templateId);
    if (!template) return null;

    const existingIds = template.components.map(c => c.component_id);
    const newComponentIds = [...existingIds, ...componentIds];

    return await mockFeeTemplatesProvider.updateFeeTemplate(templateId, { component_ids: newComponentIds });
  }

  async removeComponents(templateId: number, componentIds: number[]): Promise<FeeTemplate | null> {
    // Remove components by updating the template
    const template = await mockFeeTemplatesProvider.getFeeTemplateById(templateId);
    if (!template) return null;

    const existingIds = template.components.map(c => c.component_id);
    const newComponentIds = existingIds.filter(id => !componentIds.includes(id));

    return await mockFeeTemplatesProvider.updateFeeTemplate(templateId, { component_ids: newComponentIds });
  }
}

// ============================================================================
// CLASS MAPPINGS SERVICE
// ============================================================================

export class ClassMappingService {
  async getAll(): Promise<ClassTemplateMapping[]> {
    return await mockClassMappingsProvider.getClassTemplateMappings();
  }

  async getByClass(classId: number): Promise<ClassTemplateMapping[]> {
    return await mockClassMappingsProvider.getMappingsByClass(classId);
  }

  async create(data: ClassTemplateMappingCreate): Promise<ClassTemplateMapping> {
    return await mockClassMappingsProvider.createClassTemplateMapping(data);
  }

  async delete(mappingId: number): Promise<boolean> {
    return await mockClassMappingsProvider.deleteClassTemplateMapping(mappingId);
  }

  async bulkAssign(classIds: number[], templateId: number, academicYearId: number): Promise<ClassTemplateMapping[]> {
    return await mockClassMappingsProvider.bulkAssignTemplate(classIds, templateId, academicYearId);
  }
}

// ============================================================================
// STUDENT OVERRIDES SERVICE
// ============================================================================

export class StudentOverrideService {
  async getByStudent(studentId: number): Promise<StudentFeeOverride[]> {
    return await mockOverridesProvider.getStudentOverrides({ studentId });
  }

  async getByClass(classId: number): Promise<StudentFeeOverride[]> {
    return await mockOverridesProvider.getStudentOverrides({ classId });
  }

  async create(data: StudentFeeOverrideCreate): Promise<StudentFeeOverride> {
    return await mockOverridesProvider.createStudentOverride(data);
  }

  async update(overrideId: number, data: StudentFeeOverrideUpdate): Promise<StudentFeeOverride | null> {
    return await mockOverridesProvider.updateStudentOverride(overrideId, data);
  }

  async delete(overrideId: number): Promise<boolean> {
    return await mockOverridesProvider.deleteStudentOverride(overrideId);
  }
}

// ============================================================================
// DISCOUNT RULES SERVICE
// ============================================================================

export class DiscountRuleService {
  async getAll(): Promise<DiscountRule[]> {
    return await mockDiscountsProvider.getDiscountRules();
  }

  async getById(id: number): Promise<DiscountRule | null> {
    return await mockDiscountsProvider.getDiscountRuleById(id);
  }

  async create(data: DiscountRuleCreate): Promise<DiscountRule> {
    return await mockDiscountsProvider.createDiscountRule(1, data);
  }

  async update(id: number, data: DiscountRuleUpdate): Promise<DiscountRule | null> {
    return await mockDiscountsProvider.updateDiscountRule(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return await mockDiscountsProvider.deleteDiscountRule(id);
  }
}

// ============================================================================
// STUDENT DISCOUNTS SERVICE
// ============================================================================

export class StudentDiscountService {
  async getByStudent(studentId: number): Promise<StudentDiscountAssignment[]> {
    return await mockDiscountsProvider.getStudentDiscountAssignments({ studentId });
  }

  async getByClass(classId: number): Promise<StudentDiscountAssignment[]> {
    return await mockDiscountsProvider.getStudentDiscountAssignments({ classId });
  }

  async assign(data: StudentDiscountAssignmentCreate): Promise<StudentDiscountAssignment> {
    return await mockDiscountsProvider.assignDiscountToStudent(data);
  }

  async unassign(assignmentId: number): Promise<boolean> {
    return await mockDiscountsProvider.removeDiscountFromStudent(assignmentId);
  }

  async bulkAssign(studentIds: number[], discountId: number): Promise<StudentDiscountAssignment[]> {
    // Implement bulk assign by calling assign multiple times
    const results: StudentDiscountAssignment[] = [];
    for (const studentId of studentIds) {
      const assignment = await mockDiscountsProvider.assignDiscountToStudent({ student_id: studentId, discount_id: discountId });
      results.push(assignment);
    }
    return results;
  }
}

// ============================================================================
// INVOICES SERVICE
// ============================================================================

export class InvoiceService {
  async getAll(filters?: {
    classId?: number;
    studentId?: number;
    status?: InvoiceStatus;
    fromDate?: string;
    toDate?: string;
  }): Promise<Invoice[]> {
    return await mockInvoicesProvider.getInvoices(filters);
  }

  async getById(id: number): Promise<Invoice | null> {
    return await mockInvoicesProvider.getInvoiceById(id);
  }

  async getByStudent(studentId: number): Promise<Invoice[]> {
    return await mockInvoicesProvider.getStudentInvoices(studentId);
  }

  async generateBulk(data: BulkInvoiceCreate): Promise<BulkInvoiceResult> {
    return await mockInvoicesProvider.generateBulkInvoices(data);
  }

  async updateStatus(invoiceId: number, status: InvoiceStatus): Promise<Invoice | null> {
    return await mockInvoicesProvider.updateInvoiceStatus(invoiceId, status);
  }

  async cancel(invoiceId: number): Promise<boolean> {
    return await mockInvoicesProvider.cancelInvoice(invoiceId);
  }

  async getStats(): Promise<{
    total_invoices: number;
    total_amount: number;
    collected_amount: number;
    pending_amount: number;
    overdue_count: number;
    paid_percentage: number;
  }> {
    return await mockInvoicesProvider.getInvoiceStats();
  }
}

// ============================================================================
// PAYMENTS SERVICE
// ============================================================================

export class PaymentService {
  async getAll(filters?: {
    invoiceId?: number;
    studentId?: number;
    classId?: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<Payment[]> {
    return await mockPaymentsProvider.getPayments(filters);
  }

  async getById(id: number): Promise<Payment | null> {
    return await mockPaymentsProvider.getPaymentById(id);
  }

  async getByInvoice(invoiceId: number): Promise<Payment[]> {
    return await mockPaymentsProvider.getPaymentsByInvoice(invoiceId);
  }

  async getByStudent(studentId: number): Promise<Payment[]> {
    return await mockPaymentsProvider.getStudentPayments(studentId);
  }

  async record(data: PaymentCreate): Promise<Payment> {
    return await mockPaymentsProvider.recordPayment(data);
  }

  async refund(paymentId: number, reason: string): Promise<Payment | null> {
    return await mockPaymentsProvider.refundPayment(paymentId, reason);
  }

  async getStats(): Promise<any> {
    return await mockPaymentsProvider.getPaymentStats();
  }

  async getDailyCollections(days?: number): Promise<Array<{ date: string; amount: number; count: number }>> {
    return await mockPaymentsProvider.getDailyCollections(days);
  }
}

// ============================================================================
// REPORTS SERVICE
// ============================================================================

export class ReportsService {
  async getKpi(): Promise<FinanceKpi> {
    return await mockReportsProvider.getFinanceKpi();
  }

  async getFullReport(): Promise<FinanceReport> {
    return await mockReportsProvider.getFinanceReport();
  }

  async getRevenueByCategory(): Promise<any[]> {
    return await mockReportsProvider.getRevenueByCategory();
  }

  async getRevenueByClass(): Promise<any[]> {
    return await mockReportsProvider.getRevenueByClass();
  }

  async getTopDefaulters(limit?: number): Promise<any[]> {
    return await mockReportsProvider.getTopDefaulters(limit);
  }

  async getPaymentTrends(days?: number): Promise<any[]> {
    return await mockReportsProvider.getPaymentTrends(days);
  }

  async getClassReport(classId: number): Promise<any> {
    return await mockReportsProvider.getClassFinanceReport(classId);
  }

  async getMonthlyCollections(year?: number): Promise<any[]> {
    return await mockReportsProvider.getMonthlyCollectionReport(year);
  }
}

// ============================================================================
// SERVICE INSTANCES (Singleton Pattern)
// ============================================================================

export const feeComponentService = new FeeComponentService();
export const feeTemplateService = new FeeTemplateService();
export const classMappingService = new ClassMappingService();
export const studentOverrideService = new StudentOverrideService();
export const discountRuleService = new DiscountRuleService();
export const studentDiscountService = new StudentDiscountService();
export const invoiceService = new InvoiceService();
export const paymentService = new PaymentService();
export const reportsService = new ReportsService();

// Default export with all services
export const financeService = {
  feeComponents: feeComponentService,
  feeTemplates: feeTemplateService,
  classMappings: classMappingService,
  studentOverrides: studentOverrideService,
  discountRules: discountRuleService,
  studentDiscounts: studentDiscountService,
  invoices: invoiceService,
  payments: paymentService,
  reports: reportsService,
};
