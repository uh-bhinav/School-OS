# ✅ Exams Module Verification Checklist

Use this checklist to verify that the MSW fix is working correctly.

## 🚀 Pre-Testing Setup

- [ ] Stop any running dev servers
- [ ] Verify `.env.development` exists with `VITE_API_BASE_URL=` (empty)
- [ ] Run `pnpm install` (if needed)
- [ ] Clear browser cache (Cmd+Shift+R on Chrome)

## 🔍 Step 1: MSW Initialization

Start the dev server:
```bash
pnpm dev
```

**Expected Console Output**:
- [ ] `🔶 MSW mocking enabled`
- [ ] `🔐 Auto-logged in as admin (dev mode)`
- [ ] `🔶 HTTP Client: Running in MOCK mode`
- [ ] No errors about missing `VITE_API_BASE_URL`

## 🧪 Step 2: Navigate to Exams Page

1. Open browser to: `http://localhost:5173`
2. Click on **Academics** → **Exams** (or go to `/academics/exams`)

**Expected Console Logs** (should appear immediately):
- [ ] `🔶 MSW: Intercepted GET /api/v1/exams`
- [ ] `🔶 MSW: Query params: {academicYearId: 2025, classId: 8, section: "A"}`
- [ ] `🔶 MSW: Returning 5 exams`
- [ ] `🔶 MSW: Intercepted GET /api/v1/exam_types/1`
- [ ] `🔶 MSW: Returning 4 exam types`
- [ ] `🔶 MSW: Intercepted GET /api/v1/exams/kpi`
- [ ] `🔶 MSW: Returning KPI: {...}`

## 📊 Step 3: Verify KPI Cards

**Top of page should show 5 KPI cards**:

| KPI | Expected Value | ✓ |
|-----|----------------|---|
| Total Exams | 5 | [ ] |
| Avg Performance | ~69.7% | [ ] |
| Pass Rate | ~85.0% | [ ] |
| Pending Results | 1 | [ ] |
| Published | 4 | [ ] |

- [ ] All cards have colored icons
- [ ] Tooltips appear on hover
- [ ] No "NaN" or undefined values

## 📋 Step 4: Verify Exam List

**Table should display 5 exams**:

| # | Exam Title | Type | Date | Published | ✓ |
|---|------------|------|------|-----------|---|
| 1 | Mathematics Mid-Term Exam | Mid-Term | Sep 15, 2025 | ✅ Published | [ ] |
| 2 | Science Mid-Term Exam | Mid-Term | Sep 18, 2025 | ✅ Published | [ ] |
| 3 | English Final Exam | Final | Nov 20, 2025 | ❌ Draft | [ ] |
| 4 | Social Studies Unit Test 1 | Unit Test | Aug 10, 2025 | ✅ Published | [ ] |
| 5 | Hindi Unit Test 1 | Unit Test | Aug 12, 2025 | ✅ Published | [ ] |

- [ ] All 5 exams are visible
- [ ] Published/Draft chips show correct status
- [ ] Dates are formatted correctly
- [ ] Three-dot menu appears on each row

## 🎛️ Step 5: Test Filters

### Change Class Filter

1. Click **Class** dropdown
2. Select **Class 9**

**Expected**:
- [ ] Console shows: `🔶 MSW: Intercepted GET /api/v1/exams`
- [ ] Exam list becomes empty (no Class 9 exams in mock data)
- [ ] KPI cards update (all zeros)
- [ ] No errors

3. Change back to **Class 8**

**Expected**:
- [ ] 5 exams reappear
- [ ] KPI cards restore

### Change Section Filter

1. Click **Section** dropdown
2. Select **Section B**

**Expected**:
- [ ] Console shows MSW intercept
- [ ] Only 1 exam appears (Mathematics Mid-Term for 8B)
- [ ] KPI updates

### Change Exam Type Filter

1. Click **Exam Type** dropdown
2. Select **Unit Test**

**Expected**:
- [ ] List filters to show only Unit Test exams
- [ ] KPI updates accordingly

## ➕ Step 6: Test Create Exam

1. Click **Add Exam** button

**Expected**:
- [ ] Dialog opens with form
- [ ] "Exam Type" dropdown populates with 4 types
- [ ] Date picker shows today's date

2. Fill in the form:
   - Title: `Test Exam 1`
   - Exam Type: `Mid-Term`
   - Date: (any future date)
   - Total Marks: `100`

3. Click **Save**

**Expected Console**:
- [ ] `🔶 MSW: Intercepted POST /api/v1/exams`
- [ ] `🔶 MSW: Created exam: 101` (or similar ID)

**Expected UI**:
- [ ] Dialog closes
- [ ] New exam appears in the list
- [ ] KPI cards update (Total Exams increases)
- [ ] No errors

## ✏️ Step 7: Test Edit Exam

1. Click three-dot menu on any exam
2. Select **Edit**

**Expected**:
- [ ] Dialog opens with form pre-filled
- [ ] All fields show correct values

3. Change the title to `Updated Exam Title`
4. Click **Save**

**Expected Console**:
- [ ] `🔶 MSW: Intercepted PUT /api/v1/exams/:id`
- [ ] `🔶 MSW: Updated exam: <id>`

**Expected UI**:
- [ ] Dialog closes
- [ ] Exam title updates in the list
- [ ] No errors

## 🗑️ Step 8: Test Delete Exam

1. Click three-dot menu on an exam
2. Select **Delete**

**Expected**:
- [ ] Confirmation dialog appears
- [ ] Shows exam details
- [ ] Warning message displayed

3. Click **Delete Exam**

**Expected Console**:
- [ ] `🔶 MSW: Intercepted DELETE /api/v1/exams/:id`
- [ ] `🔶 MSW: Deleted exam: <id>`

**Expected UI**:
- [ ] Dialog closes
- [ ] Exam removed from list
- [ ] KPI updates (Total Exams decreases)
- [ ] No errors

## 📢 Step 9: Test Publish/Unpublish

1. Click three-dot menu on an unpublished exam (English Final)
2. Select **Publish**

**Expected Console**:
- [ ] `🔶 MSW: Intercepted POST /api/v1/exams/:id/publish`
- [ ] `🔶 MSW: Published exam: <id> true`

**Expected UI**:
- [ ] Status chip changes to "Published" (green)
- [ ] KPI updates (Pending decreases, Published increases)

3. Click menu again and select **Unpublish**

**Expected**:
- [ ] Status reverts to "Draft"
- [ ] KPI updates

## 📄 Step 10: Test Report Card Preview

1. Click three-dot menu on a published exam
2. Select **View Report Card**

**Expected Console**:
- [ ] `🔶 MSW: Intercepted GET /api/v1/report_cards/:exam_id`

**Expected UI**:
- [ ] Dialog opens with report card
- [ ] Shows student list (5 students for exam ID 1)
- [ ] Displays grades, marks, pass/fail status
- [ ] Download PDF button appears

3. Click **Download PDF**

**Expected Console**:
- [ ] `🔶 MSW: Intercepted GET /api/v1/pdf/report_card/:exam_id`

**Expected UI**:
- [ ] PDF download initiates
- [ ] No errors

## 🔍 Step 11: Test Export

1. Click **Export** button (download icon)
2. Select **Export as CSV**

**Expected**:
- [ ] CSV file downloads
- [ ] Filename: `exams_class_8_section_A.csv`
- [ ] Contains exam data in CSV format

## 🌐 Step 12: Network Tab Verification

Open Chrome DevTools → Network Tab:

- [ ] No **404** errors
- [ ] No **500** errors
- [ ] No **CORS** errors
- [ ] Requests show "(from service worker)" or similar indicator
- [ ] No actual HTTP requests to `localhost:8000`

## 🧩 Step 13: React Query DevTools

Open React Query DevTools (F12 → React Query tab):

**Check Query Keys**:
- [ ] `["exams", {...}]` - Shows "success" status
- [ ] `["exam_kpi", {...}]` - Shows "success" status
- [ ] `["exam_types", 1]` - Shows "success" status

**Data Inspection**:
- [ ] Click on query → "Data" tab shows mock exam objects
- [ ] No "error" states
- [ ] "staleTime" and "gcTime" configured

## 🔄 Step 14: Test Mode Switching

### Switch to Live Backend Mode

1. Stop dev server (Ctrl+C)
2. Edit `.env.development`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```
3. Restart: `pnpm dev`

**Expected Console**:
- [ ] `🔶 HTTP Client: API Base URL: http://localhost:8000/api/v1`
- [ ] No MSW interception logs

4. Navigate to `/academics/exams`

**Expected**:
- [ ] Network tab shows actual HTTP requests to `localhost:8000`
- [ ] 404 errors (expected - backend not running)

### Switch Back to Mock Mode

1. Stop dev server
2. Edit `.env.development`:
   ```env
   VITE_API_BASE_URL=
   ```
3. Restart: `pnpm dev`

**Expected**:
- [ ] MSW logs return
- [ ] Data loads successfully again

## 📝 Final Checks

- [ ] No console errors anywhere
- [ ] No React warnings
- [ ] All interactions feel smooth (loading states work)
- [ ] Page refresh preserves data (mocks reset)
- [ ] All documentation files created:
  - [ ] `MOCKS_README.md`
  - [ ] `EXAMS_MSW_FIX.md`
  - [ ] `.env.development`

---

## 🎯 Success Criteria

**All checks should pass**. If any fail:

1. **Check console for errors** - Look for specific error messages
2. **Verify `.env.development`** - Must have empty `VITE_API_BASE_URL`
3. **Check handler patterns** - Should use `*/api/v1/...`
4. **Review API paths** - Should be `/api/v1/...`
5. **Clear cache and restart** - Sometimes needed after changes

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| MSW not starting | Check `main.tsx` for MSW initialization |
| No intercept logs | Verify `.env.development` has empty base URL |
| 404 errors | Check handler path matches API path exactly |
| Data not showing | Verify filter values match mock data |
| Query errors | Check Zod schema matches mock data structure |

---

**When all checkboxes are ticked**: ✅ **Exams module is fully functional with MSW!**

🎉 You can now develop the frontend independently, switch to live backend anytime, and extend mocks easily.
