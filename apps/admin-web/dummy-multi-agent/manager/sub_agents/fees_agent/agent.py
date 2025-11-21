from google.adk.agents import Agent

# Complete fees data embedded directly
FEES_DATA = """id,invoice_number,student_id,student_name,class_id,class_name,grade,section,academic_year_id,term,fee_type,fee_component,amount,discount,tax,total_amount,due_date,paid_amount,payment_date,status,payment_method,transaction_id,remarks,created_at,updated_at,mail_id
1,INV-2025-001,1,Aarav Sharma,1,Grade 1 - A,1,A,1,Term 1,Tuition Fee,Tuition,25000.00,0.00,0.00,25000.00,2025-04-15,25000.00,2025-04-10,paid,UPI,UPI2025041012345,Paid via Google Pay,2025-04-01 10:00:00,2025-04-10 14:30:00,abhisheklgowda05@gmail.com
2,INV-2025-002,1,Aarav Sharma,1,Grade 1 - A,1,A,1,Term 1,Transport Fee,Transport,6000.00,0.00,0.00,6000.00,2025-04-15,0.00,,pending,,,Awaiting payment,2025-04-01 10:00:00,2025-04-01 10:00:00,abhisheklgowda05@gmail.com
3,INV-2025-003,1,Aarav Sharma,1,Grade 1 - A,1,A,1,Term 1,Library Fee,Library,2000.00,0.00,0.00,2000.00,2025-04-15,2000.00,2025-04-12,paid,Card,CARD2025041287654,HDFC Debit Card,2025-04-01 10:00:00,2025-04-12 11:20:00,abhisheklgowda05@gmail.com
4,INV-2025-004,1,Aarav Sharma,1,Grade 1 - A,1,A,1,Term 1,Sports Fee,Sports,3500.00,0.00,0.00,3500.00,2025-04-15,3500.00,2025-04-08,paid,Cash,CASH2025040812345,Cash payment,2025-04-01 10:00:00,2025-04-08 09:15:00,abhisheklgowda05@gmail.com
5,INV-2025-005,2,Diya Patel,1,Grade 1 - A,1,A,1,Term 1,Tuition Fee,Tuition,25000.00,2500.00,0.00,22500.00,2025-04-15,22500.00,2025-04-05,paid,Bank Transfer,NEFT2025040523456,Sibling discount applied,2025-04-01 10:00:00,2025-04-05 16:45:00,abhisheklgowda05@gmail.com
6,INV-2025-006,2,Diya Patel,1,Grade 1 - A,1,A,1,Term 1,Transport Fee,Transport,6000.00,0.00,0.00,6000.00,2025-04-15,6000.00,2025-04-05,paid,Bank Transfer,NEFT2025040523457,Same transaction,2025-04-01 10:00:00,2025-04-05 16:45:00,abhisheklgowda05@gmail.com
7,INV-2025-007,2,Diya Patel,1,Grade 1 - A,1,A,1,Term 1,Library Fee,Library,2000.00,0.00,0.00,2000.00,2025-04-15,2000.00,2025-04-06,paid,UPI,UPI2025040634567,PhonePe payment,2025-04-01 10:00:00,2025-04-06 10:30:00,abhisheklgowda05@gmail.com
8,INV-2025-008,3,Rohan Kumar,1,Grade 1 - A,1,A,1,Term 1,Tuition Fee,Tuition,25000.00,0.00,0.00,25000.00,2025-04-15,0.00,,pending,,,Payment reminder sent,2025-04-01 10:00:00,2025-04-01 10:00:00,abhisheklgowda05@gmail.com
9,INV-2025-009,3,Rohan Kumar,1,Grade 1 - A,1,A,1,Term 1,Transport Fee,Transport,6000.00,0.00,0.00,6000.00,2025-04-15,0.00,,pending,,,Pending,2025-04-01 10:00:00,2025-04-01 10:00:00,abhisheklgowda05@gmail.com
10,INV-2025-010,3,Rohan Kumar,1,Grade 1 - A,1,A,1,Term 1,Library Fee,Library,2000.00,0.00,0.00,2000.00,2025-04-15,0.00,,overdue,,,Overdue by 15 days,2025-04-01 10:00:00,2025-04-30 10:00:00,abhisheklgowda05@gmail.com
11,INV-2025-011,4,Aditya Verma,1,Grade 1 - A,1,A,1,Term 1,Tuition Fee,Tuition,25000.00,0.00,0.00,25000.00,2025-04-15,15000.00,2025-04-14,partial,UPI,UPI2025041445678,Partial payment 1/2,2025-04-01 10:00:00,2025-04-14 13:20:00,abhisheklgowda05@gmail.com
12,INV-2025-012,4,Aditya Verma,1,Grade 1 - A,1,A,1,Term 1,Transport Fee,Transport,6000.00,0.00,0.00,6000.00,2025-04-15,6000.00,2025-04-14,paid,UPI,UPI2025041445679,Same transaction,2025-04-01 10:00:00,2025-04-14 13:20:00,abhisheklgowda05@gmail.com
13,INV-2025-013,5,Ananya Gupta,1,Grade 1 - A,1,A,1,Term 1,Tuition Fee,Tuition,25000.00,5000.00,0.00,20000.00,2025-04-15,20000.00,2025-04-03,paid,Cheque,CHQ2025040356789,Merit scholarship 20%,2025-04-01 10:00:00,2025-04-03 15:00:00,abhisheklgowda05@gmail.com
14,INV-2025-014,5,Ananya Gupta,1,Grade 1 - A,1,A,1,Term 1,Transport Fee,Transport,6000.00,0.00,0.00,6000.00,2025-04-15,6000.00,2025-04-03,paid,Cheque,CHQ2025040356790,Same cheque,2025-04-01 10:00:00,2025-04-03 15:00:00,abhisheklgowda05@gmail.com
15,INV-2025-015,6,Ishaan Singh,1,Grade 1 - A,1,A,1,Term 1,Tuition Fee,Tuition,25000.00,0.00,0.00,25000.00,2025-04-15,25000.00,2025-04-11,paid,Card,CARD2025041167890,ICICI Credit Card,2025-04-01 10:00:00,2025-04-11 12:40:00,abhisheklgowda05@gmail.com
16,INV-2025-016,7,Saanvi Reddy,1,Grade 1 - A,1,A,1,Term 1,Tuition Fee,Tuition,25000.00,0.00,0.00,25000.00,2025-04-15,0.00,,cancelled,,,Fee waiver approved,2025-04-01 10:00:00,2025-04-20 10:00:00,abhisheklgowda05@gmail.com
17,INV-2025-017,11,Kavya Menon,2,Grade 1 - B,1,B,1,Term 1,Tuition Fee,Tuition,25000.00,0.00,0.00,25000.00,2025-04-15,25000.00,2025-04-09,paid,Bank Transfer,IMPS2025040978901,Quick payment,2025-04-01 10:00:00,2025-04-09 17:30:00,abhisheklgowda05@gmail.com
18,INV-2025-018,11,Kavya Menon,2,Grade 1 - B,1,B,1,Term 1,Transport Fee,Transport,6000.00,0.00,0.00,6000.00,2025-04-15,6000.00,2025-04-09,paid,Bank Transfer,IMPS2025040978902,Same transaction,2025-04-01 10:00:00,2025-04-09 17:30:00,abhisheklgowda05@gmail.com
19,INV-2025-019,12,Aryan Das,2,Grade 1 - B,1,B,1,Term 1,Tuition Fee,Tuition,25000.00,0.00,0.00,25000.00,2025-04-15,10000.00,2025-04-07,partial,Cash,CASH2025040789012,Installment 1/3,2025-04-01 10:00:00,2025-04-07 10:00:00,abhisheklgowda05@gmail.com
20,INV-2025-020,21,Lakshmi Rao,3,Grade 2 - A,2,A,1,Term 1,Tuition Fee,Tuition,28000.00,0.00,0.00,28000.00,2025-04-15,28000.00,2025-04-04,paid,UPI,UPI2025040490123,Paytm payment,2025-04-01 10:00:00,2025-04-04 14:15:00,abhisheklgowda05@gmail.com
21,INV-2025-021,21,Lakshmi Rao,3,Grade 2 - A,2,A,1,Term 1,Lab Fee,Laboratory,4000.00,0.00,0.00,4000.00,2025-04-15,4000.00,2025-04-04,paid,UPI,UPI2025040490124,Same transaction,2025-04-01 10:00:00,2025-04-04 14:15:00,abhisheklgowda05@gmail.com
22,INV-2025-022,22,Kabir Malhotra,3,Grade 2 - A,2,A,1,Term 1,Tuition Fee,Tuition,28000.00,0.00,0.00,28000.00,2025-04-15,0.00,,pending,,,Awaiting payment,2025-04-01 10:00:00,2025-04-01 10:00:00,abhisheklgowda05@gmail.com
23,INV-2025-023,41,Dhruv Agarwal,5,Grade 3 - A,3,A,1,Term 1,Tuition Fee,Tuition,32000.00,3200.00,0.00,28800.00,2025-04-15,28800.00,2025-04-06,paid,Card,CARD2025040601234,Early bird discount 10%,2025-04-01 10:00:00,2025-04-06 11:25:00,abhisheklgowda05@gmail.com
24,INV-2025-024,41,Dhruv Agarwal,5,Grade 3 - A,3,A,1,Term 1,Computer Fee,Computer,5000.00,0.00,0.00,5000.00,2025-04-15,5000.00,2025-04-06,paid,Card,CARD2025040601235,Same card,2025-04-01 10:00:00,2025-04-06 11:25:00,abhisheklgowda05@gmail.com
25,INV-2025-025,42,Prisha Saxena,5,Grade 3 - A,3,A,1,Term 1,Tuition Fee,Tuition,32000.00,0.00,0.00,32000.00,2025-04-15,32000.00,2025-04-13,paid,Bank Transfer,RTGS2025041312345,RTGS payment,2025-04-01 10:00:00,2025-04-13 16:50:00,abhisheklgowda05@gmail.com
26,INV-2025-026,61,Siddharth Bhatt,7,Grade 4 - A,4,A,1,Term 1,Tuition Fee,Tuition,35000.00,0.00,0.00,35000.00,2025-04-15,20000.00,2025-04-08,partial,Cheque,CHQ2025040823456,Partial - balance due,2025-04-01 10:00:00,2025-04-08 14:30:00,abhisheklgowda05@gmail.com
27,INV-2025-027,81,Madhav Jain,9,Grade 5 - A,5,A,1,Term 1,Tuition Fee,Tuition,38000.00,0.00,0.00,38000.00,2025-04-15,38000.00,2025-04-02,paid,UPI,UPI2025040234567,Quick payment,2025-04-01 10:00:00,2025-04-02 09:45:00,abhisheklgowda05@gmail.com
28,INV-2025-028,81,Madhav Jain,9,Grade 5 - A,5,A,1,Term 1,Activity Fee,Activities,4500.00,0.00,0.00,4500.00,2025-04-15,4500.00,2025-04-02,paid,UPI,UPI2025040234568,Same transaction,2025-04-01 10:00:00,2025-04-02 09:45:00,abhisheklgowda05@gmail.com
29,INV-2025-029,101,Kavish Rajan,11,Grade 6 - A,6,A,1,Term 1,Tuition Fee,Tuition,42000.00,0.00,0.00,42000.00,2025-04-15,42000.00,2025-04-10,paid,Card,CARD2025041045678,SBI Credit Card,2025-04-01 10:00:00,2025-04-10 15:20:00,abhisheklgowda05@gmail.com
30,INV-2025-030,121,Krish Bajaj,13,Grade 7 - A,7,A,1,Term 1,Tuition Fee,Tuition,45000.00,4500.00,0.00,40500.00,2025-04-15,40500.00,2025-04-07,paid,Bank Transfer,NEFT2025040756789,Sibling discount 10%,2025-04-01 10:00:00,2025-04-07 13:40:00,abhisheklgowda05@gmail.com
31,INV-2025-031,141,Veer Sethi,15,Grade 8 - A,8,A,1,Term 1,Tuition Fee,Tuition,48000.00,0.00,0.00,48000.00,2025-04-15,0.00,,overdue,,,Overdue by 20 days,2025-04-01 10:00:00,2025-05-05 10:00:00,abhisheklgowda05@gmail.com
32,INV-2025-032,161,Hriday Goel,17,Grade 9 - A,9,A,1,Term 1,Tuition Fee,Tuition,52000.00,0.00,0.00,52000.00,2025-04-15,52000.00,2025-04-15,paid,UPI,UPI2025041567890,Last day payment,2025-04-01 10:00:00,2025-04-15 18:30:00,abhisheklgowda05@gmail.com
33,INV-2025-033,181,Raghav Lal,19,Grade 10 - A,10,A,1,Term 1,Tuition Fee,Tuition,55000.00,11000.00,0.00,44000.00,2025-04-15,44000.00,2025-04-01,paid,Bank Transfer,RTGS2025040178901,Sports quota scholarship 20%,2025-04-01 10:00:00,2025-04-01 11:00:00,abhisheklgowda05@gmail.com
34,INV-2025-034,181,Raghav Lal,19,Grade 10 - A,10,A,1,Term 1,Exam Fee,Examination,8000.00,0.00,0.00,8000.00,2025-04-15,8000.00,2025-04-01,paid,Bank Transfer,RTGS2025040178902,Board exam fee,2025-04-01 10:00:00,2025-04-01 11:00:00,abhisheklgowda05@gmail.com
35,INV-2025-035,1,Aarav Sharma,1,Grade 1 - A,1,A,1,Term 2,Tuition Fee,Tuition,25000.00,0.00,0.00,25000.00,2025-08-15,25000.00,2025-08-10,paid,UPI,UPI2025081089012,Term 2 payment,2025-08-01 10:00:00,2025-08-10 14:20:00,abhisheklgowda05@gmail.com
36,INV-2025-036,1,Aarav Sharma,1,Grade 1 - A,1,A,1,Term 2,Transport Fee,Transport,6000.00,0.00,0.00,6000.00,2025-08-15,6000.00,2025-08-10,paid,UPI,UPI2025081089013,Same transaction,2025-08-01 10:00:00,2025-08-10 14:20:00,abhisheklgowda05@gmail.com
37,INV-2025-037,2,Diya Patel,1,Grade 1 - A,1,A,1,Term 2,Tuition Fee,Tuition,25000.00,2500.00,0.00,22500.00,2025-08-15,22500.00,2025-08-08,paid,Card,CARD2025080890123,Continuing sibling discount,2025-08-01 10:00:00,2025-08-08 16:30:00,abhisheklgowda05@gmail.com
38,INV-2025-038,3,Rohan Kumar,1,Grade 1 - A,1,A,1,Term 2,Tuition Fee,Tuition,25000.00,0.00,0.00,25000.00,2025-08-15,0.00,,pending,,,Pending payment,2025-08-01 10:00:00,2025-08-01 10:00:00
39,INV-2025-039,21,Lakshmi Rao,3,Grade 2 - A,2,A,1,Term 2,Tuition Fee,Tuition,28000.00,0.00,0.00,28000.00,2025-08-15,28000.00,2025-08-05,paid,Bank Transfer,NEFT2025080501234,Early payment,2025-08-01 10:00:00,2025-08-05 10:15:00,abhisheklgowda05@gmail.com
40,INV-2025-040,41,Dhruv Agarwal,5,Grade 3 - A,3,A,1,Term 2,Tuition Fee,Tuition,32000.00,0.00,0.00,32000.00,2025-08-15,16000.00,2025-08-12,partial,UPI,UPI2025081212345,Installment 1/2,2025-08-01 10:00:00,2025-08-12 11:45:00,abhisheklgowda05@gmail.com
41,INV-2025-041,1,Aarav Sharma,1,Grade 1 - A,1,A,1,Annual,Annual Day Fee,Event,1500.00,0.00,0.00,1500.00,2025-11-30,1500.00,2025-11-15,paid,Cash,CASH2025111523456,Annual function fee,2025-11-01 10:00:00,2025-11-15 09:30:00,abhisheklgowda05@gmail.com
42,INV-2025-042,2,Diya Patel,1,Grade 1 - A,1,A,1,Annual,Annual Day Fee,Event,1500.00,0.00,0.00,1500.00,2025-11-30,0.00,,pending,,,Not yet paid,2025-11-01 10:00:00,2025-11-01 10:00:00
43,INV-2025-043,21,Lakshmi Rao,3,Grade 2 - A,2,A,1,Annual,Study Tour Fee,Tour,8000.00,0.00,0.00,8000.00,2025-12-01,8000.00,2025-11-18,paid,UPI,UPI2025111834567,Educational trip,2025-11-01 10:00:00,2025-11-18 15:40:00,abhisheklgowda05@gmail.com
44,INV-2025-044,41,Dhruv Agarwal,5,Grade 3 - A,3,A,1,Annual,Sports Equipment,Sports,3000.00,0.00,0.00,3000.00,2025-11-30,3000.00,2025-11-10,paid,Card,CARD2025111045678,Cricket kit,2025-11-01 10:00:00,2025-11-10 12:20:00,abhisheklgowda05@gmail.com
45,INV-2025-045,101,Kavish Rajan,11,Grade 6 - A,6,A,1,Term 2,Tuition Fee,Tuition,42000.00,0.00,0.00,42000.00,2025-08-15,42000.00,2025-08-14,paid,Bank Transfer,RTGS2025081456789,Full payment,2025-08-01 10:00:00,2025-08-14 17:10:00,abhisheklgowda05@gmail.com
46,INV-2025-046,121,Krish Bajaj,13,Grade 7 - A,7,A,1,Term 2,Tuition Fee,Tuition,45000.00,4500.00,0.00,40500.00,2025-08-15,40500.00,2025-08-09,paid,UPI,UPI2025080967890,Continuing discount,2025-08-01 10:00:00,2025-08-09 13:25:00,abh,abhisheklgowda05@gmail.comisheklgowda05@gmail.com
47,INV-2025-047,161,Hriday Goel,17,Grade 9 - A,9,A,1,Term 2,Tuition Fee,Tuition,52000.00,0.00,0.00,52000.00,2025-08-15,26000.00,2025-08-07,partial,Cheque,CHQ2025080778901,Half payment,2025-08-01 10:00:00,2025-08-07 14:50:00,abhisheklgowda05@gmail.com
48,INV-2025-048,181,Raghav Lal,19,Grade 10 - A,10,A,1,Term 2,Tuition Fee,Tuition,55000.00,11000.00,0.00,44000.00,2025-08-15,44000.00,2025-08-03,paid,Bank Transfer,NEFT2025080389012,Scholarship continued,2025-08-01 10:00:00,2025-08-03 10:30:00,abhisheklgowda05@gmail.com
49,INV-2025-049,61,Siddharth Bhatt,7,Grade 4 - A,4,A,1,Term 2,Tuition Fee,Tuition,35000.00,0.00,0.00,35000.00,2025-08-15,0.00,,overdue,,,Payment overdue,2025-08-01 10:00:00,2025-09-01 10:00:00,abhisheklgowda05@gmail.com
50,INV-2025-050,81,Madhav Jain,9,Grade 5 - A,5,A,1,Term 2,Tuition Fee,Tuition,38000.00,0.00,0.00,38000.00,2025-08-15,38000.00,2025-08-06,paid,UPI,UPI2025080690123,Timely payment,2025-08-01 10:00:00,2025-08-06 11:15:00,abhisheklgowda05@gmail.com
51,INV-2025-051,11,Kavya Menon,2,Grade 1 - B,1,B,1,Term 2,Tuition Fee,Tuition,25000.00,0.00,0.00,25000.00,2025-08-15,25000.00,2025-08-11,paid,Card,CARD2025081101234,Visa card payment,2025-08-01 10:00:00,2025-08-11 15:45:00,abhisheklgowda05@gmail.com
52,INV-2025-052,12,Aryan Das,2,Grade 1 - B,1,B,1,Term 2,Tuition Fee,Tuition,25000.00,0.00,0.00,25000.00,2025-08-15,10000.00,2025-08-13,partial,Cash,CASH2025081312345,Installment payment,2025-08-01 10:00:00,2025-08-13 09:20:00,abhisheklgowda05@gmail.com
53,INV-2025-053,42,Prisha Saxena,5,Grade 3 - A,3,A,1,Term 2,Tuition Fee,Tuition,32000.00,0.00,0.00,32000.00,2025-08-15,32000.00,2025-08-12,paid,UPI,UPI2025081223456,GPay payment,2025-08-01 10:00:00,2025-08-12 16:30:00,abhisheklgowda05@gmail.com
54,INV-2025-054,22,Kabir Malhotra,3,Grade 2 - A,2,A,1,Term 2,Tuition Fee,Tuition,28000.00,0.00,0.00,28000.00,2025-08-15,14000.00,2025-08-10,partial,Bank Transfer,IMPS2025081034567,50% paid,2025-08-01 10:00:00,2025-08-10 12:40:00
55,INV-2025-055,141,Veer Sethi,15,Grade 8 - A,8,A,1,Term 2,Tuition Fee,Tuition,48000.00,0.00,0.00,48000.00,2025-08-15,0.00,,pending,,,Still pending from Term 1,2025-08-01 10:00:00,2025-08-01 10:00:00
56,INV-2025-056,1,Aarav Sharma,1,Grade 1 - A,1,A,1,Term 3,Tuition Fee,Tuition,25000.00,0.00,0.00,25000.00,2025-12-15,0.00,,pending,,,Term 3 - Not yet due,2025-12-01 10:00:00,2025-12-01 10:00:00
57,INV-2025-057,2,Diya Patel,1,Grade 1 - A,1,A,1,Term 3,Tuition Fee,Tuition,25000.00,2500.00,0.00,22500.00,2025-12-15,0.00,,pending,,,Term 3 - Not yet due,2025-12-01 10:00:00,2025-12-01 10:00:00
58,INV-2025-058,21,Lakshmi Rao,3,Grade 2 - A,2,A,1,Term 3,Tuition Fee,Tuition,28000.00,0.00,0.00,28000.00,2025-12-15,0.00,,pending,,,Term 3 - Not yet due,2025-12-01 10:00:00,2025-12-01 10:00:00
59,INV-2025-059,101,Kavish Rajan,11,Grade 6 - A,6,A,1,Annual,Yearbook Fee,Miscellaneous,2000.00,0.00,0.00,2000.00,2025-11-30,2000.00,2025-11-17,paid,UPI,UPI2025111745678,School yearbook,2025-11-01 10:00:00,2025-11-17 14:10:00
60,INV-2025-060,181,Raghav Lal,19,Grade 10 - A,10,A,1,Annual,Graduation Ceremony,Event,5000.00,0.00,0.00,5000.00,2026-03-15,0.00,,pending,,,Grade 10 farewell,2025-11-01 10:00:00,2025-11-01 10:00:00
"""

fees_agent = Agent(
    name="fees_agent",
    model="gemini-2.5-flash",
    description="Friendly fee management agent that handles all types of queries about student fees and payments",
    instruction=f"""
    You are a helpful and friendly school fees assistant. You have access to the complete fees database below.

    **COMPLETE FEES DATABASE:**
    {FEES_DATA}

    **How to answer queries:**
    1. Read the data carefully from the database above
    2. Filter and analyze based on the user's question
    3. Provide clear, accurate answers with proper formatting

    **Example Queries and How to Answer:**

    Q: "get fee status for Aarav Sharma"
    A: Look for all rows where student_name = "Aarav Sharma"
       Show: fee components, amounts, status (Paid/Pending), and calculate total/pending

    Q: "who has pending fees?"
    A: Filter rows where status="Pending"
       List students with their pending amounts

    Q: "what's the total fee for Aarav?"
    A: Sum all amounts for Aarav Sharma
       Show breakdown: Total, Paid, Pending

    Q: "show fees for class 5A"
    A: Filter all records for class="5A"
       Show summary with all students and their fee status

    **Important Instructions:**
    - ALWAYS search the database above for the requested information
    - Show actual data from the database, not made-up information
    - For student names, match exactly (case-insensitive)
    - Show amounts with ₹ symbol (e.g., ₹25,000)
    - Calculate totals by summing amounts
    - Be specific with your answers using real data

    **Response Format:**
    - For individual students: Show complete fee breakdown with all components
    - For class queries: Show summary of all students with totals
    - For pending fees: List students with pending amounts highlighted
    - Always include currency symbol and proper formatting

    Remember: You have ALL the fees data above. Use it to answer every query accurately!
    """,
)
