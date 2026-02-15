# 🎓 SchoolOS Multi-Agent System

## Comprehensive Documentation

A sophisticated AI-powered multi-agent system for school management that provides intelligent querying capabilities across attendance, marks, fees, timetables, HR, and budgeting. The system supports **role-based orchestration** with separate agent systems for **Principals** and **Super Admins**.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Role-Based Orchestration](#role-based-orchestration)
4. [Principal Agents](#principal-agents)
5. [Super Admin Agents](#super-admin-agents)
6. [API Reference](#api-reference)
7. [Agent Flow & Routing](#agent-flow--routing)
8. [Data Management](#data-management)
9. [Email Notification System](#email-notification-system)
10. [Session Management](#session-management)
11. [Setup & Installation](#setup--installation)
12. [Technical Implementation Details](#technical-implementation-details)

---

## 🏗️ System Overview

The SchoolOS Multi-Agent System is built on **Google Gemini AI** (specifically `gemini-2.5-flash`) and uses a **keyword-based routing mechanism** to direct user queries to specialized agents. Each agent is equipped with domain-specific data and custom prompts optimized for their area of expertise.

### Key Features

- ✅ **Role-Based Access**: Separate orchestration for Principals and Super Admins
- ✅ **Intelligent Routing**: Keyword-based detection routes queries to the appropriate agent
- ✅ **Session Management**: Maintains conversation history for context-aware responses
- ✅ **Email Integration**: Built-in Gmail SMTP for sending notifications
- ✅ **RESTful API**: FastAPI-powered endpoints for frontend integration
- ✅ **Isolated Sessions**: Principal and Super Admin sessions are completely isolated

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SchoolOS Multi-Agent API                           │
│                              (FastAPI - Port 8004)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        API Layer (api.py)                            │   │
│  │  • Role-based routing (principal vs super_admin)                     │   │
│  │  • Session management                                                │   │
│  │  • CORS configuration                                                │   │
│  │  • Health checks                                                     │   │
│  └────────────────────────┬───────────────────┬────────────────────────┘   │
│                           │                   │                             │
│              ┌────────────▼──────┐   ┌───────▼────────────┐                │
│              │  Principal Flow   │   │  Super Admin Flow  │                │
│              └────────────┬──────┘   └───────┬────────────┘                │
│                           │                   │                             │
│  ┌────────────────────────▼──────────────────▼─────────────────────────┐   │
│  │                       Router Layer                                   │   │
│  │  ┌─────────────────────────┐  ┌─────────────────────────────────┐   │   │
│  │  │    agent_router.py      │  │    super_admin_router.py        │   │   │
│  │  │  • Session storage      │  │  • Isolated session storage     │   │   │
│  │  │  • History management   │  │  • Super admin history mgmt     │   │   │
│  │  │  • Message processing   │  │  • Message processing           │   │   │
│  │  └───────────┬─────────────┘  └───────────────┬─────────────────┘   │   │
│  └──────────────┼────────────────────────────────┼─────────────────────┘   │
│                 │                                │                          │
│  ┌──────────────▼────────────────┐  ┌───────────▼──────────────────────┐   │
│  │        agents.py              │  │     super_admin_agents.py        │   │
│  │  ┌──────────────────────┐     │  │  ┌────────────────────────────┐  │   │
│  │  │ Keyword Detection    │     │  │  │   Keyword Detection        │  │   │
│  │  │ detect_agent()       │     │  │  │   detect_super_admin_      │  │   │
│  │  └──────────┬───────────┘     │  │  │   agent()                  │  │   │
│  │             │                 │  │  └──────────┬─────────────────┘  │   │
│  │  ┌──────────▼───────────┐     │  │  ┌──────────▼─────────────────┐  │   │
│  │  │ Agent Definitions    │     │  │  │  Super Admin Agents        │  │   │
│  │  │ • attendance_agent   │     │  │  │  • group_overview_agent    │  │   │
│  │  │ • marks_agent        │     │  │  │  • group_finance_agent     │  │   │
│  │  │ • fees_agent         │     │  │  │  • group_attendance_agent  │  │   │
│  │  │ • timetable_agent    │     │  │  │  • compliance_risk_agent   │  │   │
│  │  │ • hr_agent           │     │  │  │  • group_communication_    │  │   │
│  │  │ • budget_agent       │     │  │  │    agent                   │  │   │
│  │  │ • email_agent        │     │  │  │  • schools_overview_agent  │  │   │
│  │  └──────────────────────┘     │  │  └────────────────────────────┘  │   │
│  └───────────────────────────────┘  └──────────────────────────────────┘   │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      Google Gemini AI (gemini-2.5-flash)              │  │
│  │                     • Natural Language Processing                      │  │
│  │                     • Context-aware responses                          │  │
│  │                     • Data analysis & insights                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎭 Role-Based Orchestration

The system implements complete **role isolation** between Principal and Super Admin users:

### How Role-Based Routing Works

```python
# Request with role specification
{
    "message": "Show me attendance summary",
    "session_id": "optional-session-id",
    "role": "principal"  # or "super_admin"
}
```

| Role | Description | Agents Available |
|------|-------------|------------------|
| `principal` (default) | Single-school management | Attendance, Marks, Fees, Timetable, HR, Budget, Email |
| `super_admin` | Multi-school group management | Group Overview, Group Finance, Group Attendance, Compliance/Risk, Communication, Schools Overview |

### Session Isolation

- **Principal sessions**: Standard UUID (e.g., `550e8400-e29b-41d4-a716-446655440000`)
- **Super Admin sessions**: Prefixed with `super_admin_` (e.g., `super_admin_550e8400-e29b-41d4...`)
- Sessions are stored in separate dictionaries with no cross-access

---

## 👨‍🏫 Principal Agents

### Overview

Principal agents handle **single-school operations** with access to detailed student, staff, and operational data.

### Agent Definitions

#### 1. 📊 Attendance Agent (`attendance_agent`)

**Purpose**: Track student attendance, identify patterns, and flag at-risk students.

**Keywords**: `attendance`, `present`, `absent`, `late`, `attendance percentage`, `who came`, `who didn't come`

**Data Fields**:
- Student ID, Name, Class, Section
- Date, Status (present/absent/late)
- Period, Remarks
- Attendance Percentage
- Parent Email (for notifications)

**Sample Queries**:
- "Who is absent today?"
- "Show students with attendance below 75%"
- "What's Aarav's attendance percentage?"

**Special Capabilities**:
- Calculates attendance percentages
- Identifies students below 75% threshold as "at risk"
- Provides email addresses for follow-up actions

---

#### 2. 📚 Marks Agent (`marks_agent`)

**Purpose**: Academic performance analysis, grade tracking, and performance identification.

**Keywords**: `marks`, `grade`, `score`, `exam`, `performance`, `topper`, `failed`, `lowest`, `highest`, `rank`

**Data Fields**:
- Student ID, Name, Class
- Subject, Exam Type
- Max Marks, Obtained Marks
- Grade, Percentage

**Grading System**:
| Grade | Percentage Range |
|-------|-----------------|
| A+ | 90-100% |
| A | 80-89% |
| B | 70-79% |
| C | 60-69% |
| D | 50-59% |
| F | Below 50% |

**Sample Queries**:
- "Who is the topper in Grade 5?"
- "Show students who failed Mathematics"
- "What are Diya's marks?"

---

#### 3. 💰 Fees Agent (`fees_agent`)

**Purpose**: Fee collection status, payment tracking, and dues management.

**Keywords**: `fee`, `payment`, `pending`, `paid`, `dues`, `invoice`, `balance`, `overdue`, `hasn't paid`, `unpaid`

**Data Fields**:
- Invoice Number, Student ID, Name
- Fee Type, Amount, Paid Amount, Balance
- Status (paid/pending/partial/overdue)
- Due Date, Parent Email

**Payment Statuses**:
| Status | Description |
|--------|-------------|
| `paid` | Fully paid |
| `pending` | Due soon, not yet paid |
| `partial` | Partially paid |
| `overdue` | Past due date |

**Sample Queries**:
- "Who hasn't paid fees?"
- "Show overdue invoices"
- "What's Rohan's fee status?"

---

#### 4. 📅 Timetable Agent (`timetable_agent`)

**Purpose**: Class schedule management and teacher assignment tracking.

**Keywords**: `timetable`, `schedule`, `period`, `room`, `which teacher`, `most classes`

**Data Fields**:
- Class, Day, Period
- Time Slot, Subject
- Teacher ID, Teacher Name
- Room Assignment

**Sample Queries**:
- "What's the timetable for Grade 5-A?"
- "Which teacher has the most classes?"
- "Where is the Physics class held?"

---

#### 5. 👥 HR Agent (`hr_agent`)

**Purpose**: Staff management, leave tracking, and human resources operations.

**Keywords**: `staff`, `employee`, `leave`, `salary`, `department`, `joining`, `hr`, `human resource`, `periods assigned`, `leave request`, `sick leave`, `casual leave`

**Data Fields**:
- Staff ID, Employee ID, Name
- Department, Designation, Role
- Salary, Joining Date, Status
- Periods Per Week, Leave Balance

**Leave Types**:
- SICK, CASUAL, EMERGENCY, MEDICAL, MATERNITY

**Leave Statuses**:
- PENDING, APPROVED, REJECTED

**Sample Queries**:
- "Show pending leave requests"
- "Which teacher has the most periods?"
- "What's Anjali's leave balance?"

---

#### 6. 📈 Budget Agent (`budget_agent`)

**Purpose**: Budget management, expense tracking, and financial approvals.

**Keywords**: `budget`, `expense`, `spending`, `allocated`, `funds`, `financial`, `approval`, `transaction`, `cost`

**Data Fields**:
- Budget ID, Title, Type
- Coordinator, Allocated Amount
- Spent, Remaining, Pending
- Status, Date Range

**Budget Statuses**:
- `active`: Currently in use
- `upcoming`: Not yet started
- `completed`: Finished
- `planning`: In preparation

**Sample Queries**:
- "Show pending budget approvals"
- "What's the utilization of Annual Day budget?"
- "Which budgets are over 80% utilized?"

---

#### 7. 📧 Email Agent (`email_agent`)

**Purpose**: Send email notifications based on conversation context.

**How It Works**:
1. Extracts email addresses from conversation history
2. Determines context (attendance, fees, marks, etc.)
3. Generates appropriate subject and body
4. Sends via Gmail SMTP

**Trigger Keywords**: `email`, `send`, `mail`, `notify`, `reminder`

**Sample Flow**:
```
User: "Who has pending fees?"
Agent: [Shows students with emails]
User: "Send them a reminder"
Agent: [Sends email to extracted addresses]
```

---

## 👑 Super Admin Agents

### Overview

Super Admin agents provide **group-level insights** across multiple schools, designed for executive-level decision making.

### Agent Definitions

#### 1. 🏫 Group Overview Agent (`group_overview_agent`)

**Purpose**: High-level health summary across all schools in the group.

**Keywords**: `overview`, `summary`, `overall`, `health`, `total schools`, `all schools`, `group`, `dashboard`, `snapshot`, `status`

**Insights Provided**:
- Total schools by status (Active, Warning, Suspended)
- Aggregate student and staff counts
- At-risk school identification
- Critical alerts summary

---

#### 2. 💰 Group Finance Agent (`group_finance_agent`)

**Purpose**: Revenue analysis and fee collection trends across schools.

**Keywords**: `finance`, `revenue`, `collection`, `dues`, `money`, `payment`, `fee`, `financial`, `income`, `outstanding`

**Metrics Tracked**:
- Total revenue per school
- Collection rates
- Pending/overdue amounts
- Year-over-year growth
- Financial stress indicators

---

#### 3. 📊 Group Attendance Agent (`group_attendance_agent`)

**Purpose**: Attendance health monitoring across the school group.

**Keywords**: `attendance`, `absent`, `present`, `absenteeism`, `chronic`, `below threshold`, `at risk`

**Analysis Areas**:
- Average attendance per school
- Schools below 85% threshold
- Chronic absenteeism patterns
- Trend analysis (improving/declining)
- Risk level assessment

---

#### 4. ⚠️ Compliance & Risk Agent (`compliance_risk_agent`)

**Purpose**: Compliance monitoring, audit status, and risk assessment.

**Keywords**: `compliance`, `risk`, `audit`, `license`, `legal`, `violation`, `certificate`, `expired`, `safety`

**Compliance Checks**:
- License validity and expiry
- Audit status (Passed/Failed/Conditional)
- Certificate status (Fire Safety, Health, Building)
- Critical violations count
- Overall compliance rating

---

#### 5. 📱 Group Communication Agent (`group_communication_agent`)

**Purpose**: Message delivery and parent engagement analytics.

**Keywords**: `communication`, `message`, `notification`, `parent`, `engagement`, `sms`, `email`, `delivery`

**Metrics**:
- Message delivery success rates
- Parent app adoption rates
- Response times
- SMS credit status
- Email bounce rates
- Engagement scores (A+ to F)

---

#### 6. 🏆 Schools Overview Agent (`schools_overview_agent`)

**Purpose**: Per-school status, rankings, and comparative analysis.

**Keywords**: `school list`, `compare schools`, `ranking`, `performance`, `individual school`, `best school`, `worst school`

**Capabilities**:
- School health scores
- Multi-dimensional rankings
- Tier distribution analysis
- School-to-school comparisons
- Performance benchmarking

---

## 🔌 API Reference

### Base URL
```
http://localhost:8004
```

### Endpoints

#### 1. Health Check
```http
GET /health
```

**Response**:
```json
{
    "status": "healthy",
    "version": "3.0.0",
    "agents": ["attendance_agent", "marks_agent", "fees_agent", ...],
    "super_admin_agents": ["group_overview_agent", "group_finance_agent", ...]
}
```

---

#### 2. Create New Session
```http
POST /api/chat/new_session
```

**Request Body**:
```json
{
    "role": "principal"  // or "super_admin"
}
```

**Response**:
```json
{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Session created successfully. You can now send messages."
}
```

---

#### 3. Send Message
```http
POST /api/chat/send
```

**Request Body**:
```json
{
    "message": "Who is absent today?",
    "session_id": "optional-existing-session-id",
    "role": "principal"
}
```

**Response**:
```json
{
    "message": "📊 Based on the attendance data...",
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "agentId": "attendance_agent",
    "timestamp": "2025-01-31T10:30:00.000Z"
}
```

---

#### 4. Get Chat History
```http
GET /api/chat/history/{session_id}
```

**Response**:
```json
{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "principal",
    "history": [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "👋 Hello! I'm your School Management Assistant..."}
    ]
}
```

---

## 🔀 Agent Flow & Routing

### Message Processing Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           User Message Received                          │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         Check Role Parameter                             │
│                    (Default: "principal")                                │
└─────────────┬──────────────────────────────────────────┬─────────────────┘
              │                                          │
              ▼                                          ▼
┌─────────────────────────┐                ┌─────────────────────────────┐
│   role == "principal"   │                │   role == "super_admin"     │
└────────────┬────────────┘                └──────────────┬──────────────┘
             │                                            │
             ▼                                            ▼
┌─────────────────────────┐                ┌─────────────────────────────┐
│   agent_router.py       │                │   super_admin_router.py     │
│   process_message()     │                │   process_super_admin_      │
│                         │                │   message()                 │
└────────────┬────────────┘                └──────────────┬──────────────┘
             │                                            │
             ▼                                            ▼
┌─────────────────────────┐                ┌─────────────────────────────┐
│   Add to Session        │                │   Add to Super Admin        │
│   History               │                │   Session History           │
└────────────┬────────────┘                └──────────────┬──────────────┘
             │                                            │
             ▼                                            ▼
┌─────────────────────────┐                ┌─────────────────────────────┐
│   agents.py             │                │   super_admin_agents.py     │
│   get_agent_response()  │                │   get_super_admin_agent_    │
│                         │                │   response()                │
└────────────┬────────────┘                └──────────────┬──────────────┘
             │                                            │
             ▼                                            ▼
┌─────────────────────────┐                ┌─────────────────────────────┐
│   Keyword Detection     │                │   Keyword Detection         │
│   detect_agent()        │                │   detect_super_admin_       │
│                         │                │   agent()                   │
└────────────┬────────────┘                └──────────────┬──────────────┘
             │                                            │
             ├──── Is Greeting? ────► Return Welcome     │
             │      Message                              │
             │                                            │
             ├──── Is Email     ────► Extract emails,    │
             │      Request?         Send notification   │
             │                                            │
             ▼                                            ▼
┌─────────────────────────┐                ┌─────────────────────────────┐
│   Match Keywords to     │                │   Match Keywords to         │
│   Agent Definition      │                │   Super Admin Agent         │
└────────────┬────────────┘                └──────────────┬──────────────┘
             │                                            │
             ▼                                            ▼
┌─────────────────────────┐                ┌─────────────────────────────┐
│   Build System Prompt:  │                │   Build System Prompt:      │
│   • Agent Data          │                │   • Multi-school Data       │
│   • Instructions        │                │   • Executive Instructions  │
│   • Conversation        │                │   • Conversation Context    │
│     Context (last 6)    │                │     (last 6)                │
└────────────┬────────────┘                └──────────────┬──────────────┘
             │                                            │
             └─────────────────┬──────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    Google Gemini API Call                                │
│                    (gemini-2.5-flash model)                              │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    Return Response with Agent ID                         │
└──────────────────────────────────────────────────────────────────────────┘
```

### Keyword Detection Algorithm

```python
def detect_agent(query: str) -> tuple[str, dict]:
    """
    Detection priority: First match wins
    """
    query_lower = query.lower()

    for agent_id, config in AGENT_DEFINITIONS.items():
        for keyword in config["keywords"]:
            if keyword in query_lower:
                return agent_id, config

    # Default fallback
    return "school_management_agent", None
```

---

## 📊 Data Management

### Data Sources

The system uses **embedded CSV-formatted data** for demo purposes. In production, this would connect to a database.

#### Principal Data Files (manager/data/):
- `attendance.csv` - Student attendance records
- `marks.csv` - Academic performance data
- `fees.csv` - Fee invoices and payments
- `timetable.csv` - Class schedules

#### Embedded Data (agents.py):
- `STUDENTS_DATA` - Student master data
- `ATTENDANCE_DATA` - Attendance with percentages
- `MARKS_DATA` - Grades and exam results
- `FEES_DATA` - Invoices and payment status
- `TIMETABLE_DATA` - Class schedules
- `STAFF_DATA` - Employee information
- `LEAVE_DATA` - Leave requests
- `BUDGET_DATA` - Budget allocations
- `BUDGET_TRANSACTIONS` - Expense transactions

#### Super Admin Data (super_admin_agents.py):
- `SCHOOLS_DATA` - School master data
- `GROUP_FINANCE_DATA` - Per-school financial metrics
- `GROUP_ATTENDANCE_DATA` - Per-school attendance health
- `COMPLIANCE_RISK_DATA` - Compliance status
- `COMMUNICATION_DATA` - Message delivery stats
- `SCHOOLS_HEALTH_SUMMARY` - Overall health scores

---

## 📧 Email Notification System

### Configuration

```python
EMAIL_SENDER = "your-email@gmail.com"
EMAIL_APP_PASSWORD = "your-app-password"  # Gmail App Password
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
```

### Email Flow

1. **Context Detection**: Analyzes conversation for email-related keywords
2. **Email Extraction**: Regex pattern extracts emails from previous responses
3. **Context Determination**: Identifies email type (attendance, fees, marks, leave)
4. **Template Generation**: Creates appropriate subject and body
5. **SMTP Delivery**: Sends via Gmail with TLS

### Email Types

| Context | Subject Template |
|---------|-----------------|
| Attendance | "School Notification - Attendance Alert" |
| Fees | "School Notification - Fee Payment Reminder" |
| Marks | "School Notification - Academic Performance Update" |
| Leave | "School Notification - Leave Request Update" |

---

## 🔐 Session Management

### Principal Sessions

```python
# Storage
sessions = {}

# Session Structure
sessions[session_id] = {
    "history": [
        {"role": "user", "content": "..."},
        {"role": "assistant", "content": "..."}
    ]
}

# Session ID Format
session_id = str(uuid.uuid4())  # e.g., "550e8400-e29b-41d4-a716-446655440000"
```

### Super Admin Sessions

```python
# Isolated Storage
super_admin_sessions = {}

# Session ID Format
session_id = f"super_admin_{uuid.uuid4()}"  # Prefixed for identification
```

### Context Window

Both systems maintain the **last 6 messages** for context:

```python
context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history[-6:]])
```

---

## 🚀 Setup & Installation

### Prerequisites

- Python 3.10+
- Google API Key (for Gemini AI)
- Gmail App Password (for email notifications)

### Installation Steps

1. **Navigate to Directory**
   ```bash
   cd apps/admin-web/dummy-multi-agent
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**

   Create `.env` file:
   ```env
   GOOGLE_API_KEY=your_google_api_key
   EMAIL_SENDER=your_email@gmail.com
   EMAIL_APP_PASSWORD=your_gmail_app_password
   ```

4. **Start Server**
   ```bash
   ./start.sh
   # or
   python api.py
   ```

5. **Access API**
   - API: http://localhost:8004
   - Docs: http://localhost:8004/docs

### Dependencies

```txt
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
google-generativeai>=0.8.0
python-dotenv>=1.0.0
pydantic>=2.0.0
```

---

## 🔧 Technical Implementation Details

### Google ADK Integration (manager/)

The `manager/` directory contains an alternative implementation using **Google ADK (Agent Development Kit)**:

```python
from google.adk.agents import Agent

school_management_agent = Agent(
    name="school_management_agent",
    model="gemini-2.5-flash",
    description="...",
    instruction="...",
    sub_agents=[attendance_agent, marks_agent, fees_agent, timetable_agent],
)
```

This provides a more structured agent hierarchy with formal sub-agent delegation.

### Response Formatting

All agents follow consistent formatting rules:

1. **Emojis** - For visual categorization
2. **Bullet Points** - For lists and data
3. **Specific Values** - Names, percentages, emails
4. **Actionable Insights** - Clear recommendations

### Error Handling

```python
try:
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(system_prompt)
    return {"message": f"{emoji} {response.text}", "agent_id": agent_id}
except Exception as e:
    return {
        "message": f"❌ I encountered an error: {str(e)}\n\nPlease ensure GOOGLE_API_KEY is set in the .env file.",
        "agent_id": "error",
    }
```

---

## 📁 File Structure

```
dummy-multi-agent/
├── api.py                      # FastAPI server with role-based routing
├── agent_router.py             # Principal session & message routing
├── agents.py                   # Principal agent definitions & logic
├── super_admin_router.py       # Super Admin session management
├── super_admin_agents.py       # Super Admin agent definitions
├── requirements.txt            # Python dependencies
├── start.sh                    # Server startup script
├── .env                        # Environment variables
├── README.md                   # This documentation
│
└── manager/                    # Google ADK implementation
    ├── agent.py               # Main school management agent
    ├── data/                  # CSV data files
    │   ├── attendance.csv
    │   ├── fees.csv
    │   ├── marks.csv
    │   └── timetable.csv
    ├── sub_agents/            # Specialized sub-agents
    │   ├── attendance_agent/
    │   ├── fees_agent/
    │   ├── marks_agent/
    │   └── timetable_agent/
    └── tools/
        └── tools.py           # Email & utility tools
```

---

## 🤝 Contributing

When adding new agents:

1. Define keywords in the appropriate `AGENT_DEFINITIONS` or `SUPER_ADMIN_AGENTS` dictionary
2. Add relevant data
3. Write a clear `prompt_addition` with specific instructions
4. Test with various query phrasings
5. Update this README

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | - | Initial principal agents |
| 2.0.0 | - | Added HR and Budget agents |
| 3.0.0 | Current | Role-based routing, Super Admin agents |

---

## 📞 Support

For issues or questions, refer to the main SchoolOS documentation or contact the development team.

---

*Built with ❤️ for SchoolOS - Smart School Management*
