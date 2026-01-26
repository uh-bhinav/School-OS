"""
Super Admin Agents - Multi-Agent System for Group-Level School Management
==========================================================================
Provides group-level insights across multiple schools for Super Administrators.
All agents are READ-ONLY and return text-only responses.

AGENTS:
1. group_overview_agent      - High-level health summary across all schools
2. group_finance_agent       - Revenue, dues, collection trends
3. group_attendance_agent    - Attendance health across schools
4. compliance_risk_agent     - Compliance issues, audits, violations
5. group_communication_agent - Message delivery, parent engagement
6. schools_overview_agent    - Per-school status and rankings
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
env_path = Path(__file__).parent / "manager" / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)

# Configure Gemini
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)


# ============================================================================
# SUPER ADMIN DATA - GROUP LEVEL (Multi-School Data)
# ============================================================================

# --- SCHOOLS MASTER DATA ---
SCHOOLS_DATA = """school_id,school_name,school_code,city,state,principal,total_students,total_staff,status,tier,established,last_audit_date,license_expiry
1,Tapasya Vidyanikethan,TVPS001,Bangalore,Karnataka,Dr. Rajesh Kumar,1250,85,Active,Premium,2015,2025-08-15,2026-03-31
2,Green Valley International,GVI002,Chennai,Tamil Nadu,Mrs. Lakshmi Iyer,980,72,Active,Standard,2018,2025-06-20,2025-12-15
3,Sunrise Academy,SRA003,Hyderabad,Telangana,Mr. Venkat Rao,1450,95,Active,Premium,2012,2025-09-10,2026-06-30
4,Little Stars School,LSS004,Mumbai,Maharashtra,Mrs. Priya Desai,650,48,Warning,Basic,2020,2024-11-30,2025-02-28
5,Knowledge Hub Academy,KHA005,Pune,Maharashtra,Dr. Amit Sharma,1100,78,Active,Standard,2016,2025-07-25,2026-01-15
6,Bright Future School,BFS006,Delhi,Delhi,Mr. Rahul Gupta,890,62,Suspended,Basic,2019,2024-08-10,2024-12-31
7,Excel International,EXI007,Kolkata,West Bengal,Mrs. Anjali Sen,1320,88,Active,Premium,2014,2025-10-05,2026-09-30
8,Wisdom Tree School,WTS008,Jaipur,Rajasthan,Dr. Meera Joshi,720,52,Active,Standard,2021,2025-05-18,2025-11-30"""

# --- GROUP FINANCE DATA (Per School) ---
GROUP_FINANCE_DATA = """school_id,school_name,total_revenue,collected_amount,pending_dues,overdue_amount,collection_rate,avg_fee_per_student,last_month_collection,yoy_growth
1,Tapasya Vidyanikethan,62500000,58750000,3750000,1250000,94.0,50000,4850000,8.5
2,Green Valley International,44100000,39690000,4410000,2205000,90.0,45000,3200000,5.2
3,Sunrise Academy,72500000,68875000,3625000,1087500,95.0,50000,5650000,12.3
4,Little Stars School,26000000,18200000,7800000,5200000,70.0,40000,1200000,-3.5
5,Knowledge Hub Academy,49500000,44550000,4950000,1980000,90.0,45000,3600000,6.8
6,Bright Future School,35600000,21360000,14240000,10680000,60.0,40000,800000,-15.2
7,Excel International,66000000,62700000,3300000,990000,95.0,50000,5100000,10.1
8,Wisdom Tree School,32400000,29160000,3240000,1620000,90.0,45000,2350000,7.4"""

# --- GROUP ATTENDANCE DATA (Per School) ---
GROUP_ATTENDANCE_DATA = """school_id,school_name,avg_attendance_pct,students_below_75,chronic_absentees,best_class,worst_class,trend,risk_level
1,Tapasya Vidyanikethan,92.5,45,12,Grade 10-A (97.2%),Grade 1-B (85.3%),improving,Low
2,Green Valley International,88.3,78,25,Grade 8-A (94.1%),Grade 5-B (79.8%),stable,Medium
3,Sunrise Academy,94.1,32,8,Grade 9-A (98.5%),Grade 3-A (88.2%),improving,Low
4,Little Stars School,72.8,185,62,Grade 6-A (82.5%),Grade 2-B (58.3%),declining,Critical
5,Knowledge Hub Academy,89.5,65,18,Grade 7-A (95.2%),Grade 4-B (81.5%),stable,Medium
6,Bright Future School,65.2,312,124,Grade 5-A (78.2%),Grade 1-A (48.5%),declining,Critical
7,Excel International,93.8,38,10,Grade 10-B (98.1%),Grade 2-A (87.4%),improving,Low
8,Wisdom Tree School,87.2,58,20,Grade 8-B (93.8%),Grade 3-B (78.9%),stable,Medium"""

# --- COMPLIANCE & RISK DATA ---
COMPLIANCE_RISK_DATA = """school_id,school_name,license_status,license_expiry,last_audit,audit_status,pending_violations,critical_issues,fire_safety_cert,health_cert,building_cert,overall_compliance
1,Tapasya Vidyanikethan,Valid,2026-03-31,2025-08-15,Passed,0,0,Valid,Valid,Valid,Compliant
2,Green Valley International,Valid,2025-12-15,2025-06-20,Passed,1,0,Valid,Valid,Valid,Minor Issues
3,Sunrise Academy,Valid,2026-06-30,2025-09-10,Passed,0,0,Valid,Valid,Valid,Compliant
4,Little Stars School,Expiring Soon,2025-02-28,2024-11-30,Failed,5,2,Expired,Valid,Pending,At Risk
5,Knowledge Hub Academy,Valid,2026-01-15,2025-07-25,Passed,1,0,Valid,Valid,Valid,Minor Issues
6,Bright Future School,Expired,2024-12-31,2024-08-10,Failed,8,4,Expired,Expired,Expired,Critical
7,Excel International,Valid,2026-09-30,2025-10-05,Passed,0,0,Valid,Valid,Valid,Compliant
8,Wisdom Tree School,Valid,2025-11-30,2025-05-18,Conditional,2,1,Valid,Pending,Valid,At Risk"""

# --- COMMUNICATION DATA ---
COMMUNICATION_DATA = """school_id,school_name,total_messages_sent,delivered,failed,read_rate,parent_app_adoption,avg_response_time_hrs,sms_credits_remaining,email_bounce_rate,engagement_score
1,Tapasya Vidyanikethan,15680,15523,157,89.5,92.3,2.4,4500,1.2,A
2,Green Valley International,12450,11956,494,82.3,78.5,4.8,2800,3.8,B
3,Sunrise Academy,18920,18731,189,91.2,95.1,1.8,5200,0.9,A+
4,Little Stars School,8560,7447,1113,58.2,45.2,12.5,800,15.2,D
5,Knowledge Hub Academy,11200,10864,336,85.6,82.4,3.2,3200,2.8,B+
6,Bright Future School,6780,5085,1695,42.5,28.3,24.8,150,22.5,F
7,Excel International,16540,16375,165,90.8,93.8,2.1,4800,1.0,A
8,Wisdom Tree School,9870,9376,494,79.8,71.2,5.5,2100,4.8,B"""

# --- SCHOOLS HEALTH SUMMARY ---
SCHOOLS_HEALTH_SUMMARY = """school_id,school_name,overall_health_score,academic_score,financial_score,operational_score,compliance_score,rank,alerts
1,Tapasya Vidyanikethan,92,94,95,88,100,2,None
2,Green Valley International,81,83,85,78,90,5,License expiring in 30 days
3,Sunrise Academy,95,96,97,92,100,1,None
4,Little Stars School,52,58,55,48,45,7,Multiple critical issues - Immediate attention required
5,Knowledge Hub Academy,84,86,85,82,90,4,None
6,Bright Future School,28,35,40,22,15,8,SUSPENDED - Urgent action required
7,Excel International,93,95,96,90,100,3,None
8,Wisdom Tree School,78,80,82,75,72,6,Health certificate renewal pending"""


# ============================================================================
# SUPER ADMIN AGENT DEFINITIONS
# ============================================================================

SUPER_ADMIN_AGENTS = {
    "group_overview_agent": {
        "keywords": [
            "overview",
            "summary",
            "overall",
            "health",
            "total schools",
            "all schools",
            "group",
            "dashboard",
            "snapshot",
            "status",
            "how many schools",
            "schools count",
        ],
        "data": f"""SCHOOLS MASTER DATA:
{SCHOOLS_DATA}

SCHOOLS HEALTH SUMMARY:
{SCHOOLS_HEALTH_SUMMARY}""",
        "emoji": "🏫",
        "prompt_addition": """
You are the Group Overview Agent for a Super Admin managing multiple schools.
Focus on:
- Total number of schools and their distribution by status (Active, Warning, Suspended)
- Total students and staff across all schools
- At-risk schools requiring attention
- High-level health summary across the group
- Quick wins and critical alerts

Provide executive-level insights suitable for a Super Admin dashboard.""",
    },
    "group_finance_agent": {
        "keywords": [
            "finance",
            "revenue",
            "collection",
            "dues",
            "money",
            "payment",
            "fee",
            "financial",
            "income",
            "outstanding",
            "cash flow",
            "budget",
        ],
        "data": GROUP_FINANCE_DATA,
        "emoji": "💰",
        "prompt_addition": """
You are the Group Finance Agent for a Super Admin.
Focus on:
- Total revenue across all schools
- Fee collection rates and trends
- Schools with high pending dues or overdue amounts
- Year-over-year growth comparison
- Financial stress indicators
- Schools needing collection intervention

Provide actionable financial insights with specific numbers and percentages.""",
    },
    "group_attendance_agent": {
        "keywords": [
            "attendance",
            "absent",
            "present",
            "absenteeism",
            "chronic",
            "below threshold",
            "at risk",
            "attendance health",
            "attendance risk",
        ],
        "data": GROUP_ATTENDANCE_DATA,
        "emoji": "📊",
        "prompt_addition": """
You are the Group Attendance Agent for a Super Admin.
Focus on:
- Average attendance across all schools
- Schools with attendance below acceptable threshold (85%)
- Chronic absenteeism patterns
- Attendance trends (improving/declining)
- Risk levels and interventions needed
- Best and worst performing classes

Highlight schools requiring immediate attention.""",
    },
    "compliance_risk_agent": {
        "keywords": [
            "compliance",
            "risk",
            "audit",
            "license",
            "legal",
            "violation",
            "certificate",
            "expired",
            "safety",
            "inspection",
            "pending",
        ],
        "data": COMPLIANCE_RISK_DATA,
        "emoji": "⚠️",
        "prompt_addition": """
You are the Compliance & Risk Agent for a Super Admin.
Focus on:
- Schools with expired or expiring licenses
- Failed or pending audits
- Critical compliance violations
- Certificate status (fire safety, health, building)
- Legal risks and liability concerns
- Immediate actions required

Prioritize issues by severity and urgency.""",
    },
    "group_communication_agent": {
        "keywords": [
            "communication",
            "message",
            "notification",
            "parent",
            "engagement",
            "sms",
            "email",
            "delivery",
            "reach",
            "app adoption",
        ],
        "data": COMMUNICATION_DATA,
        "emoji": "📱",
        "prompt_addition": """
You are the Group Communication Agent for a Super Admin.
Focus on:
- Message delivery success rates
- Parent app adoption across schools
- Communication engagement scores
- Schools with poor parent reachability
- SMS credit status
- Email bounce rates and issues

Identify schools needing communication infrastructure improvements.""",
    },
    "schools_overview_agent": {
        "keywords": [
            "school list",
            "compare schools",
            "ranking",
            "performance",
            "individual school",
            "school details",
            "which school",
            "best school",
            "worst school",
            "school comparison",
            "tier",
        ],
        "data": f"""SCHOOLS MASTER DATA:
{SCHOOLS_DATA}

SCHOOLS HEALTH SUMMARY:
{SCHOOLS_HEALTH_SUMMARY}

FINANCIAL DATA:
{GROUP_FINANCE_DATA}

ATTENDANCE DATA:
{GROUP_ATTENDANCE_DATA}""",
        "emoji": "🏆",
        "prompt_addition": """
You are the Schools Overview Agent for a Super Admin.
Focus on:
- Per-school status and health flags
- School rankings by various metrics
- Comparative analysis between schools
- Tier distribution (Premium, Standard, Basic)
- Individual school deep-dives when requested
- Performance benchmarking

Provide both high-level rankings and specific school details when asked.""",
    },
}


def detect_super_admin_agent(query: str) -> tuple[str, dict]:
    """
    Detect which super admin agent should handle the query.
    Uses keyword matching similar to principal agent detection.

    Args:
        query: User's message text

    Returns:
        tuple: (agent_id, config_dict)
    """
    query_lower = query.lower()

    # Check each agent's keywords
    for agent_id, config in SUPER_ADMIN_AGENTS.items():
        for keyword in config["keywords"]:
            if keyword in query_lower:
                return agent_id, config

    # Default fallback to group overview agent
    return "group_overview_agent", SUPER_ADMIN_AGENTS["group_overview_agent"]


async def get_super_admin_agent_response(user_message: str, history: list) -> dict:
    """
    Get response from the appropriate super admin agent based on user query.

    Args:
        user_message: The user's query
        history: Conversation history for context

    Returns:
        dict: {"message": str, "agent_id": str}
    """

    # Build conversation context
    context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history[-6:]])
    query_lower = user_message.lower()

    # Detect agent
    agent_id, config = detect_super_admin_agent(user_message)

    # Handle greeting
    greeting_words = [
        "hi",
        "hello",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
    ]
    if any(
        query_lower.strip() == word
        or query_lower.startswith(word + " ")
        or query_lower.startswith(word + ",")
        for word in greeting_words
    ):
        return {
            "message": """👋 **Hello! I'm your Super Admin Group Management Assistant.**

I provide group-level insights across all your schools. Here's what I can help with:

🏫 **Group Overview** - Total schools, students, health summary
💰 **Financial Health** - Revenue, collections, dues across schools
📊 **Attendance Health** - Attendance trends, at-risk schools
⚠️ **Compliance & Risk** - Licenses, audits, violations
📱 **Communication** - Message delivery, parent engagement
🏆 **Schools Overview** - Rankings, comparisons, individual school details

**Try asking:**
- "Give me a group overview"
- "Which schools have poor financial health?"
- "Show schools with attendance below 80%"
- "Are there any compliance issues?"
- "Rank schools by overall performance"

What would you like to know about your school group?""",
            "agent_id": "group_overview_agent",
        }

    # Build prompt with relevant data
    relevant_data = config["data"]
    emoji = config["emoji"]
    prompt_addition = config["prompt_addition"]

    system_prompt = f"""You are a Super Admin assistant for a school management group.
You have access to data across multiple schools and provide group-level insights.
Your responses should be executive-level, actionable, and data-driven.

CURRENT DATA:
{relevant_data}

INSTRUCTIONS:
{prompt_addition}

FORMATTING RULES:
1. Use emojis to make responses friendly and readable
2. Format lists with bullet points
3. Use tables where appropriate for comparisons
4. Highlight critical issues with ⚠️ or 🚨
5. Include specific numbers, percentages, and school names
6. Be concise but thorough
7. Prioritize actionable insights
8. When comparing, show rankings or percentages

RECENT CONVERSATION:
{context}

USER QUERY: {user_message}

Provide an accurate, executive-level response based on the data above."""

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(system_prompt)

        return {"message": f"{emoji} {response.text}", "agent_id": agent_id}
    except Exception as e:
        return {
            "message": f"❌ I encountered an error: {str(e)}\n\nPlease ensure GOOGLE_API_KEY is set in the .env file.",
            "agent_id": "error",
        }
