import type { CallLog, Broadcast, SentimentStats } from '../types/communication.types';

let mockCallLogs: CallLog[] = [
  {
    id: '1',
    caller_name: 'Mrs. Sharma',
    phone_number: '+91 98765 43210',
    call_reason: 'fee_inquiry',
    call_notes: 'Asked about scholarship programs for next year',
    sentiment: 'positive',
    duration_minutes: 5,
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    logged_by: 'Front Office',
  },
  {
    id: '2',
    caller_name: 'Mr. Kumar',
    phone_number: '+91 98765 43211',
    call_reason: 'transport',
    call_notes: 'Bus delay complaint for Route 5',
    sentiment: 'neutral',
    duration_minutes: 8,
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    logged_by: 'Front Office',
  },
  {
    id: '3',
    caller_name: 'Mrs. Patel',
    phone_number: '+91 98765 43212',
    call_reason: 'complaint',
    call_notes: 'Unhappy with cafeteria food quality',
    sentiment: 'negative',
    duration_minutes: 12,
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    logged_by: 'Front Office',
  },
];

let mockBroadcasts: Broadcast[] = [
  {
    id: '1',
    message: 'School will remain closed tomorrow due to heavy rainfall. Stay safe!',
    channel: 'sms',
    target_audience: 'all-parents', // ✅ Changed from target_group
    priority: 'urgent',
    sent_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    sent_by: 'Principal',
    recipient_count: 450,
    status: 'sent',
  },
];

export const mockCommunicationProvider = {
  getCallLogs(): CallLog[] {
    return [...mockCallLogs].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  getTodaySentiment(): SentimentStats {
    const today = new Date().toDateString();
    const todayCalls = mockCallLogs.filter(
      call => new Date(call.timestamp).toDateString() === today
    );

    return {
      positive: todayCalls.filter(c => c.sentiment === 'positive').length,
      neutral: todayCalls.filter(c => c.sentiment === 'neutral').length,
      negative: todayCalls.filter(c => c.sentiment === 'negative').length,
      total: todayCalls.length,
    };
  },

  logCall(callData: Partial<CallLog>): CallLog {
    const newCall: CallLog = {
      id: `call-${Date.now()}`,
      caller_name: callData.caller_name || '',
      phone_number: callData.phone_number || '',
      call_reason: callData.call_reason || 'general',
      call_notes: callData.call_notes || '',
      sentiment: callData.sentiment || 'neutral',
      duration_minutes: callData.duration_minutes || Math.floor(Math.random() * 15) + 3,
      timestamp: new Date().toISOString(),
      logged_by: 'Front Office',
    };

    mockCallLogs = [newCall, ...mockCallLogs];
    return newCall;
  },

  sendBroadcast(broadcastData: Partial<Broadcast>): Broadcast {
    const recipientCounts: Record<string, number> = {
      'all-parents': 450,
      'all-staff': 80,
      'all_staff': 80, // Support both formats
      'all_teachers': 45,
      'all_parents': 450,
      'specific-class': 30,
      'specific_class': 30,
      'transport': 120,
      'transport_staff': 15,
      'cafeteria_staff': 8,
    };

    const newBroadcast: Broadcast = {
      id: `broadcast-${Date.now()}`,
      message: broadcastData.message || '',
      channel: broadcastData.channel || 'sms',
      target_audience: broadcastData.target_audience || 'all-staff', // ✅ Changed
      priority: broadcastData.priority || 'normal',
      sent_at: new Date().toISOString(),
      sent_by: 'Front Office',
      recipient_count: recipientCounts[broadcastData.target_audience || 'all-staff'] || 50,
      status: 'sent',
    };

    mockBroadcasts = [newBroadcast, ...mockBroadcasts];
    return newBroadcast;
  },

  getBroadcasts(): Broadcast[] {
    return [...mockBroadcasts].sort((a, b) =>
      new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
    );
  },
};
