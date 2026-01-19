# 🚀 Exams Module - Quick Start Guide

## Getting Started in 3 Steps

### Step 1: Ensure MSW is Running ✓
The mock service worker should already be initialized in your project. If not:

```typescript
// src/main.tsx
import { worker } from "./mocks/browser";

if (import.meta.env.DEV) {
  worker.start();
}
```

### Step 2: Navigate to Exams Page ✓
Visit: `http://localhost:5173/academics/exams`

> **Note:** You must be logged in as an `admin` or `teacher` role.

### Step 3: Start Using! ✓
That's it! The module is fully functional with mock data.

---

## 📋 What You Can Do

### 1. **Filter Exams**
- Select Academic Year (2023-2026)
- Select Class (1-10)
- Select Section (A-D)
- Select Exam Type (optional)
- Click "Apply Filters"

### 2. **View KPI Metrics**
Hover over each card to see tooltips explaining:
- Total Exams
- Average Performance
- Pass Rate
- Pending Results
- Published Exams

### 3. **Add a New Exam**
1. Click "Add Exam" button
2. Fill in:
   - Exam Title (e.g., "Physics Final Exam")
   - Exam Type (Mid-Term, Final, Unit Test, Monthly)
   - Exam Date
   - Total Marks
3. Click "Create Exam"

### 4. **Edit an Exam**
1. Click the ⋮ menu on any exam row
2. Select "Edit Exam"
3. Modify details
4. Click "Update Exam"

### 5. **View Exam Details**
1. Click the ⋮ menu on any exam row
2. Select "View Details"
3. See performance metrics and statistics

### 6. **View Report Card**
1. Click the ⋮ menu on any exam row
2. Select "View Report Card"
3. See student-wise results with grades
4. Click "Download PDF" (mock download)

### 7. **Publish/Unpublish Results**
1. Click the ⋮ menu on any exam row
2. Select "Publish" or "Unpublish"
3. Status updates immediately

### 8. **Delete an Exam**
1. Click the ⋮ menu on any exam row
2. Select "Delete"
3. Confirm deletion in the dialog

### 9. **Export Data**
1. Click the download icon (top right)
2. Select "Export as CSV"
3. File downloads with current filtered data

---

## 🎯 Try These Scenarios

### Scenario 1: Browse Different Classes
1. Change Class to "9"
2. Change Section to "B"
3. Click "Apply Filters"
4. Notice the exam list and KPIs update

### Scenario 2: Create and Publish
1. Click "Add Exam"
2. Create "English Mid-Term Exam"
3. Save it (initially Draft)
4. Publish it via the action menu
5. See KPI metrics update

### Scenario 3: View Report Card
1. Find an exam with status "Published"
2. Click ⋮ → "View Report Card"
3. See student results
4. Note the color-coded grades
5. Check pass/fail statistics

### Scenario 4: Export to CSV
1. Filter exams (e.g., Class 8, Section A)
2. Click download icon → "Export as CSV"
3. Open the CSV file
4. Verify data matches the table

---

## 🔍 Understanding the UI

### Status Colors
- 🟢 **Green (Published)** - Results are live and visible to students
- ⚪ **Gray (Draft)** - Results are hidden

### Grade Colors
- 🟢 **Dark Green (A+)** - 90-100%
- 🟢 **Green (A)** - 80-89%
- 🔵 **Blue (B+/B)** - 60-79%
- 🟠 **Orange (C)** - 50-59%
- 🔴 **Red (D/F)** - Below 50%

### KPI Card Meanings
- **Total Exams** - All exams for selected filters
- **Avg Performance** - Average score across published exams
- **Pass Rate** - Percentage of students passing
- **Pending Results** - Exams not yet published
- **Published** - Exams with visible results

---

## 🐛 Troubleshooting

### Issue: Page shows "No exams found"
**Solution:** The default filters (Year: 2025, Class: 8, Section: A) have mock data. Try these exact values.

### Issue: Can't access the page
**Solution:**
1. Ensure you're logged in as `admin` or `teacher`
2. Check that `academics.exams` is in your school's subscribed modules

### Issue: Export doesn't work
**Solution:**
- CSV export works with real data
- PDF export shows an alert (backend needed)

### Issue: Report card is empty
**Solution:** Only Exam ID 1 (Mathematics Mid-Term) has sample student data. Try viewing that one.

### Issue: Changes don't persist after refresh
**Solution:** This is expected! MSW mocks reset on page refresh. Backend integration will persist data.

---

## 💡 Tips & Tricks

1. **Quick Testing** - Use Class 8, Section A, Year 2025 for immediate mock data
2. **Explore Actions** - Every exam has multiple actions in the ⋮ menu
3. **Responsive Design** - Try resizing your browser to see mobile layout
4. **Empty States** - Change to Class 10, Section D to see "No exams found"
5. **Loading States** - Watch for skeleton screens while data loads

---

## 📚 Next Steps

1. ✅ **Familiarize** yourself with all components
2. ✅ **Test** each CRUD operation
3. ✅ **Review** the code structure
4. ✅ **Check** the documentation in `EXAMS_MODULE.md`
5. ✅ **Prepare** for backend integration

---

## 📞 Need Help?

- 📖 See `EXAMS_MODULE.md` for detailed documentation
- 📊 See `EXAMS_IMPLEMENTATION_SUMMARY.md` for implementation details
- 🔧 Check browser console for any errors
- 🌐 Verify MSW handlers are registered in Network tab

---

**Enjoy exploring the Exams Module! 🎓**
