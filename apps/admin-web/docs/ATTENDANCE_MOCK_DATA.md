# Enhanced Mock Data Examples

This file contains example mock data for testing the enhanced Attendance module features.

## Sample Data Scenarios

### 1. Excellent Attendance Scenario (≥95%)

```typescript
// Weekly Summary Data
const excellentWeeklyData = {
  class_id: 101,
  week_start: "2025-11-03",
  buckets: [
    { grade_label: "1st", present_pct: 98.5 },
    { grade_label: "2nd", present_pct: 97.2 },
    { grade_label: "3rd", present_pct: 96.8 },
    { grade_label: "4th", present_pct: 95.3 },
    { grade_label: "5th", present_pct: 97.9 },
    { grade_label: "6th", present_pct: 96.1 },
    { grade_label: "7th", present_pct: 98.2 },
    { grade_label: "8th", present_pct: 97.5 },
  ],
};

// Expected Insight: "Excellent Attendance — weekly average is 97.2%"
```

### 2. Mixed Performance Scenario

```typescript
// Weekly Summary with Low-Performing Grade
const mixedWeeklyData = {
  class_id: 101,
  week_start: "2025-11-03",
  buckets: [
    { grade_label: "1st", present_pct: 92.5 },
    { grade_label: "2nd", present_pct: 88.7 },
    { grade_label: "3rd", present_pct: 91.2 },
    { grade_label: "4th", present_pct: 82.3 }, // Low performer
    { grade_label: "5th", present_pct: 89.5 },
    { grade_label: "6th", present_pct: 90.8 },
    { grade_label: "7th", present_pct: 93.1 },
    { grade_label: "8th", present_pct: 91.4 },
  ],
};

// Expected Insights:
// 1. "Weekly average is 89.9% — Good overall, room for improvement"
// 2. "4th grade shows 82.3% attendance — needs attention"
```

### 3. Positive Trend Range Data

```typescript
// Class Range with Improving Trend
const positiveTrendData = {
  class_id: 101,
  from: "2025-11-01",
  to: "2025-11-08",
  series: [
    { date: "2025-11-01", present_count: 22, absent_count: 4, late_count: 2 },
    { date: "2025-11-02", present_count: 23, absent_count: 3, late_count: 2 },
    { date: "2025-11-03", present_count: 24, absent_count: 3, late_count: 1 },
    { date: "2025-11-04", present_count: 25, absent_count: 2, late_count: 1 },
    { date: "2025-11-05", present_count: 26, absent_count: 1, late_count: 1 },
    { date: "2025-11-06", present_count: 26, absent_count: 2, late_count: 0 },
    { date: "2025-11-07", present_count: 27, absent_count: 1, late_count: 0 },
    { date: "2025-11-08", present_count: 27, absent_count: 1, late_count: 0 },
  ],
};

// Expected Insight: "Positive trend: Attendance improved by 3.1 students on average"
```

### 4. Negative Trend Range Data

```typescript
// Class Range with Declining Trend
const negativeTrendData = {
  class_id: 101,
  from: "2025-11-01",
  to: "2025-11-08",
  series: [
    { date: "2025-11-01", present_count: 27, absent_count: 1, late_count: 0 },
    { date: "2025-11-02", present_count: 26, absent_count: 2, late_count: 0 },
    { date: "2025-11-03", present_count: 25, absent_count: 2, late_count: 1 },
    { date: "2025-11-04", present_count: 24, absent_count: 3, late_count: 1 },
    { date: "2025-11-05", present_count: 23, absent_count: 3, late_count: 2 },
    { date: "2025-11-06", present_count: 22, absent_count: 4, late_count: 2 },
    { date: "2025-11-07", present_count: 21, absent_count: 5, late_count: 2 },
    { date: "2025-11-08", present_count: 20, absent_count: 6, late_count: 2 },
  ],
};

// Expected Insight: "Declining trend: Attendance decreased by 4.3 students — investigate causes"
```

### 5. High Tardiness Scenario

```typescript
// Daily Attendance with High Late Count
const highTardinessData = {
  items: [
    { attendance_id: 1, student_id: 1001, class_id: 101, date: "2025-11-08", status: "PRESENT", remarks: null, marked_by: "admin", marked_at: "2025-11-08T08:00:00Z" },
    { attendance_id: 2, student_id: 1002, class_id: 101, date: "2025-11-08", status: "LATE", remarks: "Bus delay", marked_by: "admin", marked_at: "2025-11-08T08:15:00Z" },
    { attendance_id: 3, student_id: 1003, class_id: 101, date: "2025-11-08", status: "LATE", remarks: null, marked_by: "admin", marked_at: "2025-11-08T08:17:00Z" },
    { attendance_id: 4, student_id: 1004, class_id: 101, date: "2025-11-08", status: "PRESENT", remarks: null, marked_by: "admin", marked_at: "2025-11-08T08:00:00Z" },
    { attendance_id: 5, student_id: 1005, class_id: 101, date: "2025-11-08", status: "LATE", remarks: null, marked_by: "admin", marked_at: "2025-11-08T08:20:00Z" },
    { attendance_id: 6, student_id: 1006, class_id: 101, date: "2025-11-08", status: "LATE", remarks: null, marked_by: "admin", marked_at: "2025-11-08T08:18:00Z" },
    { attendance_id: 7, student_id: 1007, class_id: 101, date: "2025-11-08", status: "LATE", remarks: null, marked_by: "admin", marked_at: "2025-11-08T08:22:00Z" },
    { attendance_id: 8, student_id: 1008, class_id: 101, date: "2025-11-08", status: "PRESENT", remarks: null, marked_by: "admin", marked_at: "2025-11-08T08:00:00Z" },
  ],
  total: 8,
};

// Expected Insight: "5 students marked late today (62.5%) — consider investigating patterns"
// Summary Cards: Late % = 62.5% (High status, red color)
```

### 6. Unmarked Students Scenario

```typescript
// Partially Marked Attendance
const unmarkedStudentsData = {
  items: [
    { attendance_id: 1, student_id: 1001, class_id: 101, date: "2025-11-08", status: "PRESENT", remarks: null, marked_by: "admin", marked_at: "2025-11-08T08:00:00Z" },
    { attendance_id: 2, student_id: 1002, class_id: 101, date: "2025-11-08", status: "PRESENT", remarks: null, marked_by: "admin", marked_at: "2025-11-08T08:00:00Z" },
    { attendance_id: 3, student_id: 1003, class_id: 101, date: "2025-11-08", status: "ABSENT", remarks: "Sick", marked_by: "admin", marked_at: "2025-11-08T08:00:00Z" },
    // ... only 10 out of 18 students marked
  ],
  total: 18, // Total students in class
};

// Expected Insight: "8 Students Unmarked — Complete attendance marking for accurate tracking"
// Summary Cards: Unmarked = 8 (Action Required status, red color)
```

### 7. Student History Example

```typescript
// Student Attendance History
const studentHistoryData = {
  student_id: 1005,
  records: [
    { date: "2025-11-08", status: "LATE", class_id: 101, remarks: "Bus delay" },
    { date: "2025-11-07", status: "PRESENT", class_id: 101, remarks: null },
    { date: "2025-11-06", status: "PRESENT", class_id: 101, remarks: null },
    { date: "2025-11-05", status: "LATE", class_id: 101, remarks: null },
    { date: "2025-11-04", status: "PRESENT", class_id: 101, remarks: null },
    { date: "2025-11-03", status: "ABSENT", class_id: 101, remarks: "Medical appointment" },
    { date: "2025-11-02", status: "PRESENT", class_id: 101, remarks: null },
    { date: "2025-11-01", status: "PRESENT", class_id: 101, remarks: null },
    { date: "2025-10-31", status: "LATE", class_id: 101, remarks: null },
    { date: "2025-10-30", status: "PRESENT", class_id: 101, remarks: null },
  ],
};

// Pattern: Frequent lateness (3 out of 10 days) — may need intervention
```

---

## Color Coding Reference

### Summary Card Colors

```typescript
// Present Percentage
const presentColors = {
  excellent: { threshold: "≥90%", color: "#4caf50", status: "Excellent" },
  good: { threshold: "80-90%", color: "#ff9800", status: "Good" },
  needsAttention: { threshold: "<80%", color: "#f44336", status: "Needs Attention" },
};

// Late Percentage
const lateColors = {
  low: { threshold: "≤10%", color: "#4caf50", status: "Low" },
  moderate: { threshold: "10-15%", color: "#ff9800", status: "Moderate" },
  high: { threshold: ">15%", color: "#f44336", status: "High" },
};

// Unmarked Count
const unmarkedColors = {
  complete: { threshold: "0", color: "#4caf50", status: "Complete" },
  pending: { threshold: "1-5", color: "#ff9800", status: "Pending" },
  actionRequired: { threshold: ">5", color: "#f44336", status: "Action Required" },
};
```

---

## CSV Upload Format

### Valid CSV Example

```csv
student_id,class_id,date,status,remarks
1001,101,2025-11-08,PRESENT,
1002,101,2025-11-08,ABSENT,Sick
1003,101,2025-11-08,LATE,Bus delay
1004,101,2025-11-08,PRESENT,
1005,101,2025-11-08,EXCUSED,Medical appointment
```

### CSV Validation Rules

```typescript
const csvValidation = {
  student_id: "Must be a valid number",
  class_id: "Must be a valid number",
  date: "Must be YYYY-MM-DD format",
  status: "Must be one of: PRESENT, ABSENT, LATE, EXCUSED",
  remarks: "Optional text field",
};
```

### Invalid CSV Examples

```csv
// Missing required field
student_id,class_id,date,status
1001,101,2025-11-08

// Invalid status
student_id,class_id,date,status
1001,101,2025-11-08,UNKNOWN

// Invalid date format
student_id,class_id,date,status
1001,101,11/08/2025,PRESENT

// Non-numeric IDs
student_id,class_id,date,status
ABC,101,2025-11-08,PRESENT
```

---

## Integration with MSW Handlers

Update `attendance.handlers.ts` to use varied scenarios:

```typescript
import { http, HttpResponse } from "msw";

export const attendanceHandlers = [
  // Daily list - high tardiness scenario
  http.get("*/v1/attendance/", ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const class_id = url.searchParams.get("class_id");

    // Generate realistic data based on filters
    const items = generateDailyAttendance(Number(class_id), date || "2025-11-08");

    return HttpResponse.json({ items, total: 32 });
  }),

  // Weekly summary - mixed performance
  http.get("*/v1/attendance/class/:classId/summary", ({ params }) => {
    const mixedBuckets = [
      { grade_label: "1st", present_pct: 92.5 },
      { grade_label: "2nd", present_pct: 88.7 },
      { grade_label: "3rd", present_pct: 91.2 },
      { grade_label: "4th", present_pct: 82.3 },
      { grade_label: "5th", present_pct: 89.5 },
      { grade_label: "6th", present_pct: 90.8 },
      { grade_label: "7th", present_pct: 93.1 },
      { grade_label: "8th", present_pct: 91.4 },
    ];

    return HttpResponse.json({
      class_id: Number(params.classId),
      week_start: "2025-11-03",
      buckets: mixedBuckets
    });
  }),

  // Range data - positive trend
  http.get("*/v1/attendance/class/:classId/range", ({ params, request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const series = generateRangeSeries(from!, to!, "positive");

    return HttpResponse.json({
      class_id: Number(params.classId),
      from: from!,
      to: to!,
      series
    });
  }),

  // Student history
  http.get("*/v1/attendance/students/:sid", ({ params }) => {
    const records = generateStudentHistory(Number(params.sid), 30);

    return HttpResponse.json({
      student_id: Number(params.sid),
      records
    });
  }),
];

// Helper functions
function generateDailyAttendance(classId: number, date: string) {
  // Generate 28 students with varying statuses
  return Array.from({ length: 28 }, (_, i) => ({
    attendance_id: i + 1,
    student_id: 1000 + i,
    class_id: classId,
    date,
    status: i % 4 === 0 ? "LATE" : i % 10 === 0 ? "ABSENT" : "PRESENT",
    remarks: i % 10 === 0 ? "Sick" : null,
    marked_by: "admin@school",
    marked_at: new Date().toISOString(),
  }));
}

function generateRangeSeries(from: string, to: string, trend: "positive" | "negative" | "stable") {
  const days = getDaysBetween(from, to);
  let basePresent = trend === "positive" ? 20 : trend === "negative" ? 27 : 24;

  return days.map((date, i) => {
    const presentCount = basePresent + (trend === "positive" ? i : trend === "negative" ? -i : 0);
    return {
      date,
      present_count: Math.max(15, Math.min(28, presentCount)),
      absent_count: Math.floor(Math.random() * 4) + 1,
      late_count: Math.floor(Math.random() * 3),
    };
  });
}

function generateStudentHistory(studentId: number, days: number) {
  const statuses = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];
  const weights = [0.7, 0.15, 0.1, 0.05]; // 70% present, 15% absent, etc.

  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);

    return {
      date: date.toISOString().slice(0, 10),
      status: weightedRandom(statuses, weights),
      class_id: 101,
      remarks: Math.random() > 0.9 ? "Random remark" : null,
    };
  });
}
```

---

## Testing Scenarios

### Test Case 1: Perfect Day
- All students present
- Expected: Green cards, "Excellent" status, no insights

### Test Case 2: High Absence Day
- 30% absent
- Expected: Red present card, "Needs Attention", insight about low attendance

### Test Case 3: Monday Morning
- 20% late (traffic/bus delays)
- Expected: Orange late card, "High Tardiness" insight

### Test Case 4: Incomplete Marking
- 10 students unmarked
- Expected: Red unmarked card, "Action Required", insight prompt

### Test Case 5: Improving Trend
- Week 1: 85% → Week 2: 92%
- Expected: Positive trend icon, green message in range chart

### Test Case 6: Declining Grade
- One grade drops to 78%
- Expected: Red bar in weekly chart, specific grade alert in insights

---

**File Purpose**: This mock data guide helps developers test all edge cases and visual states of the enhanced Attendance module.

**Last Updated**: November 8, 2025
