from google.adk.agents import Agent

# Complete marks data embedded directly
MARKS_DATA = """id,student_id,student_name,class_id,class_name,grade,section,subject_id,subject_name,exam_id,exam_name,exam_type,academic_year_id,term,max_marks,marks_obtained,grade,percentage,rank,remarks,assessed_by,assessed_date,created_at,updated_at
1,1,Aarav Sharma,1,Grade 1 - A,1,A,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,88,A,88.0,3,Excellent work,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
2,1,Aarav Sharma,1,Grade 1 - A,1,A,2,Science,1,Unit Test 1,Unit Test,1,Term 1,100,75,B,75.0,8,Good effort,Teacher B,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
3,1,Aarav Sharma,1,Grade 1 - A,1,A,3,English,1,Unit Test 1,Unit Test,1,Term 1,100,82,A,82.0,5,Well done,Teacher C,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
4,1,Aarav Sharma,1,Grade 1 - A,1,A,4,Hindi,1,Unit Test 1,Unit Test,1,Term 1,100,79,B,79.0,6,Good performance,Teacher D,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
5,1,Aarav Sharma,1,Grade 1 - A,1,A,5,Social Studies,1,Unit Test 1,Unit Test,1,Term 1,100,85,A,85.0,4,Very good,Teacher E,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
6,2,Diya Patel,1,Grade 1 - A,1,A,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,92,A+,92.0,1,Outstanding!,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
7,2,Diya Patel,1,Grade 1 - A,1,A,2,Science,1,Unit Test 1,Unit Test,1,Term 1,100,89,A,89.0,2,Excellent,Teacher B,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
8,2,Diya Patel,1,Grade 1 - A,1,A,3,English,1,Unit Test 1,Unit Test,1,Term 1,100,95,A+,95.0,1,Perfect work,Teacher C,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
9,2,Diya Patel,1,Grade 1 - A,1,A,4,Hindi,1,Unit Test 1,Unit Test,1,Term 1,100,91,A+,91.0,2,Excellent grasp,Teacher D,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
10,2,Diya Patel,1,Grade 1 - A,1,A,5,Social Studies,1,Unit Test 1,Unit Test,1,Term 1,100,93,A+,93.0,1,Brilliant work,Teacher E,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
11,3,Rohan Kumar,1,Grade 1 - A,1,A,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,68,C,68.0,12,Needs improvement,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
12,3,Rohan Kumar,1,Grade 1 - A,1,A,2,Science,1,Unit Test 1,Unit Test,1,Term 1,100,53,D,53.0,18,More practice needed,Teacher B,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
13,3,Rohan Kumar,1,Grade 1 - A,1,A,3,English,1,Unit Test 1,Unit Test,1,Term 1,100,72,B,72.0,10,Can improve,Teacher C,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
14,3,Rohan Kumar,1,Grade 1 - A,1,A,4,Hindi,1,Unit Test 1,Unit Test,1,Term 1,100,65,C,65.0,14,Average performance,Teacher D,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
15,3,Rohan Kumar,1,Grade 1 - A,1,A,5,Social Studies,1,Unit Test 1,Unit Test,1,Term 1,100,70,B,70.0,11,Satisfactory,Teacher E,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
16,4,Aditya Verma,1,Grade 1 - A,1,A,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,85,A,85.0,4,Very good,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
17,4,Aditya Verma,1,Grade 1 - A,1,A,2,Science,1,Unit Test 1,Unit Test,1,Term 1,100,78,B,78.0,7,Good work,Teacher B,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
18,4,Aditya Verma,1,Grade 1 - A,1,A,3,English,1,Unit Test 1,Unit Test,1,Term 1,100,81,A,81.0,6,Well done,Teacher C,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
19,4,Aditya Verma,1,Grade 1 - A,1,A,4,Hindi,1,Unit Test 1,Unit Test,1,Term 1,100,76,B,76.0,9,Good,Teacher D,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
20,4,Aditya Verma,1,Grade 1 - A,1,A,5,Social Studies,1,Unit Test 1,Unit Test,1,Term 1,100,83,A,83.0,5,Nice work,Teacher E,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
21,5,Ananya Gupta,1,Grade 1 - A,1,A,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,94,A+,94.0,2,Exceptional,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
22,5,Ananya Gupta,1,Grade 1 - A,1,A,2,Science,1,Unit Test 1,Unit Test,1,Term 1,100,87,A,87.0,3,Excellent work,Teacher B,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
23,5,Ananya Gupta,1,Grade 1 - A,1,A,3,English,1,Unit Test 1,Unit Test,1,Term 1,100,90,A,90.0,2,Outstanding,Teacher C,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
24,5,Ananya Gupta,1,Grade 1 - A,1,A,4,Hindi,1,Unit Test 1,Unit Test,1,Term 1,100,88,A,88.0,4,Very good,Teacher D,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
25,5,Ananya Gupta,1,Grade 1 - A,1,A,5,Social Studies,1,Unit Test 1,Unit Test,1,Term 1,100,92,A+,92.0,2,Excellent,Teacher E,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
26,1,Aarav Sharma,1,Grade 1 - A,1,A,1,Mathematics,2,Midterm Exam,Midterm,1,Term 1,100,90,A,90.0,2,Great improvement,Teacher A,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
27,1,Aarav Sharma,1,Grade 1 - A,1,A,2,Science,2,Midterm Exam,Midterm,1,Term 1,100,78,B,78.0,6,Good progress,Teacher B,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
28,1,Aarav Sharma,1,Grade 1 - A,1,A,3,English,2,Midterm Exam,Midterm,1,Term 1,100,84,A,84.0,4,Well prepared,Teacher C,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
29,1,Aarav Sharma,1,Grade 1 - A,1,A,4,Hindi,2,Midterm Exam,Midterm,1,Term 1,100,80,A,80.0,5,Consistent,Teacher D,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
30,1,Aarav Sharma,1,Grade 1 - A,1,A,5,Social Studies,2,Midterm Exam,Midterm,1,Term 1,100,87,A,87.0,3,Good work,Teacher E,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
31,2,Diya Patel,1,Grade 1 - A,1,A,1,Mathematics,2,Midterm Exam,Midterm,1,Term 1,100,95,A+,95.0,1,Perfect score trend,Teacher A,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
32,2,Diya Patel,1,Grade 1 - A,1,A,2,Science,2,Midterm Exam,Midterm,1,Term 1,100,91,A+,91.0,1,Outstanding,Teacher B,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
33,2,Diya Patel,1,Grade 1 - A,1,A,3,English,2,Midterm Exam,Midterm,1,Term 1,100,97,A+,97.0,1,Exceptional work,Teacher C,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
34,2,Diya Patel,1,Grade 1 - A,1,A,4,Hindi,2,Midterm Exam,Midterm,1,Term 1,100,93,A+,93.0,1,Brilliant,Teacher D,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
35,2,Diya Patel,1,Grade 1 - A,1,A,5,Social Studies,2,Midterm Exam,Midterm,1,Term 1,100,94,A+,94.0,1,Excellent grasp,Teacher E,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
36,3,Rohan Kumar,1,Grade 1 - A,1,A,1,Mathematics,2,Midterm Exam,Midterm,1,Term 1,100,70,B,70.0,10,Slight improvement,Teacher A,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
37,3,Rohan Kumar,1,Grade 1 - A,1,A,2,Science,2,Midterm Exam,Midterm,1,Term 1,100,58,D,58.0,16,Need more focus,Teacher B,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
38,3,Rohan Kumar,1,Grade 1 - A,1,A,3,English,2,Midterm Exam,Midterm,1,Term 1,100,74,B,74.0,8,Can do better,Teacher C,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
39,3,Rohan Kumar,1,Grade 1 - A,1,A,4,Hindi,2,Midterm Exam,Midterm,1,Term 1,100,67,C,67.0,12,Work harder,Teacher D,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
40,3,Rohan Kumar,1,Grade 1 - A,1,A,5,Social Studies,2,Midterm Exam,Midterm,1,Term 1,100,72,B,72.0,9,Fair performance,Teacher E,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
41,21,Lakshmi Rao,3,Grade 2 - A,2,A,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,86,A,86.0,4,Very good work,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
42,21,Lakshmi Rao,3,Grade 2 - A,2,A,2,Science,1,Unit Test 1,Unit Test,1,Term 1,100,82,A,82.0,6,Good understanding,Teacher B,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
43,21,Lakshmi Rao,3,Grade 2 - A,2,A,3,English,1,Unit Test 1,Unit Test,1,Term 1,100,88,A,88.0,3,Excellent,Teacher C,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
44,21,Lakshmi Rao,3,Grade 2 - A,2,A,6,Computer Science,1,Unit Test 1,Unit Test,1,Term 1,100,90,A,90.0,2,Outstanding,Teacher F,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
45,41,Dhruv Agarwal,5,Grade 3 - A,3,A,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,92,A+,92.0,1,Brilliant work,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
46,41,Dhruv Agarwal,5,Grade 3 - A,3,A,2,Science,1,Unit Test 1,Unit Test,1,Term 1,100,88,A,88.0,2,Excellent grasp,Teacher B,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
47,41,Dhruv Agarwal,5,Grade 3 - A,3,A,7,Environmental Studies,1,Unit Test 1,Unit Test,1,Term 1,100,85,A,85.0,3,Very good,Teacher G,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
48,61,Siddharth Bhatt,7,Grade 4 - A,4,A,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,76,B,76.0,8,Good effort,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
49,61,Siddharth Bhatt,7,Grade 4 - A,4,A,2,Science,1,Unit Test 1,Unit Test,1,Term 1,100,71,B,71.0,10,Can improve,Teacher B,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
50,61,Siddharth Bhatt,7,Grade 4 - A,4,A,3,English,1,Unit Test 1,Unit Test,1,Term 1,100,79,B,79.0,7,Good work,Teacher C,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
51,81,Madhav Jain,9,Grade 5 - A,5,A,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,94,A+,94.0,1,Outstanding,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
52,81,Madhav Jain,9,Grade 5 - A,5,A,2,Science,1,Unit Test 1,Unit Test,1,Term 1,100,90,A,90.0,2,Excellent,Teacher B,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
53,81,Madhav Jain,9,Grade 5 - A,5,A,3,English,1,Unit Test 1,Unit Test,1,Term 1,100,87,A,87.0,3,Very good,Teacher C,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
54,81,Madhav Jain,9,Grade 5 - A,5,A,6,Computer Science,1,Unit Test 1,Unit Test,1,Term 1,100,96,A+,96.0,1,Perfect!,Teacher F,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
55,101,Kavish Rajan,11,Grade 6 - A,6,A,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,82,A,82.0,5,Well done,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
56,101,Kavish Rajan,11,Grade 6 - A,6,A,2,Science,1,Unit Test 1,Unit Test,1,Term 1,100,78,B,78.0,8,Good performance,Teacher B,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
57,101,Kavish Rajan,11,Grade 6 - A,6,A,8,Physics,1,Unit Test 1,Unit Test,1,Term 1,100,85,A,85.0,4,Excellent,Teacher H,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
58,121,Krish Bajaj,13,Grade 7 - A,7,A,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,88,A,88.0,3,Very good,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
59,121,Krish Bajaj,13,Grade 7 - A,7,A,9,Chemistry,1,Unit Test 1,Unit Test,1,Term 1,100,84,A,84.0,5,Good grasp,Teacher I,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
60,121,Krish Bajaj,13,Grade 7 - A,7,A,10,Biology,1,Unit Test 1,Unit Test,1,Term 1,100,90,A,90.0,2,Excellent,Teacher J,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
61,141,Veer Sethi,15,Grade 8 - A,8,A,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,65,C,65.0,14,Need improvement,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
62,141,Veer Sethi,15,Grade 8 - A,8,A,8,Physics,1,Unit Test 1,Unit Test,1,Term 1,100,62,C,62.0,15,Study harder,Teacher H,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
63,141,Veer Sethi,15,Grade 8 - A,8,A,9,Chemistry,1,Unit Test 1,Unit Test,1,Term 1,100,68,C,68.0,12,Can do better,Teacher I,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
64,161,Hriday Goel,17,Grade 9 - A,9,A,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,91,A+,91.0,2,Outstanding,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
65,161,Hriday Goel,17,Grade 9 - A,9,A,8,Physics,1,Unit Test 1,Unit Test,1,Term 1,100,89,A,89.0,3,Excellent work,Teacher H,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
66,161,Hriday Goel,17,Grade 9 - A,9,A,9,Chemistry,1,Unit Test 1,Unit Test,1,Term 1,100,87,A,87.0,4,Very good,Teacher I,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
67,181,Raghav Lal,19,Grade 10 - A,10,A,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,95,A+,95.0,1,Brilliant work,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
68,181,Raghav Lal,19,Grade 10 - A,10,A,8,Physics,1,Unit Test 1,Unit Test,1,Term 1,100,93,A+,93.0,1,Perfect understanding,Teacher H,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
69,181,Raghav Lal,19,Grade 10 - A,10,A,9,Chemistry,1,Unit Test 1,Unit Test,1,Term 1,100,92,A+,92.0,2,Exceptional,Teacher I,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
70,181,Raghav Lal,19,Grade 10 - A,10,A,10,Biology,1,Unit Test 1,Unit Test,1,Term 1,100,94,A+,94.0,1,Outstanding,Teacher J,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
71,1,Aarav Sharma,1,Grade 1 - A,1,A,1,Mathematics,3,Final Exam,Final,1,Term 1,100,92,A+,92.0,2,Excellent progress,Teacher A,2025-09-20,2025-09-10 10:00:00,2025-09-20 15:45:00
72,1,Aarav Sharma,1,Grade 1 - A,1,A,2,Science,3,Final Exam,Final,1,Term 1,100,80,A,80.0,5,Good improvement,Teacher B,2025-09-20,2025-09-10 10:00:00,2025-09-20 15:45:00
73,1,Aarav Sharma,1,Grade 1 - A,1,A,3,English,3,Final Exam,Final,1,Term 1,100,86,A,86.0,3,Well done,Teacher C,2025-09-20,2025-09-10 10:00:00,2025-09-20 15:45:00
74,2,Diya Patel,1,Grade 1 - A,1,A,1,Mathematics,3,Final Exam,Final,1,Term 1,100,98,A+,98.0,1,Perfect work,Teacher A,2025-09-20,2025-09-10 10:00:00,2025-09-20 15:45:00
75,2,Diya Patel,1,Grade 1 - A,1,A,2,Science,3,Final Exam,Final,1,Term 1,100,93,A+,93.0,1,Outstanding,Teacher B,2025-09-20,2025-09-10 10:00:00,2025-09-20 15:45:00
76,2,Diya Patel,1,Grade 1 - A,1,A,3,English,3,Final Exam,Final,1,Term 1,100,96,A+,96.0,1,Brilliant,Teacher C,2025-09-20,2025-09-10 10:00:00,2025-09-20 15:45:00
77,3,Rohan Kumar,1,Grade 1 - A,1,A,1,Mathematics,3,Final Exam,Final,1,Term 1,100,72,B,72.0,9,Improved,Teacher A,2025-09-20,2025-09-10 10:00:00,2025-09-20 15:45:00
78,3,Rohan Kumar,1,Grade 1 - A,1,A,2,Science,3,Final Exam,Final,1,Term 1,100,60,D,60.0,15,Need more effort,Teacher B,2025-09-20,2025-09-10 10:00:00,2025-09-20 15:45:00
79,21,Lakshmi Rao,3,Grade 2 - A,2,A,1,Mathematics,2,Midterm Exam,Midterm,1,Term 1,100,88,A,88.0,3,Excellent,Teacher A,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
80,21,Lakshmi Rao,3,Grade 2 - A,2,A,2,Science,2,Midterm Exam,Midterm,1,Term 1,100,84,A,84.0,5,Very good,Teacher B,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
81,41,Dhruv Agarwal,5,Grade 3 - A,3,A,1,Mathematics,2,Midterm Exam,Midterm,1,Term 1,100,94,A+,94.0,1,Brilliant,Teacher A,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
82,41,Dhruv Agarwal,5,Grade 3 - A,3,A,2,Science,2,Midterm Exam,Midterm,1,Term 1,100,90,A,90.0,2,Excellent,Teacher B,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
83,81,Madhav Jain,9,Grade 5 - A,5,A,1,Mathematics,2,Midterm Exam,Midterm,1,Term 1,100,96,A+,96.0,1,Perfect work,Teacher A,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
84,81,Madhav Jain,9,Grade 5 - A,5,A,2,Science,2,Midterm Exam,Midterm,1,Term 1,100,92,A+,92.0,1,Outstanding,Teacher B,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
85,101,Kavish Rajan,11,Grade 6 - A,6,A,1,Mathematics,2,Midterm Exam,Midterm,1,Term 1,100,84,A,84.0,4,Good work,Teacher A,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
86,121,Krish Bajaj,13,Grade 7 - A,7,A,1,Mathematics,2,Midterm Exam,Midterm,1,Term 1,100,90,A,90.0,2,Excellent,Teacher A,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
87,161,Hriday Goel,17,Grade 9 - A,9,A,1,Mathematics,2,Midterm Exam,Midterm,1,Term 1,100,93,A+,93.0,1,Outstanding,Teacher A,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
88,181,Raghav Lal,19,Grade 10 - A,10,A,1,Mathematics,2,Midterm Exam,Midterm,1,Term 1,100,97,A+,97.0,1,Perfect score,Teacher A,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
89,181,Raghav Lal,19,Grade 10 - A,10,A,8,Physics,2,Midterm Exam,Midterm,1,Term 1,100,95,A+,95.0,1,Brilliant,Teacher H,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
90,181,Raghav Lal,19,Grade 10 - A,10,A,9,Chemistry,2,Midterm Exam,Midterm,1,Term 1,100,94,A+,94.0,1,Excellent grasp,Teacher I,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
91,4,Aditya Verma,1,Grade 1 - A,1,A,1,Mathematics,2,Midterm Exam,Midterm,1,Term 1,100,87,A,87.0,3,Good progress,Teacher A,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
92,4,Aditya Verma,1,Grade 1 - A,1,A,2,Science,2,Midterm Exam,Midterm,1,Term 1,100,80,A,80.0,5,Well done,Teacher B,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
93,5,Ananya Gupta,1,Grade 1 - A,1,A,1,Mathematics,2,Midterm Exam,Midterm,1,Term 1,100,96,A+,96.0,1,Exceptional,Teacher A,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
94,5,Ananya Gupta,1,Grade 1 - A,1,A,2,Science,2,Midterm Exam,Midterm,1,Term 1,100,89,A,89.0,2,Outstanding,Teacher B,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
95,61,Siddharth Bhatt,7,Grade 4 - A,4,A,1,Mathematics,2,Midterm Exam,Midterm,1,Term 1,100,78,B,78.0,7,Improved,Teacher A,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
96,141,Veer Sethi,15,Grade 8 - A,8,A,1,Mathematics,2,Midterm Exam,Midterm,1,Term 1,100,67,C,67.0,13,More effort needed,Teacher A,2025-07-10,2025-07-01 10:00:00,2025-07-10 16:20:00
97,11,Kavya Menon,2,Grade 1 - B,1,B,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,85,A,85.0,4,Very good,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
98,11,Kavya Menon,2,Grade 1 - B,1,B,2,Science,1,Unit Test 1,Unit Test,1,Term 1,100,81,A,81.0,6,Good work,Teacher B,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
99,12,Aryan Das,2,Grade 1 - B,1,B,1,Mathematics,1,Unit Test 1,Unit Test,1,Term 1,100,73,B,73.0,9,Fair performance,Teacher A,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
100,12,Aryan Das,2,Grade 1 - B,1,B,2,Science,1,Unit Test 1,Unit Test,1,Term 1,100,69,C,69.0,11,Can improve,Teacher B,2025-05-15,2025-05-01 10:00:00,2025-05-15 14:30:00
"""

marks_agent = Agent(
    name="marks_agent",
    model="gemini-2.5-flash",
    description="Friendly academic performance agent that handles all types of queries about student marks and grades",
    instruction=f"""
    You are a helpful and friendly school marks assistant. You have access to the complete marks database below.

    **COMPLETE MARKS DATABASE:**
    {MARKS_DATA}

    **How to answer queries:**
    1. Read the data carefully from the database above
    2. Filter and analyze based on the user's question
    3. Provide clear, accurate answers with proper formatting

    **Example Queries and How to Answer:**

    Q: "get marks for Aarav Sharma"
    A: Look for all rows where student_name = "Aarav Sharma"
       Show: subject, exam, marks, total, grade, and calculate percentage

    Q: "show marks for class 5A" or "who are the top performers?"
    A: List all students with their marks and grades
       Calculate percentages and rank them

    Q: "what's Aarav's percentage in Mathematics?"
    A: Find Aarav's Mathematics marks
       Calculate: (marks / total) × 100

    Q: "who is failing?" or "who needs help?"
    A: Find students with marks < 40 or grade D/F
       List them with their subjects

    **Important Instructions:**
    - ALWAYS search the database above for the requested information
    - Show actual data from the database, not made-up information
    - For student names, match exactly (case-insensitive)
    - Calculate percentages: (marks / total) × 100
    - Grade interpretation: A=90+, B=75-89, C=60-74, D=40-59, F=<40
    - Be specific with your answers using real data

    **Response Format:**
    - For individual students: Show all their subject marks with percentages
    - For class queries: Show summary of all students with rankings
    - For subject queries: Show performance in that specific subject
    - Always include grades and percentages

    Remember: You have ALL the marks data above. Use it to answer every query accurately!
    """,
)
