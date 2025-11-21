# 📊 Attendance Agent - Enhanced Edition

An intelligent agent for comprehensive student attendance management and analysis, built with Google ADK.

## 🌟 Features

### Core Capabilities
- **Individual Student Tracking**: Complete attendance history for any student
- **Date-Based Queries**: View all students' attendance on specific dates
- **Class Summaries**: Aggregate statistics for entire classes
- **Trend Analysis**: Track attendance patterns over time
- **Low Attendance Detection**: Automatically identify at-risk students
- **Period-Wise Breakdown**: Analyze attendance by class periods
- **Student Comparison**: Compare attendance metrics between multiple students

### Advanced Features
1. **Detailed Statistics**: Get comprehensive attendance metrics including:
   - Attendance percentage
   - Present/Absent/Late counts
   - Date ranges
   - Status assessment (Good/Warning/Critical)

2. **Intelligent Alerts**: Automatically categorizes students:
   - ✅ **Good**: ≥75% attendance
   - ⚠️ **Warning**: 60-74% attendance
   - 🚨 **Critical**: <60% attendance

3. **Trend Analysis**: Understand attendance patterns:
   - Daily attendance rates
   - Average class performance
   - Temporal patterns

## 🛠️ Available Tools

### 1. `get_student_attendance`
Get complete attendance records for a specific student.
```python
student_name: str  # e.g., "Aarav Sharma"
```

### 2. `get_attendance_by_date`
Get attendance for all students on a specific date.
```python
date: str  # Format: YYYY-MM-DD (e.g., "2025-10-11")
```

### 3. `get_class_attendance_summary`
Get overall attendance summary for a class.
```python
class_name: str  # e.g., "5A"
```

### 4. `get_student_attendance_statistics`
Get detailed statistics for a student including percentages and status.
```python
student_name: str  # e.g., "Diya Patel"
```

### 5. `find_students_with_low_attendance`
Identify students below attendance threshold.
```python
threshold: float = 75.0  # Minimum attendance percentage
class_name: str = None   # Optional class filter
```

### 6. `get_class_attendance_trends`
Analyze daily attendance trends for a class.
```python
class_name: str  # e.g., "5A"
```

### 7. `get_period_attendance`
Get period-wise attendance breakdown for a specific date.
```python
class_name: str  # e.g., "5A"
date: str        # Format: YYYY-MM-DD
```

### 8. `compare_student_attendance`
Compare attendance between multiple students.
```python
student_names: List[str]  # e.g., ["Aarav Sharma", "Diya Patel"]
```

## 💬 Example Queries

### Student-Specific Queries
```
"Show me the attendance for Aarav Sharma"
"What's Diya Patel's attendance percentage?"
"Get attendance statistics for Rohan Kumar"
```

### Class-Level Queries
```
"What's the attendance summary for class 5A?"
"Show attendance trends for class 5A"
"Which students in 5A have low attendance?"
```

### Date-Based Queries
```
"Show attendance for 2025-10-11"
"What was the attendance on October 11, 2025?"
"Period-wise attendance for 5A on 2025-10-11"
```

### Comparative Queries
```
"Compare attendance between Aarav Sharma and Diya Patel"
"Who has better attendance, Aarav or Rohan?"
```

### Alert Queries
```
"Find all students with attendance below 75%"
"Show me students with critical attendance"
"Who needs attendance improvement in class 5A?"
```

## 📁 Data Structure

The agent works with CSV data containing:
- `id`: Unique identifier
- `student_name`: Full name of the student
- `class`: Class identifier (e.g., "5A")
- `grade`: Grade level
- `section`: Section identifier
- `date`: Date of attendance (YYYY-MM-DD)
- `status`: Present, Absent, or Late
- `period`: Class period number

## 🎯 Use Cases

### For Teachers
- Monitor individual student attendance
- Identify students who need intervention
- Generate attendance reports
- Track class-wide trends

### For Administrators
- Analyze school-wide attendance patterns
- Identify classes with low attendance
- Generate compliance reports
- Monitor attendance improvement

### For Parents
- Check their child's attendance record
- View attendance percentage
- Compare with class averages

## 🔄 Integration

The attendance agent is integrated into the multi-agent system and can be accessed through the manager agent:

```python
from manager.sub_agents.attendance_agent import attendance_agent
```

## 📊 Response Format

### Student Statistics Response
```json
{
  "student_name": "Aarav Sharma",
  "class": "5A",
  "total_days_tracked": 10,
  "present": 8,
  "absent": 1,
  "late": 1,
  "attendance_percentage": 80.0,
  "date_range": "2025-10-11 to 2025-10-20",
  "latest_status": "Present",
  "latest_date": "2025-10-20",
  "status": "Good"
}
```

### Low Attendance Response
```json
[
  {
    "student_name": "Rohan Kumar",
    "class": "5A",
    "attendance_percentage": 65.5,
    "days_present": 6,
    "total_days": 10,
    "days_absent": 3,
    "days_late": 1
  }
]
```

## 🚀 Future Enhancements

Potential improvements for future versions:
- [ ] Predictive analytics for attendance trends
- [ ] Integration with SMS/Email alerts
- [ ] Automated parent notifications
- [ ] Attendance certificates generation
- [ ] Integration with academic performance data
- [ ] Export to PDF/Excel reports
- [ ] Attendance forecasting
- [ ] Customizable alert thresholds

## 📝 Notes

- All dates should be in YYYY-MM-DD format
- Class names are case-insensitive (5a = 5A)
- Student names are case-insensitive
- Attendance percentage is calculated as: (Present / Total) × 100
- Late status is tracked separately but doesn't count as absent

## 🤝 Contributing

To enhance the attendance agent:
1. Add new methods to `AttendanceAgentHelper` class
2. Create corresponding tool functions with `@tool` decorator
3. Add tools to the agent's tools list
4. Update documentation

## 📄 License

Part of the Agent Development Kit Crash Course project.
