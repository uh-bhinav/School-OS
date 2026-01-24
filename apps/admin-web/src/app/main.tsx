import React from "react";
import ReactDOM from "react-dom/client";
import { FrontOfficeShell } from "./components/FrontOfficeShell";
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
import ExamsRoute from "./routes/academics/exams/ExamsRoute";
import MarksRoute from "./routes/academics/marks/MarksRoute";
import MarksPage from "./routes/academics/marks/MarksPage";
import LeaderboardsPage from "./routes/academics/leaderboards/LeaderboardsPage";
import TeachersPage from "./routes/academics/teachers/TeachersPage";
import TeacherDetailPage from "./routes/academics/teachers/TeacherDetailPage";
import StudentsPage from "./routes/academics/students/StudentsPage";
import StudentDetailPage from "./routes/academics/students/StudentDetailPage";
import ClubsPage from "./routes/academics/clubs/ClubsPage";
import AchievementsPage from "./routes/academics/achievements/AchievementsPage";
import AnnouncementsPage from "./routes/announcements";
import CommunicationsPage from "./routes/communications";
import FeeManagementPage from "./routes/finance";
import InvoicesPage from "./routes/finance/invoices/InvoicesPage";
import PaymentsPage from "./routes/finance/payments/PaymentsPage";
import DiscountsPage from "./routes/finance/discounts/DiscountsPage";
import RefundsPage from "./routes/finance/refunds/RefundsPage";
import AlbumsPage from "./routes/media/albums/AlbumsPage";
import ProductsPage from "./routes/media/products/ProductsPage";
import { Shell, Protected } from "./components/Shell";
import { runAuthMigration } from "./utils/authCleanup";
import { logDemoModeStatus } from "./mockDataProviders";
import FrontOfficeDashboard from "./routes/dashboard/frontoffice";
import { VisitorsPage } from "./routes/frontoffice/visitors";
import CouriersPage from "./routes/frontoffice/couriers";
import AdmissionsPage from "./routes/frontoffice/admissions";
import ServiceRequestsPage from "./routes/frontoffice/serviceRequest";
import ServiceRequestDetailPage from "./routes/frontoffice/serviceRequestDetail";
import PrincipalCalendarPage from "./routes/frontoffice/principalCalendar";
import FrontOfficeCommunication from "./routes/frontoffice/communication";
import AdmissionsPipeline from './routes/frontoffice/admission-pipline';
import RootRedirect from "./routes/RootRedirect";




// ============================================================================
// AUTH MIGRATION - Clean up stale auth state from previous sessions
// ============================================================================
runAuthMigration();

// ============================================================================
// DEMO MODE STATUS - Log on app startup
// ============================================================================
logDemoModeStatus();

// Create QueryClient with proper error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Never retry on 401/403 (auth errors)
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      // Don't run queries with null/undefined in query keys
      enabled: true,
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
    element: <RootRedirect />,
  },
  {
    path: "/admin",
    element: (
      <Protected allowedRoles={["admin"]}>
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
        path: "media/albums",
        element: <AlbumsPage />,
      },
      {
        path: "media/products",
        element: <ProductsPage />,
      }
    ],
  },
  // ================= FRONT OFFICE ROOT =================
  {
    path: "/frontoffice",
    element: (
      <Protected allowedRoles={["front_office"]}>
        <FrontOfficeShell />
      </Protected>
    ),
    children: [
      { index: true, element: <FrontOfficeDashboard /> },
      { path: "visitors", element: <VisitorsPage /> },
      { path: "couriers", element: <CouriersPage /> },
      { path: "admissions", element: <AdmissionsPage /> },
      { path: "admissions-pipeline", element: <AdmissionsPipeline /> },
      { path: "serviceRequest", element: <ServiceRequestsPage /> },
      { path: "serviceRequest/:requestId", element: <ServiceRequestDetailPage /> },
      { path: "principalCalendar", element: <PrincipalCalendarPage /> },
      { path: "communication", element: <FrontOfficeCommunication /> },
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
