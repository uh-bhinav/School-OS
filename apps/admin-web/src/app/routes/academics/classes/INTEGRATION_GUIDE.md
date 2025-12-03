/**
 * CLASSES MODULE - INTEGRATION GUIDE
 *
 * Follow these steps to integrate the Classes module into your app
 */

// ============================================================================
// STEP 1: Add Routes
// ============================================================================

// In your main router file (e.g., src/app/routes/index.tsx or App.tsx)
// Import the components:

import ClassesPage from './academics/classes/ClassesPage';
import ClassDetailPage from './academics/classes/ClassDetailPage';

// Add these routes to your route configuration:

const routes = [
  // ... existing routes
  {
    path: "/academics/classes",
    element: <ClassesPage />
  },
  {
    path: "/academics/classes/:classId",
    element: <ClassDetailPage />
  },
  // ... more routes
];

// ============================================================================
// STEP 2: Add Navigation Menu Item
// ============================================================================

// In your sidebar/navigation component, add:

import { School } from '@mui/icons-material';

const navigationItems = [
  // ... existing items
  {
    label: "Classes",
    path: "/academics/classes",
    icon: <School />,
    section: "Academics"
  },
  // ... more items
];

// ============================================================================
// STEP 3: Verify Environment Variables
// ============================================================================

// In .env or .env.development file:
VITE_DEMO_MODE=true

// ============================================================================
// STEP 4: Test the Module
// ============================================================================

// 1. Navigate to http://localhost:5173/academics/classes
// 2. You should see the Classes list page with 20 classes
// 3. Click "View" on any class to see the detail page
// 4. Test all 6 tabs
// 5. Try assigning a class teacher
// 6. Test subject-teacher mapping editing

// ============================================================================
// API REFERENCE
// ============================================================================

// Import services:
import {
  getClasses,
  getClassById,
  getClassKPI,
  assignTeacherToClass,
  getClassStudents,
  getClassTimetable,
  getClassSubjectMappings,
  updateClassSubjectMapping,
  getClassRankList,
  getClassLeaderboard,
} from '@/app/services/classes.api';

// Import hooks:
import {
  useClasses,
  useClassById,
  useClassKPI,
  useClassStudents,
  useClassTimetable,
  useClassSubjectMapping,
  useClassRankList,
  useClassLeaderboard,
  useAssignClassTeacher,
  useUpdateSubjectMapping,
} from '@/app/services/classes.hooks';

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

// In a component:
import { useClasses } from '@/app/services/classes.hooks';

function MyComponent() {
  const { data: classes, isLoading, error } = useClasses(1);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {classes?.map(cls => (
        <div key={cls.class_id}>
          {cls.class_name} - {cls.section}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/**
 * If you encounter TypeScript errors:
 * 1. Restart TypeScript server: CMD/CTRL + Shift + P -> "TypeScript: Restart TS Server"
 * 2. Clear cache: Delete .ts-cache folders
 * 3. Rebuild: npm run build
 *
 * If mock data doesn't load:
 * 1. Verify VITE_DEMO_MODE=true in .env
 * 2. Check browser console for errors
 * 3. Ensure React Query is configured
 *
 * If routes don't work:
 * 1. Verify routes are added to router configuration
 * 2. Check exact path matching
 * 3. Ensure React Router is set up correctly
 */
