# Backend Integration Example

## Quick Start: Connecting Real Data to Dashboard

This guide shows you **exactly** how to replace mock data with real backend APIs.

---

## 📡 Backend Endpoints Required

Create these 5 endpoints in your FastAPI backend:

### 1. Dashboard Metrics
```
GET /api/schools/{school_id}/dashboard/metrics
```

**Response:**
```json
{
  "total_students": 1247,
  "total_teachers": 68,
  "total_classes": 42,
  "pending_fees": 285000000,
  "announcements_count": 12,
  "attendance_percentage": 92.5,
  "student_growth_percentage": 5.2,
  "fee_collection_percentage": 12.8,
  "admission_growth_percentage": 8.3,
  "announcement_growth_percentage": -2.1
}
```

### 2. Revenue Data
```
GET /api/schools/{school_id}/dashboard/revenue?months=8
```

**Response:**
```json
[
  { "month": "Jan", "fees": 245000, "expenses": 180000, "admissions": 15 },
  { "month": "Feb", "fees": 268000, "expenses": 175000, "admissions": 22 },
  { "month": "Mar", "fees": 312000, "expenses": 195000, "admissions": 35 }
]
```

### 3. Student Distribution
```
GET /api/schools/{school_id}/dashboard/student-distribution
```

**Response:**
```json
[
  { "grade_range": "Grades 1-3", "count": 342, "percentage": 27.4 },
  { "grade_range": "Grades 4-6", "count": 385, "percentage": 30.9 },
  { "grade_range": "Grades 7-8", "count": 246, "percentage": 19.7 }
]
```

### 4. Attendance by Grade
```
GET /api/schools/{school_id}/dashboard/attendance-by-grade
```

**Response:**
```json
[
  {
    "grade": "Grade 1",
    "present_percentage": 94.5,
    "absent_percentage": 5.5,
    "total_students": 128
  },
  {
    "grade": "Grade 2",
    "present_percentage": 93.2,
    "absent_percentage": 6.8,
    "total_students": 115
  }
]
```

### 5. Module Usage
```
GET /api/schools/{school_id}/dashboard/module-usage?days=7
```

**Response:**
```json
[
  {
    "module_key": "academics.attendance",
    "module_name": "Attendance",
    "usage_percentage": 87,
    "active_users": 52
  },
  {
    "module_key": "finance.fees",
    "module_name": "Fee Management",
    "usage_percentage": 94,
    "active_users": 18
  }
]
```

### 6. Key Insights (Optional but recommended)
```
GET /api/schools/{school_id}/dashboard/insights
```

**Response:**
```json
[
  {
    "type": "success",
    "category": "Academics",
    "message": "Attendance improved by 5% this week — Grades 3 and 6 showed the biggest improvement."
  },
  {
    "type": "warning",
    "category": "Finance",
    "message": "Fee collection 15% below target — send reminders to parents with pending balances."
  }
]
```

---

## 🔧 FastAPI Implementation Example

```python
# backend/app/api/v1/dashboard.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import Student, Teacher, Class, Fee, Announcement, Attendance
from datetime import datetime, timedelta
from sqlalchemy import func
from typing import List

router = APIRouter()

@router.get("/schools/{school_id}/dashboard/metrics")
async def get_dashboard_metrics(
    school_id: int,
    db: Session = Depends(get_db)
):
    """Get overall dashboard metrics with growth percentages"""

    # Current metrics
    total_students = db.query(Student).filter(
        Student.school_id == school_id,
        Student.status == 'active'
    ).count()

    total_teachers = db.query(Teacher).filter(
        Teacher.school_id == school_id,
        Teacher.status == 'active'
    ).count()

    total_classes = db.query(Class).filter(
        Class.school_id == school_id
    ).count()

    # Pending fees (in paisa)
    pending_fees = db.query(func.sum(Fee.amount)).filter(
        Fee.school_id == school_id,
        Fee.status == 'pending'
    ).scalar() or 0

    # Announcements this month
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0)
    announcements_count = db.query(Announcement).filter(
        Announcement.school_id == school_id,
        Announcement.created_at >= current_month_start
    ).count()

    # Calculate growth percentages (compare with last month)
    last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)

    last_month_students = db.query(Student).filter(
        Student.school_id == school_id,
        Student.created_at < current_month_start,
        Student.status == 'active'
    ).count()

    student_growth_percentage = (
        ((total_students - last_month_students) / last_month_students * 100)
        if last_month_students > 0 else 0
    )

    # ... calculate other growth percentages similarly

    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_classes": total_classes,
        "pending_fees": pending_fees,
        "announcements_count": announcements_count,
        "attendance_percentage": 92.5,  # Calculate from attendance table
        "student_growth_percentage": round(student_growth_percentage, 1),
        "fee_collection_percentage": 12.8,  # Calculate from fee payments
        "admission_growth_percentage": 8.3,  # Calculate from admissions
        "announcement_growth_percentage": -2.1  # Calculate from announcements
    }


@router.get("/schools/{school_id}/dashboard/revenue")
async def get_revenue_data(
    school_id: int,
    months: int = Query(8, ge=1, le=12),
    db: Session = Depends(get_db)
):
    """Get monthly revenue data for the specified number of months"""

    from dateutil.relativedelta import relativedelta
    import calendar

    revenue_data = []
    current_date = datetime.now()

    for i in range(months):
        month_date = current_date - relativedelta(months=months - i - 1)
        month_start = month_date.replace(day=1, hour=0, minute=0, second=0)
        month_end = month_date.replace(
            day=calendar.monthrange(month_date.year, month_date.month)[1],
            hour=23, minute=59, second=59
        )

        # Fee collection for the month
        fees = db.query(func.sum(Fee.amount)).filter(
            Fee.school_id == school_id,
            Fee.paid_at >= month_start,
            Fee.paid_at <= month_end,
            Fee.status == 'paid'
        ).scalar() or 0

        # Admission revenue (first term fee)
        admissions_revenue = db.query(func.sum(Student.admission_fee)).filter(
            Student.school_id == school_id,
            Student.created_at >= month_start,
            Student.created_at <= month_end
        ).scalar() or 0

        # Expenses (if tracked)
        expenses = 0  # Implement based on your expense tracking

        revenue_data.append({
            "month": month_date.strftime("%b"),
            "fees": int(fees / 100),  # Convert paisa to rupees
            "expenses": expenses,
            "admissions": db.query(Student).filter(
                Student.school_id == school_id,
                Student.created_at >= month_start,
                Student.created_at <= month_end
            ).count()
        })

    return revenue_data


@router.get("/schools/{school_id}/dashboard/student-distribution")
async def get_student_distribution(
    school_id: int,
    db: Session = Depends(get_db)
):
    """Get student distribution by grade ranges"""

    total_students = db.query(Student).filter(
        Student.school_id == school_id,
        Student.status == 'active'
    ).count()

    if total_students == 0:
        return []

    # Define grade ranges
    grade_ranges = [
        ("Grades 1-3", [1, 2, 3]),
        ("Grades 4-6", [4, 5, 6]),
        ("Grades 7-8", [7, 8]),
        ("Grades 9-10", [9, 10]),
        ("Grades 11-12", [11, 12])
    ]

    distribution = []
    for range_name, grades in grade_ranges:
        count = db.query(Student).filter(
            Student.school_id == school_id,
            Student.grade.in_(grades),
            Student.status == 'active'
        ).count()

        percentage = (count / total_students * 100) if total_students > 0 else 0

        distribution.append({
            "grade_range": range_name,
            "count": count,
            "percentage": round(percentage, 1)
        })

    return distribution


@router.get("/schools/{school_id}/dashboard/attendance-by-grade")
async def get_attendance_by_grade(
    school_id: int,
    db: Session = Depends(get_db)
):
    """Get attendance statistics by grade for the current week"""

    from datetime import datetime, timedelta

    # Get current week (Monday to Sunday)
    today = datetime.now()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    attendance_data = []

    for grade in range(1, 13):  # Grades 1-12
        # Total students in this grade
        total_students = db.query(Student).filter(
            Student.school_id == school_id,
            Student.grade == grade,
            Student.status == 'active'
        ).count()

        if total_students == 0:
            continue

        # Present count this week
        present_count = db.query(func.count(Attendance.id)).filter(
            Attendance.school_id == school_id,
            Attendance.date >= week_start,
            Attendance.date <= week_end,
            Attendance.grade == grade,
            Attendance.status == 'present'
        ).scalar() or 0

        # Total attendance records (present + absent)
        total_records = db.query(func.count(Attendance.id)).filter(
            Attendance.school_id == school_id,
            Attendance.date >= week_start,
            Attendance.date <= week_end,
            Attendance.grade == grade
        ).scalar() or 1  # Avoid division by zero

        present_percentage = (present_count / total_records * 100) if total_records > 0 else 0
        absent_percentage = 100 - present_percentage

        attendance_data.append({
            "grade": f"Grade {grade}",
            "present_percentage": round(present_percentage, 1),
            "absent_percentage": round(absent_percentage, 1),
            "total_students": total_students
        })

    return attendance_data


@router.get("/schools/{school_id}/dashboard/module-usage")
async def get_module_usage(
    school_id: int,
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """Get module usage statistics for the last N days"""

    # This requires tracking module usage in your database
    # Example implementation:

    from datetime import datetime, timedelta

    start_date = datetime.now() - timedelta(days=days)

    modules = [
        {
            "module_key": "academics.attendance",
            "module_name": "Attendance",
        },
        {
            "module_key": "finance.fees",
            "module_name": "Fee Management",
        },
        {
            "module_key": "academics.exams",
            "module_name": "Exams",
        },
        {
            "module_key": "comms.announcements",
            "module_name": "Announcements",
        },
    ]

    usage_data = []
    total_staff = db.query(Teacher).filter(
        Teacher.school_id == school_id,
        Teacher.status == 'active'
    ).count()

    for module in modules:
        # Query user activity logs for this module
        active_users = db.query(func.count(func.distinct(ActivityLog.user_id))).filter(
            ActivityLog.school_id == school_id,
            ActivityLog.module == module["module_key"],
            ActivityLog.timestamp >= start_date
        ).scalar() or 0

        usage_percentage = (active_users / total_staff * 100) if total_staff > 0 else 0

        usage_data.append({
            "module_key": module["module_key"],
            "module_name": module["module_name"],
            "usage_percentage": round(usage_percentage),
            "active_users": active_users
        })

    return usage_data


@router.get("/schools/{school_id}/dashboard/insights")
async def generate_key_insights(
    school_id: int,
    db: Session = Depends(get_db)
):
    """Generate actionable insights based on current data"""

    insights = []

    # 1. Attendance Insight
    avg_attendance = db.query(func.avg(Attendance.present_percentage)).filter(
        Attendance.school_id == school_id,
        Attendance.date >= datetime.now() - timedelta(days=7)
    ).scalar() or 0

    if avg_attendance >= 93:
        insights.append({
            "type": "success",
            "category": "Academics",
            "message": f"Excellent attendance at {avg_attendance:.1f}% this week — well above the 90% target."
        })
    elif avg_attendance < 85:
        insights.append({
            "type": "warning",
            "category": "Academics",
            "message": f"Attendance at {avg_attendance:.1f}% (below 90% target) — investigate causes and contact parents."
        })

    # 2. Fee Collection Insight
    pending_fees = db.query(func.sum(Fee.amount)).filter(
        Fee.school_id == school_id,
        Fee.status == 'pending'
    ).scalar() or 0

    if pending_fees > 5000000:  # More than 5L pending
        insights.append({
            "type": "warning",
            "category": "Finance",
            "message": f"₹{pending_fees/100000:.1f}L in pending fees — send automated reminders to parents."
        })

    # 3. Capacity Insight
    capacity_issues = db.query(Class).filter(
        Class.school_id == school_id,
        Class.enrolled_students >= Class.capacity * 0.95
    ).count()

    if capacity_issues > 0:
        insights.append({
            "type": "info",
            "category": "Administration",
            "message": f"{capacity_issues} classes are nearing full capacity — consider opening additional sections."
        })

    # 4. Engagement Insight
    low_engagement_modules = db.query(Module).filter(
        Module.school_id == school_id,
        Module.usage_percentage < 70
    ).count()

    if low_engagement_modules > 0:
        insights.append({
            "type": "info",
            "category": "Administration",
            "message": f"{low_engagement_modules} modules have low usage — schedule training sessions for staff."
        })

    return insights[:5]  # Return top 5 insights
```

---

## 🔄 Frontend Integration

No changes needed! The dashboard already uses TanStack Query hooks. Just ensure your backend endpoints match the paths in `/services/queries/dashboard.ts`:

```typescript
// This file is already configured correctly
export function useDashboardMetrics(schoolId: number) {
  return useQuery({
    queryKey: ['dashboard', 'metrics', schoolId],
    queryFn: async () => {
      const response = await http.get<DashboardMetrics>(
        `/schools/${schoolId}/dashboard/metrics`  // ← Backend endpoint
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!schoolId,
  });
}
```

---

## ✅ Testing the Integration

### 1. Test with Postman/Thunder Client

```bash
GET http://localhost:8000/api/schools/2/dashboard/metrics
GET http://localhost:8000/api/schools/2/dashboard/revenue?months=8
GET http://localhost:8000/api/schools/2/dashboard/student-distribution
GET http://localhost:8000/api/schools/2/dashboard/attendance-by-grade
GET http://localhost:8000/api/schools/2/dashboard/module-usage?days=7
GET http://localhost:8000/api/schools/2/dashboard/insights
```

### 2. Verify Response Format

Ensure each endpoint returns data in the exact format shown in the mock data examples.

### 3. Test in Development

The dashboard will automatically use real data once the backend is running and MSW is disabled in production mode.

---

## 🚀 Deployment Checklist

- [ ] All 6 backend endpoints implemented
- [ ] Response formats match TypeScript interfaces
- [ ] Database queries optimized (use indexes)
- [ ] Error handling added to all endpoints
- [ ] CORS configured for frontend domain
- [ ] Authentication middleware applied
- [ ] Rate limiting configured
- [ ] Caching headers set appropriately
- [ ] Tested with real school data
- [ ] MSW disabled in production build

---

## 📊 SQL Optimization Tips

### Add Indexes

```sql
-- Index for student queries
CREATE INDEX idx_students_school_status ON students(school_id, status);
CREATE INDEX idx_students_grade ON students(grade);

-- Index for attendance queries
CREATE INDEX idx_attendance_school_date ON attendance(school_id, date);
CREATE INDEX idx_attendance_grade ON attendance(grade);

-- Index for fee queries
CREATE INDEX idx_fees_school_status ON fees(school_id, status);
CREATE INDEX idx_fees_paid_at ON fees(paid_at);

-- Index for announcements
CREATE INDEX idx_announcements_school_created ON announcements(school_id, created_at);
```

### Use Database Views

```sql
-- Create a view for quick attendance stats
CREATE VIEW vw_weekly_attendance AS
SELECT
  school_id,
  grade,
  DATE_TRUNC('week', date) as week_start,
  COUNT(*) FILTER (WHERE status = 'present') * 100.0 / COUNT(*) as present_percentage
FROM attendance
GROUP BY school_id, grade, week_start;
```

---

## 🔐 Security Considerations

1. **Authentication**: Ensure all endpoints check user permissions
2. **School Isolation**: Always filter by `school_id` from authenticated user
3. **Input Validation**: Validate query parameters (months, days)
4. **Rate Limiting**: Limit dashboard API calls to prevent abuse
5. **Data Sanitization**: Sanitize any user inputs before database queries

---

## 📈 Monitoring & Analytics

Track these metrics for your dashboard API:

- Response times for each endpoint
- Cache hit rates
- Error rates
- Most frequently called endpoints
- Peak usage times

Use tools like:
- **Sentry** for error tracking
- **DataDog** or **New Relic** for APM
- **Prometheus** + **Grafana** for custom metrics

---

This integration guide should give you everything you need to connect real data to your dashboard! 🎉
