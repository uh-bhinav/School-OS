import { useState } from 'react';
import {
  Radio,
  Phone,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  MessageSquare,
  Send,
  Search,
  ArrowLeft,
  Clock,
  Users,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCallLogs, useTodaySentiment, useLogCall, useSendBroadcast, useBroadcasts } from '../../services/communication.hooks';

export default function CommunicationHub() {
  const navigate = useNavigate();
  const [broadcastChannel, setBroadcastChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'normal' | 'low'>('normal');
  const [searchTerm, setSearchTerm] = useState('');

  // Call Logger Form
  const [callerName, setCallerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callReason, setCallReason] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative'>('positive');

  const { data: callLogs = [], isLoading: callsLoading } = useCallLogs();
  const { data: broadcasts = [], isLoading: broadcastsLoading } = useBroadcasts();
  const { data: sentimentStats } = useTodaySentiment();
  const logCallMutation = useLogCall();
  const sendBroadcastMutation = useSendBroadcast();

  const handleLogCall = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!callerName || !phoneNumber || !callReason) {
      alert('⚠️ Please fill all required fields');
      return;
    }

    try {
      await logCallMutation.mutateAsync({
        caller_name: callerName,
        phone_number: phoneNumber,
        call_reason: callReason as any, // ✅ Cast to proper type
        call_notes: callNotes,
        sentiment: sentiment,
        duration_minutes: 0,
      });

      // Reset form
      setCallerName('');
      setPhoneNumber('');
      setCallReason('');
      setCallNotes('');
      setSentiment('positive');

      alert('✅ Call logged successfully!');
    } catch (error) {
      alert('❌ Failed to log call');
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!broadcastMessage || !targetAudience) {
      alert('⚠️ Please select target audience and enter message');
      return;
    }

    if (confirm(`Send ${priority.toUpperCase()} ${broadcastChannel.toUpperCase()} broadcast to ${targetAudience.replace('-', ' ')}?`)) {
      try {
        await sendBroadcastMutation.mutateAsync({
          message: broadcastMessage,
          channel: broadcastChannel,
          target_audience: targetAudience,
          priority: priority,
        });

        setBroadcastMessage('');
        setTargetAudience('');
        setPriority('normal');
        alert('✅ Broadcast sent successfully!');
      } catch (error) {
        alert('❌ Failed to send broadcast');
      }
    }
  };

  const filteredCalls = callLogs.filter(call =>
    call.caller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.call_reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Radio className="w-8 h-8 text-blue-600" />
          Communication Hub
        </h1>
        <p className="text-gray-600 mt-1">Broadcast messages and manage communications</p>
      </div>

      {/* Sentiment Report */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Sentiment Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span className="text-sm text-gray-600">Positive</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">{sentimentStats?.positive || 12}</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Minus className="w-6 h-6 text-gray-600" />
              <span className="text-sm text-gray-600">Neutral</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">{sentimentStats?.neutral || 8}</div>
          </div>

          <div className="bg-red-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-6 h-6 text-red-600" />
              <span className="text-sm text-gray-600">Negative</span>
            </div>
            <div className="text-4xl font-bold text-gray-900">{sentimentStats?.negative || 3}</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Emergency Broadcast */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Emergency Broadcast</h2>
              <p className="text-sm text-gray-600">Send urgent messages</p>
            </div>
            <span className="ml-auto px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Preview</span>
          </div>

          <form onSubmit={handleSendBroadcast}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select target...</option>
                <option value="all-parents">All Parents (450)</option>
                <option value="all-staff">All Staff (80)</option>
                <option value="specific-class">Specific Class (30)</option>
                <option value="transport">Transport Users (120)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {(['urgent', 'normal', 'low'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 rounded-lg font-medium capitalize transition-colors ${
                      priority === p
                        ? p === 'urgent'
                          ? 'bg-red-600 text-white'
                          : p === 'normal'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBroadcastChannel('sms')}
                  className={`py-2 rounded-lg font-medium transition-colors ${
                    broadcastChannel === 'sms'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  SMS
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastChannel('whatsapp')}
                  className={`py-2 rounded-lg font-medium transition-colors ${
                    broadcastChannel === 'whatsapp'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  WhatsApp
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows={4}
                maxLength={160}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Type your message here..."
              />
              <div className="text-xs text-gray-500 mt-1">
                {broadcastMessage.length}/160 characters
              </div>
            </div>

            <button
              type="submit"
              disabled={sendBroadcastMutation.isPending}
              className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sendBroadcastMutation.isPending ? 'Sending...' : 'Send Broadcast'}
            </button>
          </form>
        </div>

        {/* Call Logger */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Call Logger</h2>
              <p className="text-sm text-gray-600">Record phone interactions</p>
            </div>
          </div>

          <form onSubmit={handleLogCall}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caller Name
              </label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter caller name..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Call Reason
              </label>
              <select
                value={callReason}
                onChange={(e) => setCallReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select reason...</option>
                <option value="fee_inquiry">Fee Inquiry</option>
                <option value="admission">Admission Query</option>
                <option value="complaint">Complaint</option>
                <option value="transport">Transport Issue</option>
                <option value="general">General Inquiry</option>
                <option value="appreciation">Appreciation</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Call Notes
              </label>
              <textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Enter call summary..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Call Sentiment
              </label>
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={logCallMutation.isPending}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <MessageSquare className="w-4 h-4" />
              {logCallMutation.isPending ? 'Logging...' : 'Log Call'}
            </button>
          </form>
        </div>
      </div>

      {/* Recent Calls & Broadcasts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Calls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Calls</h2>
            <Search className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {callsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : filteredCalls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No calls logged yet</div>
            ) : (
              filteredCalls.slice(0, 5).map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{call.caller_name}</div>
                      <div className="text-sm text-gray-600 capitalize">
                        {call.call_reason.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {new Date(call.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-xs text-gray-500">Duration: {call.duration_minutes}m</div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        call.sentiment === 'positive'
                          ? 'bg-green-100 text-green-800'
                          : call.sentiment === 'neutral'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {call.sentiment}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Broadcasts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Broadcasts</h2>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {broadcastsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : broadcasts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No broadcasts sent yet</div>
            ) : (
              broadcasts.slice(0, 5).map((broadcast) => (
                <div
                  key={broadcast.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          broadcast.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : broadcast.priority === 'normal'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {broadcast.priority?.toUpperCase() || 'NORMAL'}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {broadcast.channel}
                      </span>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{broadcast.message}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{broadcast.recipient_count} recipients</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(broadcast.sent_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
