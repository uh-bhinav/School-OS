# 🚀 Timetable Developer Quick Reference

## 📦 Component Import Map

```typescript
// Core Page
import TimetablePage from "@/routes/academics/timetable/TimetablePage";
import TimetableRoute from "@/routes/academics/timetable/TimetableRoute";

// UI Components
import FiltersBar from "@/components/timetable/FiltersBar";
import KPICards from "@/components/timetable/KPICards";
import Legend from "@/components/timetable/Legend";
import GridView from "@/components/timetable/GridView";
import PublishBar from "@/components/timetable/PublishBar";
import PeriodFormDialog from "@/components/timetable/PeriodFormDialog";
import SwapDialog from "@/components/timetable/SwapDialog";
import ExportDialog from "@/components/timetable/ExportDialog";
import GenerateDialog from "@/components/timetable/GenerateDialog";
import HowToUsePopover from "@/components/timetable/HowToUsePopover";
import InfoTooltip from "@/components/timetable/InfoTooltip";
import TimetableErrorBoundary from "@/components/timetable/TimetableErrorBoundary";

// Services
import {
  useTimetableGrid,
  useTimetableKPIs,
  useCreateEntry,
  useUpdateEntry,
  useDeleteEntry,
  useSwapEntries,
  useCheckConflict,
  useGenerateTimetable,
  usePublishWeek,
} from "@/services/timetable.hooks";

import {
  useTeachers,
  useSubjects,
  useRooms,
} from "@/services/resources.hooks";

// Types
import type {
  TimetableEntry,
  TimetableGrid,
  Period,
  DayOfWeek,
  KPISnapshot,
} from "@/services/timetable.schema";

import type {
  Teacher,
  Subject,
  Room,
} from "@/services/resources.schema";
```

---

## 🔧 Common Tasks

### Add a New KPI
```typescript
// 1. Update schema
export const KPISnapshot = z.object({
  coverage_pct: z.number(),
  conflicts_count: z.number(),
  free_periods: z.number(),
  room_util_pct: z.number(),
  new_kpi: z.number(), // ← Add here
});

// 2. Update KPICards component
<Card
  title="New KPI"
  value={`${newKpi}`}
  infoColor="info"
  tooltip="Explanation of new KPI calculation"
  trend="up"
  trendValue="Looking good!"
/>

// 3. Update mock handler
http.get(`${BASE}/kpis`, () => HttpResponse.json({
  coverage_pct: 86.5,
  // ... existing
  new_kpi: 42, // ← Add here
})),
```

### Add a New Filter
```typescript
// 1. Update filters state in TimetablePage
const [filters, setFilters] = useState({
  academic_year_id: 2025,
  class_id: 8,
  section: "A",
  week_start: toMondayISO(new Date()),
  new_filter: "value", // ← Add here
});

// 2. Update FiltersBar props
<FiltersBar
  value={filters}
  onChange={(v) => setFilters(s => ({ ...s, ...v }))}
  classes={CLASSES}
  sections={SECTIONS}
  onApply={() => refetch()}
  newFilterOptions={[...]} // ← Add here
/>

// 3. Update query keys
export function useTimetableGrid(q: {
  academic_year_id: number;
  class_id: number;
  section: string;
  week_start: string;
  new_filter?: string; // ← Add here
}) {
  return useQuery({
    queryKey: ["timetable", "grid", q],
    // ...
  });
}
```

### Customize Grid Colors
```typescript
// In GridView.tsx
<Box sx={{
  bgcolor: cell
    ? hasConflict
      ? alpha("#YOUR_COLOR", 0.08) // Conflict color
      : isPublished
        ? alpha("#YOUR_COLOR", 0.04) // Published color
        : "action.hover" // Default color
    : "transparent",
}}>
```

---

## 🎨 Theming

### Override Default Colors
```typescript
// In your theme provider
const theme = createTheme({
  palette: {
    primary: {
      main: "#E87722", // School brand color
    },
    success: {
      main: "#4caf50", // Published, No conflicts
    },
    error: {
      main: "#f44336", // Conflicts
    },
    warning: {
      main: "#ff9800", // Warnings
    },
  },
});
```

---

## 📡 API Integration

### Replace Mock Data
```typescript
// Remove MSW handlers in production
// vite.config.ts or main.tsx
if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser');
  worker.start();
}

// Update http.ts with production API URL
const baseURL = import.meta.env.VITE_API_BASE_URL; // https://api.school-os.com
```

### Add New Endpoint
```typescript
// 1. Define in timetable.api.ts
export async function newEndpoint(params: NewParams) {
  const { data } = await http.post<NewResponse>(`${BASE}/new`, params);
  return data;
}

// 2. Create hook in timetable.hooks.ts
export function useNewEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: newEndpoint,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timetable"] });
    },
  });
}

// 3. Add mock handler
http.post(`${BASE}/new`, async ({ request }) => {
  const body = await request.json();
  return HttpResponse.json({ success: true });
}),
```

---

## 🔍 Debugging Tips

### Enable Query DevTools
```typescript
// main.tsx or App.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Log Render Counts
```typescript
import { useEffect, useRef } from 'react';

function useRenderCount(componentName: string) {
  const count = useRef(0);
  useEffect(() => {
    count.current++;
    console.log(`${componentName} rendered ${count.current} times`);
  });
}

// In component
useRenderCount("GridView");
```

### Check Memoization
```typescript
// Add console.log to useMemo
const periods = useMemo(() => {
  console.log("Periods recalculated");
  return grid?.periods ?? defaultPeriods;
}, [grid]);
```

---

## 🧪 Testing Patterns

### Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KPICards from './KPICards';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('renders KPI cards', () => {
  render(
    <KPICards
      coveragePct={90}
      conflictsCount={0}
      freePeriods={5}
      roomUtilPct={80}
    />,
    { wrapper: createWrapper() }
  );
  expect(screen.getByText('90.0%')).toBeInTheDocument();
});
```

### Hook Test
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useTimetableGrid } from './timetable.hooks';

test('fetches timetable grid', async () => {
  const { result } = renderHook(() =>
    useTimetableGrid({
      academic_year_id: 2025,
      class_id: 8,
      section: "A",
      week_start: "2025-11-03",
    }),
    { wrapper: createWrapper() }
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.entries).toBeDefined();
});
```

---

## 📊 Performance Monitoring

### Measure Component Render Time
```typescript
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: "mount" | "update",
  actualDuration: number,
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

<Profiler id="GridView" onRender={onRenderCallback}>
  <GridView {...props} />
</Profiler>
```

### Track API Call Duration
```typescript
http.interceptors.request.use(config => {
  config.metadata = { startTime: Date.now() };
  return config;
});

http.interceptors.response.use(response => {
  const duration = Date.now() - response.config.metadata.startTime;
  console.log(`${response.config.url} took ${duration}ms`);
  return response;
});
```

---

## 🚨 Common Errors & Solutions

### "Cannot read property 'map' of undefined"
```typescript
// BAD
entries.map(e => ...)

// GOOD
(entries ?? []).map(e => ...)
```

### "React does not recognize the `xxx` prop on a DOM element"
```typescript
// BAD
<Box component="div" item xs={12}>

// GOOD (MUI v6)
<Box sx={{ gridColumn: "span 12" }}>
```

### "Maximum update depth exceeded"
```typescript
// BAD (infinite loop)
useEffect(() => {
  setFilters({ ...filters, week_start: newDate });
}, [filters]);

// GOOD
useEffect(() => {
  setFilters(f => ({ ...f, week_start: newDate }));
}, [newDate]);
```

### "Query data undefined"
```typescript
// BAD
const { data } = useTimetableGrid(filters);
const periods = data.periods; // ❌ data might be undefined

// GOOD
const { data } = useTimetableGrid(filters);
const periods = data?.periods ?? defaultPeriods;
```

---

## 🔐 Security Checklist

- [ ] Validate all user inputs client-side
- [ ] Sanitize data before rendering
- [ ] Use HTTPS in production
- [ ] Implement CSRF tokens for mutations
- [ ] Rate-limit API endpoints
- [ ] Log sensitive actions (publish, delete)
- [ ] Require authentication for all endpoints
- [ ] Validate JWT tokens server-side
- [ ] Prevent XSS with Content Security Policy
- [ ] Audit dependencies for vulnerabilities

---

## 📦 Bundle Size Optimization

### Code Splitting
```typescript
// Lazy load dialogs
const ExportDialog = lazy(() => import('./ExportDialog'));
const GenerateDialog = lazy(() => import('./GenerateDialog'));

<Suspense fallback={<CircularProgress />}>
  {showExport && <ExportDialog ... />}
</Suspense>
```

### Tree Shaking
```typescript
// BAD
import { Button, TextField, ... } from '@mui/material';

// GOOD
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
```

---

## 🎯 Keyboard Shortcuts (Future)

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          handleSave();
          break;
        case 'p':
          e.preventDefault();
          handlePublish();
          break;
        case 'e':
          e.preventDefault();
          handleExport();
          break;
      }
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

## 📞 Support & Contribution

- **Issues**: File bugs in GitHub Issues
- **PRs**: Follow conventional commits (feat/fix/docs)
- **Slack**: #school-os-frontend
- **Docs**: [Internal Wiki](https://wiki.school-os.com)

---

*Happy coding! 🎉*
