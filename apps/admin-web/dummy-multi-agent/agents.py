"""
School Management Multi-Agent System
=====================================
A robust demo orchestration using Google Gemini with comprehensive school data.
Supports: Attendance, Marks, Fees, Timetable, HR, and Budgeting queries.
Now with visual chart generation capabilities for analytical queries.
Response Governor enforces concise, software-like outputs.
"""

import os
import re
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# Import graph helpers for visualization support
try:
    from .graph_helpers import (
        should_generate_graph,
        build_graph_payload,
        generate_chart_safe,
        USE_RESPONSE_TEMPLATES,
        TEMPLATES_ENABLED,
        apply_template_to_message,
    )

    GRAPH_ENABLED = True
except ImportError:
    try:
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

# Import Response Governor
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
        logging.warning("Response Governor not available.")

# Import Graph Intelligence for smarter auto-graph decisions
try:
    from .graph_intelligence import graph_decision_pipeline

    GRAPH_INTELLIGENCE_ENABLED = True
except ImportError:
    try:
        from graph_intelligence import graph_decision_pipeline

        GRAPH_INTELLIGENCE_ENABLED = True
    except ImportError:
        GRAPH_INTELLIGENCE_ENABLED = False
        logging.warning(
            "Graph Intelligence not available. Using legacy graph detection."
        )

# Import Report Intelligence for downloadable report generation
try:
    from .report_intelligence import should_generate_report, resolve_report_data
    from .report_generator_tool import generate_report as generate_pdf_report

    REPORT_ENABLED = True
except ImportError:
    try:
        from report_intelligence import should_generate_report, resolve_report_data
        from report_generator_tool import generate_report as generate_pdf_report

        REPORT_ENABLED = True
    except ImportError:
        REPORT_ENABLED = False
        logging.warning(
            "Report Intelligence not available. Report generation disabled."
        )

# Import Email Workflow Manager (human-in-the-loop approval)
try:
    from .email_workflow_manager import handle_email_workflow

    EMAIL_WORKFLOW_ENABLED = True
except ImportError:
    try:
        from email_workflow_manager import handle_email_workflow

        EMAIL_WORKFLOW_ENABLED = True
    except ImportError:
        EMAIL_WORKFLOW_ENABLED = False
        logging.warning("Email Workflow Manager not available.")

# Import Exam Scheduler Tool (multi-turn scheduling + hall tickets)
try:
    from .exam_scheduler_tool import (
        handle_exam_scheduling,
        is_exam_scheduling_request,
        is_hall_ticket_request,
        exam_workflows,
    )

    EXAM_SCHEDULER_ENABLED = True
except ImportError:
    try:
        from exam_scheduler_tool import (
            handle_exam_scheduling,
            is_exam_scheduling_request,
            is_hall_ticket_request,
            exam_workflows,
        )

        EXAM_SCHEDULER_ENABLED = True
    except ImportError:
        EXAM_SCHEDULER_ENABLED = False
        logging.warning("Exam Scheduler not available.")

# Import Export Generator Tool (CSV/Excel exports)
try:
    from .export_generator_tool import export_unpaid_invoices

    EXPORT_ENABLED = True
except ImportError:
    try:
        from export_generator_tool import export_unpaid_invoices

        EXPORT_ENABLED = True
    except ImportError:
        EXPORT_ENABLED = False
        logging.warning("Export Generator not available.")

# Import Context Chip Handler
try:
    from .context_chip_handler import enrich_message_with_context, validate_chips

    CONTEXT_CHIPS_ENABLED = True
except ImportError:
    try:
        from context_chip_handler import enrich_message_with_context, validate_chips

        CONTEXT_CHIPS_ENABLED = True
    except ImportError:
        CONTEXT_CHIPS_ENABLED = False
        logging.warning("Context Chip Handler not available.")

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
# EMAIL CONFIGURATION
# ============================================================================
EMAIL_SENDER = "abhishekl1792005@gmail.com"
EMAIL_APP_PASSWORD = "nshmknprzjypkorf"

# ============================================================================
# COMPREHENSIVE SCHOOL DATA (Aligned with Frontend Mock Data)
# ============================================================================

# --- STUDENT DATA (750+ students across classes 1-10, sections A & B) ---
STUDENTS_DATA = """student_id,student_name,class_name,section,roll_no,email,parent_email,parent_phone,gender,admission_date
1,Aarav Sharma,Grade 1,A,01,aarav.s@school.com,parent.aarav@gmail.com,+91-9876543001,Male,2024-04-01
2,Diya Patel,Grade 1,A,02,diya.p@school.com,parent.diya@gmail.com,+91-9876543002,Female,2024-04-01
3,Rohan Kumar,Grade 1,A,03,rohan.k@school.com,parent.rohan@gmail.com,+91-9876543003,Male,2024-04-01
4,Aditya Verma,Grade 1,A,04,aditya.v@school.com,parent.aditya@gmail.com,+91-9876543004,Male,2024-04-01
5,Ananya Gupta,Grade 1,A,05,ananya.g@school.com,parent.ananya@gmail.com,+91-9876543005,Female,2024-04-01
6,Ishaan Singh,Grade 1,A,06,ishaan.s@school.com,parent.ishaan@gmail.com,+91-9876543006,Male,2024-04-01
7,Myra Joshi,Grade 1,A,07,myra.j@school.com,parent.myra@gmail.com,+91-9876543007,Female,2024-04-01
8,Vivaan Rao,Grade 1,A,08,vivaan.r@school.com,parent.vivaan@gmail.com,+91-9876543008,Male,2024-04-01
9,Kiara Nair,Grade 1,A,09,kiara.n@school.com,parent.kiara@gmail.com,+91-9876543009,Female,2024-04-01
10,Arnav Iyer,Grade 1,A,10,arnav.i@school.com,parent.arnav@gmail.com,+91-9876543010,Male,2024-04-01
11,Zara Malhotra,Grade 1,B,01,zara.m@school.com,parent.zara@gmail.com,+91-9876543011,Female,2024-04-01
12,Krishna Das,Grade 1,B,02,krishna.d@school.com,parent.krishna@gmail.com,+91-9876543012,Male,2024-04-01
101,Siddharth Mehta,Grade 5,A,01,siddharth.m@school.com,parent.siddharth@gmail.com,+91-9876543101,Male,2020-04-01
102,Prisha Kapoor,Grade 5,A,02,prisha.k@school.com,parent.prisha@gmail.com,+91-9876543102,Female,2020-04-01
103,Madhav Jain,Grade 5,A,03,madhav.j@school.com,parent.madhav@gmail.com,+91-9876543103,Male,2020-04-01
104,Shanaya Bose,Grade 5,A,04,shanaya.b@school.com,parent.shanaya@gmail.com,+91-9876543104,Female,2020-04-01
105,Rudra Tiwari,Grade 5,A,05,rudra.t@school.com,parent.rudra@gmail.com,+91-9876543105,Male,2020-04-01
106,Avni Ghosh,Grade 5,B,01,avni.g@school.com,parent.avni@gmail.com,+91-9876543106,Female,2020-04-01
201,Veer Sethi,Grade 8,A,01,veer.s@school.com,parent.veer@gmail.com,+91-9876543201,Male,2017-04-01
202,Mishka Sen,Grade 8,A,02,mishka.s@school.com,parent.mishka@gmail.com,+91-9876543202,Female,2017-04-01
203,Raghav Lal,Grade 8,A,03,raghav.l@school.com,parent.raghav@gmail.com,+91-9876543203,Male,2017-04-01
204,Tara Dutta,Grade 8,A,04,tara.d@school.com,parent.tara@gmail.com,+91-9876543204,Female,2017-04-01
205,Kian Sinha,Grade 8,B,01,kian.s@school.com,parent.kian@gmail.com,+91-9876543205,Male,2017-04-01
301,Laksh Kulkarni,Grade 10,A,01,laksh.k@school.com,parent.laksh@gmail.com,+91-9876543301,Male,2015-04-01
302,Mira Deshpande,Grade 10,A,02,mira.d@school.com,parent.mira@gmail.com,+91-9876543302,Female,2015-04-01
303,Viraj Patil,Grade 10,A,03,viraj.p@school.com,parent.viraj@gmail.com,+91-9876543303,Male,2015-04-01"""

# --- ATTENDANCE DATA ---
ATTENDANCE_DATA = """id,student_id,student_name,class_name,section,date,status,period,remarks,attendance_pct,mail_id
1,1,Aarav Sharma,Grade 1,A,2025-11-18,present,1,On time,95.5,bhuvanbalajiv@gmail.com
2,2,Diya Patel,Grade 1,A,2025-11-18,present,1,On time,98.2,bitpodcast24@gmail.com
3,3,Rohan Kumar,Grade 1,A,2025-11-18,present,1,On time,72.1,parent.rohan@gmail.com
4,4,Aditya Verma,Grade 1,A,2025-11-18,late,1,Traffic delay,68.3,abhisheklgowda05@gmail.com
5,5,Ananya Gupta,Grade 1,A,2025-11-18,absent,1,Medical leave,89.0,parent.ananya@gmail.com
6,6,Ishaan Singh,Grade 1,A,2025-11-18,absent,1,Family emergency,55.2,parent.ishaan@gmail.com
7,7,Myra Joshi,Grade 1,A,2025-11-18,present,1,On time,91.4,parent.myra@gmail.com
8,8,Vivaan Rao,Grade 1,A,2025-11-18,present,1,On time,94.8,parent.vivaan@gmail.com
9,9,Kiara Nair,Grade 1,A,2025-11-18,late,1,Bus delay,85.6,parent.kiara@gmail.com
10,10,Arnav Iyer,Grade 1,A,2025-11-18,present,1,On time,97.2,parent.arnav@gmail.com
101,101,Siddharth Mehta,Grade 5,A,2025-11-18,present,1,On time,93.4,parent.siddharth@gmail.com
102,102,Prisha Kapoor,Grade 5,A,2025-11-18,present,1,On time,96.8,parent.prisha@gmail.com
103,103,Madhav Jain,Grade 5,A,2025-11-18,absent,1,Sick leave,45.2,abhisheklgowda05@gmail.com
104,104,Shanaya Bose,Grade 5,A,2025-11-18,present,1,On time,88.9,parent.shanaya@gmail.com
105,105,Rudra Tiwari,Grade 5,A,2025-11-18,late,1,Overslept,52.3,parent.rudra@gmail.com
106,106,Avni Ghosh,Grade 5,B,2025-11-18,present,1,On time,91.5,parent.avni@gmail.com
201,201,Veer Sethi,Grade 8,A,2025-11-18,present,1,On time,78.4,parent.veer@gmail.com
202,202,Mishka Sen,Grade 8,A,2025-11-18,present,1,On time,95.6,parent.mishka@gmail.com
203,203,Raghav Lal,Grade 8,A,2025-11-18,absent,1,Sports event,92.1,parent.raghav@gmail.com
204,204,Tara Dutta,Grade 8,A,2025-11-18,present,1,On time,97.8,parent.tara@gmail.com
205,205,Kian Sinha,Grade 8,B,2025-11-18,present,1,On time,89.3,parent.kian@gmail.com
301,301,Laksh Kulkarni,Grade 10,A,2025-11-18,present,1,On time,94.2,parent.laksh@gmail.com
302,302,Mira Deshpande,Grade 10,A,2025-11-18,present,1,On time,99.1,parent.mira@gmail.com
303,303,Viraj Patil,Grade 10,A,2025-11-18,absent,1,College visit,88.5,parent.viraj@gmail.com"""

# --- MARKS DATA ---
MARKS_DATA = """id,student_id,student_name,class_name,subject,exam,max_marks,obtained,grade,percentage
1,1,Aarav Sharma,Grade 1 - A,Mathematics,Unit Test 1,100,88,A,88.0
2,1,Aarav Sharma,Grade 1 - A,Science,Unit Test 1,100,75,B,75.0
3,1,Aarav Sharma,Grade 1 - A,English,Unit Test 1,100,82,A,82.0
4,2,Diya Patel,Grade 1 - A,Mathematics,Unit Test 1,100,92,A+,92.0
5,2,Diya Patel,Grade 1 - A,Science,Unit Test 1,100,89,A,89.0
6,2,Diya Patel,Grade 1 - A,English,Unit Test 1,100,95,A+,95.0
7,3,Rohan Kumar,Grade 1 - A,Mathematics,Unit Test 1,100,45,D,45.0
8,3,Rohan Kumar,Grade 1 - A,Science,Unit Test 1,100,38,F,38.0
9,3,Rohan Kumar,Grade 1 - A,English,Unit Test 1,100,52,C,52.0
10,4,Aditya Verma,Grade 1 - A,Mathematics,Unit Test 1,100,68,C,68.0
11,5,Ananya Gupta,Grade 1 - A,Mathematics,Unit Test 1,100,94,A+,94.0
12,6,Ishaan Singh,Grade 1 - A,Mathematics,Unit Test 1,100,35,F,35.0
13,6,Ishaan Singh,Grade 1 - A,Science,Unit Test 1,100,42,D,42.0
101,101,Siddharth Mehta,Grade 5 - A,Mathematics,Unit Test 1,100,78,B,78.0
102,102,Prisha Kapoor,Grade 5 - A,Mathematics,Unit Test 1,100,96,A+,96.0
103,103,Madhav Jain,Grade 5 - A,Mathematics,Unit Test 1,100,41,D,41.0
104,104,Shanaya Bose,Grade 5 - A,Mathematics,Unit Test 1,100,85,A,85.0
105,105,Rudra Tiwari,Grade 5 - A,Mathematics,Unit Test 1,100,33,F,33.0
201,201,Veer Sethi,Grade 8 - A,Mathematics,Unit Test 1,100,55,C,55.0
202,202,Mishka Sen,Grade 8 - A,Mathematics,Unit Test 1,100,91,A+,91.0
203,203,Raghav Lal,Grade 8 - A,Mathematics,Unit Test 1,100,88,A,88.0
204,204,Tara Dutta,Grade 8 - A,Mathematics,Unit Test 1,100,97,A+,97.0
301,301,Laksh Kulkarni,Grade 10 - A,Mathematics,Unit Test 1,100,82,A,82.0
302,302,Mira Deshpande,Grade 10 - A,Mathematics,Unit Test 1,100,99,A+,99.0
303,303,Viraj Patil,Grade 10 - A,Mathematics,Unit Test 1,100,76,B,76.0"""

# --- FEES DATA ---
FEES_DATA = """id,invoice_no,student_id,student_name,class_name,fee_type,amount,paid,balance,status,due_date,mail_id
1,INV-2025-001,1,Aarav Sharma,Grade 1 - A,Tuition Fee,50000,50000,0,paid,2025-04-15,abhisheklgowda05@gmail.com
2,INV-2025-002,1,Aarav Sharma,Grade 1 - A,Transport Fee,12000,0,12000,pending,2025-04-15,abhisheklgowda05@gmail.com
3,INV-2025-003,2,Diya Patel,Grade 1 - A,Tuition Fee,50000,50000,0,paid,2025-04-15,bitpodcast24@gmail.com
4,INV-2025-004,2,Diya Patel,Grade 1 - A,Transport Fee,12000,12000,0,paid,2025-04-15,bitpodcast24@gmail.com
5,INV-2025-005,3,Rohan Kumar,Grade 1 - A,Tuition Fee,50000,25000,25000,partial,2025-04-15,parent.rohan@gmail.com
6,INV-2025-006,3,Rohan Kumar,Grade 1 - A,Transport Fee,12000,0,12000,overdue,2025-03-15,parent.rohan@gmail.com
7,INV-2025-007,4,Aditya Verma,Grade 1 - A,Tuition Fee,50000,0,50000,overdue,2025-02-15,parent.aditya@gmail.com
8,INV-2025-008,5,Ananya Gupta,Grade 1 - A,Tuition Fee,50000,50000,0,paid,2025-04-15,parent.ananya@gmail.com
9,INV-2025-009,6,Ishaan Singh,Grade 1 - A,Tuition Fee,50000,0,50000,overdue,2025-01-15,parent.ishaan@gmail.com
10,INV-2025-010,6,Ishaan Singh,Grade 1 - A,Transport Fee,12000,0,12000,overdue,2025-01-15,parent.ishaan@gmail.com
101,INV-2025-101,101,Siddharth Mehta,Grade 5 - A,Tuition Fee,55000,55000,0,paid,2025-04-15,parent.siddharth@gmail.com
102,INV-2025-102,102,Prisha Kapoor,Grade 5 - A,Tuition Fee,55000,55000,0,paid,2025-04-15,parent.prisha@gmail.com
103,INV-2025-103,103,Madhav Jain,Grade 5 - A,Tuition Fee,55000,0,55000,overdue,2025-02-15,abhisheklgowda05@gmail.com
104,INV-2025-104,104,Shanaya Bose,Grade 5 - A,Tuition Fee,55000,30000,25000,partial,2025-04-15,parent.shanaya@gmail.com
105,INV-2025-105,105,Rudra Tiwari,Grade 5 - A,Tuition Fee,55000,0,55000,pending,2025-04-20,parent.rudra@gmail.com
201,INV-2025-201,201,Veer Sethi,Grade 8 - A,Tuition Fee,60000,0,60000,overdue,2025-03-15,parent.veer@gmail.com
202,INV-2025-202,202,Mishka Sen,Grade 8 - A,Tuition Fee,60000,60000,0,paid,2025-04-15,parent.mishka@gmail.com
203,INV-2025-203,203,Raghav Lal,Grade 8 - A,Tuition Fee,60000,60000,0,paid,2025-04-15,parent.raghav@gmail.com
301,INV-2025-301,301,Laksh Kulkarni,Grade 10 - A,Tuition Fee,65000,65000,0,paid,2025-04-15,parent.laksh@gmail.com
302,INV-2025-302,302,Mira Deshpande,Grade 10 - A,Tuition Fee,65000,65000,0,paid,2025-04-15,parent.mira@gmail.com
303,INV-2025-303,303,Viraj Patil,Grade 10 - A,Tuition Fee,65000,32500,32500,partial,2025-04-15,parent.viraj@gmail.com"""

# --- TIMETABLE DATA ---
TIMETABLE_DATA = """class_name,day,period,time,subject,teacher_id,teacher_name,room
Grade 1 - A,Monday,1,08:30-09:15,Mathematics,2,Anjali Patel,Room 101
Grade 1 - A,Monday,2,09:15-10:00,English,1,Priya Sharma,Room 101
Grade 1 - A,Monday,3,10:00-10:45,Science,3,Rajesh Singh,Science Lab 1
Grade 1 - A,Monday,4,11:00-11:45,Hindi,4,Kavita Verma,Room 101
Grade 1 - A,Monday,5,11:45-12:30,Social Studies,5,Amit Gupta,Room 101
Grade 1 - A,Monday,6,12:30-13:15,Art,10,Meera Iyer,Art Room
Grade 1 - A,Tuesday,1,08:30-09:15,Science,3,Rajesh Singh,Science Lab 1
Grade 1 - A,Tuesday,2,09:15-10:00,Mathematics,2,Anjali Patel,Room 101
Grade 1 - A,Tuesday,3,10:00-10:45,English,1,Priya Sharma,Room 101
Grade 5 - A,Monday,1,08:30-09:15,Mathematics,6,Lakshmi Agarwal,Room 501
Grade 5 - A,Monday,2,09:15-10:00,Science,7,Ramesh Choudhury,Science Lab 2
Grade 5 - A,Monday,3,10:00-10:45,English,8,Fatima Khan,Room 501
Grade 5 - A,Monday,4,11:00-11:45,Social Studies,5,Amit Gupta,Room 501
Grade 5 - A,Monday,5,11:45-12:30,Hindi,4,Kavita Verma,Room 501
Grade 5 - A,Monday,6,12:30-13:15,Computer,11,Arjun Reddy,Computer Lab
Grade 8 - A,Monday,1,08:30-09:15,Physics,3,Rajesh Singh,Physics Lab
Grade 8 - A,Monday,2,09:15-10:00,Chemistry,9,Sunita Nair,Chemistry Lab
Grade 8 - A,Monday,3,10:00-10:45,Mathematics,2,Anjali Patel,Room 801
Grade 8 - A,Monday,4,11:00-11:45,English,1,Priya Sharma,Room 801
Grade 8 - A,Monday,5,11:45-12:30,Biology,7,Ramesh Choudhury,Biology Lab
Grade 8 - A,Monday,6,12:30-13:15,Computer,11,Arjun Reddy,Computer Lab
Grade 10 - A,Monday,1,08:30-09:15,Physics,3,Rajesh Singh,Physics Lab
Grade 10 - A,Monday,2,09:15-10:00,Chemistry,9,Sunita Nair,Chemistry Lab
Grade 10 - A,Monday,3,10:00-10:45,Mathematics,6,Lakshmi Agarwal,Room 1001
Grade 10 - A,Monday,4,11:00-11:45,English,8,Fatima Khan,Room 1001
Grade 10 - A,Monday,5,11:45-12:30,Biology,7,Ramesh Choudhury,Biology Lab
Grade 10 - A,Monday,6,12:30-13:15,Computer,11,Arjun Reddy,Computer Lab"""

# --- STAFF / HR DATA ---
STAFF_DATA = """staff_id,employee_id,name,email,phone,department,designation,role,joining_date,salary,status,periods_per_week,leave_balance
1,EMP001,Rajesh Kumar,rajesh.kumar@school.com,+91-9876543210,Management,Principal,Management,2018-01-15,150000,Active,8,22
2,EMP002,Priya Sharma,priya.sharma@school.com,+91-9876543211,English,HOD English,Teaching,2019-07-01,85000,Active,28,18
3,EMP003,Anjali Patel,anjali.patel@school.com,+91-9876543212,Mathematics,Senior Teacher,Teaching,2020-06-15,75000,Active,32,15
4,EMP004,Rajesh Singh,rajesh.singh@school.com,+91-9876543213,Science,Physics Teacher,Teaching,2021-04-10,70000,Active,30,20
5,EMP005,Kavita Verma,kavita.verma@school.com,+91-9876543214,Hindi,Hindi Teacher,Teaching,2019-08-01,65000,Active,28,12
6,EMP006,Amit Gupta,amit.gupta@school.com,+91-9876543215,Social Studies,History HOD,Teaching,2018-06-01,80000,Active,26,16
7,EMP007,Lakshmi Agarwal,lakshmi.agarwal@school.com,+91-9876543216,Mathematics,Mathematics HOD,Teaching,2017-04-01,90000,Active,24,20
8,EMP008,Ramesh Choudhury,ramesh.choudhury@school.com,+91-9876543217,Science,Biology Teacher,Teaching,2020-01-15,72000,Active,30,14
9,EMP009,Fatima Khan,fatima.khan@school.com,+91-9876543218,English,English Teacher,Teaching,2021-07-01,68000,Active,28,18
10,EMP010,Sunita Nair,sunita.nair@school.com,+91-9876543219,Science,Chemistry Teacher,Teaching,2019-04-15,73000,Active,30,16
11,EMP011,Meera Iyer,meera.iyer@school.com,+91-9876543220,Arts,Art Teacher,Teaching,2022-01-10,55000,Active,20,20
12,EMP012,Arjun Reddy,arjun.reddy@school.com,+91-9876543221,Computer,Computer Teacher,Teaching,2020-08-01,75000,Active,24,18
13,EMP013,Deepika Menon,deepika.menon@school.com,+91-9876543222,Admin,Office Admin,Non-Teaching,2019-03-01,45000,Active,0,15
14,EMP014,Vikram Rao,vikram.rao@school.com,+91-9876543223,Accounts,Accountant,Non-Teaching,2018-05-01,55000,Active,0,18
15,EMP015,Pooja Saxena,pooja.saxena@school.com,+91-9876543224,Sports,Sports Coach,Teaching,2021-06-01,60000,Active,20,20"""

# --- LEAVE REQUESTS ---
LEAVE_DATA = """leave_id,staff_id,staff_name,department,leave_type,from_date,to_date,days,reason,status,applied_on
LV001,3,Anjali Patel,Mathematics,SICK,2025-11-26,2025-11-26,1,Severe migraine,PENDING,2025-11-25
LV002,6,Amit Gupta,Social Studies,EMERGENCY,2025-11-27,2025-11-28,2,Family emergency,PENDING,2025-11-25
LV003,8,Ramesh Choudhury,Science,CASUAL,2025-11-26,2025-11-26,1,Personal work,APPROVED,2025-11-24
LV004,1,Priya Sharma,English,MEDICAL,2025-12-01,2025-12-03,3,Surgery recovery,APPROVED,2025-11-20
LV005,5,Kavita Verma,Hindi,CASUAL,2025-11-29,2025-11-29,1,Wedding attendance,PENDING,2025-11-25
LV006,9,Fatima Khan,English,SICK,2025-11-25,2025-11-25,1,Cold and fever,REJECTED,2025-11-24
LV007,11,Meera Iyer,Arts,MATERNITY,2025-12-15,2026-03-15,90,Maternity leave,APPROVED,2025-11-01
LV008,4,Rajesh Singh,Science,CASUAL,2025-12-10,2025-12-10,1,Bank work,PENDING,2025-11-25"""

# --- BUDGET DATA ---
BUDGET_DATA = """budget_id,title,type,coordinator,allocated,spent,remaining,pending,status,start_date,end_date
BUD001,Annual Day 2025,event,Priya Sharma,500000,325000,175000,45000,active,2025-11-01,2025-12-31
BUD002,Science Lab Equipment,department,Rajesh Singh,300000,280000,20000,15000,active,2025-04-01,2026-03-31
BUD003,Sports Day 2025,event,Pooja Saxena,200000,50000,150000,25000,upcoming,2025-12-01,2026-01-31
BUD004,Library Books,department,Amit Gupta,150000,120000,30000,0,active,2025-04-01,2026-03-31
BUD005,Computer Lab Upgrade,project,Arjun Reddy,800000,750000,50000,0,completed,2025-01-01,2025-10-31
BUD006,Teacher Training Program,recurring,Rajesh Kumar,250000,180000,70000,20000,active,2025-04-01,2026-03-31
BUD007,School Maintenance,recurring,Deepika Menon,600000,450000,150000,30000,active,2025-04-01,2026-03-31
BUD008,Art Exhibition 2025,event,Meera Iyer,100000,0,100000,10000,planning,2026-01-15,2026-02-28"""

# --- BUDGET TRANSACTIONS ---
BUDGET_TRANSACTIONS = """txn_id,budget_id,budget_title,category,description,amount,type,status,requested_by,approved_by,date
TXN001,BUD001,Annual Day 2025,Decorations,Stage decoration materials,45000,expense,approved,Priya Sharma,Rajesh Kumar,2025-11-15
TXN002,BUD001,Annual Day 2025,Catering,Refreshments advance,60000,expense,approved,Priya Sharma,Rajesh Kumar,2025-11-16
TXN003,BUD001,Annual Day 2025,Sound System,DJ and sound rental,35000,expense,pending,Priya Sharma,null,2025-11-20
TXN004,BUD002,Science Lab Equipment,Equipment,Microscopes purchase,120000,expense,approved,Rajesh Singh,Rajesh Kumar,2025-05-10
TXN005,BUD002,Science Lab Equipment,Chemicals,Lab chemicals,45000,expense,approved,Rajesh Singh,Rajesh Kumar,2025-06-15
TXN006,BUD003,Sports Day 2025,Equipment,Sports equipment,25000,expense,pending,Pooja Saxena,null,2025-11-22
TXN007,BUD004,Library Books,Books,New textbooks,80000,expense,approved,Amit Gupta,Rajesh Kumar,2025-07-01
TXN008,BUD006,Teacher Training,Workshop,Training workshop fee,50000,expense,approved,Rajesh Kumar,Rajesh Kumar,2025-08-15
TXN009,BUD007,School Maintenance,Repairs,Classroom repairs,75000,expense,approved,Deepika Menon,Rajesh Kumar,2025-09-01
TXN010,BUD001,Annual Day 2025,Costumes,Student costumes,25000,expense,pending,Priya Sharma,null,2025-11-24"""


# ============================================================================
# EMAIL TOOL
# ============================================================================


def send_email(recipient_email: str, subject: str, body: str) -> str:
    """Send email using Gmail SMTP."""
    try:
        recipients = [email.strip() for email in recipient_email.split(",")]

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_APP_PASSWORD)

        msg = MIMEMultipart()
        msg["From"] = EMAIL_SENDER
        msg["To"] = ", ".join(recipients)
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        server.sendmail(EMAIL_SENDER, recipients, msg.as_string())
        server.quit()

        return f"✅ Email sent successfully to {len(recipients)} recipient(s): {', '.join(recipients)}"
    except Exception as e:
        return f"❌ Failed to send email: {str(e)}"


# ============================================================================
# AGENT ROUTING & RESPONSE
# ============================================================================

AGENT_DEFINITIONS = {
    "hr_agent": {
        "keywords": [
            "staff",
            "employee",
            "leave",
            "salary",
            "department",
            "joining",
            "hr",
            "human resource",
            "periods assigned",
            "leave request",
            "sick leave",
            "casual leave",
        ],
        "data": f"{STAFF_DATA}\n\nLEAVE REQUESTS:\n{LEAVE_DATA}",
        "emoji": "👥",
        "prompt_addition": """Focus on HR/staff data. Include leave balance. For "most periods" check periods_per_week.""",
    },
    "attendance_agent": {
        "keywords": [
            "attendance",
            "present",
            "absent",
            "late",
            "attendance percentage",
            "who came",
            "who didn't come",
            "attendance trend",
            "attendance comparison",
        ],
        "data": ATTENDANCE_DATA,
        "emoji": "📊",
        "prompt_addition": """Focus on attendance. Below 75% = at-risk. Include email (mail_id).""",
        "graph_config": {
            "supports_charts": True,
            "default_chart_type": "line",
            "value_field": "attendance_pct",
            "category_field": "class_name",
        },
    },
    "marks_agent": {
        "keywords": [
            "marks",
            "grade",
            "score",
            "exam",
            "performance",
            "topper",
            "failed",
            "failing",
            "lowest",
            "highest",
            "rank",
            "marks trend",
            "performance comparison",
            "low marks",
            "high marks",
            "poor performance",
            "good performance",
            "below average",
            "above average",
            "academic",
            "result",
            "results",
            "percentage",
        ],
        "data": MARKS_DATA,
        "emoji": "📚",
        "prompt_addition": """Focus on academics data. Grades: A+(90+), A(80-89), B(70-79), C(60-69), D(50-59), F(<50).
IMPORTANT:
- For "low marks" queries, look for percentage < 50 or grade = 'F' or grade = 'D'
- For "failed" or "failing" queries, look for grade = 'F' (percentage < 50)
- Include student_name, subject, and obtained marks in your response
- When generating chart data, use student names as labels and their marks/percentage as values""",
        "graph_config": {
            "supports_charts": True,
            "default_chart_type": "bar",
            "value_field": "percentage",
            "category_field": "class_name",
        },
    },
    "fees_agent": {
        "keywords": [
            "fee",
            "fees",
            "payment",
            "pending",
            "paid",
            "payed",
            "dues",
            "invoice",
            "balance",
            "overdue",
            "hasn't paid",
            "havent paid",
            "haven't paid",
            "not paid",
            "unpaid",
            "defaulter",
            "defaulters",
            "collection trend",
            "fee comparison",
            "fee status",
            "payment status",
            "tuition",
            "transport fee",
        ],
        "data": FEES_DATA,
        "emoji": "💰",
        "prompt_addition": """Focus on fees data. Status values: paid/pending/partial/overdue.
IMPORTANT:
- For "who hasn't paid" or "unpaid" queries, look for status='overdue' or status='pending' or balance > 0
- Include student_name and balance/status in your response
- Include mail_id for email reminders.""",
        "graph_config": {
            "supports_charts": True,
            "default_chart_type": "bar",
            "value_field": "amount",
            "category_field": "class_name",
        },
    },
    "timetable_agent": {
        "keywords": [
            "timetable",
            "schedule",
            "period",
            "room",
            "which teacher",
            "most classes",
        ],
        "data": TIMETABLE_DATA,
        "emoji": "📅",
        "prompt_addition": """Focus on schedules. Include room and timing info.""",
    },
    "budget_agent": {
        "keywords": [
            "budget",
            "expense",
            "spending",
            "allocated",
            "funds",
            "financial",
            "approval",
            "transaction",
            "cost",
            "budget trend",
            "expenditure comparison",
        ],
        "data": f"{BUDGET_DATA}\n\nTRANSACTIONS:\n{BUDGET_TRANSACTIONS}",
        "emoji": "📈",
        "prompt_addition": """Focus on budget. Utilization = (spent/allocated)*100. Alert if >80%.""",
        "graph_config": {
            "supports_charts": True,
            "default_chart_type": "bar",
            "value_field": "spent",
            "category_field": "title",
        },
    },
}


def detect_agents(query: str) -> list[tuple[str, dict]]:
    """
    Detect ALL agents that should handle the query.
    Returns a list of (agent_id, config) tuples for multi-domain queries.
    Uses word boundary matching to prevent false positives.
    """
    query_lower = query.lower()
    matched_agents = []
    matched_keywords = {}  # Track which keywords matched for each agent

    # Check each agent's keywords with word boundary matching
    for agent_id, config in AGENT_DEFINITIONS.items():
        for keyword in config["keywords"]:
            # Use word boundary regex for single/short keywords to prevent false positives
            # e.g., "hr" should not match "through"
            if len(keyword) <= 3:
                # Use word boundary for short keywords
                pattern = r"\b" + re.escape(keyword) + r"\b"
                if re.search(pattern, query_lower):
                    if agent_id not in matched_keywords:
                        matched_keywords[agent_id] = []
                        matched_agents.append((agent_id, config))
                    matched_keywords[agent_id].append(keyword)
                    break  # Only need one match per agent
            else:
                # For longer keywords, substring matching is fine
                if keyword in query_lower:
                    if agent_id not in matched_keywords:
                        matched_keywords[agent_id] = []
                        matched_agents.append((agent_id, config))
                    matched_keywords[agent_id].append(keyword)
                    break  # Only need one match per agent

    # Log matched agents for debugging
    if matched_agents:
        logger.info(
            f"Query matched agents: {[a[0] for a in matched_agents]} with keywords: {matched_keywords}"
        )

    return matched_agents


def detect_agent(query: str) -> tuple[str, dict]:
    """Detect which agent should handle the query (primary agent)."""
    matched = detect_agents(query)
    if matched:
        return matched[0]
    return "school_management_agent", None


def get_combined_agent_data(
    matched_agents: list[tuple[str, dict]], query: str
) -> tuple[str, str, str, dict]:
    """
    Combine data from multiple matched agents for multi-domain queries.

    Returns: (combined_data, agent_ids_str, combined_prompt_addition, primary_graph_config)
    """
    if not matched_agents:
        return "", "school_management_agent", "", {}

    if len(matched_agents) == 1:
        agent_id, config = matched_agents[0]
        return (
            config["data"],
            agent_id,
            config.get("prompt_addition", ""),
            config.get("graph_config", {}),
        )

    # Multiple agents matched - combine their data
    combined_data_parts = []
    combined_prompts = []
    primary_graph_config = {}
    agent_ids = []

    for agent_id, config in matched_agents:
        agent_ids.append(agent_id)
        # Add agent-specific header to data
        agent_name = agent_id.replace("_agent", "").upper()
        combined_data_parts.append(f"=== {agent_name} DATA ===\n{config['data']}")
        if config.get("prompt_addition"):
            combined_prompts.append(f"For {agent_name}: {config['prompt_addition']}")

        # Use first agent's graph config as primary
        if not primary_graph_config and config.get("graph_config"):
            primary_graph_config = config["graph_config"]

    combined_data = "\n\n".join(combined_data_parts)
    combined_prompt = "\n".join(combined_prompts)
    agent_ids_str = "+".join(agent_ids)

    logger.info(f"Combined data from agents: {agent_ids}")

    return combined_data, agent_ids_str, combined_prompt, primary_graph_config


async def get_agent_response(
    user_message: str,
    history: list,
    context_chips: list = None,
    session_id: str = None,
) -> dict:
    """Get response from the appropriate agent based on user query.

    Args:
        user_message: The user's query text
        history: Conversation history list
        context_chips: Optional context chips from dashboard Cmd/Ctrl+Click
        session_id: Session identifier for stateful workflows (email drafts, exam scheduling)
    """

    # Build query lower for keyword matching
    query_lower = user_message.lower()

    # --- CONTEXT CHIPS: Enrich message with dashboard context ---
    enriched_message = user_message
    if context_chips and CONTEXT_CHIPS_ENABLED:
        validated = validate_chips(context_chips)
        if validated:
            enriched_message = enrich_message_with_context(user_message, validated)
            logger.info(f"Message enriched with {len(validated)} context chips")

    # --- SESSION ID for workflow state ---
    if not session_id:
        session_id = f"session_{id(history)}"

    # --- EXAM SCHEDULING: Check for active workflow or new request ---
    if EXAM_SCHEDULER_ENABLED:
        # Check if there's an active exam workflow OR this is a new scheduling request
        if session_id in exam_workflows or is_exam_scheduling_request(user_message):
            exam_result = handle_exam_scheduling(user_message, history, session_id)
            if exam_result:
                return exam_result

        # Standalone hall ticket request (when no active workflow)
        if is_hall_ticket_request(user_message):
            # Look for a recently completed schedule in workflow storage
            # or tell user to schedule first
            return {
                "message": (
                    "### 🎫 Hall Ticket Generation\n\n"
                    "To generate hall tickets, please first create an exam schedule.\n\n"
                    'Say **"Schedule an exam"** to get started, and hall tickets will '
                    "be automatically generated when the schedule is approved."
                ),
                "agent_id": "exam_scheduler_agent",
            }

    # --- EMAIL WORKFLOW: Check for pending draft or new email request ---
    if EMAIL_WORKFLOW_ENABLED:
        email_result = handle_email_workflow(user_message, history, session_id)
        if email_result:
            return email_result
    else:
        # Fallback: If workflow not available, block direct sends with helpful message
        email_triggers = [
            "send email",
            "email them",
            "mail them",
            "send notification",
            "notify them",
            "send reminder",
        ]
        if any(t in query_lower for t in email_triggers):
            return {
                "message": (
                    "### 📧 Email Service Unavailable\n\n"
                    "The email workflow module is not loaded. "
                    "Please restart the server and ensure `email_workflow_manager.py` "
                    "is in the same directory as `agents.py`."
                ),
                "agent_id": "email_agent",
            }

    # From here on, use enriched_message (includes context chip data if any)
    effective_message = enriched_message

    # Detect all matching agents for multi-domain query support
    matched_agents = detect_agents(effective_message)

    # --- REPORT GENERATION: Check if user wants a downloadable report ---
    report_result = None
    if REPORT_ENABLED:
        try:
            report_decision = should_generate_report(user_message)
            if report_decision["needs_report"]:
                logger.info(
                    f"Report requested: type={report_decision['report_type']}, "
                    f"confidence={report_decision['confidence']}"
                )

                entity = report_decision["entity"]

                # If no student name found in the current message,
                # try to extract from conversation history
                if not entity.get("student_name") and not entity.get("student_id"):
                    from report_intelligence import extract_entity

                    for msg in reversed(history[-10:]):
                        content = msg.get("content", "")
                        hist_entity = extract_entity(content)
                        if hist_entity.get("student_name"):
                            entity["student_name"] = hist_entity["student_name"]
                            logger.info(
                                f"Extracted student name from history: {entity['student_name']}"
                            )
                            break
                    # Also try simple name matching from prior assistant responses
                    if not entity.get("student_name"):
                        import csv as csv_module
                        import io as io_module

                        reader = csv_module.DictReader(
                            io_module.StringIO(STUDENTS_DATA.strip())
                        )
                        all_student_names = [r.get("student_name", "") for r in reader]
                        for msg in reversed(history[-10:]):
                            content = msg.get("content", "")
                            for sname in all_student_names:
                                if sname and sname.lower() in content.lower():
                                    entity["student_name"] = sname
                                    logger.info(
                                        f"Matched student name from history: {sname}"
                                    )
                                    break
                            if entity.get("student_name"):
                                break

                # If still no entity after history search, ask the user
                if (
                    not entity.get("student_name")
                    and not entity.get("student_id")
                    and not entity.get("class_name")
                ):
                    return {
                        "message": (
                            "**Please specify a student**\n\n"
                            "To generate a report card, I need to know which student. "
                            "You can specify by:\n\n"
                            "• **Name:** _give me the report card of Aarav Sharma_\n"
                            "• **Student ID:** _report card for student id 1_\n"
                            "• **Class:** _class analytics for Grade 5-A_"
                        ),
                        "agent_id": matched_agents[0][0]
                        if matched_agents
                        else "report_agent",
                    }

                # Resolve data for the report from inline CSV data
                report_data = resolve_report_data(
                    report_type=report_decision["report_type"],
                    entity=entity,
                    students_data=STUDENTS_DATA,
                    marks_data=MARKS_DATA,
                    attendance_data=ATTENDANCE_DATA,
                    fees_data=FEES_DATA,
                )

                if report_data.get("found"):
                    # Generate the PDF report
                    pdf_result = generate_pdf_report(
                        report_type=report_decision["report_type"],
                        data=report_data,
                        output_format=report_decision.get("format", "pdf"),
                    )
                    if pdf_result.get("status") == "success":
                        report_result = {
                            "file_name": pdf_result["file_name"],
                            "file_path": str(pdf_result.get("file_path", "")),
                            "report_type": pdf_result["report_type"],
                            "message": pdf_result["message"],
                            "file_size": pdf_result.get("file_size", 0),
                        }
                        # Return immediately with report + confirmation message
                        entity_desc = report_decision["entity"].get(
                            "student_name",
                            report_decision["entity"].get("class_name", ""),
                        )
                        return {
                            "message": (
                                f"📄 **Report Generated Successfully**\n\n"
                                f"• **Type:** {report_decision['report_type'].replace('_', ' ').title()}\n"
                                f"• **For:** {entity_desc or 'Requested data'}\n"
                                f"• **File:** {pdf_result['file_name']}\n"
                                f"• **Size:** {pdf_result.get('file_size', 'N/A')}\n\n"
                                f"📥 Click the download button to save your report."
                            ),
                            "agent_id": matched_agents[0][0]
                            if matched_agents
                            else "report_agent",
                            "report": report_result,
                        }
                    else:
                        logger.warning(f"Report generation failed: {pdf_result}")
                else:
                    # Student not found — return a helpful error instead of
                    # falling through to Gemini (which also won't find them)
                    entity_desc = (
                        entity.get("student_name")
                        or entity.get("class_name")
                        or f"student_id={entity.get('student_id')}"
                    )
                    # Build a list of available student names for suggestion
                    import csv as csv_module
                    import io as io_module

                    reader = csv_module.DictReader(
                        io_module.StringIO(STUDENTS_DATA.strip())
                    )
                    all_names = [r.get("student_name", "") for r in reader]
                    # Find close matches if possible
                    suggestions = []
                    if entity.get("student_name"):
                        search_parts = entity["student_name"].lower().split()
                        for n in all_names:
                            if any(p in n.lower() for p in search_parts):
                                suggestions.append(n)
                    suggestion_text = ""
                    if suggestions:
                        suggestion_text = (
                            "\n\n**Did you mean one of these students?**\n"
                            + "\n".join(f"• {s}" for s in suggestions[:5])
                        )
                    else:
                        suggestion_text = (
                            "\n\n**Available students include:**\n"
                            + "\n".join(f"• {s}" for s in all_names[:8])
                        )
                    return {
                        "message": (
                            f"**Student Not Found**\n\n"
                            f"No student matching **{entity_desc}** was found "
                            f"in the school records."
                            f"{suggestion_text}"
                        ),
                        "agent_id": matched_agents[0][0]
                        if matched_agents
                        else "report_agent",
                    }
        except Exception as e:
            logger.exception(f"Report generation error: {e}")

    # Get primary agent for single-domain queries
    if matched_agents:
        agent_id, config = matched_agents[0]
    else:
        agent_id, config = "school_management_agent", None

    # Handle greeting - ONLY if no specific agent was detected
    if agent_id == "school_management_agent":
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
                "message": """👋 Hello! I'm your School Assistant.

I can help with: 📊 Attendance | 📚 Marks | 💰 Fees | 📅 Timetable | 👥 Staff | 📈 Budget

Try: "Who has lowest attendance?" or "Show fee defaulters" """,
                "agent_id": "school_management_agent",
            }

    # Build prompt with relevant data - support multi-agent queries
    if len(matched_agents) > 1:
        # Multi-domain query - combine data from all matched agents
        (
            relevant_data,
            agent_id,
            prompt_addition,
            graph_config,
        ) = get_combined_agent_data(matched_agents, effective_message)
        emoji = "🎓"  # Use general emoji for multi-domain queries
        logger.info(
            f"Multi-domain query detected, using combined data from: {agent_id}"
        )
    elif config:
        relevant_data = config["data"]
        emoji = config.get("emoji", "🎓")
        prompt_addition = config.get("prompt_addition", "")
        graph_config = config.get("graph_config", {})
        logger.info(f"Single-domain query detected, using {agent_id}")
    else:
        relevant_data = f"""
ATTENDANCE: {ATTENDANCE_DATA}

MARKS: {MARKS_DATA}

FEES: {FEES_DATA}

STAFF: {STAFF_DATA}
"""
        emoji = "🎓"
        prompt_addition = "Provide helpful insights from the available school data."
        graph_config = {}

    # Check if visualization is requested
    needs_graph = False
    chart_result = None

    # Check if graph is needed based on the query, regardless of agent config
    if GRAPH_ENABLED:
        if GRAPH_INTELLIGENCE_ENABLED:
            # Use smarter graph intelligence scoring
            from graph_intelligence import should_auto_graph

            auto_graph_result = should_auto_graph(effective_message)
            needs_graph = auto_graph_result["needs_graph"]
            if needs_graph:
                logger.info(
                    f"Graph Intelligence: score={auto_graph_result['score']:.2f}, "
                    f"type={auto_graph_result['chart_type']}, "
                    f"reason={auto_graph_result['reasoning']}"
                )
        else:
            needs_graph = should_generate_graph(effective_message)
        # If graph is needed but current agent doesn't support charts,
        # still allow graph generation by using fallback chart generation
        if needs_graph and not graph_config.get("supports_charts", False):
            logger.info(
                f"Graph requested but {agent_id} doesn't have chart config, will use fallback"
            )

    # If graph is needed, add instructions to extract chart data
    chart_instruction = ""
    if needs_graph:
        chart_instruction = """

CHART DATA (MANDATORY FOR THIS QUERY):
You MUST analyze the DATA provided above and generate chart data that DIRECTLY answers the user's question.
DO NOT use unrelated data. The chart MUST visualize the EXACT data requested in the QUERY.

Provide chart data as JSON at the END of your text response:
<CHART_DATA>
{"chart_type": "bar", "title": "Title That Matches The Query", "labels": ["Name1","Name2"], "values": [value1,value2]}
</CHART_DATA>

CRITICAL: The title, labels, and values MUST be extracted from the DATA above and MUST directly answer the QUERY.
Chart types: line, bar, pie, horizontal_bar. Max 10 data points."""

    system_prompt = f"""You are a school data assistant. Provide thorough, well-structured answers.

AVAILABLE DATA (USE ONLY THIS DATA - DO NOT INVENT OR HALLUCINATE):
{relevant_data}

{prompt_addition}

CRITICAL RULES:
1. ONLY use data from the AVAILABLE DATA section above
2. If the requested data is NOT in the AVAILABLE DATA, say "Data not available for this query"
3. DO NOT make up names, numbers, or any information not in the data
4. DO NOT mix data from different categories unless the user explicitly asks for cross-domain info

FORMATTING RULES (VERY IMPORTANT — responses must be easy to read):
1. Use proper markdown with REAL line breaks between sections
2. Use ### headings to separate major sections
3. Use **bold** ONLY for names, labels, and key values — NOT for entire sentences
4. Use bullet points (• or -) for lists, one item per line
5. Leave a blank line between paragraphs and between sections
6. Use tables (| col | col |) when presenting structured data with 3+ columns
7. Keep sentences in normal (non-bold) text — bold is for emphasis only
8. Be detailed and thorough — include all relevant data points
9. NO greetings (hi, hello, hey)
10. NO suggestions about what else you can help with
11. NO filler phrases ("here is", "based on the data", "I found", "let me")
12. NEVER write diagrams, flowcharts, mermaid, or ASCII art
13. NEVER use ```code blocks``` for visual representation

Example of GOOD formatting:
### Attendance Summary

**Aarav Sharma** — 92% attendance (Present: 46, Absent: 4)
**Priya Patel** — 88% attendance (Present: 44, Absent: 6)

### Students Below 85%

- **Rahul Kumar**: 78% — needs improvement
- **Neha Singh**: 72% — critical

Overall class average: 85.3%
{chart_instruction}

QUERY: {effective_message}"""

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(system_prompt)

        # Safely extract response text with proper error handling
        response_text = None
        try:
            response_text = response.text
        except ValueError as ve:
            # Handle case when response.text accessor fails (empty/blocked response)
            logger.error(f"Response text extraction failed: {ve}")
            # Check if response was blocked by safety filters
            if hasattr(response, "candidates") and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, "safety_ratings"):
                    logger.warning(f"Safety ratings: {candidate.safety_ratings}")
                if hasattr(candidate, "finish_reason"):
                    logger.warning(f"Finish reason: {candidate.finish_reason}")

            # Provide a fallback response based on the agent type
            if agent_id == "fees_agent":
                response_text = "• Fee data query processed\n• Please check specific student records"
            elif agent_id == "marks_agent":
                response_text = "• Marks data query processed\n• Please check student performance records"
            else:
                response_text = "• Query processed but response was limited\n• Please try a more specific question"

        if not response_text:
            response_text = (
                "• Unable to process this query\n• Please try rephrasing your question"
            )

        # Extract chart data if present and generate chart
        if needs_graph and GRAPH_ENABLED:
            chart_result = _extract_and_generate_chart(response_text, agent_id)
            # Remove chart data tags from response text
            response_text = re.sub(
                r"<CHART_DATA>.*?</CHART_DATA>", "", response_text, flags=re.DOTALL
            ).strip()

            # If LLM didn't provide chart data, use Graph Intelligence pipeline
            if not chart_result and GRAPH_INTELLIGENCE_ENABLED:
                logger.info(
                    "LLM chart extraction failed, using Graph Intelligence pipeline"
                )
                try:
                    gi_result = graph_decision_pipeline(
                        query=effective_message,
                        response_text=response_text,
                        agent_id=agent_id,
                        existing_chart=None,
                    )
                    if gi_result["should_graph"] and gi_result.get("chart_params"):
                        params = gi_result["chart_params"]
                        if params.get("labels") and params.get("values"):
                            payload = build_graph_payload(
                                agent_type=agent_id.replace("_agent", ""),
                                intent="comparison",
                                labels=params["labels"],
                                values=params["values"],
                                title=params.get("title", ""),
                                x_label=params.get("x_label", ""),
                                y_label=params.get("y_label", ""),
                                chart_type=gi_result.get("chart_type", "bar"),
                            )
                            result_chart, error = generate_chart_safe(payload)
                            if not error and result_chart:
                                chart_result = {
                                    "base64_image": result_chart.get("base64_image"),
                                    "chart_type": result_chart.get("chart_type"),
                                    "title": params.get("title", ""),
                                }
                                logger.info(
                                    "Graph Intelligence pipeline generated chart successfully"
                                )
                except Exception as gi_err:
                    logger.warning(f"Graph Intelligence pipeline error: {gi_err}")

        # Apply Response Governor for strict output control (if enabled)
        logger.info(
            f"GOVERNOR_ENABLED={GOVERNOR_ENABLED}, GRAPH_ENABLED={GRAPH_ENABLED}"
        )
        if GOVERNOR_ENABLED:
            # Analyze query to determine if graph is required
            analyzer = QueryAnalyzer()
            query_info = analyzer.analyze(effective_message)

            # If query requires graph but none generated, try fallback chart generation
            if query_info["requires_graph"] and not chart_result and GRAPH_ENABLED:
                logger.info(
                    f"Governor: Query requires graph, trying fallback for {agent_id}"
                )
                chart_result = _generate_fallback_chart(
                    response_text, effective_message, agent_id
                )

            # Apply governor enforcement
            governed_response = govern_response(
                raw_response=response_text,
                query=effective_message,
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
            if report_result:
                result["report"] = report_result

            # --- EXPORT: Auto-generate CSV for fees/finance queries ---
            if EXPORT_ENABLED and agent_id == "fees_agent":
                try:
                    export_keywords = [
                        "unpaid",
                        "defaulter",
                        "pending",
                        "overdue",
                        "export",
                        "download",
                        "csv",
                        "excel",
                        "list all",
                        "fee status",
                    ]
                    if any(kw in query_lower for kw in export_keywords):
                        export_result = export_unpaid_invoices(FEES_DATA)
                        if export_result.get("status") == "success":
                            result["export"] = {
                                "file_name": export_result["file_name"],
                                "file_path": str(export_result.get("file_path", "")),
                                "row_count": export_result.get("row_count", 0),
                                "format": "csv",
                            }
                            result["message"] += (
                                f"\n\n📥 **Export Ready**\n"
                                f"• File: {export_result['file_name']}\n"
                                f"• Rows: {export_result.get('row_count', 'N/A')}\n"
                                f"Click the download button to save the CSV."
                            )
                except Exception as exp_err:
                    logger.warning(f"Export generation error: {exp_err}")

            return result

        # Fallback: Apply response templates if enabled (legacy path)
        elif USE_RESPONSE_TEMPLATES and TEMPLATES_ENABLED:
            template_result = apply_template_to_message(
                message=response_text,
                query=effective_message,
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
            if report_result:
                result["report"] = report_result
        else:
            # Fallback to raw response
            result = {"message": f"{emoji} {response_text}", "agent_id": agent_id}

            if chart_result:
                result["chart"] = chart_result
            if report_result:
                result["report"] = report_result

        return result

    except Exception as e:
        logger.exception(f"Agent response error: {e}")
        return {
            "message": f"❌ I encountered an error: {str(e)}\n\nPlease ensure GOOGLE_API_KEY is set in the .env file.",
            "agent_id": "error",
        }


def _extract_and_generate_chart(response_text: str, agent_id: str) -> dict | None:
    """
    Extract chart data from LLM response and generate chart.

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

        # Return in format expected by frontend (base64_image key)
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


def _generate_fallback_chart(
    response_text: str, query: str, agent_id: str
) -> dict | None:
    """
    Generate a chart from response text when LLM didn't provide structured chart data.
    Extracts numbers and labels from bullet points to create a visualization.

    CRITICAL: Only extract data that is relevant to the agent type and query context.

    Args:
        response_text: The agent's text response
        query: Original user query
        agent_id: Agent identifier

    Returns:
        Chart result dict or None if generation fails
    """
    try:
        query_lower = query.lower()

        # Validate that we have data relevant to the query
        # Don't generate charts for unrelated data
        relevance_keywords = {
            "marks_agent": [
                "marks",
                "score",
                "grade",
                "percentage",
                "obtained",
                "performance",
                "low marks",
                "high marks",
                "failed",
                "pass",
            ],
            "attendance_agent": [
                "attendance",
                "present",
                "absent",
                "late",
                "attendance_pct",
            ],
            "fees_agent": ["fee", "paid", "pending", "overdue", "balance", "amount"],
            "hr_agent": ["staff", "employee", "salary", "leave", "periods"],
            "budget_agent": ["budget", "expense", "spent", "allocated"],
        }

        # Check if query matches the agent's domain
        agent_keywords = relevance_keywords.get(agent_id, [])
        if not any(kw in query_lower for kw in agent_keywords):
            logger.warning(
                f"Query doesn't match {agent_id} domain, skipping fallback chart"
            )
            return None

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
                        # Validate label relevance based on agent type
                        if label and len(label) < 30:
                            # Skip labels that look like unrelated HR/staff data
                            # when we're querying for student data
                            if agent_id in [
                                "marks_agent",
                                "attendance_agent",
                                "fees_agent",
                            ]:
                                staff_terms = [
                                    "staff",
                                    "employee",
                                    "salary",
                                    "leave",
                                    "periods per week",
                                    "active staff",
                                ]
                                if any(term in label.lower() for term in staff_terms):
                                    logger.debug(f"Skipping unrelated label: {label}")
                                    continue
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
        if "trend" in query_lower or "over time" in query_lower:
            chart_type = "line"
        elif "ranking" in query_lower or "top" in query_lower:
            chart_type = "horizontal_bar"
        elif "distribution" in query_lower or "breakdown" in query_lower:
            chart_type = "pie"

        # Generate title from query - make it more specific
        title_words = query.split()[:6]
        title = " ".join(word.title() for word in title_words)

        # Ensure title reflects the actual data domain
        domain_titles = {
            "marks_agent": "Student Marks Analysis",
            "attendance_agent": "Attendance Analysis",
            "fees_agent": "Fee Payment Analysis",
            "hr_agent": "Staff Analysis",
            "budget_agent": "Budget Analysis",
        }
        if agent_id in domain_titles and len(title) < 10:
            title = domain_titles[agent_id]

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
