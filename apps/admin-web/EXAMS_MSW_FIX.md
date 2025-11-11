# 🔧 Exams Module MSW Fix - Technical Summary

## Problem Diagnosis

The Exams page was failing to load mock data despite:
- ✅ MSW being properly initialized
- ✅ Mock handlers defined in `exams.handlers.ts`
- ✅ API hooks and schemas correctly implemented
- ✅ UI components working correctly

### Root Cause: URL Path Mismatch

**Issue 1: Handler Path Patterns**
```typescript
// ❌ Original (WRONG)
http.get("/v1/exams", ...)
```

MSW handlers were using simple paths without wildcards. When axios made requests to `http://localhost:8000/api/v1/exams`, MSW couldn't match them because:
1. The handler pattern `/v1/exams` only matches the path portion
2. MSW couldn't match the full URL with domain and port

**Issue 2: API Path Mismatch**
```typescript
// ❌ Original API paths
const BASE = "/v1/exams";

// ✅ Fixed API paths
const BASE = "/api/v1/exams";
```

The API layer was using `/v1/exams` but the actual backend (and `.env`) expected `/api/v1/exams`.

**Issue 3: Base URL Configuration**
```typescript
// ❌ Original - Required base URL always
if (!baseURL) {
  throw new Error("Missing API base URL");
}

// ✅ Fixed - Allow empty in dev mode
if (!baseURL && import.meta.env.PROD) {
  throw new Error("Missing API base URL");
}
```

The HTTP client threw an error when `VITE_API_BASE_URL` was empty, preventing MSW from working.

---

## Solution Applied

### 1. Updated MSW Handler Patterns

**File**: `src/app/mocks/exams.handlers.ts`

```typescript
// ✅ FIXED - Uses wildcard pattern
export const examsHandlers = [
  http.get("*/api/v1/exams", async ({ request }) => {
    console.log("🔶 MSW: Intercepted GET /api/v1/exams");
    // ... handler logic
  }),

  http.get("*/api/v1/exam_types/:school_id", async ({ params }) => {
    console.log("🔶 MSW: Intercepted GET /api/v1/exam_types/:school_id", params.school_id);
    // ... handler logic
  }),

  // ... all other endpoints updated similarly
];
```

**Key Changes**:
- Added `*` wildcard prefix: `*/api/v1/exams`
- Included `/api` in the path to match the full endpoint structure
- Added console logging for debugging

### 2. Fixed API Path Constants

**File**: `src/app/services/exams.api.ts`

```typescript
// ✅ FIXED
const BASE = "/api/v1/exams";
const TYPES = "/api/v1/exam_types";
const KPI = "/api/v1/exams/kpi";
```

**File**: `src/app/services/reportcard.api.ts`

```typescript
// ✅ FIXED
const BASE = "/api/v1/report_cards";
const PDF = "/api/v1/pdf/report_card";
```

### 3. Updated HTTP Client for Mock Mode

**File**: `src/app/services/http.ts`

```typescript
const baseURL = import.meta.env.VITE_API_BASE_URL;

// ✅ Allow empty baseURL in development for MSW
if (!baseURL && import.meta.env.PROD) {
  throw new Error("Missing API base URL");
}

const resolvedBaseURL = baseURL || "";

if (!baseURL && import.meta.env.DEV) {
  console.log("🔶 HTTP Client: Running in MOCK mode");
} else {
  console.log("🔶 HTTP Client: API Base URL:", resolvedBaseURL);
}

export const http = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});
```

### 4. Created Environment Configuration

**File**: `.env.development` (NEW)

```env
# Development Environment Configuration

VITE_SUPABASE_URL=https://nrowqnfyfjbsjbzqvkzr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...

# Empty base URL enables MSW mock interception
VITE_API_BASE_URL=
```

**File**: `.env` (UPDATED)

```env
# Production/Real Backend Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## Technical Deep Dive

### How MSW Matches Requests

MSW uses **path matching** with optional wildcards:

```typescript
// Pattern: "*/api/v1/exams"
// Matches:
//   ✅ http://localhost:8000/api/v1/exams
//   ✅ https://api.example.com/api/v1/exams
//   ✅ /api/v1/exams (relative URL)

// Pattern: "/api/v1/exams" (no wildcard)
// Matches:
//   ❌ http://localhost:8000/api/v1/exams (has domain)
//   ✅ /api/v1/exams (relative URL only)
```

### Request Flow: Before vs After

#### Before (Not Working)

```
1. ExamsPage renders
   ↓
2. useExams hook calls getExams()
   ↓
3. Axios request: GET http://localhost:8000/api/v1/exams
   ↓
4. MSW tries to match "/v1/exams" pattern
   ↓
5. ❌ No match (domain doesn't match)
   ↓
6. Request bypasses MSW → 404 Error
```

#### After (Working)

```
1. ExamsPage renders
   ↓
2. useExams hook calls getExams()
   ↓
3. Axios request: GET /api/v1/exams (relative URL with empty baseURL)
   ↓
4. MSW matches "*/api/v1/exams" pattern
   ↓
5. ✅ Handler intercepts request
   ↓
6. Console: "🔶 MSW: Intercepted GET /api/v1/exams"
   ↓
7. Returns mock data → UI renders successfully
```

---

## Verification Steps

### 1. Check Console Logs

After starting dev server (`pnpm dev`), you should see:

```
🔶 MSW mocking enabled
🔶 HTTP Client: Running in MOCK mode
```

When navigating to `/academics/exams`:

```
🔶 MSW: Intercepted GET /api/v1/exams
🔶 MSW: Query params: {academicYearId: 2025, classId: 8, section: "A"}
🔶 MSW: Returning 5 exams

🔶 MSW: Intercepted GET /api/v1/exam_types/1
🔶 MSW: Returning 4 exam types

🔶 MSW: Intercepted GET /api/v1/exams/kpi
🔶 MSW: KPI Query params: {academicYearId: 2025, classId: 8}
🔶 MSW: Returning KPI: {total_exams: 5, avg_performance: 69.7, ...}
```

### 2. Check Network Tab

- No 404 errors
- No actual HTTP requests (they're intercepted by MSW)
- Requests might show as "Service Worker" in Chrome DevTools

### 3. Verify UI

- **KPI Cards**: Should show metrics (5 total exams, ~70% avg performance, etc.)
- **Exam List**: Should display 5 exams for Class 8A
- **Filters**: Changing class/section should trigger new MSW intercepts
- **CRUD Operations**: Create/Edit/Delete should work and log MSW intercepts

---

## Common Pitfalls & Solutions

### Problem: "MSW is not intercepting my requests"

**Symptoms**: 404 errors, no console logs from MSW

**Solutions**:
1. Check `.env.development` has `VITE_API_BASE_URL=` (empty)
2. Restart dev server after changing `.env`
3. Verify handler pattern uses wildcard: `*/api/v1/...`
4. Check handler path matches API path exactly

### Problem: "Data is undefined in React Query"

**Symptoms**: Loading states never complete, `data` is `undefined`

**Solutions**:
1. Open React Query DevTools (F12 → Components → React Query)
2. Check if queries show "error" status
3. Verify mock data matches Zod schema exactly
4. Check console for Zod validation errors

### Problem: "Filters don't return data"

**Symptoms**: Changing filters shows empty list

**Solutions**:
1. Check default filter values match mock data:
   ```typescript
   const mockExams = [
     { academic_year_id: 2025, class_id: 8, section: "A", ... }
   ];
   ```
2. Verify handler filter logic:
   ```typescript
   let filtered = mockExams.filter(e => e.academic_year_id === academicYearId);
   ```
3. Add logging to handler to debug filter values

---

## Files Changed

### Modified Files
1. ✏️ `src/app/mocks/exams.handlers.ts` - Updated all handler patterns, added logging
2. ✏️ `src/app/services/exams.api.ts` - Fixed API path constants
3. ✏️ `src/app/services/reportcard.api.ts` - Fixed API path constants
4. ✏️ `src/app/services/http.ts` - Allow empty baseURL in dev mode
5. ✏️ `.env` - Added documentation comment

### New Files
1. ✨ `.env.development` - Dev-specific config with empty base URL
2. ✨ `MOCKS_README.md` - Comprehensive MSW documentation
3. ✨ `EXAMS_MSW_FIX.md` - This technical summary

---

## Testing Checklist

After applying this fix:

- [x] ✅ MSW starts in development mode
- [x] ✅ Console shows interception logs
- [x] ✅ Exams list loads with 5 items
- [x] ✅ KPI cards show metrics
- [x] ✅ Exam types dropdown populates
- [x] ✅ Filters work correctly
- [x] ✅ Create exam works
- [x] ✅ Edit exam works
- [x] ✅ Delete exam works
- [x] ✅ Publish/unpublish works
- [x] ✅ No 404 errors in Network tab
- [x] ✅ Can switch to live backend by updating `.env.development`

---

## Future Enhancements

1. **Add More Test Scenarios**:
   - Multiple academic years
   - Different exam types
   - Edge cases (no exams, all unpublished, etc.)

2. **Enhance Mock Data**:
   - Add subject-wise breakdown
   - Include student-level marks
   - Add historical trend data

3. **Error Scenarios**:
   - Handler for 500 errors
   - Network timeout simulation
   - Partial data scenarios

4. **Performance Testing**:
   - Large dataset handlers (100+ exams)
   - Pagination support
   - Search functionality

---

## References

- [MSW Documentation](https://mswjs.io/docs/)
- [Wildcard Matching in MSW](https://mswjs.io/docs/api/http#wildcards)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)

---

**Status**: ✅ **FIXED** - Mock data now renders successfully on the Exams page.

**Last Updated**: November 9, 2025
