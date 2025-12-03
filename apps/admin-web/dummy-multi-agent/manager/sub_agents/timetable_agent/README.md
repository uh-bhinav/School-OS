# 📅 Timetable Agent - Enhanced Edition

An intelligent agent for comprehensive timetable management, schedule analysis, and teacher workload tracking, built with Google ADK.

## 🌟 Features

### Core Capabilities
- **Class Timetables**: Complete weekly schedules for any class
- **Day-Specific Schedules**: View timetables for specific days
- **Teacher Schedules**: Full weekly schedules for teachers
- **Teacher Workload Analysis**: Comprehensive workload statistics
- **Subject Schedules**: Track when subjects are taught across classes
- **Period Analysis**: See what's scheduled in specific periods
- **Availability Checking**: Verify teacher availability for specific times
- **Free Period Detection**: Find gaps in class schedules
- **Schedule Comparison**: Compare timetables across multiple classes

### Advanced Features
1. **Intelligent Schedule Organization**:
   - Automatic sorting by day and period
   - Day-order awareness (Monday→Sunday)
   - Chronological period arrangement
   - Clear, structured output

2. **Teacher Workload Analytics**:
   - Total periods per week
   - Classes and subjects taught
   - Day-wise breakdown
   - Subject-wise distribution
   - Average workload calculation

3. **Subject Distribution Analysis**:
   - Periods per subject per week
   - Percentage distribution
   - Subject frequency tracking
   - Curriculum balance insights

4. **Availability Management**:
   - Real-time availability checking
   - Conflict detection
   - Free period identification
   - Scheduling assistance

## 🛠️ Available Tools

### 1. `get_class_timetable`
Get complete weekly timetable for a class.
```python
class_name: str  # e.g., "5A"
```

### 2. `get_class_day_timetable`
Get timetable for a specific day.
```python
class_name: str  # e.g., "5A"
day: str         # e.g., "Monday"
```

### 3. `get_teacher_full_schedule`
Get teacher's complete weekly schedule.
```python
teacher_name: str  # e.g., "Anjali Verma"
```

### 4. `get_teacher_workload_analysis`
Get comprehensive teacher workload analysis.
```python
teacher_name: str  # e.g., "Rajesh Kumar"
```

### 5. `get_subject_full_schedule`
Get all periods for a subject across classes.
```python
subject: str  # e.g., "Mathematics"
```

### 6. `get_period_all_classes`
Get what's scheduled in a specific period.
```python
period: int  # e.g., 1, 2, 3
```

### 7. `get_class_subject_distribution`
Analyze subject distribution in a class.
```python
class_name: str  # e.g., "5A"
```

### 8. `check_teacher_availability`
Check if teacher is free at a specific time.
```python
teacher_name: str  # e.g., "Sunita Gupta"
day: str           # e.g., "Monday"
period: int        # e.g., 3
```

### 9. `get_class_daily_breakdown`
Get day-wise schedule summary for a class.
```python
class_name: str  # e.g., "5A"
```

### 10. `find_class_free_periods`
Find free periods in a class schedule.
```python
class_name: str     # e.g., "5A"
day: str            # e.g., "Monday"
max_period: int = 8 # Maximum periods in a day
```

### 11. `get_teacher_daily_schedule`
Get teacher's schedule for a specific day.
```python
teacher_name: str  # e.g., "Vikram Rao"
day: str           # e.g., "Monday"
```

### 12. `compare_class_timetables`
Compare timetables across multiple classes.
```python
class_names: List[str]  # e.g., ["5A", "5B"]
```

## 💬 Example Queries

### Class Timetable Queries
```
"Show me the timetable for class 5A"
"What's the schedule for 5A?"
"Display the weekly timetable for class 5A"
```

### Day-Specific Queries
```
"What's the timetable for 5A on Monday?"
"Show Monday's schedule for class 5A"
"What subjects does 5A have on Friday?"
```

### Teacher Queries
```
"What classes does Anjali Verma teach?"
"Show me Rajesh Kumar's schedule"
"What's Sunita Gupta's weekly schedule?"
"How many periods does Vikram Rao teach?"
```

### Workload Analysis Queries
```
"What's Anjali Verma's workload?"
"How busy is Rajesh Kumar?"
"Show teacher workload for Meena Singh"
```

### Subject Queries
```
"When is Mathematics taught in 5A?"
"Show all Science classes"
"What's the Mathematics schedule?"
```

### Availability Queries
```
"Is Anjali Verma free on Monday period 3?"
"Check if Rajesh Kumar is available Tuesday period 2"
"Can Sunita Gupta take a class on Wednesday period 4?"
```

### Period Analysis Queries
```
"What's scheduled in period 1 across all classes?"
"Show all period 3 classes"
"What happens in the first period?"
```

### Distribution Queries
```
"How are subjects distributed in 5A?"
"Show subject frequency for class 5A"
"What's the subject breakdown for 5A?"
```

### Free Period Queries
```
"Find free periods for 5A on Monday"
"When is 5A free on Tuesday?"
"Show available periods for class 5A on Friday"
```

### Comparison Queries
```
"Compare timetables of 5A and 5B"
"What's different between class schedules?"
```

## 📁 Data Structure

The agent works with CSV data containing:
- `class`: Class identifier (e.g., "5A")
- `day`: Day of the week (Monday-Sunday)
- `period`: Period number (1, 2, 3, etc.)
- `subject`: Subject name (e.g., "Mathematics", "Science")
- `teacher`: Teacher's full name (e.g., "Anjali Verma")

## 🎯 Use Cases

### For School Administrators
- View and manage all class timetables
- Analyze teacher workload distribution
- Plan meeting times using free periods
- Balance subject allocation
- Identify scheduling conflicts
- Optimize teacher assignments

### For Teachers
- Check personal teaching schedule
- View workload and period distribution
- Find free periods for planning
- Check availability for additional classes
- See which classes they teach and when

### For Students & Parents
- View class weekly schedule
- Know which subjects are on which days
- Prepare for specific day schedules
- Plan study based on subject frequency

### For Academic Coordinators
- Ensure balanced subject distribution
- Monitor teacher workloads
- Identify potential scheduling issues
- Plan substitute teacher assignments
- Analyze curriculum time allocation

## 🔄 Integration

The timetable agent is integrated into the multi-agent system:

```python
from manager.sub_agents.timetable_agent import timetable_agent
```

## 📊 Response Formats

### Class Timetable
```json
[
  {
    "class": "5A",
    "day": "Monday",
    "period": 1,
    "subject": "Mathematics",
    "teacher": "Anjali Verma"
  },
  {
    "class": "5A",
    "day": "Monday",
    "period": 2,
    "subject": "Science",
    "teacher": "Rajesh Kumar"
  }
]
```

### Teacher Workload Analysis
```json
{
  "teacher_name": "Anjali Verma",
  "total_periods_per_week": 15,
  "classes_taught": ["5A", "5B"],
  "total_classes": 2,
  "subjects_taught": ["Mathematics"],
  "total_subjects": 1,
  "periods_per_day": {
    "Monday": 3,
    "Tuesday": 3,
    "Wednesday": 3,
    "Thursday": 3,
    "Friday": 3
  },
  "periods_per_subject": {
    "Mathematics": 15
  },
  "average_periods_per_day": 3.0
}
```

### Subject Distribution
```json
{
  "class": "5A",
  "total_periods_per_week": 25,
  "subject_distribution": {
    "Mathematics": {
      "periods_per_week": 5,
      "percentage": 20.0
    },
    "Science": {
      "periods_per_week": 5,
      "percentage": 20.0
    },
    "English": {
      "periods_per_week": 5,
      "percentage": 20.0
    }
  },
  "unique_subjects": 5
}
```

### Teacher Availability
```json
{
  "teacher": "Sunita Gupta",
  "day": "Monday",
  "period": 3,
  "available": false,
  "reason": "Teaching English to 5A"
}
```

### Daily Breakdown
```json
{
  "class": "5A",
  "daily_breakdown": {
    "Monday": {
      "total_periods": 5,
      "subjects": ["Mathematics", "Science", "English", "Social Studies", "Computer Science"],
      "teachers": ["Anjali Verma", "Rajesh Kumar", "Sunita Gupta", "Vikram Rao", "Meena Singh"],
      "periods": [1, 2, 3, 4, 5]
    }
  }
}
```

## 🚀 Future Enhancements

Potential improvements for future versions:
- [ ] Automated conflict detection
- [ ] Optimal timetable generation
- [ ] Substitute teacher suggestions
- [ ] Room allocation integration
- [ ] Event scheduling (exams, assemblies)
- [ ] Teacher preference tracking
- [ ] Student elective management
- [ ] Timetable export (PDF/Excel/iCal)
- [ ] Visual timetable generation
- [ ] Mobile app notifications
- [ ] Integration with attendance tracking
- [ ] Historical timetable archive

## 📈 Key Features

### Smart Sorting
- Chronological day ordering (Monday→Sunday)
- Period-wise organization
- Class-based grouping
- Teacher-centric views

### Workload Insights
- Total weekly periods
- Day-wise distribution
- Subject-wise breakdown
- Average calculations

### Availability Features
- Real-time conflict checking
- Free period identification
- Scheduling assistance
- Gap analysis

### Comparative Analysis
- Multi-class comparison
- Subject distribution comparison
- Teacher workload comparison
- Period utilization analysis

## 📝 Best Practices

### For Querying
- Use full teacher names as they appear in data
- Specify complete class identifiers (e.g., "5A" not just "5")
- Use proper day names (Monday, Tuesday, etc.)
- Period numbers should be integers

### For Scheduling
- Always check teacher availability before planning
- Consider free periods for meetings/activities
- Balance workload across days
- Ensure subject distribution aligns with curriculum

### For Analysis
- Review workload periodically to ensure fair distribution
- Check subject frequency matches curriculum requirements
- Identify and address scheduling conflicts early
- Use comparison tools for multi-class insights

## 🤝 Contributing

To enhance the timetable agent:
1. Add new methods to `TimetableAgentHelper` class
2. Create corresponding tool functions with `@tool` decorator
3. Add tools to the agent's tools list
4. Update documentation and examples

## 📄 License

Part of the Agent Development Kit Crash Course project.
