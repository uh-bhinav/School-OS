from google.adk.agents import Agent

# Complete timetable data embedded directly
TIMETABLE_DATA = """id,class_id,class_name,grade,section,day,day_of_week,period_id,period_no,period_name,start_time,end_time,subject_id,subject_name,teacher_id,teacher_name,room_id,room_name,academic_year_id,is_break,break_type,notes,created_at,updated_at
1,1,Grade 1 - A,1,A,MON,Monday,1,1,Period 1,08:30,09:15,1,Mathematics,1,Anjali Verma,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
2,1,Grade 1 - A,1,A,MON,Monday,2,2,Period 2,09:15,10:00,3,English,3,Sunita Gupta,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
3,1,Grade 1 - A,1,A,MON,Monday,3,3,Period 3,10:00,10:45,2,Science,2,Rajesh Kumar,102,Science Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
4,1,Grade 1 - A,1,A,MON,Monday,4,4,Short Break,10:45,11:00,,,,,,,1,true,short,15 min break,2025-04-01 10:00:00,2025-04-01 10:00:00
5,1,Grade 1 - A,1,A,MON,Monday,5,5,Period 4,11:00,11:45,4,Hindi,4,Priya Sharma,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
6,1,Grade 1 - A,1,A,MON,Monday,6,6,Period 5,11:45,12:30,5,Social Studies,5,Vikram Rao,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
7,1,Grade 1 - A,1,A,MON,Monday,7,7,Lunch Break,12:30,13:15,,,,,,,1,true,lunch,45 min lunch,2025-04-01 10:00:00,2025-04-01 10:00:00
8,1,Grade 1 - A,1,A,MON,Monday,8,8,Period 6,13:15,14:00,11,Art,11,Kavita Menon,105,Art Room,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
9,1,Grade 1 - A,1,A,TUE,Tuesday,1,1,Period 1,08:30,09:15,2,Science,2,Rajesh Kumar,102,Science Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
10,1,Grade 1 - A,1,A,TUE,Tuesday,2,2,Period 2,09:15,10:00,1,Mathematics,1,Anjali Verma,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
11,1,Grade 1 - A,1,A,TUE,Tuesday,3,3,Period 3,10:00,10:45,3,English,3,Sunita Gupta,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
12,1,Grade 1 - A,1,A,TUE,Tuesday,4,4,Short Break,10:45,11:00,,,,,,,1,true,short,15 min break,2025-04-01 10:00:00,2025-04-01 10:00:00
13,1,Grade 1 - A,1,A,TUE,Tuesday,5,5,Period 4,11:00,11:45,4,Hindi,4,Priya Sharma,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
14,1,Grade 1 - A,1,A,TUE,Tuesday,6,6,Period 5,11:45,12:30,6,Computer Science,6,Meena Singh,104,Computer Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
15,1,Grade 1 - A,1,A,TUE,Tuesday,7,7,Lunch Break,12:30,13:15,,,,,,,1,true,lunch,45 min lunch,2025-04-01 10:00:00,2025-04-01 10:00:00
16,1,Grade 1 - A,1,A,TUE,Tuesday,8,8,Period 6,13:15,14:00,12,Physical Education,12,Amit Desai,Playground,Sports Ground,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
17,1,Grade 1 - A,1,A,WED,Wednesday,1,1,Period 1,08:30,09:15,1,Mathematics,1,Anjali Verma,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
18,1,Grade 1 - A,1,A,WED,Wednesday,2,2,Period 2,09:15,10:00,5,Social Studies,5,Vikram Rao,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
19,1,Grade 1 - A,1,A,WED,Wednesday,3,3,Period 3,10:00,10:45,3,English,3,Sunita Gupta,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
20,1,Grade 1 - A,1,A,WED,Wednesday,4,4,Short Break,10:45,11:00,,,,,,,1,true,short,15 min break,2025-04-01 10:00:00,2025-04-01 10:00:00
21,1,Grade 1 - A,1,A,WED,Wednesday,5,5,Period 4,11:00,11:45,2,Science,2,Rajesh Kumar,102,Science Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
22,1,Grade 1 - A,1,A,WED,Wednesday,6,6,Period 5,11:45,12:30,4,Hindi,4,Priya Sharma,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
23,1,Grade 1 - A,1,A,WED,Wednesday,7,7,Lunch Break,12:30,13:15,,,,,,,1,true,lunch,45 min lunch,2025-04-01 10:00:00,2025-04-01 10:00:00
24,1,Grade 1 - A,1,A,WED,Wednesday,8,8,Period 6,13:15,14:00,13,Music,13,Ravi Shankar,106,Music Room,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
25,1,Grade 1 - A,1,A,THU,Thursday,1,1,Period 1,08:30,09:15,3,English,3,Sunita Gupta,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
26,1,Grade 1 - A,1,A,THU,Thursday,2,2,Period 2,09:15,10:00,1,Mathematics,1,Anjali Verma,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
27,1,Grade 1 - A,1,A,THU,Thursday,3,3,Period 3,10:00,10:45,2,Science,2,Rajesh Kumar,102,Science Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
28,1,Grade 1 - A,1,A,THU,Thursday,4,4,Short Break,10:45,11:00,,,,,,,1,true,short,15 min break,2025-04-01 10:00:00,2025-04-01 10:00:00
29,1,Grade 1 - A,1,A,THU,Thursday,5,5,Period 4,11:00,11:45,6,Computer Science,6,Meena Singh,104,Computer Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
30,1,Grade 1 - A,1,A,THU,Thursday,6,6,Period 5,11:45,12:30,5,Social Studies,5,Vikram Rao,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
31,1,Grade 1 - A,1,A,THU,Thursday,7,7,Lunch Break,12:30,13:15,,,,,,,1,true,lunch,45 min lunch,2025-04-01 10:00:00,2025-04-01 10:00:00
32,1,Grade 1 - A,1,A,THU,Thursday,8,8,Period 6,13:15,14:00,11,Art,11,Kavita Menon,105,Art Room,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
33,1,Grade 1 - A,1,A,FRI,Friday,1,1,Period 1,08:30,09:15,2,Science,2,Rajesh Kumar,102,Science Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
34,1,Grade 1 - A,1,A,FRI,Friday,2,2,Period 2,09:15,10:00,1,Mathematics,1,Anjali Verma,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
35,1,Grade 1 - A,1,A,FRI,Friday,3,3,Period 3,10:00,10:45,4,Hindi,4,Priya Sharma,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
36,1,Grade 1 - A,1,A,FRI,Friday,4,4,Short Break,10:45,11:00,,,,,,,1,true,short,15 min break,2025-04-01 10:00:00,2025-04-01 10:00:00
37,1,Grade 1 - A,1,A,FRI,Friday,5,5,Period 4,11:00,11:45,3,English,3,Sunita Gupta,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
38,1,Grade 1 - A,1,A,FRI,Friday,6,6,Period 5,11:45,12:30,12,Physical Education,12,Amit Desai,Playground,Sports Ground,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
39,1,Grade 1 - A,1,A,FRI,Friday,7,7,Lunch Break,12:30,13:15,,,,,,,1,true,lunch,45 min lunch,2025-04-01 10:00:00,2025-04-01 10:00:00
40,1,Grade 1 - A,1,A,FRI,Friday,8,8,Period 6,13:15,14:00,7,Environmental Studies,7,Deepa Nair,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
41,1,Grade 1 - A,1,A,SAT,Saturday,1,1,Period 1,08:30,09:15,1,Mathematics,1,Anjali Verma,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
42,1,Grade 1 - A,1,A,SAT,Saturday,2,2,Period 2,09:15,10:00,6,Computer Science,6,Meena Singh,104,Computer Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
43,1,Grade 1 - A,1,A,SAT,Saturday,3,3,Period 3,10:00,10:45,13,Music,13,Ravi Shankar,106,Music Room,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
44,1,Grade 1 - A,1,A,SAT,Saturday,4,4,Short Break,10:45,11:00,,,,,,,1,true,short,15 min break,2025-04-01 10:00:00,2025-04-01 10:00:00
45,1,Grade 1 - A,1,A,SAT,Saturday,5,5,Period 4,11:00,11:45,14,Library,14,Shalini Joshi,Library,School Library,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
46,1,Grade 1 - A,1,A,SAT,Saturday,6,6,Period 5,11:45,12:30,15,Co-curricular,15,Multiple Teachers,Auditorium,Main Hall,1,false,,Club activities,2025-04-01 10:00:00,2025-04-01 10:00:00
47,3,Grade 2 - A,2,A,MON,Monday,1,1,Period 1,08:30,09:15,1,Mathematics,16,Neha Kapoor,201,Room 201,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
48,3,Grade 2 - A,2,A,MON,Monday,2,2,Period 2,09:15,10:00,2,Science,17,Karan Saxena,202,Science Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
49,3,Grade 2 - A,2,A,MON,Monday,3,3,Period 3,10:00,10:45,3,English,18,Pooja Reddy,201,Room 201,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
50,3,Grade 2 - A,2,A,MON,Monday,4,4,Short Break,10:45,11:00,,,,,,,1,true,short,15 min break,2025-04-01 10:00:00,2025-04-01 10:00:00
51,3,Grade 2 - A,2,A,MON,Monday,5,5,Period 4,11:00,11:45,4,Hindi,19,Rohit Malhotra,201,Room 201,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
52,3,Grade 2 - A,2,A,MON,Monday,6,6,Period 5,11:45,12:30,5,Social Studies,20,Anita Patel,201,Room 201,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
53,3,Grade 2 - A,2,A,MON,Monday,7,7,Lunch Break,12:30,13:15,,,,,,,1,true,lunch,45 min lunch,2025-04-01 10:00:00,2025-04-01 10:00:00
54,3,Grade 2 - A,2,A,MON,Monday,8,8,Period 6,13:15,14:00,6,Computer Science,21,Arun Yadav,204,Computer Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
55,5,Grade 3 - A,3,A,MON,Monday,1,1,Period 1,08:30,09:15,1,Mathematics,22,Divya Iyer,301,Room 301,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
56,5,Grade 3 - A,3,A,MON,Monday,2,2,Period 2,09:15,10:00,2,Science,23,Sandeep Pillai,302,Science Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
57,5,Grade 3 - A,3,A,MON,Monday,3,3,Period 3,10:00,10:45,3,English,24,Rekha Bhatt,301,Room 301,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
58,5,Grade 3 - A,3,A,MON,Monday,4,4,Short Break,10:45,11:00,,,,,,,1,true,short,15 min break,2025-04-01 10:00:00,2025-04-01 10:00:00
59,5,Grade 3 - A,3,A,MON,Monday,5,5,Period 4,11:00,11:45,7,Environmental Studies,25,Geeta Mishra,301,Room 301,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
60,5,Grade 3 - A,3,A,MON,Monday,6,6,Period 5,11:45,12:30,6,Computer Science,26,Vijay Kulkarni,304,Computer Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
61,5,Grade 3 - A,3,A,MON,Monday,7,7,Lunch Break,12:30,13:15,,,,,,,1,true,lunch,45 min lunch,2025-04-01 10:00:00,2025-04-01 10:00:00
62,5,Grade 3 - A,3,A,MON,Monday,8,8,Period 6,13:15,14:00,12,Physical Education,27,Suresh Rao,Playground,Sports Ground,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
63,9,Grade 5 - A,5,A,MON,Monday,1,1,Period 1,08:30,09:15,1,Mathematics,28,Lakshmi Agarwal,501,Room 501,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
64,9,Grade 5 - A,5,A,MON,Monday,2,2,Period 2,09:15,10:00,2,Science,29,Ramesh Choudhury,502,Science Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
65,9,Grade 5 - A,5,A,MON,Monday,3,3,Period 3,10:00,10:45,3,English,30,Seema Banerjee,501,Room 501,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
66,9,Grade 5 - A,5,A,MON,Monday,4,4,Short Break,10:45,11:00,,,,,,,1,true,short,15 min break,2025-04-01 10:00:00,2025-04-01 10:00:00
67,9,Grade 5 - A,5,A,MON,Monday,5,5,Period 4,11:00,11:45,5,Social Studies,31,Harish Sinha,501,Room 501,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
68,9,Grade 5 - A,5,A,MON,Monday,6,6,Period 5,11:45,12:30,6,Computer Science,32,Nisha Tiwari,504,Computer Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
69,9,Grade 5 - A,5,A,MON,Monday,7,7,Lunch Break,12:30,13:15,,,,,,,1,true,lunch,45 min lunch,2025-04-01 10:00:00,2025-04-01 10:00:00
70,9,Grade 5 - A,5,A,MON,Monday,8,8,Period 6,13:15,14:00,11,Art,33,Priyanka Goswami,505,Art Room,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
71,11,Grade 6 - A,6,A,MON,Monday,1,1,Period 1,08:30,09:15,1,Mathematics,34,Ashok Jain,601,Room 601,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
72,11,Grade 6 - A,6,A,MON,Monday,2,2,Period 2,09:15,10:00,8,Physics,35,Mohan Bhargava,602,Physics Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
73,11,Grade 6 - A,6,A,MON,Monday,3,3,Period 3,10:00,10:45,3,English,36,Shruti Das,601,Room 601,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
74,11,Grade 6 - A,6,A,MON,Monday,4,4,Short Break,10:45,11:00,,,,,,,1,true,short,15 min break,2025-04-01 10:00:00,2025-04-01 10:00:00
75,11,Grade 6 - A,6,A,MON,Monday,5,5,Period 4,11:00,11:45,4,Hindi,37,Madhav Ghosh,601,Room 601,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
76,11,Grade 6 - A,6,A,MON,Monday,6,6,Period 5,11:45,12:30,5,Social Studies,38,Usha Trivedi,601,Room 601,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
77,11,Grade 6 - A,6,A,MON,Monday,7,7,Lunch Break,12:30,13:15,,,,,,,1,true,lunch,45 min lunch,2025-04-01 10:00:00,2025-04-01 10:00:00
78,11,Grade 6 - A,6,A,MON,Monday,8,8,Period 6,13:15,14:00,6,Computer Science,39,Alok Chawla,604,Computer Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
79,13,Grade 7 - A,7,A,MON,Monday,1,1,Period 1,08:30,09:15,1,Mathematics,40,Indira Mehta,701,Room 701,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
80,13,Grade 7 - A,7,A,MON,Monday,2,2,Period 2,09:15,10:00,8,Physics,41,Prakash Joshi,702,Physics Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
81,13,Grade 7 - A,7,A,MON,Monday,3,3,Period 3,10:00,10:45,9,Chemistry,42,Rani Kulkarni,703,Chemistry Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
82,13,Grade 7 - A,7,A,MON,Monday,4,4,Short Break,10:45,11:00,,,,,,,1,true,short,15 min break,2025-04-01 10:00:00,2025-04-01 10:00:00
83,13,Grade 7 - A,7,A,MON,Monday,5,5,Period 4,11:00,11:45,3,English,43,Sanjay Pandey,701,Room 701,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
84,13,Grade 7 - A,7,A,MON,Monday,6,6,Period 5,11:45,12:30,10,Biology,44,Varun Kohli,704,Biology Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
85,13,Grade 7 - A,7,A,MON,Monday,7,7,Lunch Break,12:30,13:15,,,,,,,1,true,lunch,45 min lunch,2025-04-01 10:00:00,2025-04-01 10:00:00
86,13,Grade 7 - A,7,A,MON,Monday,8,8,Period 6,13:15,14:00,6,Computer Science,45,Tanuja Dubey,704,Computer Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
87,15,Grade 8 - A,8,A,MON,Monday,1,1,Period 1,08:30,09:15,1,Mathematics,46,Ganesh Varma,801,Room 801,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
88,15,Grade 8 - A,8,A,MON,Monday,2,2,Period 2,09:15,10:00,8,Physics,47,Hemant Rane,802,Physics Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
89,15,Grade 8 - A,8,A,MON,Monday,3,3,Period 3,10:00,10:45,9,Chemistry,48,Jyoti Sethi,803,Chemistry Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
90,15,Grade 8 - A,8,A,MON,Monday,4,4,Short Break,10:45,11:00,,,,,,,1,true,short,15 min break,2025-04-01 10:00:00,2025-04-01 10:00:00
91,15,Grade 8 - A,8,A,MON,Monday,5,5,Period 4,11:00,11:45,3,English,49,Kamal Khanna,801,Room 801,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
92,15,Grade 8 - A,8,A,MON,Monday,6,6,Period 5,11:45,12:30,10,Biology,50,Lata Jha,804,Biology Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
93,15,Grade 8 - A,8,A,MON,Monday,7,7,Lunch Break,12:30,13:15,,,,,,,1,true,lunch,45 min lunch,2025-04-01 10:00:00,2025-04-01 10:00:00
94,15,Grade 8 - A,8,A,MON,Monday,8,8,Period 6,13:15,14:00,5,Social Studies,51,Manoj Shah,801,Room 801,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
95,17,Grade 9 - A,9,A,MON,Monday,1,1,Period 1,08:30,09:15,1,Mathematics,52,Nandini Modi,901,Room 901,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
96,17,Grade 9 - A,9,A,MON,Monday,2,2,Period 2,09:15,10:00,8,Physics,53,Om Goel,902,Physics Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
97,17,Grade 9 - A,9,A,MON,Monday,3,3,Period 3,10:00,10:45,9,Chemistry,54,Pallavi Doshi,903,Chemistry Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
98,17,Grade 9 - A,9,A,MON,Monday,4,4,Short Break,10:45,11:00,,,,,,,1,true,short,15 min break,2025-04-01 10:00:00,2025-04-01 10:00:00
99,17,Grade 9 - A,9,A,MON,Monday,5,5,Period 4,11:00,11:45,3,English,55,Qamar Bhatia,901,Room 901,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
100,17,Grade 9 - A,9,A,MON,Monday,6,6,Period 5,11:45,12:30,10,Biology,56,Radha Bakshi,904,Biology Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
101,17,Grade 9 - A,9,A,MON,Monday,7,7,Lunch Break,12:30,13:15,,,,,,,1,true,lunch,45 min lunch,2025-04-01 10:00:00,2025-04-01 10:00:00
102,17,Grade 9 - A,9,A,MON,Monday,8,8,Period 6,13:15,14:00,6,Computer Science,57,Saurabh Oberoi,904,Computer Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
103,19,Grade 10 - A,10,A,MON,Monday,1,1,Period 1,08:30,09:15,1,Mathematics,58,Tara Lal,1001,Room 1001,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
104,19,Grade 10 - A,10,A,MON,Monday,2,2,Period 2,09:15,10:00,8,Physics,59,Umesh Bhardwaj,1002,Physics Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
105,19,Grade 10 - A,10,A,MON,Monday,3,3,Period 3,10:00,10:45,9,Chemistry,60,Vidya Chauhan,1003,Chemistry Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
106,19,Grade 10 - A,10,A,MON,Monday,4,4,Short Break,10:45,11:00,,,,,,,1,true,short,15 min break,2025-04-01 10:00:00,2025-04-01 10:00:00
107,19,Grade 10 - A,10,A,MON,Monday,5,5,Period 4,11:00,11:45,3,English,61,Waseem Saini,1001,Room 1001,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
108,19,Grade 10 - A,10,A,MON,Monday,6,6,Period 5,11:45,12:30,10,Biology,62,Yamini Rastogi,1004,Biology Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
109,19,Grade 10 - A,10,A,MON,Monday,7,7,Lunch Break,12:30,13:15,,,,,,,1,true,lunch,45 min lunch,2025-04-01 10:00:00,2025-04-01 10:00:00
110,19,Grade 10 - A,10,A,MON,Monday,8,8,Period 6,13:15,14:00,5,Social Studies,63,Zahir Ahmed,1001,Room 1001,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
111,1,Grade 1 - A,1,A,TUE,Tuesday,3,3,Period 3,10:00,10:45,3,English,3,Sunita Gupta,101,Room 101,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
112,3,Grade 2 - A,2,A,TUE,Tuesday,1,1,Period 1,08:30,09:15,3,English,18,Pooja Reddy,201,Room 201,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
113,5,Grade 3 - A,3,A,TUE,Tuesday,1,1,Period 1,08:30,09:15,2,Science,23,Sandeep Pillai,302,Science Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
114,9,Grade 5 - A,5,A,TUE,Tuesday,1,1,Period 1,08:30,09:15,3,English,30,Seema Banerjee,501,Room 501,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
115,11,Grade 6 - A,6,A,TUE,Tuesday,1,1,Period 1,08:30,09:15,8,Physics,35,Mohan Bhargava,602,Physics Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
116,13,Grade 7 - A,7,A,TUE,Tuesday,1,1,Period 1,08:30,09:15,9,Chemistry,42,Rani Kulkarni,703,Chemistry Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
117,15,Grade 8 - A,8,A,TUE,Tuesday,1,1,Period 1,08:30,09:15,8,Physics,47,Hemant Rane,802,Physics Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
118,17,Grade 9 - A,9,A,TUE,Tuesday,1,1,Period 1,08:30,09:15,9,Chemistry,54,Pallavi Doshi,903,Chemistry Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
119,19,Grade 10 - A,10,A,TUE,Tuesday,1,1,Period 1,08:30,09:15,8,Physics,59,Umesh Bhardwaj,1002,Physics Lab,1,false,,,2025-04-01 10:00:00,2025-04-01 10:00:00
120,1,Grade 1 - A,1,A,WED,Wednesday,1,1,Period 1,08:30,09:15,1,Mathematics,1,Anjali Verma,101,Room 101,1,false,,Extra practice,2025-04-01 10:00:00,2025-04-01 10:00:00
"""

timetable_agent = Agent(
    name="timetable_agent",
    model="gemini-2.5-flash",
    description="Friendly timetable management agent that handles all types of queries about school schedules",
    instruction=f"""
    You are a helpful and friendly school timetable assistant. You have access to the complete timetable database below.

    **COMPLETE TIMETABLE DATABASE:**
    {TIMETABLE_DATA}

    **How to answer queries:**
    1. Read the data carefully from the database above
    2. Filter and analyze based on the user's question
    3. Provide clear, accurate answers with proper formatting

    **Example Queries and How to Answer:**

    Q: "get timetable for class 5A"
    A: Look for all rows where class = "5A"
       Show: organized by day and period with subject and teacher

    Q: "what's on Monday for class 5A?"
    A: Filter rows where class="5A" and day="Monday"
       Show: period-wise schedule with subjects and teachers

    Q: "when does class 5A have Mathematics?"
    A: Find rows where class="5A" and subject="Mathematics"
       Show: day, period, and teacher name

    Q: "who teaches Science to class 5A?"
    A: Find rows where class="5A" and subject="Science"
       Show: teacher name, day, and period

    **Important Instructions:**
    - ALWAYS search the database above for the requested information
    - Show actual data from the database, not made-up information
    - Match class names exactly (case-insensitive)
    - Format timetables in clear period-wise tables
    - Include teacher names for all subjects
    - Be specific with your answers using real data

    **Response Format:**
    - For class timetables: Show complete schedule organized by day/period
    - For subject queries: Show when and where the subject is taught
    - For teacher queries: Show what they teach and when
    - Use clear tables with columns: Period | Subject | Teacher

    Remember: You have ALL the timetable data above. Use it to answer every query accurately!
    """,
)
