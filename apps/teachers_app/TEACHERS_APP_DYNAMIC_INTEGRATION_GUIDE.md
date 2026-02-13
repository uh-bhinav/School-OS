# Teachers App Dynamic Integration Guide
## Complete Handoff Document for Making the App Dynamic

---

## 📋 Table of Contents
1. [Current State Overview](#current-state-overview)
2. [Database Schema & Mapping](#database-schema--mapping)
3. [Backend API Status](#backend-api-status)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Step-by-Step Integration Process](#step-by-step-integration-process)
6. [Code Examples](#code-examples)
7. [Common Pitfalls & Debugging](#common-pitfalls--debugging)

---

## 1. Current State Overview

### What You Have Right Now
- ✅ **Flutter Teachers App** running successfully on Android emulator
- ✅ **18 Functional Modules** - all screens work but use hardcoded demo data
- ✅ **Backend FastAPI Server** at `http://localhost:8000/api/v1/`
- ✅ **PostgreSQL Database** with complete school management schema
- ✅ **Dependencies Installed**: `provider`, `http`, `shared_preferences`, `google_fonts`, `fl_chart`, etc.

### The 18 Modules in the App

| # | Module Name | Current State | Backend API Status |
|---|-------------|---------------|-------------------|
| 1 | Dashboard | Shows "Mr. Rajesh Kumar", hardcoded schedule | ✅ Ready |
| 2 | My Classes | Hardcoded 3 classes (8-A, 8-B, 9-A) | ✅ Ready |
| 3 | Attendance Management | Hardcoded 8 students, fake stats | ✅ Ready |
| 4 | Timetable Scheduling | Hardcoded weekly schedule | ✅ Ready |
| 5 | Gradebook/Marks | Hardcoded marks data | ✅ Ready |
| 6 | Announcements | Hardcoded announcements list | ✅ Ready |
| 7 | Achievements | Hardcoded achievements | ✅ Ready |
| 8 | Homework Assignments | Hardcoded homework | ❌ Need to build |
| 9 | Daily Diary | Hardcoded diary entries | ❌ Need to build |
| 10 | Task Manager | Hardcoded tasks | ❌ Need to build |
| 11 | Behaviour Notes | Hardcoded notes | ❌ Need to build |
| 12 | Supervisor Comments | Hardcoded comments | ❌ Need to build |
| 13 | Salary Tracker | Hardcoded salary data | ❌ Need to build |
| 14 | Leave Management | Hardcoded leave requests | ❌ Need to build |
| 15 | Resource Library | Hardcoded resources | ❌ Need to build |
| 16 | Event Management | Hardcoded events | ❌ Need to build |
| 17 | Analytics | Hardcoded charts/stats | ⚠️ Partial (needs custom queries) |
| 18 | Profile Settings | Hardcoded profile info | ✅ Ready |

### Your Mission
Transform this demo app into a **fully dynamic application** where all data comes from the real backend database instead of hardcoded values.

---

## 2. Database Schema & Mapping

### Key Database Tables for Teachers App

#### 2.1 Authentication & Profiles
```sql
-- Core user authentication
auth.users → Basic user account (email, password)
public.profiles → Extended user info (user_id, school_id, full_name, role)
public.user_roles → Links users to roles (user_id, role_id, school_id)
public.roles_definition → Role definitions (teacher, admin, etc.)
```

#### 2.2 Teacher-Specific Tables
```sql
-- Teacher information
public.teachers (id, user_id, school_id, employee_id, qualification, date_of_joining, subjects)
public.teacher_subjects (teacher_id, subject_id, school_id)
```

#### 2.3 Classes & Students
```sql
-- Class management
public.classes (id, school_id, academic_year_id, name, section, class_teacher_id, strength)
public.class_subjects (class_id, subject_id, teacher_id)
public.students (id, user_id, school_id, class_id, roll_number, date_of_birth)
public.student_contacts (student_id, contact_type, name, phone_number, email, relationship)
```

#### 2.4 Attendance (Partitioned Monthly)
```sql
-- Attendance records (partitioned by month for performance)
public.student_attendance (id, student_id, class_id, date, status, marked_by, marked_at)
  ↳ Partitions: student_attendance_2026_02, student_attendance_2026_03, etc.
```

#### 2.5 Timetable & Periods
```sql
-- Schedule management
public.timetable (id, school_id, academic_year_id, class_id, subject_id, teacher_id, day_of_week, period_number, room_number)
public.class_periods (id, school_id, period_number, start_time, end_time)
```

#### 2.6 Exams & Marks
```sql
-- Assessment management
public.exams (id, school_id, academic_year_id, class_id, exam_type_id, name, start_date, end_date)
public.exam_types (id, school_id, name, weightage, description)
public.marks (id, exam_id, student_id, subject_id, marks_obtained, total_marks, remarks, updated_by)
```

#### 2.7 Announcements & Achievements
```sql
-- Communication & recognition
public.announcements (id, school_id, title, content, created_by, target_audience, priority, expires_at)
public.student_achievements (id, student_id, school_id, achievement_type, title, description, date, awarded_by)
```

### 🗺️ Screen-to-Database Mapping

| Screen | Primary Tables | API Endpoint |
|--------|---------------|--------------|
| **Dashboard** | `profiles`, `teachers`, `timetable` | `GET /api/v1/users/me`, `GET /api/v1/timetable?teacher_id={id}&date={today}` |
| **My Classes** | `classes`, `class_subjects`, `teacher_subjects`, `students` | `GET /api/v1/classes?teacher_id={id}`, `GET /api/v1/classes/{class_id}/students` |
| **Attendance** | `student_attendance_YYYY_MM`, `students`, `classes` | `GET /api/v1/attendance-records/class/{class_id}`, `POST /api/v1/attendance-records/bulk` |
| **Timetable** | `timetable`, `class_periods`, `subjects`, `classes` | `GET /api/v1/timetable?teacher_id={id}&academic_year_id={id}` |
| **Gradebook** | `marks`, `exams`, `exam_types`, `students`, `subjects` | `GET /api/v1/marks?exam_id={id}`, `POST /api/v1/marks` |
| **Announcements** | `announcements`, `profiles` | `GET /api/v1/announcements?school_id={id}`, `POST /api/v1/announcements` |
| **Achievements** | `student_achievements`, `students` | `GET /api/v1/achievements?student_id={id}`, `POST /api/v1/achievements` |
| **Profile** | `profiles`, `teachers`, `subjects` | `GET /api/v1/users/me`, `PUT /api/v1/users/me` |

---

## 3. Backend API Status

### ✅ Ready APIs (You Can Start Immediately)

#### 3.1 Teachers Endpoints (`backend/app/api/v1/endpoints/teachers.py`)
```python
GET    /api/v1/teachers/me                 # Get current teacher profile
GET    /api/v1/teachers/{teacher_id}       # Get specific teacher
PUT    /api/v1/teachers/{teacher_id}       # Update teacher info
GET    /api/v1/teachers                    # List all teachers (admin)
```

#### 3.2 Attendance Endpoints (`backend/app/api/v1/endpoints/attendance_records.py`)
```python
GET    /api/v1/attendance-records/class/{class_id}           # Get class attendance
GET    /api/v1/attendance-records/class/{class_id}/summary   # Get attendance summary
POST   /api/v1/attendance-records/bulk                       # Submit attendance (multiple students)
GET    /api/v1/attendance-records/student/{student_id}       # Get student's attendance history
```

#### 3.3 Classes Endpoints (`backend/app/api/v1/endpoints/classes.py`)
```python
GET    /api/v1/classes                     # Get teacher's classes (filtered by teacher_id query param)
GET    /api/v1/classes/{class_id}          # Get specific class details
GET    /api/v1/classes/{class_id}/students # Get all students in a class
POST   /api/v1/classes                     # Create new class (admin)
PUT    /api/v1/classes/{class_id}          # Update class (admin)
```

#### 3.4 Timetable Endpoints (`backend/app/api/v1/endpoints/timetable.py`)
```python
GET    /api/v1/timetable                   # Get timetable (filter by teacher_id, class_id, date)
GET    /api/v1/timetable/{timetable_id}    # Get specific timetable entry
POST   /api/v1/timetable                   # Create timetable entry
PUT    /api/v1/timetable/{timetable_id}    # Update timetable entry
DELETE /api/v1/timetable/{timetable_id}    # Delete timetable entry
```

#### 3.5 Marks Endpoints (`backend/app/api/v1/endpoints/marks.py`)
```python
GET    /api/v1/marks                       # Get marks (filter by exam_id, student_id, subject_id)
POST   /api/v1/marks                       # Create marks entry
PUT    /api/v1/marks/{mark_id}             # Update marks
GET    /api/v1/marks/student/{student_id}/report  # Get student's complete report
```

#### 3.6 Announcements Endpoints (`backend/app/api/v1/endpoints/announcements.py`)
```python
GET    /api/v1/announcements               # List announcements (filter by school_id, target_audience)
GET    /api/v1/announcements/{id}          # Get specific announcement
POST   /api/v1/announcements               # Create announcement
PUT    /api/v1/announcements/{id}          # Update announcement
DELETE /api/v1/announcements/{id}          # Delete announcement
```

#### 3.7 Achievements Endpoints (`backend/app/api/v1/endpoints/achievements.py`)
```python
GET    /api/v1/achievements                # List achievements (filter by student_id, school_id)
GET    /api/v1/achievements/{id}           # Get specific achievement
POST   /api/v1/achievements                # Create achievement
PUT    /api/v1/achievements/{id}           # Update achievement
DELETE /api/v1/achievements/{id}           # Delete achievement
```

### ❌ Missing APIs (Need to Build)

These modules need new backend endpoints:
1. **Homework Assignments** - Need `homework_assignments` table and endpoints
2. **Daily Diary** - Need `daily_diary` or `teacher_notes` table and endpoints
3. **Task Manager** - Need `teacher_tasks` table and endpoints
4. **Behaviour Notes** - Need `student_behaviour_notes` table and endpoints
5. **Supervisor Comments** - Need `supervisor_comments` table and endpoints
6. **Salary Tracker** - Need `teacher_salary` table and endpoints
7. **Leave Management** - Need `leave_requests` table and endpoints
8. **Resource Library** - Need `teaching_resources` table and endpoints
9. **Event Management** - Need `school_events` table and endpoints
10. **Analytics** - Need custom aggregate queries
11. **Support** - Need `support_tickets` table and endpoints

---

## 4. Implementation Roadmap

### Phase 1: Foundation Setup (Week 1)
**Goal:** Set up authentication and API infrastructure

1. **Create API Service Layer**
   - Create `lib/services/api_service.dart` for all HTTP calls
   - Implement JWT token storage using `shared_preferences`
   - Add error handling and response parsing

2. **Create Data Models**
   - Create `lib/models/` directory
   - Add models for: Teacher, Student, Class, Attendance, Timetable, Mark, etc.
   - Implement `fromJson()` and `toJson()` methods

3. **Implement Authentication**
   - Create login screen
   - Integrate with backend `/api/v1/auth/login` endpoint
   - Store JWT token securely
   - Add token refresh logic

4. **Set Up State Management**
   - Set up Provider architecture
   - Create `AuthProvider` for managing user session
   - Create `TeacherProvider` for teacher-specific data

### Phase 2: Core Modules (Week 2-3)
**Goal:** Implement the 7 modules with ready APIs

**Priority Order:**
1. ✅ **Profile Settings** (Easiest - single user data)
2. ✅ **Dashboard** (Shows integration working)
3. ✅ **My Classes** (Foundation for other modules)
4. ✅ **Attendance Management** (High priority, frequently used)
5. ✅ **Timetable Scheduling** (Important for daily operations)
6. ✅ **Gradebook/Marks** (Critical for assessments)
7. ✅ **Announcements** (Communication)

### Phase 3: Extended Modules (Week 4-5)
**Goal:** Build new backend endpoints and integrate

Work with backend team to create:
1. Homework Assignments API → Integrate
2. Daily Diary API → Integrate
3. Task Manager API → Integrate
4. Behaviour Notes API → Integrate
5. Achievements API → Integrate

### Phase 4: Advanced Features (Week 6)
**Goal:** Complete remaining modules

1. Salary Tracker
2. Leave Management
3. Resource Library
4. Event Management
5. Analytics Dashboard
6. Support System

### Phase 5: Polish & Testing (Week 7)
**Goal:** Production-ready app

1. Error handling improvements
2. Loading states and animations
3. Offline support (cache data)
4. Testing with real data
5. Bug fixes

---

## 5. Step-by-Step Integration Process

### 🔧 Complete Workflow for Each Module

#### Step 1: Understand Current Hardcoded Data
**Example: Dashboard Screen**
```dart
// Current hardcoded data in dashboard_screen.dart
final todayClasses = [
  {
    'time': '09:00 AM',
    'subject': 'Mathematics',
    'class': '8-A',
    'room': 'Room 101',
  },
  // ... more hardcoded classes
];
```

**What you need to identify:**
- What data is currently hardcoded?
- What format is it in? (List, Map, Object)
- Where is it used in the UI?

#### Step 2: Design Data Model
**Create model class that matches backend response**

```dart
// lib/models/class_period.dart
class ClassPeriod {
  final String id;
  final String time;
  final String subject;
  final String className;
  final String room;
  final int periodNumber;

  ClassPeriod({
    required this.id,
    required this.time,
    required this.subject,
    required this.className,
    required this.room,
    required this.periodNumber,
  });

  // Parse JSON from backend
  factory ClassPeriod.fromJson(Map<String, dynamic> json) {
    return ClassPeriod(
      id: json['id'],
      time: json['start_time'], // From class_periods table
      subject: json['subject']['name'], // From subjects table
      className: json['class']['name'], // From classes table
      room: json['room_number'],
      periodNumber: json['period_number'],
    );
  }
}
```

#### Step 3: Create API Service Method
**Add method to fetch data from backend**

```dart
// lib/services/api_service.dart
class ApiService {
  final String baseUrl = 'http://10.0.2.2:8000/api/v1'; // Android emulator localhost
  
  Future<List<ClassPeriod>> getTodaySchedule(String teacherId) async {
    final token = await _getToken();
    final today = DateTime.now().toIso8601String().split('T')[0];
    
    final response = await http.get(
      Uri.parse('$baseUrl/timetable?teacher_id=$teacherId&date=$today'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => ClassPeriod.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load schedule: ${response.statusCode}');
    }
  }
  
  Future<String> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token') ?? '';
  }
}
```

#### Step 4: Integrate into Screen with Provider
**Replace hardcoded data with API call**

```dart
// lib/screens/dashboard_screen.dart
class DashboardScreen extends StatefulWidget {
  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _apiService = ApiService();
  List<ClassPeriod> _todayClasses = [];
  bool _isLoading = true;
  String? _error;
  
  @override
  void initState() {
    super.initState();
    _loadData();
  }
  
  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    
    try {
      final teacherId = await _getTeacherId(); // From shared preferences
      final classes = await _apiService.getTodaySchedule(teacherId);
      
      setState(() {
        _todayClasses = classes;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Center(child: CircularProgressIndicator());
    }
    
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Error: $_error'),
            ElevatedButton(
              onPressed: _loadData,
              child: Text('Retry'),
            ),
          ],
        ),
      );
    }
    
    return ListView.builder(
      itemCount: _todayClasses.length,
      itemBuilder: (context, index) {
        final period = _todayClasses[index];
        return ClassCard(
          time: period.time,
          subject: period.subject,
          className: period.className,
          room: period.room,
        );
      },
    );
  }
}
```

#### Step 5: Test & Handle Edge Cases

**Things to test:**
1. ✅ **Happy Path** - Data loads successfully
2. ✅ **Empty State** - No classes today (show empty message)
3. ✅ **Error Handling** - Backend is down (show error + retry button)
4. ✅ **Loading State** - Show spinner while loading
5. ✅ **Token Expiry** - JWT expired (redirect to login)
6. ✅ **Network Issues** - No internet connection

**Edge cases to handle:**
```dart
// Empty state
if (_todayClasses.isEmpty && !_isLoading) {
  return Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.calendar_today, size: 64, color: Colors.grey),
        SizedBox(height: 16),
        Text('No classes scheduled today'),
      ],
    ),
  );
}

// Token expiry handling
if (response.statusCode == 401) {
  // Token expired, redirect to login
  await _clearToken();
  Navigator.pushReplacementNamed(context, '/login');
  return;
}

// Network error handling
try {
  final response = await http.get(...).timeout(Duration(seconds: 10));
} on TimeoutException {
  throw Exception('Request timed out. Check your internet connection.');
} on SocketException {
  throw Exception('No internet connection');
} catch (e) {
  throw Exception('Unexpected error: $e');
}
```

---

## 6. Code Examples

### 6.1 Complete API Service Structure

```dart
// lib/services/api_service.dart
import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Use 10.0.2.2 for Android emulator (maps to localhost)
  // Use actual IP for physical devices (e.g., 192.168.1.100)
  static const String baseUrl = 'http://10.0.2.2:8000/api/v1';
  
  // ==================== AUTH ====================
  
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
      }),
    );
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      await _saveToken(data['access_token']);
      return data;
    } else {
      throw Exception('Login failed: ${response.body}');
    }
  }
  
  Future<void> logout() async {
    await _clearToken();
  }
  
  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('jwt_token', token);
  }
  
  Future<void> _clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
  }
  
  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }
  
  // ==================== TEACHERS ====================
  
  Future<Teacher> getCurrentTeacher() async {
    final response = await _authenticatedGet('/teachers/me');
    return Teacher.fromJson(response);
  }
  
  Future<Teacher> getTeacher(String teacherId) async {
    final response = await _authenticatedGet('/teachers/$teacherId');
    return Teacher.fromJson(response);
  }
  
  // ==================== CLASSES ====================
  
  Future<List<Class>> getMyClasses(String teacherId) async {
    final response = await _authenticatedGet('/classes?teacher_id=$teacherId');
    return (response as List).map((json) => Class.fromJson(json)).toList();
  }
  
  Future<List<Student>> getClassStudents(String classId) async {
    final response = await _authenticatedGet('/classes/$classId/students');
    return (response as List).map((json) => Student.fromJson(json)).toList();
  }
  
  // ==================== ATTENDANCE ====================
  
  Future<List<AttendanceRecord>> getClassAttendance(String classId, String date) async {
    final response = await _authenticatedGet(
      '/attendance-records/class/$classId?date=$date'
    );
    return (response as List).map((json) => AttendanceRecord.fromJson(json)).toList();
  }
  
  Future<AttendanceSummary> getAttendanceSummary(String classId) async {
    final response = await _authenticatedGet(
      '/attendance-records/class/$classId/summary'
    );
    return AttendanceSummary.fromJson(response);
  }
  
  Future<void> submitAttendance(List<Map<String, dynamic>> attendanceData) async {
    await _authenticatedPost('/attendance-records/bulk', attendanceData);
  }
  
  // ==================== TIMETABLE ====================
  
  Future<List<TimetableEntry>> getTimetable({
    required String teacherId,
    String? date,
    String? dayOfWeek,
  }) async {
    String query = 'teacher_id=$teacherId';
    if (date != null) query += '&date=$date';
    if (dayOfWeek != null) query += '&day_of_week=$dayOfWeek';
    
    final response = await _authenticatedGet('/timetable?$query');
    return (response as List).map((json) => TimetableEntry.fromJson(json)).toList();
  }
  
  // ==================== MARKS ====================
  
  Future<List<Mark>> getMarks({
    String? examId,
    String? studentId,
    String? subjectId,
  }) async {
    String query = '';
    if (examId != null) query += 'exam_id=$examId&';
    if (studentId != null) query += 'student_id=$studentId&';
    if (subjectId != null) query += 'subject_id=$subjectId&';
    
    final response = await _authenticatedGet('/marks?$query');
    return (response as List).map((json) => Mark.fromJson(json)).toList();
  }
  
  Future<void> submitMarks(Map<String, dynamic> markData) async {
    await _authenticatedPost('/marks', markData);
  }
  
  // ==================== ANNOUNCEMENTS ====================
  
  Future<List<Announcement>> getAnnouncements(String schoolId) async {
    final response = await _authenticatedGet('/announcements?school_id=$schoolId');
    return (response as List).map((json) => Announcement.fromJson(json)).toList();
  }
  
  Future<void> createAnnouncement(Map<String, dynamic> announcementData) async {
    await _authenticatedPost('/announcements', announcementData);
  }
  
  // ==================== ACHIEVEMENTS ====================
  
  Future<List<Achievement>> getAchievements({String? studentId, String? schoolId}) async {
    String query = '';
    if (studentId != null) query += 'student_id=$studentId&';
    if (schoolId != null) query += 'school_id=$schoolId&';
    
    final response = await _authenticatedGet('/achievements?$query');
    return (response as List).map((json) => Achievement.fromJson(json)).toList();
  }
  
  Future<void> createAchievement(Map<String, dynamic> achievementData) async {
    await _authenticatedPost('/achievements', achievementData);
  }
  
  // ==================== HELPER METHODS ====================
  
  Future<dynamic> _authenticatedGet(String endpoint) async {
    final token = await _getToken();
    if (token == null) throw Exception('No authentication token');
    
    try {
      final response = await http.get(
        Uri.parse('$baseUrl$endpoint'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(Duration(seconds: 15));
      
      return _handleResponse(response);
    } on TimeoutException {
      throw Exception('Request timed out');
    } on SocketException {
      throw Exception('No internet connection');
    }
  }
  
  Future<dynamic> _authenticatedPost(String endpoint, dynamic body) async {
    final token = await _getToken();
    if (token == null) throw Exception('No authentication token');
    
    try {
      final response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode(body),
      ).timeout(Duration(seconds: 15));
      
      return _handleResponse(response);
    } on TimeoutException {
      throw Exception('Request timed out');
    } on SocketException {
      throw Exception('No internet connection');
    }
  }
  
  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    } else if (response.statusCode == 401) {
      throw Exception('Unauthorized - please login again');
    } else if (response.statusCode == 403) {
      throw Exception('Access forbidden');
    } else if (response.statusCode == 404) {
      throw Exception('Resource not found');
    } else if (response.statusCode >= 500) {
      throw Exception('Server error - please try again later');
    } else {
      throw Exception('Request failed: ${response.statusCode}');
    }
  }
}
```

### 6.2 Example Data Models

```dart
// lib/models/teacher.dart
class Teacher {
  final String id;
  final String userId;
  final String schoolId;
  final String employeeId;
  final String fullName;
  final String email;
  final String? qualification;
  final DateTime? dateOfJoining;
  final List<String>? subjects;
  
  Teacher({
    required this.id,
    required this.userId,
    required this.schoolId,
    required this.employeeId,
    required this.fullName,
    required this.email,
    this.qualification,
    this.dateOfJoining,
    this.subjects,
  });
  
  factory Teacher.fromJson(Map<String, dynamic> json) {
    return Teacher(
      id: json['id'],
      userId: json['user_id'],
      schoolId: json['school_id'],
      employeeId: json['employee_id'],
      fullName: json['full_name'],
      email: json['email'],
      qualification: json['qualification'],
      dateOfJoining: json['date_of_joining'] != null 
        ? DateTime.parse(json['date_of_joining']) 
        : null,
      subjects: json['subjects'] != null 
        ? List<String>.from(json['subjects']) 
        : null,
    );
  }
}

// lib/models/class.dart
class Class {
  final String id;
  final String schoolId;
  final String academicYearId;
  final String name;
  final String? section;
  final String? classTeacherId;
  final int? strength;
  final double? attendancePercentage;
  
  Class({
    required this.id,
    required this.schoolId,
    required this.academicYearId,
    required this.name,
    this.section,
    this.classTeacherId,
    this.strength,
    this.attendancePercentage,
  });
  
  factory Class.fromJson(Map<String, dynamic> json) {
    return Class(
      id: json['id'],
      schoolId: json['school_id'],
      academicYearId: json['academic_year_id'],
      name: json['name'],
      section: json['section'],
      classTeacherId: json['class_teacher_id'],
      strength: json['strength'],
      attendancePercentage: json['attendance_percentage']?.toDouble(),
    );
  }
  
  String get displayName => section != null ? '$name-$section' : name;
}

// lib/models/student.dart
class Student {
  final String id;
  final String userId;
  final String schoolId;
  final String classId;
  final String rollNumber;
  final String fullName;
  final String? email;
  final DateTime? dateOfBirth;
  final String? bloodGroup;
  final String? address;
  
  Student({
    required this.id,
    required this.userId,
    required this.schoolId,
    required this.classId,
    required this.rollNumber,
    required this.fullName,
    this.email,
    this.dateOfBirth,
    this.bloodGroup,
    this.address,
  });
  
  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['id'],
      userId: json['user_id'],
      schoolId: json['school_id'],
      classId: json['class_id'],
      rollNumber: json['roll_number'],
      fullName: json['full_name'],
      email: json['email'],
      dateOfBirth: json['date_of_birth'] != null 
        ? DateTime.parse(json['date_of_birth']) 
        : null,
      bloodGroup: json['blood_group'],
      address: json['address'],
    );
  }
}

// lib/models/attendance_record.dart
class AttendanceRecord {
  final String id;
  final String studentId;
  final String classId;
  final DateTime date;
  final String status; // 'present', 'absent', 'late', 'excused'
  final String? remarks;
  final String markedBy;
  final DateTime markedAt;
  
  AttendanceRecord({
    required this.id,
    required this.studentId,
    required this.classId,
    required this.date,
    required this.status,
    this.remarks,
    required this.markedBy,
    required this.markedAt,
  });
  
  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    return AttendanceRecord(
      id: json['id'],
      studentId: json['student_id'],
      classId: json['class_id'],
      date: DateTime.parse(json['date']),
      status: json['status'],
      remarks: json['remarks'],
      markedBy: json['marked_by'],
      markedAt: DateTime.parse(json['marked_at']),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'student_id': studentId,
      'class_id': classId,
      'date': date.toIso8601String().split('T')[0],
      'status': status,
      'remarks': remarks,
    };
  }
}
```

### 6.3 Provider Setup (State Management)

```dart
// lib/providers/auth_provider.dart
import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../models/teacher.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  Teacher? _currentTeacher;
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _error;
  
  Teacher? get currentTeacher => _currentTeacher;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      await _apiService.login(email, password);
      _currentTeacher = await _apiService.getCurrentTeacher();
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      _isAuthenticated = false;
      notifyListeners();
      return false;
    }
  }
  
  Future<void> logout() async {
    await _apiService.logout();
    _currentTeacher = null;
    _isAuthenticated = false;
    notifyListeners();
  }
  
  Future<void> loadCurrentTeacher() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      _currentTeacher = await _apiService.getCurrentTeacher();
      _isAuthenticated = true;
    } catch (e) {
      _error = e.toString();
      _isAuthenticated = false;
    }
    
    _isLoading = false;
    notifyListeners();
  }
}

// lib/main.dart - Setup providers
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        // Add more providers as needed
      ],
      child: MyApp(),
    ),
  );
}
```

### 6.4 Login Screen Example

```dart
// lib/screens/login_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  
  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
  
  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    final success = await authProvider.login(
      _emailController.text.trim(),
      _passwordController.text,
    );
    
    if (success) {
      Navigator.pushReplacementNamed(context, '/dashboard');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.error ?? 'Login failed'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo
                  Icon(Icons.school, size: 80, color: Colors.blue),
                  SizedBox(height: 24),
                  Text(
                    'Teachers Portal',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 48),
                  
                  // Email field
                  TextFormField(
                    controller: _emailController,
                    decoration: InputDecoration(
                      labelText: 'Email',
                      prefixIcon: Icon(Icons.email),
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your email';
                      }
                      if (!value.contains('@')) {
                        return 'Please enter a valid email';
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: 16),
                  
                  // Password field
                  TextFormField(
                    controller: _passwordController,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      prefixIcon: Icon(Icons.lock),
                      border: OutlineInputBorder(),
                    ),
                    obscureText: true,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your password';
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: 24),
                  
                  // Login button
                  Consumer<AuthProvider>(
                    builder: (context, authProvider, child) {
                      return SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: authProvider.isLoading ? null : _handleLogin,
                          child: authProvider.isLoading
                            ? CircularProgressIndicator(color: Colors.white)
                            : Text('Login', style: TextStyle(fontSize: 16)),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

---

## 7. Common Pitfalls & Debugging

### 🚨 Common Mistakes (and How to Avoid Them)

#### 1. Wrong Localhost URL for Android Emulator
**❌ WRONG:**
```dart
const String baseUrl = 'http://localhost:8000/api/v1';  // Won't work!
```

**✅ CORRECT:**
```dart
const String baseUrl = 'http://10.0.2.2:8000/api/v1';  // Android emulator
// OR for physical device:
const String baseUrl = 'http://192.168.1.100:8000/api/v1';  // Use your computer's IP
```

#### 2. Forgetting to Handle Token Expiry
**Problem:** JWT tokens expire, user gets logged out unexpectedly

**Solution:**
```dart
Future<dynamic> _authenticatedGet(String endpoint) async {
  try {
    final response = await http.get(...);
    
    if (response.statusCode == 401) {
      // Token expired - redirect to login
      await _clearToken();
      throw Exception('Session expired. Please login again.');
    }
    
    return _handleResponse(response);
  } catch (e) {
    rethrow;
  }
}
```

#### 3. Not Handling Loading & Error States
**❌ WRONG:**
```dart
// UI breaks when data is loading or error occurs
return ListView.builder(
  itemCount: _classes.length,  // Crashes if _classes is null!
  itemBuilder: (context, index) => ClassCard(_classes[index]),
);
```

**✅ CORRECT:**
```dart
if (_isLoading) {
  return Center(child: CircularProgressIndicator());
}

if (_error != null) {
  return ErrorView(error: _error, onRetry: _loadData);
}

if (_classes.isEmpty) {
  return EmptyStateView(message: 'No classes found');
}

return ListView.builder(
  itemCount: _classes.length,
  itemBuilder: (context, index) => ClassCard(_classes[index]),
);
```

#### 4. Hardcoding IDs Instead of Getting from Auth
**❌ WRONG:**
```dart
final classes = await apiService.getMyClasses('teacher-123');  // Hardcoded!
```

**✅ CORRECT:**
```dart
final authProvider = Provider.of<AuthProvider>(context, listen: false);
final teacherId = authProvider.currentTeacher?.id;
if (teacherId == null) {
  // Handle not logged in
  return;
}
final classes = await apiService.getMyClasses(teacherId);
```

#### 5. Not Using `toIso8601String()` for Dates
**Problem:** Backend expects dates in specific format

**Solution:**
```dart
// When sending date to backend
final today = DateTime.now().toIso8601String().split('T')[0];  // "2026-02-08"
```

#### 6. Forgetting Null Safety
**Problem:** Dart null safety errors

**Solution:**
```dart
// Use ?. for null-safe access
final teacherName = teacher?.fullName ?? 'Unknown';

// Check null before using
if (student?.dateOfBirth != null) {
  final age = calculateAge(student!.dateOfBirth!);
}
```

### 🔍 Debugging Tips

#### Check Backend Logs
```bash
# In backend terminal
cd /Users/apple/School-OS/backend
source ../.venv/bin/activate
uvicorn app.main:app --reload --log-level debug
```

#### Check Flutter Logs
```bash
# In teachers_app terminal
flutter logs
# OR
flutter run --verbose
```

#### Test API Endpoints Manually
```bash
# Get token first
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@school.com","password":"password123"}'

# Use token to test endpoint
curl -X GET http://localhost:8000/api/v1/teachers/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Flutter DevTools
```bash
# Run app, then open DevTools
flutter pub global activate devtools
flutter pub global run devtools
```

### 📋 Debugging Checklist

When something doesn't work:
- [ ] Is the backend server running? (`uvicorn app.main:app --reload`)
- [ ] Is the correct URL being used? (`10.0.2.2` for emulator)
- [ ] Is the JWT token valid? (Check expiry time)
- [ ] Are you handling null values properly?
- [ ] Did you check the backend logs for errors?
- [ ] Did you check the Flutter console for errors?
- [ ] Is the response JSON format what you expect?
- [ ] Are you using the correct HTTP method? (GET/POST/PUT)
- [ ] Did you add the Authorization header?
- [ ] Is the data model's `fromJson()` parsing correctly?

---

## 📚 Additional Resources

### Documentation
- **Flutter**: https://docs.flutter.dev/
- **Provider**: https://pub.dev/packages/provider
- **HTTP Package**: https://pub.dev/packages/http
- **FastAPI**: https://fastapi.tiangolo.com/

### Helpful Commands
```bash
# Flutter
flutter clean                    # Clean build cache
flutter pub get                  # Install dependencies
flutter run                      # Run app
flutter build apk               # Build APK

# Backend
source ../.venv/bin/activate    # Activate Python venv
uvicorn app.main:app --reload   # Start backend server
pytest                           # Run tests
```

### Backend API Testing
Use the backend's Swagger UI for testing endpoints:
- Open: http://localhost:8000/docs
- Click "Authorize" and paste your JWT token
- Test any endpoint directly from browser

---

## 🎯 Your First Task

**Start with the easiest module to build confidence:**

### Task: Make Dashboard Screen Dynamic

1. ✅ Create `lib/services/api_service.dart` with `getTodaySchedule()` method
2. ✅ Create `lib/models/class_period.dart` model
3. ✅ Modify `lib/screens/dashboard_screen.dart`:
   - Remove hardcoded `todayClasses` list
   - Add `_isLoading`, `_error` state variables
   - Add `_loadData()` method to fetch from API
   - Update UI to show loading/error/data states
4. ✅ Test with real backend data
5. ✅ Handle edge cases (no classes today, network error)

**Expected Result:** Dashboard shows your real name and today's actual schedule from the database!

---

## 💡 Remember

- **Start Small**: Do one module at a time, test thoroughly
- **Copy Backend Response**: Print backend JSON response, match your model exactly
- **Test Error Cases**: Always test what happens when backend is down
- **Ask for Help**: If backend endpoint doesn't exist, coordinate with backend team
- **Use DevTools**: Flutter DevTools is your best friend for debugging
- **Read Error Messages**: They usually tell you exactly what's wrong!

**Good luck! You've got this! 🚀**

---

**Questions?** Check:
1. Backend docs: `/Users/apple/School-OS/backend/README.md`
2. API docs: http://localhost:8000/docs
3. Previous integration guide in conversation history
