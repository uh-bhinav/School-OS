import axios from 'axios';

export interface GatePassData {
  studentName: string;
  reason: string;
  contact: string;
}

// Mock API endpoint (replace with actual backend endpoint)
const GATE_PASS_API_URL = '/api/gatepass';

/**
 * Sends the gate pass data to the backend.
 * @param gatePassData - The data for the gate pass.
 * @returns A promise that resolves when the gate pass is successfully sent.
 */
export const sendGatePass = async (gatePassData: GatePassData): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('Mock API: Gate pass sent successfully', gatePassData);
        resolve();
      }, 1000);
    });
  };
