import { mockVisitorsProvider } from '../mockDataProviders/mockVisitors';
import type { Visitor, VisitorStats } from '../mockDataProviders/mockVisitors';
import { useDemoModeStore } from '../stores/useDemoModeStore';

/**
 * Check if demo mode is enabled
 */
function isDemoMode(): boolean {
  return useDemoModeStore.getState().isDemoMode;
}

/**
 * Get all visitors with optional status filter
 */
export async function getVisitors(status?: Visitor['status']): Promise<Visitor[]> {
  if (isDemoMode()) {
    return mockVisitorsProvider.getVisitors(status);
  }

  // TODO: Real API call when backend is ready
  // const response = await http.get('/visitors', { params: { status } });
  // return response.data;

  throw new Error('Backend API not implemented yet');
}

/**
 * Get visitor statistics for today
 */
export async function getVisitorStats(): Promise<VisitorStats> {
  if (isDemoMode()) {
    return mockVisitorsProvider.getVisitorStats();
  }

  // TODO: Real API call
  throw new Error('Backend API not implemented yet');
}

/**
 * Check in a new visitor
 */
export async function checkInVisitor(visitor: Partial<Visitor>): Promise<Visitor> {
  if (isDemoMode()) {
    return mockVisitorsProvider.checkIn(visitor);
  }

  // TODO: Real API call
  // const response = await http.post('/visitors/check-in', visitor);
  // return response.data;

  throw new Error('Backend API not implemented yet');
}

/**
 * Check out a visitor
 */
export async function checkOutVisitor(visitorId: string): Promise<Visitor> {
  if (isDemoMode()) {
    return mockVisitorsProvider.checkOut(visitorId);
  }

  // TODO: Real API call
  throw new Error('Backend API not implemented yet');
}

/**
 * Issue digital gate pass with QR code
 */
export async function issueGatePass(visitorId: string): Promise<{ qrCode: string; passUrl: string }> {
  if (isDemoMode()) {
    return mockVisitorsProvider.issueGatePass(visitorId);
  }

  // TODO: Real API call
  throw new Error('Backend API not implemented yet');
}
