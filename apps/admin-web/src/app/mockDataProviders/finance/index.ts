// ============================================================================
// FINANCE MOCK DATA PROVIDERS - MAIN INDEX
// ============================================================================
// Exports all finance-related mock data providers

// Re-export all functions and types
export * from './mockFeeComponents.ts';
export * from './mockFeeTemplates.ts';
export * from './mockClassMappings.ts';
export * from './mockOverrides.ts';
export * from './mockDiscounts.ts';
export * from './mockInvoices.ts';
export * from './mockPayments.ts';
export * from './mockReports.ts';
export * from './mockStudents.ts';
export * from './mockClasses.ts';

// Export provider objects for service layer
export { mockFeeComponentsProvider } from './mockFeeComponents.ts';
export { mockFeeTemplatesProvider } from './mockFeeTemplates.ts';
export { mockClassMappingsProvider } from './mockClassMappings.ts';
export { mockOverridesProvider } from './mockOverrides.ts';
export { mockDiscountsProvider } from './mockDiscounts.ts';
export { mockInvoicesProvider } from './mockInvoices.ts';
export { mockPaymentsProvider } from './mockPayments.ts';
export { mockReportsProvider } from './mockReports.ts';
