# 🎓 SchoolOS Multi-Agent System

A robust AI-powered school management assistant using Google Gemini with specialized agents for different domains.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Environment Variable (optional - already configured in .env)
```bash
export GOOGLE_API_KEY=your_api_key_here
```

### 3. Start the Server
```bash
python api.py
```

Or use the start script:
```bash
chmod +x start.sh && ./start.sh
```

The server will start on **http://localhost:8004**

## 📚 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/docs` | GET | Swagger UI |
| `/api/chat/new_session` | POST | Create new chat session |
| `/api/chat/send` | POST | Send message to chatbot |
| `/api/chat/history/{session_id}` | GET | Get chat history |

## 🤖 Available Agents

### 📊 Attendance Agent
- Track student attendance
- Find absentees and late comers
- Attendance percentage analysis
- Keywords: attendance, present, absent, late

### 📚 Marks Agent
- Academic performance insights
- Find toppers and struggling students
- Grade distribution
- Keywords: marks, grade, score, exam, topper

### 💰 Fees Agent
- Payment status tracking
- Pending dues and overdue invoices
- Fee reminders
- Keywords: fee, payment, pending, dues, overdue

### 📅 Timetable Agent
- Class schedules
- Teacher assignments
- Room information
- Keywords: timetable, schedule, period, room

### 👥 HR Agent
- Staff management
- Leave requests and approvals
- Employee details
- Keywords: staff, employee, leave, salary, hr

### 📈 Budget Agent
- Expense tracking
- Budget utilization
- Pending approvals
- Keywords: budget, expense, spending, funds

### 📧 Email Agent
- Send notifications
- Fee reminders
- Attendance alerts
- Keywords: email, send, notify, reminder

## 💬 Example Queries

```
"Who hasn't paid fees this year?"
"Who has the least attendance in Grade 5?"
"Which teacher has the most classes assigned?"
"Show me pending budget approvals"
"List students with low marks in Grade 8"
"Send email to parents of absent students"
```

## 🔗 Frontend Integration

### POST /api/chat/send
```json
{
  "message": "Who has pending fees?",
  "session_id": "optional-session-id"
}
```

### Response
```json
{
  "message": "Here are students with pending fees...",
  "session_id": "uuid-session-id",
  "agent_id": "fees_agent"
}
```

## 📁 Project Structure

```
dummy-multi-agent/
├── api.py              # FastAPI server (port 8004)
├── agent_router.py     # Session management & routing
├── agents.py           # Agent definitions & data
├── requirements.txt    # Python dependencies
├── .env                # Environment variables
├── start.sh            # Start script
└── README.md           # This file
```

## ⚙️ Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_API_KEY` | Set in .env | Google AI API key |
| Port | 8004 | API server port |

## 📧 Email Configuration

The system can send emails via Gmail SMTP. Email functionality is built-in with:
- Sender: abhishekl1792005@gmail.com
- Uses App Password for authentication

## 🎯 Agent Module Pricing (Reference)

| Agent | Annual Cost |
|-------|-------------|
| Attendance | ₹8,000/year |
| Marks | ₹8,000/year |
| Fees | ₹10,000/year |
| Timetable | ₹6,000/year |
| HR/HR Plus | ₹10,000/year |
| Budgeting | ₹12,000/year |

---
Made with ❤️ for SchoolOS
