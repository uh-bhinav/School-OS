# 📚 Marks Agent - Enhanced Edition

An intelligent agent for comprehensive student academic performance management and analysis, built with Google ADK.

## 🌟 Features

### Core Capabilities
- **Individual Student Tracking**: Complete marks history across all subjects and exams
- **Exam-Based Analysis**: View all students' performance in specific exams
- **Subject-Specific Queries**: Get grades and performance in particular subjects
- **Performance Summaries**: Comprehensive academic performance analysis
- **Topper Lists**: Identify top performers in any subject
- **Low Performer Detection**: Automatically identify students needing academic support
- **Class Averages**: Calculate subject-wise class statistics
- **Student Comparisons**: Compare academic performance between multiple students
- **Progress Tracking**: Monitor student improvement over time in specific subjects

### Advanced Features
1. **Comprehensive Performance Analysis**:
   - Overall percentage across all subjects
   - Best and worst subject performances
   - Grade distribution
   - Performance status (Excellent/Good/Average/Below Average/Needs Improvement)

2. **Intelligent Categorization**:
   - 🏆 **Excellent**: ≥90%
   - ✅ **Good**: 75-89%
   - 📊 **Average**: 60-74%
   - ⚠️ **Below Average**: 40-59%
   - 🚨 **Needs Improvement**: <40%

3. **Multi-Dimensional Analysis**:
   - Subject-wise class averages
   - Exam-wide comprehensive reports
   - Student progress tracking over multiple exams
   - Top performer rankings
   - Grade distribution analysis

## 🛠️ Available Tools

### 1. `get_student_marks`
Get all marks records for a specific student.
```python
student_name: str  # e.g., "Aarav Sharma"
```

### 2. `get_exam_marks`
Get all marks for a specific exam across all students.
```python
exam_name: str  # e.g., "Midterm 1"
```

### 3. `get_student_grade_in_subject`
Get grade details for a student in a specific subject.
```python
student_name: str  # e.g., "Diya Patel"
subject: str       # e.g., "Mathematics"
```

### 4. `get_student_performance_analysis`
Get comprehensive performance analysis with statistics and insights.
```python
student_name: str  # e.g., "Aarav Sharma"
```

### 5. `find_subject_toppers`
Get top performers in a subject.
```python
subject: str      # e.g., "Mathematics"
exam: str = None  # Optional exam filter
limit: int = 5    # Number of top students
```

### 6. `find_low_performers`
Identify students scoring below threshold.
```python
threshold: float = 40.0  # Minimum percentage
subject: str = None      # Optional subject filter
```

### 7. `get_subject_class_average`
Calculate class average for a subject.
```python
subject: str      # e.g., "Science"
exam: str = None  # Optional exam filter
```

### 8. `compare_students_performance`
Compare performance between multiple students.
```python
student_names: List[str]  # e.g., ["Aarav Sharma", "Diya Patel"]
```

### 9. `get_exam_comprehensive_analysis`
Get comprehensive exam analysis with subject-wise breakdown.
```python
exam_name: str  # e.g., "Midterm 1"
```

### 10. `get_student_subject_progress`
Track student performance in a subject across exams.
```python
student_name: str  # e.g., "Rohan Kumar"
subject: str       # e.g., "Science"
```

## 💬 Example Queries

### Student-Specific Queries
```
"Show me Aarav Sharma's marks"
"What's Diya Patel's performance summary?"
"How did Rohan Kumar perform overall?"
"What grade did Aarav get in Mathematics?"
```

### Subject-Level Queries
```
"Who are the top 5 students in Mathematics?"
"What's the class average in Science?"
"Show me the best performers in Kannada"
"Which students are struggling in Mathematics?"
```

### Exam-Based Queries
```
"Show all marks for Midterm 1"
"Analyze Midterm 1 exam results"
"What was the class performance in Midterm 1?"
```

### Comparative Queries
```
"Compare Aarav and Diya's performance"
"Who performed better, Aarav or Rohan?"
"Compare academic records of top 3 students"
```

### Progress Tracking Queries
```
"Show Rohan's progress in Science"
"How has Diya improved in Mathematics?"
"Track Aarav's performance across all exams"
```

### Intervention Queries
```
"Find all students scoring below 40%"
"Who needs academic support in Science?"
"Show students with failing grades"
```

## 📁 Data Structure

The agent works with CSV data containing:
- `student_name`: Full name of the student
- `subject`: Subject name (e.g., "Mathematics", "Science")
- `exam`: Exam identifier (e.g., "Midterm 1")
- `marks`: Marks obtained by the student
- `total`: Total marks possible
- `grade`: Letter grade (A, B, C, D, F)

## 🎯 Use Cases

### For Teachers
- Monitor individual student academic progress
- Identify students who need extra help
- Recognize and celebrate top performers
- Analyze subject-wise class performance
- Track improvement over multiple exams
- Generate performance reports

### For Administrators
- Analyze exam-wide performance patterns
- Identify subjects that need curriculum improvement
- Monitor overall academic health of the school
- Generate comparative reports
- Track grade distributions

### For Students & Parents
- Check exam results and grades
- View overall performance summary
- Compare with class averages
- Track progress over time
- Identify strengths and weaknesses

## 🔄 Integration

The marks agent is integrated into the multi-agent system:

```python
from manager.sub_agents.marks_agent import marks_agent
```

## 📊 Response Formats

### Student Performance Summary
```json
{
  "student_name": "Aarav Sharma",
  "total_subjects": 2,
  "total_marks_obtained": 163,
  "total_marks_possible": 200,
  "overall_percentage": 81.5,
  "grade_distribution": {"A": 1, "B": 1},
  "best_performance": {
    "subject": "Mathematics",
    "marks": 88,
    "total": 100,
    "percentage": 88.0,
    "grade": "A"
  },
  "worst_performance": {
    "subject": "Science",
    "marks": 75,
    "total": 100,
    "percentage": 75.0,
    "grade": "B"
  },
  "performance_status": "Good"
}
```

### Subject Toppers
```json
[
  {
    "rank": 1,
    "student_name": "Diya Patel",
    "marks": 92,
    "total": 100,
    "percentage": 92.0,
    "grade": "A",
    "exam": "Midterm 1"
  },
  {
    "rank": 2,
    "student_name": "Aarav Sharma",
    "marks": 88,
    "total": 100,
    "percentage": 88.0,
    "grade": "A",
    "exam": "Midterm 1"
  }
]
```

### Class Average
```json
{
  "subject": "Mathematics",
  "exam": "Midterm 1",
  "total_students": 3,
  "average_marks": 90.0,
  "total_marks": 100,
  "average_percentage": 90.0,
  "highest_marks": 92,
  "lowest_marks": 88,
  "grade_distribution": {"A": 3}
}
```

### Exam Analysis
```json
{
  "exam_name": "Midterm 1",
  "total_students": 3,
  "total_subjects": 4,
  "overall_average_percentage": 78.5,
  "subject_wise_analysis": [
    {
      "subject": "Mathematics",
      "average_marks": 90.0,
      "total_marks": 100,
      "average_percentage": 90.0,
      "highest": 92,
      "lowest": 88
    }
  ],
  "grade_distribution": {"A": 5, "B": 2, "D": 1}
}
```

## 🚀 Future Enhancements

Potential improvements for future versions:
- [ ] Predictive analytics for academic performance
- [ ] Automated parent notifications for low scores
- [ ] Integration with attendance for correlation analysis
- [ ] Report card generation (PDF/Excel)
- [ ] Subject difficulty analysis
- [ ] Teacher performance insights
- [ ] Personalized study recommendations
- [ ] Trend analysis with visualizations
- [ ] Integration with learning management systems
- [ ] Custom grading scales configuration

## 📈 Performance Metrics

The agent tracks:
- **Individual Performance**: Per student, per subject
- **Class Performance**: Averages and distributions
- **Exam Performance**: Cross-subject analysis
- **Progress Tracking**: Performance over time
- **Comparative Analysis**: Multi-student comparisons

## 📝 Best Practices

### For Querying
- Be specific about student names and subjects
- Use exact exam names as they appear in the data
- Specify thresholds when looking for low performers
- Request limited results for topper lists (default: 5)

### For Analysis
- Always check both individual and class averages
- Look for trends across multiple exams
- Consider grade distributions for fuller context
- Compare with classmates for relative performance

### For Interventions
- Focus on students consistently below 40%
- Identify subject-specific struggles
- Track improvement after interventions
- Celebrate progress, not just absolute scores

## 🤝 Contributing

To enhance the marks agent:
1. Add new methods to `MarksAgentHelper` class
2. Create corresponding tool functions with `@tool` decorator
3. Add tools to the agent's tools list
4. Update documentation and examples

## 📄 License

Part of the Agent Development Kit Crash Course project.
