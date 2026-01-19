from google.adk.agents import Agent

# Sample attendance data (reduced for better performance and to avoid serialization issues)
# In production, this would be loaded from a database
ATTENDANCE_DATA = """id,student_id,student_name,class_id,class_name,grade,section,date,status,period,marked_by,marked_at,remarks,mail_id
1,1,Aarav Sharma,1,Grade 1 - A,1,A,2025-11-18,present,1,Teacher,2025-11-18 09:05:00,null,bhuvanbalajiv@gmail.com
11,1,Aarav Sharma,1,Grade 1 - A,1,A,2025-11-18,present,2,Teacher,2025-11-18 10:05:00,null,bhuvanbalajiv@gmail.com
1341,1,Ishaan Singh,1,Grade 1 - A,1,A,2025-11-18,present,2,Teacher,2025-11-18 10:05:00,null,bhuvanbalajiv@gmail.com

21,1,Aarav Sharma,1,Grade 1 - A,1,A,2025-11-17,present,1,Teacher,2025-11-17 09:05:00,null,bhuvanbalajiv@gmail.com
51,1,Aarav Sharma,1,Grade 1 - A,1,A,2025-11-16,present,1,Teacher,2025-11-16 09:05:00,null,bhuvanbalajiv@gmail.com
56,1,Aarav Sharma,1,Grade 1 - A,1,A,2025-11-15,present,1,Teacher,2025-11-15 09:05:00,null,bhuvanbalajiv@gmail.com
61,1,Aarav Sharma,1,Grade 1 - A,1,A,2025-11-14,present,1,Teacher,2025-11-14 09:05:00,null,bhuvanbalajiv@gmail.com
2,2,Diya Patel,1,Grade 1 - A,1,A,2025-11-18,present,1,Teacher,2025-11-18 09:05:00,null,bitpodcast24@gmail.com
12,2,Diya Patel,1,Grade 1 - A,1,A,2025-11-18,present,2,Teacher,2025-11-18 10:05:00,null,bitpodcast24@gmail.com
22,2,Diya Patel,1,Grade 1 - A,1,A,2025-11-17,present,1,Teacher,2025-11-17 09:05:00,null,bitpodcast24@gmail.com
52,2,Diya Patel,1,Grade 1 - A,1,A,2025-11-16,present,1,Teacher,2025-11-16 09:05:00,null,bitpodcast24@gmail.com
57,2,Diya Patel,1,Grade 1 - A,1,A,2025-11-15,late,1,Teacher,2025-11-15 09:14:00,traffic,bitpodcast24@gmail.com
3,3,Rohan Kumar,1,Grade 1 - A,1,A,2025-11-18,present,1,Teacher,2025-11-18 09:05:00,null,bitpodcast24@gmail.com
4,4,Aditya Verma,1,Grade 1 - A,1,A,2025-11-18,late,1,Teacher,2025-11-18 09:15:00,Arrived 10 mins late ,abhisheklgowda05@gmail.com
64,4,Aditya Verma,1,Grade 1 - A,1,A,2025-11-14,absent,1,Teacher,2025-11-14 09:05:00,Sports injury,abhisheklgowda05@gmail.com
5,5,Ananya Gupta,1,Grade 1 - A,1,A,2025-11-18,present,1,Teacher,2025-11-18 09:05:00,null,abhisheklgowda05@gmail.com
15,5,Ananya Gupta,1,Grade 1 - A,1,A,2025-11-18,absent,2,Teacher,2025-11-18 10:05:00,Not feeling well
6,6,Ishaan Singh,1,Grade 1 - A,1,A,2025-11-18,absent,1,Teacher,2025-11-18 09:05:00,Medical leave
46,81,Madhav Jain,9,Grade 5 - A,5,A,2025-11-18,present,1,Teacher,2025-11-18 09:05:00,null,abhisheklgowda05@gmail.com
50,85,Rudra Tiwari,9,Grade 5 - A,5,A,2025-11-18,late,1,Teacher,2025-11-18 09:18:00,Overslept
"""

attendance_agent = Agent(
    name="attendance_agent",
    model="gemini-2.5-flash",
    description="Friendly attendance management agent that handles all types of queries about student attendance",
    instruction=f"""
    You are a helpful and friendly school attendance assistant. You have access to the complete attendance database below.

    **COMPLETE ATTENDANCE DATABASE:**
    {ATTENDANCE_DATA}

    **How to answer queries:**
    1. Read the data carefully from the database above
    2. Filter and analyze based on the user's question
    3. Provide clear, accurate answers with proper formatting
    4. **ALWAYS include email addresses (mail_id) in your responses when available**

    **Example Queries and How to Answer:**

    Q: "get attendance for Aarav Sharma"
    A: Look for all rows where student_name = "Aarav Sharma"
       Show: dates, status (Present/Absent/Late), attendance percentage, and EMAIL

    Q: "show attendance for class 5A"
    A: Filter all records for class="5" and grade="A"
       Show: student names, their attendance status, statistics, and EMAILS

    Q: "who has low attendance?" or "students with less than 80% attendance"
    A: Calculate attendance % for each student
       List students with low attendance INCLUDING their email addresses
       Format: Student Name (Email: email@example.com) - X% attendance

    Q: "who is absent today?" or "who was absent on 2025-10-11?"
    A: Filter rows where status="Absent" for the specified date
       List all students who were absent WITH their email addresses

    **CRITICAL: Email Address Formatting**
    - When listing students, ALWAYS include their email in this format:
      "Student Name (Email: mail_id_from_database)"
    - Example: "Aarav Sharma (Email: abhisheklgowda05@gmail.com)"
    - This allows the system to send automated notifications

    **Important Instructions:**
    - ALWAYS search the database above for the requested information
    - Show actual data from the database, not made-up information
    - For student names, match exactly (case-insensitive)
    - Calculate percentages: (Present days / Total days) × 100
    - Format dates as shown in the database
    - Be specific with your answers using real data
    - **Include mail_id field in ALL student-related responses**

    **Response Format:**
    - For individual students: Show complete attendance record + EMAIL
    - For class queries: Show summary with all students + EMAILS
    - For date queries: Show who was present/absent/late + EMAILS
    - For low attendance: Highlight students + EMAILS
    - Always include relevant statistics (percentages, totals, etc.)

    Remember: You have ALL the attendance data above. Use it to answer every query accurately and ALWAYS include email addresses!
    """,
)
