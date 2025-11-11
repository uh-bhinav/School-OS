# 🎭 Mock Service Worker (MSW) Guide

## Overview

This project uses **Mock Service Worker (MSW)** to provide realistic API mocking during development. MSW intercepts network requests at the service worker level and returns mock data, allowing you to develop and test the frontend without a running backend server.

---

## 🚀 Quick Start

### Running in Mock Mode (Default)

```bash
# Install dependencies
pnpm install

# Run development server with mocks
pnpm dev
```

The app will automatically:
- ✅ Start MSW in development mode
- ✅ Intercept all API calls
- ✅ Return mock data from `src/app/mocks/`
- ✅ Log intercepted requests in the console with `🔶 MSW:` prefix

### Running with Real Backend

To test with a live backend server:

1. **Start your backend** (e.g., FastAPI server on `http://localhost:8000`)

2. **Update `.env.development`**:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

3. **Restart the dev server**:
   ```bash
   pnpm dev
   ```

The app will now make requests to your real backend instead of using mocks.

---

## 📁 Project Structure

```
src/app/mocks/
├── browser.ts              # MSW worker setup
├── handlers.ts             # Main handler aggregator
├── exams.handlers.ts       # Exam module mock handlers
├── attendance.handlers.ts  # Attendance module handlers
└── timetable.handlers.ts   # Timetable module handlers
```

---

## 🔧 How It Works

### 1. MSW Initialization

In `src/app/main.tsx`, MSW is conditionally started in development mode:

```typescript
async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass",
    });
    console.log("🔶 MSW mocking enabled");
  }
}
```

### 2. HTTP Client Configuration

The Axios client (`src/app/services/http.ts`) adapts based on the environment:

- **Mock Mode** (empty `VITE_API_BASE_URL`): Uses relative URLs that MSW intercepts
- **Live Backend**: Uses the full base URL from `.env`

```typescript
const baseURL = import.meta.env.VITE_API_BASE_URL;
const resolvedBaseURL = baseURL || ""; // Empty for MSW
```

### 3. Request Interception

MSW handlers match URL patterns using wildcards:

```typescript
// ✅ Correct - Matches any domain + path
http.get("*/api/v1/exams", async ({ request }) => { ... })

// ❌ Wrong - Only matches exact path (won't work)
http.get("/api/v1/exams", async ({ request }) => { ... })
```

---

## 🧪 Testing the Exams Module

### Available Mock Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/exams` | List all exams with filters |
| `GET` | `/api/v1/exam_types/:school_id` | Get exam types |
| `GET` | `/api/v1/exams/kpi` | Get KPI metrics |
| `POST` | `/api/v1/exams` | Create new exam |
| `PUT` | `/api/v1/exams/:id` | Update exam |
| `DELETE` | `/api/v1/exams/:id` | Delete exam |
| `POST` | `/api/v1/exams/:id/publish` | Publish/unpublish exam |
| `GET` | `/api/v1/report_cards/:exam_id` | Get report card |
| `GET` | `/api/v1/pdf/report_card/:exam_id` | Download PDF |

### Testing Workflow

1. **Navigate to Exams Page**: `/academics/exams`
2. **Check Console**: You should see MSW interception logs:
   ```
   🔶 MSW: Intercepted GET /api/v1/exams
   🔶 MSW: Query params: {academicYearId: 2025, classId: 8, section: "A"}
   🔶 MSW: Returning 5 exams
   ```

3. **Verify UI**:
   - ✅ KPI cards show metrics
   - ✅ Exam list displays data
   - ✅ Filters work (class, section, exam type)
   - ✅ Create/Edit/Delete operations work

4. **Test CRUD Operations**:
   - Click "Add Exam" → Fill form → Submit
   - Check console for `POST /api/v1/exams`
   - Verify new exam appears in list

---

## 📝 Extending Mock Data

### Adding New Mock Exams

Edit `src/app/mocks/exams.handlers.ts`:

```typescript
const mockExams: Exam[] = [
  // Add your new exam here
  {
    id: 7,
    school_id: 2,
    academic_year_id: 2025,
    class_id: 9,
    section: "A",
    exam_type_id: 1,
    exam_type_name: "Mid-Term",
    title: "Physics Mid-Term",
    date: "2025-10-15",
    total_marks: 100,
    average_score: 75.2,
    highest_score: 98,
    pass_percentage: 87,
    is_published: true,
  },
  // ... existing exams
];
```

### Creating New Mock Handlers

For a new module (e.g., "Marks"):

1. **Create handler file**: `src/app/mocks/marks.handlers.ts`

```typescript
import { http, HttpResponse, delay } from "msw";

export const marksHandlers = [
  http.get("*/api/v1/marks", async ({ request }) => {
    console.log("🔶 MSW: Intercepted GET /api/v1/marks");
    await delay(300);
    return HttpResponse.json([/* mock data */]);
  }),
];
```

2. **Register in main handlers**: Edit `src/app/mocks/handlers.ts`

```typescript
import { marksHandlers } from "./marks.handlers";

export const handlers = [
  // ... existing handlers
  ...marksHandlers,
];
```

---

## 🐛 Debugging

### MSW Not Intercepting Requests?

1. **Check console** for MSW startup message:
   ```
   🔶 MSW mocking enabled
   ```

2. **Verify `.env.development`**:
   ```env
   VITE_API_BASE_URL=
   ```
   ⚠️ Must be empty or omitted for mocks to work!

3. **Check handler paths**: Must use wildcard pattern:
   ```typescript
   // ✅ Correct
   http.get("*/api/v1/exams", ...)

   // ❌ Wrong
   http.get("/api/v1/exams", ...)
   ```

4. **Look for 404 errors** in Network tab:
   - If you see 404s, the handler path doesn't match the request
   - Check the request URL in the Network tab
   - Ensure handler uses the same path

### Data Not Appearing in UI?

1. **Check React Query DevTools**:
   - Open browser console
   - Look for query keys: `["exams", ...]`, `["exam_kpi", ...]`
   - Check if queries show "success" status

2. **Verify Zod Schemas**: Mock data must match schema definitions in `exams.schema.ts`

3. **Check filters**: Ensure default filters match mock data:
   ```typescript
   // ExamsPage.tsx
   const [filters, setFilters] = useState({
     academic_year_id: 2025,  // Must match mock data
     class_id: 8,              // Must match mock data
     section: "A",             // Must match mock data
   });
   ```

---

## 🔄 Switching Modes

### Development with Mocks → Live Backend

1. Update `.env.development`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

2. Restart dev server:
   ```bash
   pnpm dev
   ```

3. Verify in console:
   ```
   🔶 HTTP Client: API Base URL: http://localhost:8000/api/v1
   ```

### Live Backend → Mocks

1. Update `.env.development`:
   ```env
   VITE_API_BASE_URL=
   ```

2. Restart dev server

3. Verify MSW logs appear

---

## 📊 Mock Data Scenarios

### Current Exam Scenarios

The mock data includes:

1. **Published Exams** (visible to students):
   - Mathematics Mid-Term (Class 8A)
   - Science Mid-Term (Class 8A)
   - Social Studies Unit Test (Class 8A)
   - Hindi Unit Test (Class 8A)
   - Mathematics Mid-Term (Class 8B)

2. **Unpublished Exams** (draft):
   - English Final Exam (Class 8A)

3. **Various Exam Types**:
   - Mid-Term (weightage: 30%)
   - Final (weightage: 50%)
   - Unit Test (weightage: 10%)
   - Monthly Test (weightage: 10%)

### Testing Edge Cases

To test error states, modify handlers temporarily:

```typescript
http.get("*/api/v1/exams", async () => {
  // Simulate server error
  return new HttpResponse(null, { status: 500 });

  // OR simulate empty results
  return HttpResponse.json([]);

  // OR simulate slow network
  await delay(5000);
  return HttpResponse.json(mockExams);
});
```

---

## 🎓 Best Practices

1. **Always log intercepts**: Use `console.log("🔶 MSW: ...")` in handlers
2. **Match production schemas**: Ensure mock data follows Zod schemas exactly
3. **Use realistic delays**: Add `await delay(200-500)` for realistic loading states
4. **Test filters**: Verify filters work with different query parameters
5. **Reset state**: Remember `mockExams` is mutated by CRUD operations—refresh page to reset

---

## 📚 Additional Resources

- [MSW Documentation](https://mswjs.io/)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Zod Validation](https://zod.dev/)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] MSW starts automatically in dev mode
- [ ] Console shows `🔶 MSW: Intercepted...` logs
- [ ] Exams page loads with data
- [ ] KPI cards display metrics
- [ ] Exam list shows 5-6 exams
- [ ] Filters work (class, section, exam type)
- [ ] Create exam works
- [ ] Edit exam works
- [ ] Delete exam works
- [ ] Publish/unpublish works
- [ ] Report card preview opens
- [ ] No 404 errors in Network tab
- [ ] React Query shows success states

---

**🎉 You're all set!** Your Exams module should now work seamlessly with mock data during development, and can easily switch to a live backend when ready.
