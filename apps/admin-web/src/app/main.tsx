import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeRoot } from "./providers/ThemeProvider";
import { AuthRoot } from "./providers/AuthProvider";
import ChatProvider from "./providers/ChatProvider";
import "../index.css"; // ✅ CRITICAL: Import Tailwind CSS
import Login from "./routes/auth/login";
import SignupPrincipal from "./routes/auth/SignupPrincipal";
import Dashboard from "./routes/dashboard";
import AttendanceRoute from "./routes/academics/attendance/AttendanceRoute";
import TimetableRoute from "./routes/academics/timetable/TimetableRoute";
import ProxyAssignmentPage from "./routes/academics/timetable/ProxyAssignmentPage";
import ExamsRoute from "./routes/academics/exams/ExamsRoute";
import MarksRoute from "./routes/academics/marks/MarksRoute";
import MarksPage from "./routes/academics/marks/MarksPage";
import LeaderboardsPage from "./routes/academics/leaderboards/LeaderboardsPage";
import TeachersPage from "./routes/academics/teachers/TeachersPage";
import TeacherDetailPage from "./routes/academics/teachers/TeacherDetailPage";
import ClassesPage from "./routes/academics/classes/ClassesPage";
import ClassDetailPage from "./routes/academics/classes/ClassDetailPage";
import StudentsPage from "./routes/academics/students/StudentsPage";
import StudentDetailPage from "./routes/academics/students/StudentDetailPage";
import ClubsPage from "./routes/academics/clubs/ClubsPage";
import AchievementsPage from "./routes/academics/achievements/AchievementsPage";
import { LeaveManagementRoute, LeaveProxyAssignmentPage } from "./routes/academics/leaveManagement";
import TasksPage from "./routes/academics/tasks/TasksPage";
import AnnouncementsPage from "./routes/announcements";
import CommunicationsPage from "./routes/communications";
import FeeManagementPage from "./routes/finance";
import InvoicesPage from "./routes/finance/invoices/InvoicesPage";
import PaymentsPage from "./routes/finance/payments/PaymentsPage";
import DiscountsPage from "./routes/finance/discounts/DiscountsPage";
import RefundsPage from "./routes/finance/refunds/RefundsPage";
import FeeComponentsPage from "./routes/finance/fee-components/FeeComponentsPage";
import FeeTemplatesPage from "./routes/finance/fee-templates/FeeTemplatesPage";
import ClassMappingPage from "./routes/finance/class-mapping/ClassMappingPage";
import StudentOverridesPage from "./routes/finance/overrides/OverridesPage";
import StudentDiscountsPage from "./routes/finance/student-discounts/StudentDiscountsPage";
import AlbumsPage from "./routes/media/albums/AlbumsPage";
import AlbumDetailPage from "./routes/albums/AlbumDetailPage";
import ProductsPage from "./routes/media/products/ProductsPage";
import EventsPage from "./routes/events";
import EventDetailPage from "./routes/events/EventDetailPage";
import { Shell, Protected } from "./components/Shell";
import { runAuthMigration } from "./utils/authCleanup";
import { logDemoModeStatus } from "./mockDataProviders";

// HR Module imports
import HRDashboardPage from "./routes/hr";
import StaffListPage from "./routes/hr/staff/StaffListPage";
import StaffDetailPage from "./routes/hr/staff/StaffDetailPage";
import AddStaffPage from "./routes/hr/staff/AddStaffPage";
import DepartmentsPage from "./routes/hr/departments/DepartmentsPage";
import DepartmentDetailPage from "./routes/hr/departments/DepartmentDetailPage";
import StaffWallPage from "./routes/hr/staff-wall/StaffWallPage";
import StaffAttendancePage from "./routes/hr/attendance/StaffAttendancePage";

// Budget Module imports
import BudgetDashboardPage from "./routes/finance/budgets/BudgetDashboardPage";
import BudgetListPage from "./routes/finance/budgets/BudgetListPage";
import BudgetCreatePage from "./routes/finance/budgets/BudgetCreatePage";
import BudgetDetailPage from "./routes/finance/budgets/BudgetDetailPage";
import BudgetTransactionsPage from "./routes/finance/budgets/BudgetTransactionsPage";
import BudgetApprovalsPage from "./routes/finance/budgets/BudgetApprovalsPage";
import BudgetPettyCashPage from "./routes/finance/budgets/BudgetPettyCashPage";
import BudgetReportsPage from "./routes/finance/budgets/BudgetReportsPage";
import BudgetSettingsPage from "./routes/finance/budgets/BudgetSettingsPage";
import BudgetAuditLogPage from "./routes/finance/budgets/BudgetAuditLogPage";

// ============================================================================
// AUTH MIGRATION - Clean up stale auth state from previous sessions
// ============================================================================
runAuthMigration();

// ============================================================================
// DEMO MODE STATUS - Log on app startup
// ============================================================================
logDemoModeStatus();

// Create QueryClient with optimized settings to reduce API calls and connection usage
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ========================================================================
      // PERFORMANCE OPTIMIZATION: Reduce redundant API calls
      // These settings help prevent connection pool exhaustion on the backend
      // ========================================================================
      staleTime: 10 * 60 * 1000, // 10 minutes - data stays fresh longer
      gcTime: 30 * 60 * 1000, // 30 minutes - cache persists longer (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Never retry on auth errors - prevents connection spam
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        // Never retry on server errors during high load
        if (error?.response?.status >= 500) {
          return false;
        }
        // Never retry on timeout - backend is likely overloaded
        if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
          return false;
        }
        // Retry only once for network errors
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      refetchOnWindowFocus: false, // Prevent refetch when user switches tabs
      refetchOnReconnect: false, // Prevent refetch on network reconnect
      refetchOnMount: false, // Use cached data when component remounts
      refetchInterval: false, // Disable automatic polling
      networkMode: 'offlineFirst', // Use cache first, then network
    },
    mutations: {
      retry: false, // Never retry mutations - they should be explicit
      networkMode: 'offlineFirst',
    },
  },
});

// Define routes
const router = createBrowserRouter([
  {
    path: "/auth/login",
    element: <Login />,
  },
  {
    path: "/auth/signup",
    element: <SignupPrincipal />,
  },
  {
    path: "/",
    element: (
      <Protected>
        <Shell />
      </Protected>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "academics/attendance",
        element: <AttendanceRoute />,
      },
      {
        path: "academics/timetable",
        element: <TimetableRoute />,
      },
      {
        path: "academics/timetable/proxy",
        element: <ProxyAssignmentPage />,
      },
      {
        path: "academics/exams",
        element: <ExamsRoute />,
      },
      {
        path: "academics/marks",
        element: <MarksRoute />,
        children: [
          {
            index: true,
            element: <MarksPage />,
          },
        ],
      },
      {
        path: "academics/leaderboards",
        element: <LeaderboardsPage />,
      },
      {
        path: "academics/teachers",
        element: <TeachersPage />,
      },
      {
        path: "academics/teachers/:teacherId",
        element: <TeacherDetailPage />,
      },
      {
        path: "academics/classes",
        element: <ClassesPage />,
      },
      {
        path: "academics/classes/:classId",
        element: <ClassDetailPage />,
      },
      {
        path: "academics/students",
        element: <StudentsPage />,
      },
      {
        path: "academics/students/:studentId",
        element: <StudentDetailPage />,
      },
      {
        path: "academics/clubs",
        element: <ClubsPage />,
      },
      {
        path: "academics/achievements",
        element: <AchievementsPage />,
      },
      {
        path: "academics/leave-management",
        element: <LeaveManagementRoute />,
      },
      {
        path: "academics/leave-management/:leaveId/assign-proxy",
        element: <LeaveProxyAssignmentPage />,
      },
      {
        path: "academics/tasks",
        element: <TasksPage />,
      },
      {
        path: "announcements",
        element: <AnnouncementsPage />,
      },
      {
        path: "communications",
        element: <CommunicationsPage />,
      },
      {
        path: "finance/fees",
        element: <FeeManagementPage />,
      },
      {
        path: "finance/fee-components",
        element: <FeeComponentsPage />,
      },
      {
        path: "finance/fee-templates",
        element: <FeeTemplatesPage />,
      },
      {
        path: "finance/class-mapping",
        element: <ClassMappingPage />,
      },
      {
        path: "finance/overrides",
        element: <StudentOverridesPage />,
      },
      {
        path: "finance/student-discounts",
        element: <StudentDiscountsPage />,
      },
      {
        path: "finance/invoices",
        element: <InvoicesPage />,
      },
      {
        path: "finance/payments",
        element: <PaymentsPage />,
      },
      {
        path: "finance/discounts",
        element: <DiscountsPage />,
      },
      {
        path: "finance/refunds",
        element: <RefundsPage />,
      },
      {
        path: "finance/budgets",
        element: <BudgetDashboardPage />,
      },
      {
        path: "finance/budgets/create",
        element: <BudgetCreatePage />,
      },
      {
        path: "finance/budgets/list",
        element: <BudgetListPage />,
      },
      {
        path: "finance/budgets/:budgetId",
        element: <BudgetDetailPage />,
      },
      {
        path: "finance/budgets/transactions",
        element: <BudgetTransactionsPage />,
      },
      {
        path: "finance/budgets/approvals",
        element: <BudgetApprovalsPage />,
      },
      {
        path: "finance/budgets/petty-cash",
        element: <BudgetPettyCashPage />,
      },
      {
        path: "finance/budgets/reports",
        element: <BudgetReportsPage />,
      },
      {
        path: "finance/budgets/settings",
        element: <BudgetSettingsPage />,
      },
      {
        path: "finance/budgets/audit",
        element: <BudgetAuditLogPage />,
      },
      {
        path: "media/albums",
        element: <AlbumsPage />,
      },
      {
        path: "media/albums/:albumId",
        element: <AlbumDetailPage />,
      },
      {
        path: "albums/:albumId",
        element: <AlbumDetailPage />,
      },
      {
        path: "media/products",
        element: <ProductsPage />,
      },
      {
        path: "events",
        element: <EventsPage />,
      },
      {
        path: "events/:eventId",
        element: <EventDetailPage />,
      },
      // ======================================================================
      // HR MODULE ROUTES
      // ======================================================================
      {
        path: "hr",
        element: <HRDashboardPage />,
      },
      {
        path: "hr/staff",
        element: <StaffListPage />,
      },
      {
        path: "hr/staff/add",
        element: <AddStaffPage />,
      },
      {
        path: "hr/staff/:staffId",
        element: <StaffDetailPage />,
      },
      {
        path: "hr/departments",
        element: <DepartmentsPage />,
      },
      {
        path: "hr/departments/:departmentId",
        element: <DepartmentDetailPage />,
      },
      {
        path: "hr/staff-wall",
        element: <StaffWallPage />,
      },
      {
        path: "hr/attendance",
        element: <StaffAttendancePage />,
      },
    ],
  },
]);

// ============================================================================
// START THE APP - MSW COMPLETELY REMOVED
// ============================================================================
// ✅ No more MSW initialization
// ✅ Direct app startup - no async wrapper needed
// ✅ Clean bootstrap sequence
// ============================================================================

console.log("🚀 Starting SchoolOS Admin Panel...");
console.log("� Mode:", import.meta.env.DEV ? "Development" : "Production");
console.log("� API Base:", import.meta.env.VITE_API_BASE_URL || "No base URL (will use relative paths)");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthRoot>
        <ThemeRoot>
          <RouterProvider router={router} />
        </ThemeRoot>
      </AuthRoot>
      {/* ✅ ChatProvider at the end for global chatbot overlay */}
      <ChatProvider />
    </QueryClientProvider>
  </React.StrictMode>
);
