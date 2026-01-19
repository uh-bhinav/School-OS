// ============================================================================
// COURIERS API - Courier tracking for Front Office
// ============================================================================
// Currently uses mock data provider
// Future: Will connect to backend /api/v1/couriers endpoints
// ============================================================================

import { mockCouriersProvider } from '../mockDataProviders/mockCouriers';
import type { Courier, CourierStats } from '../mockDataProviders/mockCouriers';
import { useDemoModeStore } from '../stores/useDemoModeStore';

const isDemoMode = () => useDemoModeStore.getState().isDemoMode;

/**
 * Get all couriers (with optional status filter)
 */
export async function getCouriers(status?: Courier['status']): Promise<Courier[]> {
  if (isDemoMode()) {
    return mockCouriersProvider.getCouriers(status);
  }
  // TODO: Real API call
  return mockCouriersProvider.getCouriers(status);
}

/**
 * Get courier statistics
 */
export async function getCourierStats(): Promise<CourierStats> {
  if (isDemoMode()) {
    return mockCouriersProvider.getCourierStats();
  }
  // TODO: Real API call
  return mockCouriersProvider.getCourierStats();
}

/**
 * Log a new courier arrival
 */
export async function logCourier(courier: Partial<Courier>): Promise<Courier> {
  if (isDemoMode()) {
    return mockCouriersProvider.logCourier(courier);
  }
  // TODO: Real API call
  return mockCouriersProvider.logCourier(courier);
}

// /**
//  * Mark courier as delivered
//  */
// export async function markCourierDelivered(
//   courierId: string,
//   signature?: string
// ): Promise<Courier> {
//   if (isDemoMode()) {
//     return mockCouriersProvider.markDelivered(courierId, signature);
//   }
//   // TODO: Real API call
//   return mockCouriersProvider.markDelivered(courierId, signature);
// }

/**
 * Send SMS notification to recipient
 */
export async function notifyRecipient(
  courierId: string
): Promise<{ sent: boolean; message: string }> {
  if (isDemoMode()) {
    return mockCouriersProvider.notifyRecipient(courierId);
  }
  // TODO: Real API call
  return mockCouriersProvider.notifyRecipient(courierId);
}

/**
 * Mark courier as delivered
 */
export async function markCourierDelivered(
    courierId: string,
    signature?: string
  ): Promise<Courier> {
    if (isDemoMode()) {
      return mockCouriersProvider.markDelivered(courierId, signature);
    }
    // TODO: Real API call when backend is ready
    // const response = await apiClient.patch(`/api/v1/couriers/${courierId}/mark-delivered`);
    // return response.data;

    return mockCouriersProvider.markDelivered(courierId, signature);
  }
