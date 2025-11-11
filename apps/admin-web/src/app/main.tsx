import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeRoot } from "./providers/ThemeProvider";
import { AuthRoot } from "./providers/AuthProvider";
import { ConfigRoot } from "./providers/ConfigProvider";
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
import { Shell, Protected } from "./components/Shell";

// Create QueryClient with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
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
    ],
  },
]);

// Initialize MSW in development mode
async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass",
    });
    console.log("🔶 MSW mocking enabled");

    // Auto-login for development
    const { useAuthStore } = await import("./stores/useAuthStore");
    const authState = useAuthStore.getState();
    if (!authState.userId) {
      authState.setAuth({
        userId: "dev-user-123",
        schoolId: 2,
        role: "admin",
      });
      console.log("🔐 Auto-logged in as admin (dev mode)");
    }
  }
}

// Start the app
enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthRoot>
          <ConfigRoot>
            <ThemeRoot>
              <RouterProvider router={router} />
            </ThemeRoot>
          </ConfigRoot>
        </AuthRoot>
        {/* ✅ ADD ChatProvider at the end for global chatbot overlay */}
        <ChatProvider />
      </QueryClientProvider>
    </React.StrictMode>
  );
});
