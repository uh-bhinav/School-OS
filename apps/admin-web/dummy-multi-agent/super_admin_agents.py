"""
Super Admin Agents - Multi-Agent System for Group-Level School Management
==========================================================================
Provides group-level insights across multiple schools for Super Administrators.
All agents are READ-ONLY and return text-only responses with optional visualizations.
Response templating system for concise, scannable outputs.

AGENTS:
1. group_overview_agent      - High-level health summary across all schools
2. group_finance_agent       - Revenue, dues, collection trends
3. group_attendance_agent    - Attendance health across schools
4. compliance_risk_agent     - Compliance issues, audits, violations
5. group_communication_agent - Message delivery, parent engagement
6. schools_overview_agent    - Per-school status and rankings
"""

import os
import re
import logging
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# Import graph helpers for visualization support
try:
    from .graph_helpers import (
        should_generate_graph,
        build_graph_payload,
        generate_chart_safe,
        # Template utilities
        USE_RESPONSE_TEMPLATES,
        TEMPLATES_ENABLED,
        apply_template_to_message,
    )

    GRAPH_ENABLED = True
except ImportError:
    try:
        # Fallback for direct execution
        from graph_helpers import (
            should_generate_graph,
            build_graph_payload,
            generate_chart_safe,
            USE_RESPONSE_TEMPLATES,
            TEMPLATES_ENABLED,
            apply_template_to_message,
        )

        GRAPH_ENABLED = True
    except ImportError:
        GRAPH_ENABLED = False
        USE_RESPONSE_TEMPLATES = False
        TEMPLATES_ENABLED = False
        logging.warning("Graph helpers not available. Chart generation disabled.")

# Import Response Governor for strict output control
try:
    from .response_governor import (
        QueryAnalyzer,
        govern_response,
    )

    GOVERNOR_ENABLED = True
except ImportError:
    try:
        from response_governor import (
            QueryAnalyzer,
            govern_response,
        )

        GOVERNOR_ENABLED = True
    except ImportError:
        GOVERNOR_ENABLED = False
        logging.warning("Response Governor not available. Using legacy templating.")

logger = logging.getLogger(__name__)

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
        "prompt_addition": """Focus on: school count by status, total students/staff, at-risk schools, health alerts.""",
        "graph_config": {
            "supports_charts": True,
            "default_chart_type": "pie",
            "value_field": "overall_health_score",
            "category_field": "school_name",
        },
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
            "collection trend",
            "revenue comparison",
        ],
        "data": GROUP_FINANCE_DATA,
        "emoji": "💰",
        "prompt_addition": """Focus on: total revenue, collection rates, schools with high dues, YoY growth.""",
        "graph_config": {
            "supports_charts": True,
            "default_chart_type": "bar",
            "value_field": "collected_amount",
            "category_field": "school_name",
        },
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
            "attendance trend",
            "attendance comparison",
        ],
        "data": GROUP_ATTENDANCE_DATA,
        "emoji": "📊",
        "prompt_addition": """Focus on: avg attendance, schools below 85%, chronic absentees, risk levels.""",
        "graph_config": {
            "supports_charts": True,
            "default_chart_type": "horizontal_bar",
            "value_field": "avg_attendance_pct",
            "category_field": "school_name",
        },
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
        "prompt_addition": """Focus on: expired licenses, failed audits, violations, certificate status.""",
        "graph_config": {
            "supports_charts": True,
            "default_chart_type": "horizontal_bar",
            "value_field": "pending_violations",
            "category_field": "school_name",
        },
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
        "prompt_addition": """Focus on: delivery rates, parent app adoption, engagement scores.""",
        "graph_config": {
            "supports_charts": True,
            "default_chart_type": "bar",
            "value_field": "read_rate",
            "category_field": "school_name",
        },
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
        "prompt_addition": """Focus on: school rankings, comparisons, tier distribution, performance benchmarking.""",
        "graph_config": {
            "supports_charts": True,
            "default_chart_type": "horizontal_bar",
            "value_field": "overall_health_score",
            "category_field": "school_name",
        },
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
        dict: {"message": str, "agent_id": str, "chart": optional}
    """
    # Build conversation context
    _context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history[-6:]])
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
            "message": """👋 Hello! I'm your Super Admin Group Assistant.

I help with: 🏫 Overview | 💰 Finance | 📊 Attendance | ⚠️ Compliance | 📱 Communication | 🏆 Rankings

Try: "Group overview" or "Which schools have poor attendance?" """,
            "agent_id": "group_overview_agent",
        }

    # Build prompt with relevant data
    relevant_data = config["data"]
    emoji = config["emoji"]
    prompt_addition = config["prompt_addition"]
    graph_config = config.get("graph_config", {})

    # Check if visualization is requested
    needs_graph = False
    chart_result = None

    if GRAPH_ENABLED and graph_config.get("supports_charts", False):
        needs_graph = should_generate_graph(user_message)

    # If graph is needed, add instructions to extract chart data
    chart_instruction = ""
    if needs_graph:
        chart_instruction = """

CHART DATA (MANDATORY FOR THIS QUERY):
Provide chart data as JSON at the END of your text response:
<CHART_DATA>
{"chart_type": "bar", "title": "Title Here", "labels": ["Label1","Label2"], "values": [10,20]}
</CHART_DATA>

Chart types: line, bar, pie, horizontal_bar. Max 10 data points."""

    system_prompt = f"""You are a school group data assistant. Output ONLY data, never commentary.

DATA:
{relevant_data}

{prompt_addition}

STRICT OUTPUT RULES:
1. MAX 5 bullet points, each under 12 words
2. NO greetings, NO "here is", NO "based on the data"
3. NEVER write diagrams, flowcharts, mermaid, or ASCII art
4. NEVER use ```code blocks``` for any visual representation
5. Start with the most important fact
6. Use bullet format: • Item: Value
7. Critical issues only: prefix with ALERT:
{chart_instruction}

QUERY: {user_message}"""

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(system_prompt)
        response_text = response.text

        # Extract chart data if present and generate chart
        if needs_graph and GRAPH_ENABLED:
            chart_result = _extract_and_generate_super_admin_chart(
                response_text, agent_id
            )
            # Remove chart data tags from response text
            response_text = re.sub(
                r"<CHART_DATA>.*?</CHART_DATA>", "", response_text, flags=re.DOTALL
            ).strip()

        # Apply Response Governor for strict output control (if enabled)
        if GOVERNOR_ENABLED:
            # Analyze query to determine if graph is required
            analyzer = QueryAnalyzer()
            query_info = analyzer.analyze(user_message)

            # If query requires graph but none generated, try fallback chart generation
            if query_info["requires_graph"] and not chart_result and GRAPH_ENABLED:
                logger.info(
                    f"Governor: Query requires graph, trying fallback for {agent_id}"
                )
                chart_result = _generate_fallback_super_admin_chart(
                    response_text, user_message, agent_id
                )

            # Apply governor enforcement
            governed_response = govern_response(
                raw_response=response_text,
                query=user_message,
                agent_id=agent_id,
                chart=chart_result,
            )

            # Build final response with governed format
            result = {
                "message": governed_response["message"],
                "agent_id": agent_id,
                "formatted": governed_response.get("formatted"),
                "governed": True,  # Mark as governor-processed
            }

            if governed_response.get("chart"):
                result["chart"] = governed_response["chart"]
            if governed_response.get("bullets"):
                result["bullets"] = governed_response["bullets"]

            return result

        # Fallback: Apply response templates if enabled (legacy path)
        elif USE_RESPONSE_TEMPLATES and TEMPLATES_ENABLED:
            template_result = apply_template_to_message(
                message=response_text,
                query=user_message,
                agent_id=agent_id,
                chart=chart_result,
            )

            # Build final response with templated format
            result = {
                "message": f"{emoji} {template_result['message']}",
                "agent_id": agent_id,
                "formatted": template_result.get("formatted"),
            }

            if template_result.get("chart"):
                result["chart"] = template_result["chart"]
        else:
            # Fallback to raw response
            result = {"message": f"{emoji} {response_text}", "agent_id": agent_id}

            if chart_result:
                result["chart"] = chart_result

        return result

    except Exception as e:
        logger.exception(f"Super admin agent response error: {e}")
        return {
            "message": f"❌ I encountered an error: {str(e)}\n\nPlease ensure GOOGLE_API_KEY is set in the .env file.",
            "agent_id": "error",
        }


def _extract_and_generate_super_admin_chart(
    response_text: str, agent_id: str
) -> dict | None:
    """
    Extract chart data from LLM response and generate chart for super admin agents.

    Args:
        response_text: Full LLM response text
        agent_id: ID of the agent for logging

    Returns:
        Chart result dict or None if extraction/generation fails
    """
    import json

    try:
        # Extract chart data from tags
        match = re.search(
            r"<CHART_DATA>\s*(.*?)\s*</CHART_DATA>", response_text, re.DOTALL
        )
        if not match:
            logger.debug(f"No chart data found in {agent_id} response")
            return None

        chart_json = match.group(1).strip()
        chart_data = json.loads(chart_json)

        # Build payload for graph tool
        payload = build_graph_payload(
            agent_type=agent_id.replace("_agent", ""),
            intent=chart_data.get("chart_type", "comparison"),
            labels=chart_data.get("labels", []),
            values=chart_data.get("values", []),
            title=chart_data.get("title", ""),
            x_label=chart_data.get("x_label", ""),
            y_label=chart_data.get("y_label", ""),
            chart_type=chart_data.get("chart_type", "bar"),
        )

        # Generate chart
        result, error = generate_chart_safe(payload)

        if error:
            logger.error(f"Chart generation failed for {agent_id}: {error}")
            return None

        return {
            "base64_image": result.get("base64_image"),
            "chart_type": result.get("chart_type"),
            "title": chart_data.get("title", ""),
        }

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse chart JSON from {agent_id}: {e}")
        return None
    except Exception as e:
        logger.exception(f"Chart extraction error for {agent_id}: {e}")
        return None


def _generate_fallback_super_admin_chart(
    response_text: str, query: str, agent_id: str
) -> dict | None:
    """
    Generate a chart from response text when LLM didn't provide structured chart data.
    Extracts numbers and labels from bullet points to create a visualization.

    Args:
        response_text: The agent's text response
        query: Original user query
        agent_id: Agent identifier

    Returns:
        Chart result dict or None if generation fails
    """
    try:
        # Extract name:value or name - value patterns from response
        patterns = [
            r"•\s*([^:]+):\s*(\d+(?:\.\d+)?)",  # • Name: 95
            r"•\s*([^–-]+)\s*[-–]\s*(\d+(?:\.\d+)?)",  # • Name - 95
            r"(\w+(?:\s+\w+)*)\s*:\s*(\d+(?:\.\d+)?)",  # Name: 95
            r"(\w+(?:\s+\w+)*)\s+scored?\s+(\d+(?:\.\d+)?)",  # Name scored 95
        ]

        labels = []
        values = []

        for pattern in patterns:
            matches = re.findall(pattern, response_text)
            if matches and len(matches) >= 2:
                for match in matches[:10]:  # Limit to 10 items
                    label = match[0].strip()
                    try:
                        value = float(match[1])
                        if label and len(label) < 30:  # Reasonable label length
                            labels.append(label)
                            values.append(value)
                    except ValueError:
                        continue
                break  # Use first successful pattern

        if len(labels) < 2:
            logger.debug(f"Not enough data points extracted for chart: {len(labels)}")
            return None

        # Determine chart type based on query
        chart_type = "bar"
        if "trend" in query.lower() or "over time" in query.lower():
            chart_type = "line"
        elif "ranking" in query.lower() or "top" in query.lower():
            chart_type = "horizontal_bar"
        elif "distribution" in query.lower() or "breakdown" in query.lower():
            chart_type = "pie"

        # Generate title from query
        title_words = query.split()[:6]
        title = " ".join(word.title() for word in title_words)

        # Build payload
        payload = build_graph_payload(
            agent_type=agent_id.replace("_agent", ""),
            intent="comparison",
            labels=labels,
            values=values,
            title=title,
            chart_type=chart_type,
        )

        # Generate chart
        result, error = generate_chart_safe(payload)

        if error:
            logger.error(f"Fallback chart generation failed: {error}")
            return None

        logger.info(f"Successfully generated fallback chart for {agent_id}")
        return {
            "base64_image": result.get("base64_image"),
            "chart_type": result.get("chart_type"),
            "title": title,
        }

    except Exception as e:
        logger.exception(f"Fallback chart generation error: {e}")
        return None
