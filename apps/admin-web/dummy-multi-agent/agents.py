"""
School Management Multi-Agent System
=====================================
A robust demo orchestration using Google Gemini with comprehensive school data.
Supports: Attendance, Marks, Fees, Timetable, HR, and Budgeting queries.
"""

import os
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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
        "prompt_addition": """
Focus on HR and staff management.
Include leave status and balance information.
For teacher periods, use the periods_per_week column.
When asked about "most periods" or "most classes assigned", check the periods_per_week field.""",
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
        ],
        "data": ATTENDANCE_DATA,
        "emoji": "📊",
        "prompt_addition": """
Focus on attendance patterns. Calculate attendance percentages when asked.
Students with attendance below 75% are at risk.
When asked "who has least attendance", find the student with lowest attendance_pct.
Include the mail_id column value as email for each student.""",
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
            "lowest",
            "highest",
            "rank",
        ],
        "data": MARKS_DATA,
        "emoji": "📚",
        "prompt_addition": """
Focus on academic performance. A+ (90+), A (80-89), B (70-79), C (60-69), D (50-59), F (<50).
When asked "who scored least/lowest", find the student with minimum marks/percentage.
When asked "topper", find student with highest marks.""",
    },
    "fees_agent": {
        "keywords": [
            "fee",
            "payment",
            "pending",
            "paid",
            "dues",
            "invoice",
            "balance",
            "overdue",
            "hasn't paid",
            "unpaid",
        ],
        "data": FEES_DATA,
        "emoji": "💰",
        "prompt_addition": """
Focus on fee collection status.
Status meanings: paid (fully paid), pending (due soon), partial (partially paid), overdue (past due date).
When asked "who hasn't paid", list students with status='pending' or 'overdue' or 'partial'.
Include the mail_id for sending reminders.""",
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
        "prompt_addition": """
Focus on class schedules and teacher assignments.
When asked "which teacher has most classes", count periods_per_week or timetable entries per teacher.
Provide room and timing information.""",
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
        ],
        "data": f"{BUDGET_DATA}\n\nTRANSACTIONS:\n{BUDGET_TRANSACTIONS}",
        "emoji": "📈",
        "prompt_addition": """
Focus on budget management and expense tracking.
Calculate utilization percentage: (spent/allocated) * 100.
Pending transactions require approval.
Alert on budgets with utilization > 80%.""",
    },
}


def detect_agent(query: str) -> tuple[str, dict]:
    """Detect which agent should handle the query."""
    query_lower = query.lower()

    # Check each agent's keywords
    for agent_id, config in AGENT_DEFINITIONS.items():
        for keyword in config["keywords"]:
            if keyword in query_lower:
                return agent_id, config

    # Default to a general response
    return "school_management_agent", None


async def get_agent_response(user_message: str, history: list) -> dict:
    """Get response from the appropriate agent based on user query."""

    # Build conversation context
    context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history[-6:]])
    query_lower = user_message.lower()

    # Check for email request
    if any(
        word in query_lower for word in ["email", "send", "mail", "notify", "reminder"]
    ):
        # Extract emails from conversation
        emails = []
        for msg in history:
            content = msg.get("content", "")
            found_emails = re.findall(r"[\w\.-]+@[\w\.-]+\.\w+", content)
            emails.extend(found_emails)

        if emails:
            unique_emails = list(set(emails))
            # Determine context
            email_context = "school update"
            combined_context = context.lower()
            if "attendance" in combined_context:
                email_context = "attendance alert"
            elif "fee" in combined_context or "payment" in combined_context:
                email_context = "fee payment reminder"
            elif "marks" in combined_context or "grade" in combined_context:
                email_context = "academic performance update"
            elif "leave" in combined_context:
                email_context = "leave request update"

            subject = f"School Notification - {email_context.title()}"
            body = f"""Dear Parent/Guardian,

This is an automated notification regarding {email_context}.

Based on our recent conversation, we wanted to keep you informed about your ward's status.

Please contact the school administration for more details or any clarifications.

Best regards,
School Administration
SchoolOS - Smart School Management"""

            result = send_email(",".join(unique_emails), subject, body)
            return {
                "message": f"📧 **Email Notification Sent**\n\n{result}\n\n**Recipients:** {', '.join(unique_emails)}\n**Subject:** {subject}",
                "agent_id": "email_agent",
            }
        else:
            return {
                "message": "📧 I couldn't find any email addresses in our conversation. Please first query for student/staff data so I can get the relevant email addresses, then ask me to send the notification.",
                "agent_id": "email_agent",
            }

    # Detect agent
    agent_id, config = detect_agent(user_message)

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
                "message": """👋 **Hello! I'm your School Management Assistant.**

I can help you with:

📊 **Attendance** - Check student attendance, late comers, absentees
📚 **Marks** - View grades, find toppers, identify struggling students
💰 **Fees** - Payment status, pending dues, overdue invoices
📅 **Timetable** - Class schedules, teacher assignments, room info
👥 **HR & Staff** - Employee details, leave requests, salary info
📈 **Budgeting** - Expense tracking, approvals, budget utilization

**Try asking:**
- "Who hasn't paid fees this year?"
- "Who has the least attendance in Grade 5?"
- "Which teacher has the most classes assigned?"
- "Show me pending budget approvals"

What would you like to know?""",
                "agent_id": "school_management_agent",
            }

    # Build prompt with relevant data
    if config:
        relevant_data = config["data"]
        emoji = config["emoji"]
        prompt_addition = config["prompt_addition"]
    else:
        relevant_data = f"""
ATTENDANCE: {ATTENDANCE_DATA}

MARKS: {MARKS_DATA}

FEES: {FEES_DATA}

STAFF: {STAFF_DATA}
"""
        emoji = "🎓"
        prompt_addition = "Provide helpful insights from the available school data."

    system_prompt = f"""You are a friendly and helpful school management assistant.
Your job is to analyze school data and provide accurate, actionable insights.

CURRENT DATA:
{relevant_data}

INSTRUCTIONS:
{prompt_addition}

FORMATTING RULES:
1. Use emojis to make responses friendly and readable
2. Format lists with bullet points
3. Include specific names, values, and email addresses in your response
4. When showing student/staff info, include their email for follow-up actions
5. Be concise but thorough
6. If asked to compare or find min/max, analyze the data carefully

RECENT CONVERSATION:
{context}

USER QUERY: {user_message}

Provide an accurate, helpful response based on the data above."""

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(system_prompt)

        return {"message": f"{emoji} {response.text}", "agent_id": agent_id}
    except Exception as e:
        return {
            "message": f"❌ I encountered an error: {str(e)}\n\nPlease ensure GOOGLE_API_KEY is set in the .env file.",
            "agent_id": "error",
        }
