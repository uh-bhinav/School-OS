"""
Graph Integration Examples - Working Flow for Each Agent
=========================================================
Demonstrates how each agent handles visualization requests.

Run this file to test the chart generation:
    python graph_integration_examples.py
"""

import json

# ============================================================================
# EXAMPLE QUERIES AND EXPECTED BEHAVIOR
# ============================================================================

EXAMPLE_QUERIES = {
    # PRINCIPAL-LEVEL AGENTS
    "attendance_agent": {
        "graph_query": "Show me the attendance trend for the last 6 months",
        "non_graph_query": "Who has the lowest attendance?",
        "expected_chart_type": "line",
        "example_response": {
            "text": "📊 Attendance has shown steady improvement over the past 6 months, with a notable dip in November but strong recovery in January.",
            "chart": {
                "type": "line",
                "format": "base64",
                "data": "<base64_encoded_image>",
                "title": "Attendance Trend Over Time",
            },
            "notes": [
                "Lowest: November (88%)",
                "Highest: January (94%)",
                "Average: 91.3%",
            ],
        },
    },
    "marks_agent": {
        "graph_query": "Compare marks distribution across classes",
        "non_graph_query": "Who is the class topper?",
        "expected_chart_type": "bar",
        "example_response": {
            "text": "📚 Grade distribution shows strong performance in upper classes, with Grade 10 having the highest average scores.",
            "chart": {
                "type": "bar",
                "format": "base64",
                "data": "<base64_encoded_image>",
                "title": "Marks Comparison by Class",
            },
            "notes": [
                "Grade 10: Avg 85.7%",
                "Grade 8: Avg 82.3%",
                "Grade 5: Avg 78.5%",
            ],
        },
    },
    "fees_agent": {
        "graph_query": "Show fee collection trend over months",
        "non_graph_query": "Who hasn't paid fees?",
        "expected_chart_type": "line",
        "example_response": {
            "text": "💰 Fee collection has been improving steadily, with Q4 showing the best collection rates of the year.",
            "chart": {
                "type": "line",
                "format": "base64",
                "data": "<base64_encoded_image>",
                "title": "Monthly Fee Collection Trend",
            },
            "notes": [
                "Best month: January (₹48.5L)",
                "Total collected: ₹2.1Cr",
                "Collection rate: 89%",
            ],
        },
    },
    "budget_agent": {
        "graph_query": "Compare budget utilization across departments",
        "non_graph_query": "What are the pending approvals?",
        "expected_chart_type": "horizontal_bar",
        "example_response": {
            "text": "📈 Budget utilization varies significantly across departments. Computer Lab has the highest utilization at 93.8%.",
            "chart": {
                "type": "horizontal_bar",
                "format": "base64",
                "data": "<base64_encoded_image>",
                "title": "Budget Utilization by Department",
            },
            "notes": [
                "Highest: Computer Lab (93.8%)",
                "Lowest: Art Exhibition (0%)",
                "At risk: Science Lab (93.3%)",
            ],
        },
    },
    # SUPER ADMIN AGENTS
    "group_attendance_agent": {
        "graph_query": "Compare attendance across all schools",
        "non_graph_query": "Which schools have attendance issues?",
        "expected_chart_type": "horizontal_bar",
        "example_response": {
            "text": "📊 Significant attendance variation across schools. Sunrise Academy leads with 94.1%, while Bright Future School needs urgent intervention at 65.2%.",
            "chart": {
                "type": "horizontal_bar",
                "format": "base64",
                "data": "<base64_encoded_image>",
                "title": "School Attendance Comparison",
            },
            "notes": [
                "Best: Sunrise Academy (94.1%)",
                "Critical: Bright Future School (65.2%)",
                "Group average: 85.4%",
            ],
        },
    },
    "group_finance_agent": {
        "graph_query": "Show revenue distribution across schools",
        "non_graph_query": "Which school has the highest dues?",
        "expected_chart_type": "bar",
        "example_response": {
            "text": "💰 Revenue distribution shows Sunrise Academy leading with ₹7.25Cr, while smaller schools like Little Stars contribute ₹2.6Cr.",
            "chart": {
                "type": "bar",
                "format": "base64",
                "data": "<base64_encoded_image>",
                "title": "Revenue Distribution by School",
            },
            "notes": [
                "Highest: Sunrise Academy (₹7.25Cr)",
                "Total group revenue: ₹38.86Cr",
                "Best collection rate: 95%",
            ],
        },
    },
    "schools_overview_agent": {
        "graph_query": "Rank schools by overall health score",
        "non_graph_query": "Tell me about Tapasya Vidyanikethan",
        "expected_chart_type": "horizontal_bar",
        "example_response": {
            "text": "🏆 School health rankings show clear tiers. Top 3 schools (Sunrise, Excel, Tapasya) all score above 90, while Bright Future needs immediate action.",
            "chart": {
                "type": "horizontal_bar",
                "format": "base64",
                "data": "<base64_encoded_image>",
                "title": "Schools Ranked by Health Score",
            },
            "notes": [
                "#1 Sunrise Academy: 95",
                "#2 Excel International: 93",
                "#3 Tapasya Vidyanikethan: 92",
                "⚠️ Bright Future School: 28 (Critical)",
            ],
        },
    },
}


# ============================================================================
# IMPLEMENTATION PATTERN DEMO
# ============================================================================


def demonstrate_agent_pattern(agent_name: str, query: str):
    """
    Demonstrates the implementation pattern for an agent handling a graph query.

    This is pseudo-code showing the exact flow each agent follows.
    """
    print(f"\n{'='*60}")
    print(f"AGENT: {agent_name}")
    print(f"QUERY: {query}")
    print(f"{'='*60}")

    # Import helpers (as agents do)
    from graph_helpers import (
        should_generate_graph,
        build_graph_payload,
        generate_chart_safe,
    )

    # Step 1: Detect if graph is needed
    needs_graph = should_generate_graph(query)
    print(f"\n1. should_generate_graph('{query}')")
    print(f"   → Result: {needs_graph}")

    if needs_graph:
        # Step 2: Build graph payload (example data)
        # In real flow, LLM extracts this from response
        example_data = {
            "attendance_agent": {
                "labels": ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
                "values": [91, 93, 90, 88, 92, 94],
            },
            "marks_agent": {
                "labels": ["Grade 1", "Grade 5", "Grade 8", "Grade 10"],
                "values": [72, 78, 85, 89],
            },
            "fees_agent": {
                "labels": ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
                "values": [4.2, 4.5, 4.8, 4.3, 4.9, 5.1],
            },
            "budget_agent": {
                "labels": ["Annual Day", "Science Lab", "Sports Day", "Library"],
                "values": [65, 93, 25, 80],
            },
            "group_attendance_agent": {
                "labels": [
                    "Sunrise",
                    "Excel",
                    "Tapasya",
                    "Green Valley",
                    "Knowledge Hub",
                    "Wisdom Tree",
                    "Little Stars",
                    "Bright Future",
                ],
                "values": [94.1, 93.8, 92.5, 88.3, 89.5, 87.2, 72.8, 65.2],
            },
            "group_finance_agent": {
                "labels": [
                    "Sunrise",
                    "Excel",
                    "Tapasya",
                    "Knowledge Hub",
                    "Green Valley",
                    "Bright Future",
                    "Wisdom Tree",
                    "Little Stars",
                ],
                "values": [72.5, 66.0, 62.5, 49.5, 44.1, 35.6, 32.4, 26.0],
            },
            "schools_overview_agent": {
                "labels": [
                    "Sunrise",
                    "Excel",
                    "Tapasya",
                    "Knowledge Hub",
                    "Green Valley",
                    "Wisdom Tree",
                    "Little Stars",
                    "Bright Future",
                ],
                "values": [95, 93, 92, 84, 81, 78, 52, 28],
            },
        }

        data = example_data.get(
            agent_name, {"labels": ["A", "B", "C"], "values": [10, 20, 30]}
        )

        print("\n2. Building graph payload...")
        payload = build_graph_payload(
            agent_type=agent_name.replace("_agent", ""),
            intent="comparison" if "compare" in query.lower() else "trend",
            labels=data["labels"],
            values=data["values"],
            title=f"{agent_name.replace('_', ' ').title()} Analysis",
            chart_type="line" if "trend" in query.lower() else "horizontal_bar",
        )
        print(f"   → Payload: {json.dumps(payload, indent=6)[:500]}...")

        # Step 3: Generate chart
        print("\n3. Generating chart...")
        result, error = generate_chart_safe(payload)

        if error:
            print(f"   → Error: {error}")
            print("   → Fallback to text-only response")
        else:
            print(f"   → Success! Chart type: {result.get('chart_type')}")
            print(f"   → Output format: {result.get('output_format')}")
            if result.get("base64_image"):
                print(f"   → Image data: {result['base64_image'][:50]}...")
            elif result.get("file_path"):
                print(f"   → File saved to: {result['file_path']}")

        # Step 4: Format response
        print("\n4. Final response structure:")
        print(
            """   {
     "text": "<insight summary>",
     "chart": {
       "type": "<chart_type>",
       "format": "base64",
       "data": "<base64_image_data>"
     },
     "notes": ["observation1", "observation2"]
   }"""
        )
    else:
        print("\n2. No graph needed - returning text response only")
        print("   → Normal text response will be generated")

    return needs_graph


# ============================================================================
# QUICK VALIDATION TEST
# ============================================================================


def test_should_generate_graph():
    """Test the should_generate_graph function with various queries."""
    from graph_helpers import should_generate_graph

    test_cases = [
        # Should trigger graph
        ("Show attendance trend", True),
        ("Compare fee collection across months", True),
        ("Visualize performance distribution", True),
        ("Which classes are declining?", True),
        ("Show revenue comparison", True),
        ("Rank schools by health", True),
        # Should NOT trigger graph
        ("Who is the topper?", False),
        ("What is Aarav's attendance?", False),
        ("Is the fee paid?", False),
        ("Tell me about Grade 5", False),
        ("How many students are absent?", False),
    ]

    print("\n" + "=" * 60)
    print("TESTING should_generate_graph()")
    print("=" * 60)

    passed = 0
    failed = 0

    for query, expected in test_cases:
        result = should_generate_graph(query)
        status = "✓" if result == expected else "✗"
        if result == expected:
            passed += 1
        else:
            failed += 1
        print(f"{status} '{query}' → {result} (expected: {expected})")

    print(f"\nResults: {passed} passed, {failed} failed")
    return failed == 0


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("GRAPH INTEGRATION EXAMPLES - SchoolOS Multi-Agent System")
    print("=" * 70)

    # Test the detection function
    all_passed = test_should_generate_graph()

    if not all_passed:
        print(
            "\n⚠️ Some tests failed. Check the should_generate_graph() implementation."
        )

    # Demonstrate patterns for each agent
    print("\n\n" + "=" * 70)
    print("AGENT IMPLEMENTATION PATTERNS")
    print("=" * 70)

    for agent_name, config in EXAMPLE_QUERIES.items():
        # Demo with graph query
        demonstrate_agent_pattern(agent_name, config["graph_query"])
        print()

    print("\n" + "=" * 70)
    print("INTEGRATION COMPLETE")
    print("=" * 70)
    print(
        """
To use in production:

1. Agents automatically detect visualization intent
2. LLM extracts chart data in <CHART_DATA> tags
3. Graph tool generates base64 image
4. Response includes text + chart + observations

Example API response with chart:
{
    "message": "📊 Attendance trend shows...",
    "session_id": "session_123",
    "agentId": "attendance_agent",
    "timestamp": "2026-01-31T10:30:00",
    "chart": {
        "type": "line",
        "format": "base64",
        "data": "iVBORw0KGgoAAAANSUhEUgAA...",
        "title": "Attendance Trend Over Time"
    }
}
"""
    )
