import { mockCommunicationProvider } from '../mockDataProviders/mockCommunication';
import type { CallLog, Broadcast, SentimentStats } from '../types/communication.types';
import { useDemoModeStore } from '../stores/useDemoModeStore';

const isDemoMode = () => useDemoModeStore.getState().isDemoMode;

export async function getCallLogs(): Promise<CallLog[]> {
  if (isDemoMode()) {
    return mockCommunicationProvider.getCallLogs();
  }
  return mockCommunicationProvider.getCallLogs();
}

export async function getTodaySentiment(): Promise<SentimentStats> {
  if (isDemoMode()) {
    return mockCommunicationProvider.getTodaySentiment();
  }
  return mockCommunicationProvider.getTodaySentiment();
}

export async function logCall(callData: Partial<CallLog>): Promise<CallLog> {
  if (isDemoMode()) {
    return mockCommunicationProvider.logCall(callData);
  }
  return mockCommunicationProvider.logCall(callData);
}

export async function sendBroadcast(broadcastData: Partial<Broadcast>): Promise<Broadcast> {
  if (isDemoMode()) {
    return mockCommunicationProvider.sendBroadcast(broadcastData);
  }
  return mockCommunicationProvider.sendBroadcast(broadcastData);
}

export async function getBroadcasts(): Promise<Broadcast[]> {
  if (isDemoMode()) {
    return mockCommunicationProvider.getBroadcasts();
  }
  return mockCommunicationProvider.getBroadcasts();
}
