import { useState } from 'react';
import {
    Users,
    Package,
    ClipboardList,
    Calendar,
    Phone,
    Bell,
    Search,
    Plus,
    CheckCircle,
    Clock,
    TrendingUp,
    AlertCircle,
    GraduationCap,
    X,              // ✅ ADD THIS
    Zap,
  } from 'lucide-react';
  import {
    useVisitors,
    useVisitorStats,
    useCouriers,
    useCourierStats,
    useLeads,
    useLeadStats,
    useCheckOutVisitor,
    useNotifyRecipient
  } from '../../services/frontoffice.hooks';
  import { useNavigate } from 'react-router-dom';
  import type { Visitor } from '../../mockDataProviders/mockVisitors';
  import type { Courier } from '../../mockDataProviders/mockCouriers';
  import type { AdmissionLead } from '../../mockDataProviders/mockAdmissionLeads';

  import VisitorCheckInModal from '../../components/frontoffice/VisitorCheckInModal';
  import CourierLogModal from '../../components/frontoffice/CourierLogModal';
  import LeadCaptureModal from '../../components/frontoffice/LeadCaptureModal';

  import PrincipalAppointmentModal from '../../components/frontoffice/PrincipalAppointmentModal';

  export default function FrontOfficeDashboard() {
    // ✅ STEP 1: State declarations first
    const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
    const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

    const navigate = useNavigate();

    // ✅ STEP 2: Data fetching hooks BEFORE using the data
    const { data: visitors = [], isLoading: visitorsLoading } = useVisitors('checked_in');
    const { data: visitorStats } = useVisitorStats();
    const { data: couriers = [], isLoading: couriersLoading } = useCouriers('pending');
    const { data: courierStats } = useCourierStats();
    const { data: leads = [], isLoading: leadsLoading } = useLeads({ score: 'hot' });
    const { data: leadStats } = useLeadStats();

    // Mutations
    const checkOutMutation = useCheckOutVisitor();
    const notifyMutation = useNotifyRecipient();

    // ✅ STEP 3: NOW you can use the data for search
    const searchResults = {
      visitors: visitors.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.contact.includes(searchQuery)
      ).slice(0, 3),
      couriers: couriers.filter(c =>
        c.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tracking_number.includes(searchQuery)
      ).slice(0, 3),
      leads: leads.filter(l =>
        l.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.parent_name.toLowerCase().includes(searchQuery)
      ).slice(0, 3),
    };

    const hasResults = searchQuery.length > 0 && (
      searchResults.visitors.length > 0 ||
      searchResults.couriers.length > 0 ||
      searchResults.leads.length > 0
    );

    // ✅ STEP 4: Calculate real-time stats
    const liveVisitorsCount = visitors.length;
    const pendingCouriersCount = couriers.length;
    const hotLeadsCount = leads.filter(l => l.score === 'hot').length;
    const totalLeadsCount = leads.length;

    const loading = visitorsLoading || couriersLoading || leadsLoading;

    // ✅ STEP 5: Quick actions array
    const quickActions = [
      { label: 'Issue Visitor Pass', action: () => setIsVisitorModalOpen(true), icon: Users },
      { label: 'Log Courier', action: () => setIsCourierModalOpen(true), icon: Package },
      { label: 'Capture Lead', action: () => setIsLeadModalOpen(true), icon: ClipboardList },
      { label: 'View All Visitors', action: () => navigate('/frontoffice/visitors'), icon: Users },
      { label: 'View All Couriers', action: () => navigate('/frontoffice/couriers'), icon: Package },
      { label: 'View All Leads', action: () => navigate('/frontoffice/admissions'), icon: GraduationCap },
    ];

    // ✅ Loading state
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Command Center</h1>
              <p className="text-gray-600 mt-1">Front Office Operations Dashboard</p>
              <p className="text-sm text-gray-500 mt-1">
                Today's Date: <span className="font-semibold">Tuesday, November 26, 2025</span>
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.length > 0);
                }}
                onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
              />

              {/* Search Results Dropdown */}
              {showSearchResults && hasResults && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  {searchResults.visitors.length > 0 && (
                    <div className="p-3 border-b">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Visitors</p>
                      {searchResults.visitors.map(v => (
                        <div key={v.id} className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <p className="font-medium text-sm">{v.name}</p>
                          <p className="text-xs text-gray-600">{v.contact} • {v.purpose}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.couriers.length > 0 && (
                    <div className="p-3 border-b">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Couriers</p>
                      {searchResults.couriers.map(c => (
                        <div key={c.id} className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <p className="font-medium text-sm">{c.recipient_name}</p>
                          <p className="text-xs text-gray-600">{c.tracking_number}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.leads.length > 0 && (
                    <div className="p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Leads</p>
                      {searchResults.leads.map(l => (
                        <div key={l.id} className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <p className="font-medium text-sm">{l.student_name}</p>
                          <p className="text-xs text-gray-600">{l.parent_name} • {l.grade_applying}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ✅ REPLACE Quick Action Button */}
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm"
              >
                <Zap className="w-4 h-4" />
                Quick Action
              </button>

              {/* Quick Actions Dropdown */}
              {showQuickActions && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
                    <p className="text-white font-semibold">⚡ Quick Actions</p>
                    <p className="text-blue-100 text-xs mt-0.5">Fast shortcuts for common tasks</p>
                  </div>
                  <div className="p-2">
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          action.action();
                          setShowQuickActions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg flex items-center gap-3 transition-all group"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <action.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Live Visitors"
            value={String(liveVisitorsCount).padStart(2, '0')}
            subtitle="Today's Gatekeeper"
            icon={Users}
            color="blue"
            action="Issue New Pass"
            onClick={() => setIsVisitorModalOpen(true)}
          />
          <StatCard
            title="Principal's Schedule"
            value="Free"
            subtitle="10:30 AM - Available"
            icon={Calendar}
            color="green"
            action="Request Appointment"
            onClick={() => setIsAppointmentModalOpen(true)} // ✅ CHANGE THIS
          />
          <StatCard
            title="Pending Couriers"
            value={String(pendingCouriersCount)}
            subtitle="The In-Tray"
            icon={Package}
            color="orange"
            action="Log New Courier"
            onClick={() => setIsCourierModalOpen(true)}
          />
          <StatCard
            title="Active Leads"
            value={String(totalLeadsCount)}
            subtitle={`${hotLeadsCount} Hot Leads`}
            icon={ClipboardList}
            color="purple"
            action="Capture Lead"
            onClick={() => setIsLeadModalOpen(true)}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Visitors */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Live Visitors
            </h2>
            <button
              onClick={() => navigate('/frontoffice/visitors')} // ✅ ADD NAVIGATION
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>

            <div className="space-y-3">
              {visitors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No visitors checked in</p>
                </div>
              ) : (
                visitors.slice(0, 3).map((visitor) => (
                  <VisitorCard
                    key={visitor.id}
                    visitor={visitor}
                    onCheckOut={() => checkOutMutation.mutate(visitor.id)}
                  />
                ))
              )}
            </div>

            <button onClick={() => setIsVisitorModalOpen(true)} className="w-full mt-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors">
              Issue New Pass
            </button>
          </div>

          {/* Principal's Schedule */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    Principal's Schedule
                </h2>
                <button
                    onClick={() => navigate('/frontoffice/principalCalendar')} // ✅ FIX THIS
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                    Full Calendar →
                </button>
            </div>

            <div className="space-y-3">
              <ScheduleSlot time="09:00 AM" title="Morning Assembly" status="completed" />
              <ScheduleSlot time="10:30 AM" title="Available" status="free" />
              <ScheduleSlot time="11:00 AM" title="Board Meeting" status="busy" />
              <ScheduleSlot time="02:00 PM" title="Parent Consultations" status="busy" />
              <ScheduleSlot time="04:00 PM" title="Available" status="free" />
            </div>

            <button
              onClick={() => setIsAppointmentModalOpen(true)} // ✅ CHANGE THIS
              className="w-full mt-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium transition-colors"
            >
              Request Appointment
            </button>
          </div>

          {/* Pending Couriers */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                Pending Couriers
                </h2>
                <button
                onClick={() => navigate('/frontoffice/couriers')} // ✅ ADD NAVIGATION
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                View All →
                </button>
            </div>

            <div className="space-y-3">
              {couriers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No pending couriers</p>
                </div>
              ) : (
                couriers.map((courier) => (
                  <CourierCard
                    key={courier.id}
                    courier={courier}
                    onNotify={() => notifyMutation.mutate(courier.id)}
                  />
                ))
              )}
            </div>

            <button onClick={() => setIsCourierModalOpen(true)} className="w-full mt-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 font-medium transition-colors">
              Log New Courier
            </button>
          </div>
        </div>

        {/* Bottom Grid - Admission Leads */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Hot Admission Leads</h2>
              {leadStats && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded">
                  {leadStats.hot_leads} HOT
                </span>
              )}
                </div>
                <button
                onClick={() => navigate('/frontoffice/admissions')} // ✅ ADD NAVIGATION
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                View All Leads →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No hot leads at the moment</p>
              </div>
            ) : (
              leads.slice(0, 3).map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))
            )}
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <QuickStat
          label="Today's Walk-Ins"
          value={String(liveVisitorsCount)}
          icon={Phone}
          trend="+12%"
          trendUp={true}
        />
        <QuickStat
          label="Pending Follow-Ups"
          value={String(leadStats?.follow_ups_due_today || 0)}
          icon={Bell}
          trend="3 overdue"
          trendUp={false}
        />
        <QuickStat
          label="Couriers This Week"
          value={String(couriers.length)}
          icon={Package}
          trend="+8 from last week"
          trendUp={true}
        />
        <QuickStat
          label="Conversion Rate"
          value="68%"
          icon={TrendingUp}
          trend="+5%"
          trendUp={true}
        />
      </div>

        {/* ✅ ADD ALL MODALS AT THE BOTTOM */}
        <VisitorCheckInModal
            isOpen={isVisitorModalOpen}
            onClose={() => setIsVisitorModalOpen(false)}
          />
          <CourierLogModal
            isOpen={isCourierModalOpen}
            onClose={() => setIsCourierModalOpen(false)}
          />
          <LeadCaptureModal
            isOpen={isLeadModalOpen}
            onClose={() => setIsLeadModalOpen(false)}
          />
          <PrincipalAppointmentModal
            isOpen={isAppointmentModalOpen}
            onClose={() => setIsAppointmentModalOpen(false)}
          />
        </div>
    );
  }

  // ============================================================================
  // COMPONENT: StatCard
  // ============================================================================
  interface StatCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'green' | 'orange' | 'purple';
    action: string;
    onClick?: () => void; // ✅ Optional click handler
  }

  function StatCard({ title, value, subtitle, icon: Icon, color, action, onClick }: StatCardProps) {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
    };

    return (
      <div className={`${colorClasses[color]} border rounded-xl p-6 transition-all hover:shadow-md`}>
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8" />
          <span className="text-3xl font-bold">{value}</span>
        </div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm opacity-80 mb-3">{subtitle}</p>
        <button
          type="button"
          onClick={onClick} // ✅ Now properly typed
          className="text-sm font-medium hover:underline cursor-pointer"
        >
          {action}
        </button>
      </div>
    );
  }

  // ============================================================================
  // COMPONENT: VisitorCard
  // ============================================================================
  function VisitorCard({
    visitor,
    onCheckOut
  }: {
    visitor: Visitor;
    onCheckOut: () => void;
  }) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{visitor.name}</p>
          <p className="text-sm text-gray-600 capitalize">{visitor.purpose.replace('_', ' ')}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Check-in: {new Date(visitor.check_in_time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <button
          onClick={onCheckOut}
          className="text-green-600 hover:text-green-700 transition-colors"
          title="Check Out"
        >
          <CheckCircle className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ============================================================================
  // COMPONENT: ScheduleSlot
  // ============================================================================
  function ScheduleSlot({
    time,
    title,
    status
  }: {
    time: string;
    title: string;
    status: 'completed' | 'free' | 'busy'
  }) {
    const statusClasses = {
      completed: 'bg-gray-100 text-gray-600',
      free: 'bg-green-50 text-green-600 border-green-200',
      busy: 'bg-red-50 text-red-600 border-red-200',
    };

    const statusIcons = {
      completed: CheckCircle,
      free: Clock,
      busy: AlertCircle,
    };

    const Icon = statusIcons[status];

    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${statusClasses[status]} transition-all`}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm">{time}</p>
          <p className="text-sm">{title}</p>
        </div>
        {status === 'free' && (
          <span className="text-xs font-medium px-2 py-1 bg-green-100 rounded">Free</span>
        )}
      </div>
    );
  }

  // ============================================================================
  // COMPONENT: CourierCard
  // ============================================================================
  function CourierCard({
    courier,
    onNotify
  }: {
    courier: Courier;
    onNotify: () => void;
  }) {
    const [isNotifying, setIsNotifying] = useState(false);

    const handleNotify = async () => {
      setIsNotifying(true);
      try {
        await onNotify();
        alert(`✅ SMS sent to ${courier.recipient_name}!`);
      } catch (error) {
        alert('❌ Failed to send notification');
      } finally {
        setIsNotifying(false);
      }
    };
    return (
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{courier.recipient_name}</p>
            <p className="text-sm text-gray-600">via {courier.courier_company}</p>
            <p className="text-xs text-gray-500 mt-1 truncate">{courier.tracking_number}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Received: {new Date(courier.received_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={handleNotify}
            disabled={isNotifying}
            className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <Bell className="w-3 h-3" />
            {isNotifying ? 'Sending...' : 'Notify'}
          </button>
        </div>
      );
    }

  // ============================================================================
  // COMPONENT: LeadCard
  // ============================================================================
  function LeadCard({ lead }: { lead: AdmissionLead }) {
    const [showTimeline, setShowTimeline] = useState(false);

    const scoreColors = {
      hot: 'bg-red-100 text-red-600 border-red-200',
      warm: 'bg-yellow-100 text-yellow-600 border-yellow-200',
      cold: 'bg-blue-100 text-blue-600 border-blue-200',
    };

    return (
      <>
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-purple-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{lead.student_name}</h3>
            <p className="text-sm text-gray-600">{lead.parent_name}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded border ${scoreColors[lead.score]}`}>
            {lead.score.toUpperCase()}
          </span>
        </div>
        <div className="space-y-1 mb-3">
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {lead.contact}
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            🎓 {lead.grade_applying}
          </p>
          <p className="text-xs text-gray-500">
            {lead.interaction_history.length} interactions
          </p>
        </div>
        <button
          onClick={() => setShowTimeline(true)} // ✅ CHANGE THIS
          className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
        >
          View Timeline
        </button>
      </div>

        {/* ✅ ADD TIMELINE MODAL */}
        {showTimeline && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Timeline: {lead.student_name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Parent: {lead.parent_name} • {lead.contact}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTimeline(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Timeline */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="w-0.5 h-full bg-gray-300"></div>
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="font-semibold text-green-900">Lead Captured</p>
                        <p className="text-sm text-green-700 mt-1">
                          {new Date(lead.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Source: {lead.source.replace('_', ' ')} • Grade: {lead.grade_applying}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="w-0.5 h-full bg-gray-300"></div>
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="font-semibold text-blue-900">Welcome SMS Sent</p>
                        <p className="text-sm text-blue-700 mt-1">
                          {new Date(lead.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Automated message sent to {lead.contact}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="font-semibold text-yellow-900">Follow-up Scheduled</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Tomorrow at 10:00 AM
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Next: Schedule school tour
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {lead.notes && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600">{lead.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ============================================================================
  // COMPONENT: QuickStat
  // ============================================================================
  function QuickStat({
    label,
    value,
    icon: Icon,
    trend,
    trendUp
  }: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: string;
    trendUp?: boolean;
  }) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-6 h-6 text-gray-600" />
          {trend && (
            <span className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trendUp ? '↗' : '↘'} {trend}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{label}</p>
      </div>
    );
  }
