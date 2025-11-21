# Fees Agent - Enhanced Version

A comprehensive fee management agent that provides detailed analytics and insights about student fee payments, collection statistics, and payment tracking across the school.

## Overview

The Enhanced Fees Agent transforms basic fee lookups into a powerful financial management tool with:
- **9 specialized tools** for comprehensive fee analysis
- **Student-level tracking** with detailed payment breakdowns
- **Class-level summaries** with collection percentages
- **Component analysis** for fee types (Tuition, Transport, etc.)
- **Defaulter identification** sorted by pending amounts
- **Payment comparison** across multiple students
- **Overall statistics** for school-wide fee collection

## Architecture

### FeesAgentHelper Class
Manages all fee data operations with:
- CSV data loading and caching
- Internal filter methods for efficient data access
- Public methods for each analytical capability
- Lazy initialization for optimal performance

### Tool Functions
9 `@tool` decorated functions expose capabilities to the LLM:
1. `get_fees_for_student` - Complete fee records for a student
2. `get_pending_fees_for_student` - Outstanding payment details
3. `get_fee_summary_for_class` - Class-level aggregated statistics
4. `get_student_fee_summary` - Comprehensive student fee breakdown
5. `find_students_with_pending_fees` - Identify defaulters
6. `get_fee_component_summary` - Component-wise analysis
7. `get_overall_fee_statistics` - School-wide collection metrics
8. `compare_student_fees` - Multi-student payment comparison
9. `get_class_payment_distribution` - Payment status distribution

## Tools Reference

### 1. get_fees_for_student
```python
get_fees_for_student(student_name: str) -> List[Dict]
```

**Purpose**: Retrieve all fee entries (paid and pending) for a specific student.

**Parameters**:
- `student_name` (str): The student's full name (e.g., "Aarav Sharma")

**Returns**: List of dictionaries, each containing:
- `student_name`: Student's name
- `class`: Class name
- `fee_component`: Type of fee (Tuition, Transport, etc.)
- `amount`: Fee amount
- `status`: Payment status (Paid/Pending)

**Example Response**:
```json
[
  {
    "student_name": "Aarav Sharma",
    "class": "10-A",
    "fee_component": "Tuition",
    "amount": 25000,
    "status": "Paid"
  },
  {
    "student_name": "Aarav Sharma",
    "class": "10-A",
    "fee_component": "Transport",
    "amount": 6000,
    "status": "Pending"
  }
]
```

### 2. get_pending_fees_for_student
```python
get_pending_fees_for_student(student_name: str) -> Dict
```

**Purpose**: Get detailed information about a student's pending (unpaid) fees.

**Parameters**:
- `student_name` (str): The student's full name

**Returns**: Dictionary containing:
- `student`: Student name
- `pending_amount`: Total pending amount
- `pending_items`: List of pending fee entries
- `num_pending_items`: Count of pending items
- `status`: "Payment Pending" or "All Clear"

**Example Response**:
```json
{
  "student": "Aarav Sharma",
  "pending_amount": 6000,
  "pending_items": [
    {
      "student_name": "Aarav Sharma",
      "class": "10-A",
      "fee_component": "Transport",
      "amount": 6000,
      "status": "Pending"
    }
  ],
  "num_pending_items": 1,
  "status": "Payment Pending"
}
```

### 3. get_fee_summary_for_class
```python
get_fee_summary_for_class(class_name: str) -> Dict
```

**Purpose**: Get aggregated fee summary for an entire class.

**Parameters**:
- `class_name` (str): The class identifier (e.g., "10-A", "9-B")

**Returns**: Dictionary containing:
- `class`: Class name
- `total_amount`: Total fees for the class
- `paid_amount`: Total amount paid
- `pending_amount`: Total amount pending
- `num_records`: Number of fee records
- `payment_percentage`: Collection efficiency percentage

**Example Response**:
```json
{
  "class": "10-A",
  "total_amount": 124000,
  "paid_amount": 100000,
  "pending_amount": 24000,
  "num_records": 8,
  "payment_percentage": 80.65
}
```

### 4. get_student_fee_summary
```python
get_student_fee_summary(student_name: str) -> Dict
```

**Purpose**: Comprehensive fee breakdown for a student with payment analysis.

**Parameters**:
- `student_name` (str): The student's full name

**Returns**: Dictionary containing:
- `student_name`: Student's name
- `class`: Student's class
- `total_fees`: Total fee amount
- `total_paid`: Amount paid
- `total_pending`: Amount pending
- `payment_percentage`: Payment completion percentage
- `num_components`: Total fee components
- `paid_components`: Number of paid components
- `pending_components`: Number of pending components
- `fee_breakdown`: Detailed list of all fee components
- `payment_status`: Overall status (Fully Paid/Partially Paid/Unpaid)

**Example Response**:
```json
{
  "student_name": "Aarav Sharma",
  "class": "10-A",
  "total_fees": 31000,
  "total_paid": 25000,
  "total_pending": 6000,
  "payment_percentage": 80.65,
  "num_components": 2,
  "paid_components": 1,
  "pending_components": 1,
  "fee_breakdown": [
    {
      "fee_component": "Tuition",
      "amount": 25000,
      "status": "Paid"
    },
    {
      "fee_component": "Transport",
      "amount": 6000,
      "status": "Pending"
    }
  ],
  "payment_status": "Partially Paid"
}
```

### 5. find_students_with_pending_fees
```python
find_students_with_pending_fees(class_name: str = None) -> List[Dict]
```

**Purpose**: Identify students with outstanding fees, optionally filtered by class.

**Parameters**:
- `class_name` (str, optional): Filter by specific class. If None, returns for all classes.

**Returns**: List of dictionaries (sorted by pending amount, highest first):
- `student_name`: Student's name
- `class`: Student's class
- `total_pending`: Total pending amount
- `num_pending_items`: Number of pending fee components
- `pending_components`: List of pending fee types

**Example Response**:
```json
[
  {
    "student_name": "Rohan Mehta",
    "class": "10-A",
    "total_pending": 31000,
    "num_pending_items": 2,
    "pending_components": ["Tuition", "Transport"]
  },
  {
    "student_name": "Aarav Sharma",
    "class": "10-A",
    "total_pending": 6000,
    "num_pending_items": 1,
    "pending_components": ["Transport"]
  }
]
```

### 6. get_fee_component_summary
```python
get_fee_component_summary(component: str) -> Dict
```

**Purpose**: Analyze a specific fee component (e.g., Tuition, Transport) across all students.

**Parameters**:
- `component` (str): The fee component name (e.g., "Tuition", "Transport")

**Returns**: Dictionary containing:
- `fee_component`: Component name
- `total_students`: Number of students with this component
- `total_amount`: Total amount for this component
- `total_paid`: Total paid amount
- `total_pending`: Total pending amount
- `students_paid`: Number of students who paid
- `students_pending`: Number of students with pending payments
- `collection_percentage`: Collection efficiency for this component

**Example Response**:
```json
{
  "fee_component": "Tuition",
  "total_students": 10,
  "total_amount": 250000,
  "total_paid": 200000,
  "total_pending": 50000,
  "students_paid": 8,
  "students_pending": 2,
  "collection_percentage": 80.0
}
```

### 7. get_overall_fee_statistics
```python
get_overall_fee_statistics() -> Dict
```

**Purpose**: Get comprehensive school-wide fee collection statistics.

**Parameters**: None

**Returns**: Dictionary containing:
- `total_fees`: Total fees across all students
- `total_paid`: Total amount collected
- `total_pending`: Total amount pending
- `collection_percentage`: Overall collection efficiency
- `total_students`: Number of unique students
- `total_classes`: Number of unique classes
- `students_with_pending`: Count of students with pending fees
- `students_fully_paid`: Count of students fully paid
- `component_breakdown`: Dictionary with stats for each fee component

**Example Response**:
```json
{
  "total_fees": 310000,
  "total_paid": 250000,
  "total_pending": 60000,
  "collection_percentage": 80.65,
  "total_students": 10,
  "total_classes": 2,
  "students_with_pending": 3,
  "students_fully_paid": 7,
  "component_breakdown": {
    "Tuition": {
      "total": 250000,
      "paid": 200000,
      "pending": 50000
    },
    "Transport": {
      "total": 60000,
      "paid": 50000,
      "pending": 10000
    }
  }
}
```

### 8. compare_student_fees
```python
compare_student_fees(student_names: List[str]) -> Dict
```

**Purpose**: Compare fee payment status between multiple students.

**Parameters**:
- `student_names` (list): List of student names to compare

**Returns**: Dictionary with student names as keys, each containing:
- `total_fees`: Student's total fees
- `total_paid`: Amount paid by student
- `total_pending`: Amount pending
- `payment_percentage`: Payment completion percentage
- `status`: Payment status (Fully Paid/Partially Paid/Unpaid)

**Example Response**:
```json
{
  "Aarav Sharma": {
    "total_fees": 31000,
    "total_paid": 25000,
    "total_pending": 6000,
    "payment_percentage": 80.65,
    "status": "Partially Paid"
  },
  "Diya Gupta": {
    "total_fees": 31000,
    "total_paid": 31000,
    "total_pending": 0,
    "payment_percentage": 100.0,
    "status": "Fully Paid"
  }
}
```

### 9. get_class_payment_distribution
```python
get_class_payment_distribution(class_name: str) -> Dict
```

**Purpose**: Analyze payment status distribution within a class.

**Parameters**:
- `class_name` (str): The class identifier

**Returns**: Dictionary containing:
- `class`: Class name
- `total_students`: Number of students in class
- `status_distribution`: Count of students by status
- `students_by_status`: Lists of student names grouped by status

**Example Response**:
```json
{
  "class": "10-A",
  "total_students": 5,
  "status_distribution": {
    "Fully Paid": 2,
    "Partially Paid": 2,
    "Unpaid": 1
  },
  "students_by_status": {
    "fully_paid": ["Diya Gupta", "Kavya Nair"],
    "partially_paid": ["Aarav Sharma", "Isha Reddy"],
    "unpaid": ["Rohan Mehta"]
  }
}
```

## Usage Examples

### Example 1: Check Student's Pending Fees
```
User: "What are the pending fees for Aarav Sharma?"

Agent uses: get_pending_fees_for_student("Aarav Sharma")

Response: "Aarav Sharma has ₹6,000 in pending fees. He has 1 pending payment:
- Transport Fee: ₹6,000 (Pending)"
```

### Example 2: Class Fee Collection Status
```
User: "How is the fee collection for class 10-A?"

Agent uses: get_fee_summary_for_class("10-A")

Response: "Fee collection status for Class 10-A:
- Total Fees: ₹124,000
- Collected: ₹100,000 (80.65%)
- Pending: ₹24,000
The class has a collection efficiency of 80.65%."
```

### Example 3: Identify Students with Pending Fees
```
User: "Which students in class 10-A have pending fees?"

Agent uses: find_students_with_pending_fees("10-A")

Response: "3 students in Class 10-A have pending fees:
1. Rohan Mehta - ₹31,000 pending (Tuition, Transport)
2. Aarav Sharma - ₹6,000 pending (Transport)
3. Isha Reddy - ₹3,000 pending (Transport)"
```

### Example 4: Overall School Statistics
```
User: "Give me overall fee collection statistics"

Agent uses: get_overall_fee_statistics()

Response: "School-wide Fee Collection Statistics:
- Total Fees: ₹310,000
- Collected: ₹250,000 (80.65%)
- Pending: ₹60,000
- Total Students: 10 (7 fully paid, 3 with pending)
- Total Classes: 2

Component Breakdown:
- Tuition: ₹200,000 collected / ₹250,000 total (80%)
- Transport: ₹50,000 collected / ₹60,000 total (83.33%)"
```

### Example 5: Compare Students
```
User: "Compare fee status between Aarav Sharma and Diya Gupta"

Agent uses: compare_student_fees(["Aarav Sharma", "Diya Gupta"])

Response: "Fee Comparison:

Aarav Sharma:
- Total: ₹31,000 | Paid: ₹25,000 (80.65%) | Pending: ₹6,000
- Status: Partially Paid

Diya Gupta:
- Total: ₹31,000 | Paid: ₹31,000 (100%) | Pending: ₹0
- Status: Fully Paid"
```

## Data Source

The agent reads from `manager/data/fees.csv` with the following structure:

| student_name | class | fee_component | amount | status  |
|--------------|-------|---------------|--------|---------|
| Aarav Sharma | 10-A  | Tuition       | 25000  | Paid    |
| Aarav Sharma | 10-A  | Transport     | 6000   | Pending |
| Diya Gupta   | 10-A  | Tuition       | 25000  | Paid    |
| Diya Gupta   | 10-A  | Transport     | 6000   | Paid    |

## Key Features

### 1. Comprehensive Student Tracking
- Complete fee history for each student
- Payment breakdown by component
- Payment percentage calculation
- Status categorization (Fully Paid/Partially Paid/Unpaid)

### 2. Class-Level Analytics
- Aggregated fee summaries
- Collection efficiency percentages
- Payment distribution analysis
- Student categorization by payment status

### 3. Component Analysis
- Fee type-wise statistics (Tuition, Transport, etc.)
- Component-level collection rates
- Cross-component comparison

### 4. Defaulter Management
- Automatic identification of students with pending fees
- Sorted by pending amount (highest first)
- Component-wise pending breakdown
- Class-filtered or school-wide view

### 5. Financial Insights
- Overall collection percentages
- School-wide statistics
- Multi-student comparisons
- Trend analysis capabilities

## Agent Behavior

The Fees Agent is configured with:
- **Model**: `gemini-2.5-flash`
- **Name**: `fees_agent`
- **Specialization**: Fee management and payment tracking

### Response Guidelines
- Provides clear, actionable financial information
- Highlights pending amounts prominently
- Uses percentages for collection efficiency
- Sorts defaulters by pending amount
- Presents data in organized formats
- Shows exact amounts for all financial queries
- Identifies students needing payment reminders

## Integration

The fees agent integrates into the multi-agent system:

```python
from manager.sub_agents.fees_agent import fees_agent

# The fees_agent is ready to use
# It will automatically handle fee-related queries
```

## Performance Optimizations

1. **Lazy Initialization**: Helper class loads only when first needed
2. **Efficient Filtering**: Internal filter methods minimize data processing
3. **Data Caching**: CSV loaded once and reused for all operations
4. **Sorted Results**: Pre-sorted results for quick top defaulter identification

## Enhancement History

**Original Version**:
- 3 basic tools (get_fees_for_student, get_pending_fees_for_student, get_fee_summary_for_class)
- Simple data retrieval
- No analytics or insights

**Enhanced Version**:
- 9 comprehensive tools
- Helper class architecture
- Advanced analytics (payment percentages, distributions, comparisons)
- Defaulter identification and sorting
- Component-wise analysis
- Overall statistics
- Multi-student comparison
- Payment status categorization

## Future Enhancement Possibilities

1. **Payment History Tracking**: Track payment dates and history
2. **Reminder Generation**: Auto-generate payment reminders
3. **Installment Plans**: Support for installment-based payments
4. **Late Fee Calculation**: Automatic late fee computation
5. **Payment Forecasting**: Predict collection trends
6. **Export Capabilities**: Generate payment reports in various formats
7. **Visual Analytics**: Charts and graphs for fee trends
8. **Payment Gateway Integration**: Direct payment processing

---

**Status**: ✅ Fully Enhanced and Production Ready
**Last Updated**: January 2025
**Version**: 2.0 (Enhanced)
