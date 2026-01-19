export interface CallLog {
    id: string;
    caller_name: string;
    phone_number: string;
    call_reason: 'fee_inquiry' | 'admission' | 'complaint' | 'transport' | 'general' | 'appreciation';
    call_notes?: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    duration_minutes: number;
    timestamp: string;
    logged_by: string;
  }

  export interface Broadcast {
    id: string;
    message: string;
    channel: 'sms' | 'whatsapp' | 'announcement' | 'email';
    target_audience: string; // Keep as string for flexibility
    priority?: 'urgent' | 'normal' | 'low';
    sent_at: string;
    sent_by: string;
    recipient_count: number;
    status: 'sent' | 'pending' | 'failed';
  }

  export interface SentimentStats {
    positive: number;
    neutral: number;
    negative: number;
    total: number;
  }
