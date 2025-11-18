# SchoolOS - Complete Feature List

**Version**: 1.0
**Last Updated**: November 17, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Academic Management](#academic-management)
3. [Student Information System](#student-information-system)
4. [Teacher Management](#teacher-management)
5. [Attendance & Scheduling](#attendance--scheduling)
6. [Assessment & Grading](#assessment--grading)
7. [Communication System](#communication-system)
8. [Financial Management](#financial-management)
9. [E-Commerce Platform](#e-commerce-platform)
10. [Media & Albums](#media--albums)
11. [Clubs & Activities](#clubs--activities)
12. [Achievement & Gamification](#achievement--gamification)
13. [Security & Compliance](#security--compliance)

---

## Overview

SchoolOS is a comprehensive, multi-tenant school management platform designed to streamline operations for modern educational institutions. Built with scalability, security, and user experience at its core, SchoolOS provides a unified solution for managing academic, administrative, and financial operations.

### Key Highlights
- **Multi-Tenant Architecture**: Secure data isolation for multiple schools
- **Role-Based Access Control**: Granular permissions for Admin, Teacher, Student, and Parent roles
- **Real-Time Operations**: Async architecture for high-performance operations
- **Payment Gateway Integration**: Razorpay integration with webhook support
- **AI-Powered Features**: Automated timetable generation with constraint satisfaction
- **Mobile-First Design**: Optimized for mobile devices with offline capabilities

---

## Academic Management

### 1. Academic Year Service
**Purpose**: Manage academic year lifecycle and transitions

#### Features:
- **Academic Year Creation**: Define school years with start/end dates
- **Active Year Management**: Set single active academic year per school
- **Multi-Year Support**: Maintain historical data across academic years
- **Year Transitions**: Bulk student promotion between academic years
- **Year Filtering**: Scope all academic operations to specific years

#### Use Cases:
- **Start of Year**: Administrators create new academic year and set it active
- **Mid-Year Reports**: Teachers can access historical data from previous years
- **Year-End Promotion**: Bulk promote students from Grade 10 to Grade 11
- **Historical Analysis**: Generate reports comparing performance across years

---

### 2. Class Management Service
**Purpose**: Organize students into classes with teacher assignments

#### Features:
- **Class Creation**: Create classes with grade level and section
- **Class Teacher Assignment**: Assign primary teacher responsible for class
- **Subject Mapping**: Link subjects to classes for timetable generation
- **Multi-Tenancy**: Classes scoped to schools and academic years
- **Soft Delete**: Deactivate classes without losing historical data
- **Advanced Search**: Find classes by grade, section, teacher, or academic year

#### Use Cases:
- **New Semester Setup**: Create Grade 9 Section A, assign Math and Science subjects
- **Teacher Assignment**: Assign Ms. Johnson as class teacher for Grade 10A
- **Timetable Preparation**: Link subjects to class before generating schedule
- **Historical Records**: View inactive classes from previous academic years

---

### 3. Subject Management Service
**Purpose**: Manage subjects/courses offered by the school

#### Features:
- **Subject Creation**: Define subjects with name, code, and category
- **Stream Support**: Associate subjects with academic streams (Science, Commerce, Arts)
- **Teacher Specialization**: Link subjects to qualified teachers
- **Class Assignment**: Map subjects to specific classes
- **Subject Types**: Core, elective, lab, physical education categories
- **Curriculum Tracking**: Track subject syllabi and learning outcomes

#### Use Cases:
- **New Subject Addition**: Add "Computer Science" as elective for Science stream
- **Teacher Assignment**: Find all teachers qualified to teach Physics
- **Class Planning**: Get all subjects taught in Grade 11 Commerce
- **Specialization Tracking**: Track which teachers specialize in Mathematics

---

### 4. Academic Year Assignment Service
**Purpose**: Link students to specific fee structures per academic year

#### Features:
- **Student-Year Linking**: Assign students to academic years
- **Fee Structure Association**: Connect students to applicable fee templates
- **Promotion Tracking**: Maintain history of student progressions
- **Enrollment Management**: Track active enrollments per year
- **Bulk Operations**: Assign multiple students to academic years simultaneously

#### Use Cases:
- **New Admissions**: Enroll new students in current academic year
- **Year Transitions**: Promote entire Grade 10 cohort to Grade 11
- **Fee Assignment**: Link all Grade 9 students to standard fee structure
- **Dropout Handling**: Deactivate student's academic year assignment

---

## Student Information System

### 5. Student Management Service
**Purpose**: Comprehensive student profile and lifecycle management

#### Features:
- **Student Registration**: Create profiles with personal and academic details
- **Profile Management**: Update contact info, address, emergency contacts
- **Class Enrollment**: Assign students to classes with roll numbers
- **Proctor Assignment**: Assign mentor teachers to students
- **Multi-School Support**: Handle transfers between schools
- **Academic Summary**: View consolidated attendance, marks, and performance
- **Search & Filter**: Find students by name, class, roll number, or parent
- **Bulk Promotion**: Move entire class cohort to next grade level
- **Soft Delete**: Deactivate students without losing historical records

#### Use Cases:
- **New Admission**: Register John Doe, assign to Grade 9A with roll number 23
- **Contact Update**: Parent updates phone number and emergency contact
- **Teacher Assignment**: Assign Ms. Smith as proctor for student mentorship
- **Year-End Promotion**: Promote all Grade 10 students to Grade 11
- **Search**: Find all students in Grade 9 with name containing "Sarah"
- **Academic Overview**: View student's attendance percentage and average marks
- **Transfer**: Deactivate student record when moving to another school

---

### 6. Student Contact Service
**Purpose**: Manage parent/guardian relationships and communication

#### Features:
- **Parent Linking**: Associate students with parent/guardian profiles
- **Relationship Types**: Father, Mother, Guardian, Emergency Contact
- **Contact Verification**: Validate parent-student relationships
- **Multi-Guardian Support**: Allow multiple contacts per student
- **Contact Authorization**: Control which contacts can perform actions (payments, approvals)
- **Communication Preferences**: Set preferred contact methods per parent

#### Use Cases:
- **Parent Registration**: Link parent profile to newly admitted student
- **Emergency Contact**: Add grandmother as emergency contact
- **Separated Parents**: Link student to both mother and father profiles
- **Authorization**: Mark father as authorized to approve field trips
- **Fee Payments**: Verify parent is authorized to pay student fees
- **Communication**: Send notifications to all authorized contacts

---

## Teacher Management

### 7. Teacher Management Service
**Purpose**: Manage teacher profiles, qualifications, and assignments

#### Features:
- **Teacher Profiles**: Comprehensive profiles with qualifications and experience
- **Subject Specialization**: Track teacher expertise in specific subjects
- **Class Teacher Assignment**: Assign teachers as primary class supervisors
- **Proctor Assignments**: View students mentored by a teacher
- **Employment Details**: Track hiring date, employment status, department
- **Qualification Tracking**: Store degrees, certifications, and credentials
- **Timetable Access**: View weekly teaching schedule for a teacher
- **Workload Tracking**: Monitor teaching hours and class assignments
- **Soft Delete**: Deactivate teachers without losing historical data

#### Use Cases:
- **New Hire**: Register Ms. Johnson with M.Sc. Physics, 5 years experience
- **Class Assignment**: Assign Mr. Davis as class teacher for Grade 10B
- **Timetable View**: Display weekly schedule for a teacher across all classes
- **Proctor Dashboard**: Show list of students mentored by a teacher
- **Qualification Verification**: View teacher's degrees and certifications
- **Workload Analysis**: Check if teacher exceeds maximum classes per week
- **Retirement**: Deactivate teacher record while preserving historical data

---

## Attendance & Scheduling

### 8. Attendance Management Service
**Purpose**: Track student attendance with comprehensive reporting

#### Features:
- **Daily Attendance**: Mark students present, absent, late, or on leave
- **Period-Level Tracking**: Record attendance for each class period
- **Bulk Entry**: Submit attendance for entire class in single transaction
- **Date Range Reports**: Generate attendance summary for any time period
- **Percentage Calculation**: Automatic calculation of attendance rates
- **Weekly Summaries**: Pre-calculated statistics for performance optimization
- **Class-Wide Reports**: View attendance for all students in a class
- **Individual History**: Track attendance trends for specific students
- **Late Arrivals**: Distinguish between absent and late arrivals

#### Use Cases:
- **Morning Assembly**: Teacher marks entire class attendance for Period 1
- **Report Card**: Calculate student's overall attendance percentage
- **Parent Meeting**: Show attendance trends over past 3 months
- **Admin Dashboard**: View class-wide attendance for current week
- **Truancy Detection**: Identify students with attendance below threshold
- **Leave Management**: Record approved absences vs. unauthorized
- **Period Tracking**: Track which periods students miss most frequently

---

### 9. Period Management Service
**Purpose**: Define school's daily schedule structure

#### Features:
- **Period Definition**: Create periods with start/end times
- **Day-Specific Periods**: Different schedules for different days (Monday-Saturday)
- **Recess Handling**: Mark periods as recess/break (excluded from timetables)
- **Flexible Scheduling**: Support for varying period durations
- **Multi-Day Support**: Define periods for 5-day or 6-day weeks
- **Period Ordering**: Sequential numbering for consistent timetables
- **School-Level Configuration**: Each school defines own period structure

#### Use Cases:
- **School Setup**: Define 8 periods from 8:00 AM to 3:30 PM
- **Recess Configuration**: Mark Period 4 (12:00-12:30) as lunch break
- **Saturday Schedule**: Create shorter periods for half-day Saturday
- **Late Start Days**: Define alternate schedule for assembly days
- **Double Periods**: Create consecutive periods for lab sessions
- **Timetable Generation**: Use period structure for automated scheduling

---

### 10. Timetable Generation Service ⭐
**Purpose**: AI-powered automated timetable scheduling with constraint satisfaction

#### Features:
- **Automated Scheduling**: Generate complete weekly timetables automatically
- **Constraint Validation**: Enforce hard constraints (teacher availability, class conflicts)
- **Soft Constraints**: Optimize for preferences (core subjects in morning, even distribution)
- **Teacher Workload Limits**: Enforce daily and weekly teaching hour caps
- **Consecutive Periods**: Schedule lab subjects requiring 2-3 consecutive slots
- **Core Subject Prioritization**: Place important subjects in morning periods
- **Conflict Detection**: Prevent teacher double-booking and class overlaps
- **Dry Run Mode**: Preview timetables before committing to database
- **Quality Scoring**: Calculate optimization score (0-100) for timetable quality
- **Manual Adjustments**: Swap entries after generation with conflict checking
- **Unassigned Subject Reporting**: Identify subjects that couldn't be scheduled
- **Day-Specific Periods**: Support schools with different schedules per day

#### Algorithm Features:
- **Greedy CSP Solver**: Constraint satisfaction problem with priority ordering
- **Priority Sorting**: Schedule hardest subjects first (labs, core, high-frequency)
- **Even Distribution**: Spread subjects across days to avoid clustering
- **Early Exit Optimization**: Skip invalid slots early for performance
- **Pessimistic Locking**: Thread-safe operations for concurrent modifications

#### Use Cases:
- **Start of Semester**: Generate full timetable for all classes in seconds
- **Teacher Workload**: Ensure no teacher exceeds 6 classes per day
- **Lab Scheduling**: Automatically find 2 consecutive periods for Chemistry lab
- **Core Subjects**: Place Math and English in morning periods (1-3)
- **Part-Time Teachers**: Respect teacher availability constraints (MWF only)
- **Manual Fix**: Swap two timetable entries if constraint conflicts arise
- **Quality Check**: Review optimization score to validate timetable quality
- **Dry Run**: Preview generated timetable before committing to database

---

### 11. Timetable Management Service
**Purpose**: View and modify generated timetables

#### Features:
- **Class Timetables**: View weekly schedule for specific class
- **Teacher Timetables**: View all classes a teacher teaches
- **Subject Filtering**: Find all slots for a specific subject
- **Day View**: Display all periods for a particular day
- **Entry Locking**: Prevent modifications to finalized timetables
- **Swap Validation**: Ensure swaps don't create teacher conflicts
- **Audit Trail**: Track who modified timetable entries and when
- **Multi-Year Support**: Maintain separate timetables per academic year

#### Use Cases:
- **Student View**: Display weekly schedule for Grade 10A
- **Teacher Dashboard**: Show all classes Ms. Johnson teaches this week
- **Admin Override**: Manually swap two periods after generation
- **Substitute Teacher**: Find all classes a teacher has on Monday
- **Finalize Schedule**: Lock timetable to prevent further changes
- **Historical Records**: View timetables from previous academic years

---

## Assessment & Grading

### 12. Exam Management Service
**Purpose**: Organize and manage school examinations

#### Features:
- **Exam Creation**: Define exams with name, dates, type, and max marks
- **Exam Types**: Mid-term, final, quarterly, unit tests, surprise quizzes
- **Date Scheduling**: Set start/end dates for exam periods
- **Subject Mapping**: Link exams to subjects being tested
- **Academic Year Scoping**: Associate exams with specific academic years
- **Multi-School Support**: Each school manages own exam schedule
- **Soft Delete**: Deactivate exams without losing student marks
- **Exam Filtering**: Get all exams for academic year or date range

#### Use Cases:
- **Exam Creation**: Schedule "Mid-Term Exam October 2024" for all subjects
- **Mark Entry**: Create exam before teachers can enter student marks
- **Report Cards**: Fetch all exams for academic year to generate reports
- **Student View**: Show upcoming exams in next 2 weeks
- **Historical Analysis**: Compare performance across mid-term and final exams
- **Exam Calendar**: Display all scheduled exams for current semester

---

### 13. Marks Management Service
**Purpose**: Record and track student assessment results

#### Features:
- **Mark Entry**: Record marks obtained by students in exams
- **Max Marks Tracking**: Define maximum marks for each subject-exam combination
- **Bulk Entry**: Enter marks for entire class efficiently
- **Mark Updates**: Modify marks with audit trail
- **Subject-Wise Reports**: View student performance across subjects
- **Exam-Wise Reports**: Compare student performance across exams
- **Percentage Calculation**: Automatic calculation of percentages
- **Grade Computation**: Convert marks to letter grades
- **Historical Tracking**: Maintain complete mark history per student

#### Use Cases:
- **Post-Exam**: Teacher enters Math marks for all Grade 10A students
- **Correction**: Update mark after re-evaluation
- **Progress Report**: View student's marks across all subjects for mid-term
- **Subject Analysis**: Compare class performance in Physics across terms
- **Student Dashboard**: Display marks obtained in recent exams
- **Parent Portal**: Show child's marks with subject-wise breakdown

---

### 14. Report Card Service
**Purpose**: Generate comprehensive student performance reports

#### Features:
- **Consolidated Reports**: Combine marks from all exams in academic year
- **Subject-Wise Breakdown**: Display marks obtained in each subject
- **Exam-Wise Summary**: Show performance across mid-term, finals, etc.
- **Percentage Calculation**: Overall percentage and subject percentages
- **Grade Assignment**: Convert scores to letter grades (A+, A, B+, etc.)
- **Attendance Integration**: Include attendance percentage in report
- **Multi-Exam Aggregation**: Combine scores from multiple assessment types
- **PDF Generation**: Export report cards as printable PDFs
- **Historical Reports**: Access report cards from previous academic years

#### Use Cases:
- **End of Term**: Generate report cards for all students in Grade 10
- **Parent Meeting**: Display comprehensive performance report
- **Student Progress**: View improvement trends across terms
- **Merit List**: Identify top performers based on overall percentage
- **Underperformer Alerts**: Flag students with failing grades
- **Transcript Generation**: Create official academic transcripts

---

### 15. Exam Type Service
**Purpose**: Categorize and manage different types of assessments

#### Features:
- **Type Definition**: Create exam types (Mid-Term, Final, Quiz, Assignment)
- **Weightage Configuration**: Assign importance weights to exam types
- **Grade Calculation**: Define contribution to final grade
- **School-Specific Types**: Each school defines own exam categories
- **Type-Based Filtering**: Get all exams of specific type
- **Historical Tracking**: Maintain exam type definitions across years

#### Use Cases:
- **Grading Policy**: Define that Finals = 50%, Mid-Terms = 30%, Quizzes = 20%
- **Exam Creation**: Select exam type when scheduling new assessment
- **Performance Analysis**: Compare student performance in quizzes vs exams
- **Report Cards**: Group marks by exam type in performance reports

---

## Communication System

### 16. Announcement Service
**Purpose**: Broadcast important information to school community

#### Features:
- **Multi-Channel Announcements**: Post to web, mobile, email simultaneously
- **Targeted Broadcasting**: Send to specific grades, classes, or students
- **Audience Scoping**: School-wide, grade-specific, or class-specific announcements
- **Priority Levels**: Mark announcements as urgent, important, or normal
- **Rich Content**: Support for text, images, and attachments
- **Scheduling**: Schedule announcements for future publication
- **Read Tracking**: Monitor which users have viewed announcements
- **Multi-Language Support**: Announcements in multiple languages
- **Expiry Dates**: Auto-hide announcements after specified date

#### Use Cases:
- **School Closure**: Urgent announcement to all students and parents about weather closure
- **Exam Notice**: Notify Grade 10 students about upcoming final exams
- **Event Invitation**: Invite Grade 9A students to cultural event
- **Policy Update**: School-wide announcement about new uniform policy
- **Achievement**: Celebrate student achievements with school community
- **Emergency Alert**: Immediate notification about safety concerns

---

### 17. Communication Service
**Purpose**: Facilitate direct messaging between users

#### Features:
- **One-on-One Conversations**: Direct messaging between two users
- **Group Conversations**: Multi-participant chat groups
- **Role-Based Access**: Teachers, parents, students, admins can communicate
- **Message Threading**: Organize conversations with threaded replies
- **Read Receipts**: Track message delivery and read status
- **Participant Management**: Add/remove participants from conversations
- **Conversation History**: Complete message history per conversation
- **Search**: Find conversations and messages by keyword
- **Notifications**: Real-time alerts for new messages

#### Use Cases:
- **Parent-Teacher**: Private conversation about student's progress
- **Class Group**: Teacher creates group chat for Grade 10A announcements
- **Student Project**: Group conversation for collaborative project work
- **Admin Communication**: Principal messages all teachers simultaneously
- **Clarifications**: Student asks teacher question about homework
- **Feedback**: Parent provides feedback to teacher about teaching methods

---

## Financial Management

### 18. Fee Structure Service
**Purpose**: Define and manage school fee policies

#### Features:
- **Fee Components**: Break down fees into Tuition, Library, Sports, Bus, Lab, etc.
- **Fee Templates**: Create reusable fee structures for different grades
- **Term-Based Fees**: Define payment terms (Monthly, Quarterly, Annual)
- **Class Assignment**: Assign fee templates to specific classes
- **Component Amounts**: Set base amounts for each fee component
- **Template Reusability**: Apply same template to multiple classes
- **Academic Year Scoping**: Different fee structures per academic year
- **Bulk Assignment**: Apply fee templates to multiple classes at once

#### Use Cases:
- **New Year Setup**: Create fee template with Tuition (₹50,000) + Library (₹5,000)
- **Class Application**: Assign "Standard Fee Template" to all Grade 9 classes
- **Term Definition**: Create quarterly payment terms for academic year
- **Component Addition**: Add new "Technology Fee" component to existing template
- **Differential Pricing**: Create different fee structures for Grade 9 vs Grade 10

---

### 19. Student Fee Assignment Service
**Purpose**: Customize individual student fee obligations

#### Features:
- **Individual Overrides**: Customize fees for specific students
- **Fee Opt-Out**: Remove specific fee components for students
- **Scholarship Application**: Reduce or waive fees for eligible students
- **Custom Amounts**: Set different amounts than class defaults
- **Component-Level Control**: Fine-tune individual fee components
- **Academic Year Tracking**: Maintain fee assignment history
- **Bulk Updates**: Apply changes to multiple students simultaneously

#### Use Cases:
- **Scholarship**: Waive tuition fee for merit scholarship recipient
- **Bus Opt-Out**: Remove bus fee for student not using school transport
- **Sibling Discount**: Apply 10% discount for second child
- **Special Case**: Custom fee structure for student with special needs
- **Mid-Year Adjustment**: Update fees when student changes classes

---

### 20. Discount Service
**Purpose**: Manage fee discounts and concessions

#### Features:
- **Discount Templates**: Create reusable discount policies
- **Discount Types**: Percentage-based or fixed-amount discounts
- **Component Targeting**: Apply discounts to specific fee components
- **Student Assignment**: Link discounts to eligible students
- **Eligibility Rules**: Define criteria for discount qualification
- **Expiry Dates**: Time-limited promotional discounts
- **Discount Stacking**: Allow or prevent multiple discount combinations
- **Audit Trail**: Track who applied discounts and when

#### Use Cases:
- **Sibling Discount**: 10% off for families with 2+ students
- **Early Payment**: 5% discount if fees paid before due date
- **Merit Scholarship**: 50% tuition waiver for academic excellence
- **Staff Children**: 100% discount for children of school employees
- **Financial Aid**: Need-based discount for economically disadvantaged
- **Alumni Discount**: 15% off for children of alumni

---

### 21. Invoice Service
**Purpose**: Generate and manage student fee invoices

#### Features:
- **Automatic Generation**: Create invoices from fee structures and discounts
- **Itemized Billing**: Line-by-line breakdown of all fee components
- **Discount Application**: Automatically apply student-specific discounts
- **Override Handling**: Respect student fee opt-outs and customizations
- **Due Date Tracking**: Set and monitor payment deadlines
- **Invoice Status**: Track unpaid, partially paid, and paid invoices
- **Payment History**: Link invoices to payment transactions
- **Bulk Generation**: Create invoices for entire class at once
- **Partial Payment Support**: Handle installment payments
- **Late Fees**: Automatic penalty calculation for overdue payments

#### Use Cases:
- **Term Start**: Generate invoices for all Grade 9 students for Q1
- **Custom Invoice**: Create special invoice for student with fee adjustments
- **Payment Tracking**: Mark invoice as partially paid after installment
- **Overdue Notice**: Identify all unpaid invoices beyond due date
- **Reconciliation**: Match payments to invoice line items
- **Bulk Invoice**: Generate invoices for 200 students in single operation

---

### 22. Payment Service ⭐
**Purpose**: Process and track fee payments with Razorpay integration

#### Features:
- **Payment Gateway Integration**: Secure Razorpay payment processing
- **Multiple Payment Methods**: UPI, Card, Net Banking, Wallet support
- **Payment Initiation**: Create Razorpay orders and return checkout details
- **Signature Verification**: Cryptographic validation of payment completion
- **Webhook Processing**: Handle real-time payment notifications from Razorpay
- **Payment Allocation**: Distribute funds across invoice line items
- **Partial Payments**: Support installment-based fee payments
- **Payment Status Tracking**: Monitor pending, captured, failed payments
- **Reconciliation**: Automated reconciliation of pending payments
- **Authorization Handling**: Capture two-step payment flows (Authorize → Capture)
- **Failure Handling**: Graceful error handling with retry mechanisms
- **Refund Support**: Initiate and track refunds for captured payments
- **School-Specific Credentials**: Each school uses own Razorpay API keys
- **Payment History**: Complete audit trail of all transactions
- **Idempotency**: Prevent duplicate webhook processing
- **Health Monitoring**: Track payment success rates and failures

#### Advanced Features:
- **Race Condition Prevention**: Exclusive locks for concurrent webhook processing
- **Allocation Failure Recovery**: Auto-retry mechanism for failed allocations
- **Signature Security**: Invalid signature detection and alerting
- **Reconciliation Jobs**: Automated background jobs for pending payment capture
- **Authorization Expiry**: Auto-mark expired authorizations as failed
- **Payment Analytics**: 24-hour success rate and failure statistics
- **Webhook Monitoring**: Track processed, failed, and received webhooks

#### Use Cases:
- **Parent Payment**: Parent pays ₹25,000 tuition fee via Razorpay UPI
- **Installment**: Student pays first installment of ₹10,000 towards invoice
- **Webhook Processing**: Automatically mark payment as captured when Razorpay notifies
- **Partial Payment**: Allocate ₹15,000 to tuition, ₹5,000 to library fee
- **Failed Payment**: Retry capturing authorized payment before expiry
- **Reconciliation**: Nightly job captures payments missed by webhooks
- **Refund**: Process refund for student who dropped out mid-term
- **Multi-School**: School A uses different API keys than School B
- **Payment History**: View all payments made by a student across invoices
- **Admin Dashboard**: Monitor payment health with success rate metrics

---

### 23. Refund Service
**Purpose**: Process and track payment refunds

#### Features:
- **Refund Validation**: Verify payment is eligible for refund
- **Partial Refunds**: Support refunds less than original payment amount
- **Refund Tracking**: Monitor refund status (pending, processed, failed)
- **Razorpay Integration**: Initiate refunds via payment gateway API
- **Refund History**: Track all refunds per payment
- **Maximum Refund Check**: Ensure refund doesn't exceed paid amount
- **Audit Trail**: Record who initiated refund and when

#### Use Cases:
- **Student Dropout**: Refund 50% of term fees when student leaves mid-term
- **Overpayment**: Refund excess amount paid by mistake
- **Cancelled Service**: Refund bus fee when student stops using transport
- **Duplicate Payment**: Full refund when parent pays twice by error
- **Pro-Rata Refund**: Partial refund based on remaining term duration

---

### 24. Payment Gateway Service
**Purpose**: Configure payment gateway credentials

#### Features:
- **Credential Management**: Store encrypted Razorpay API keys per school
- **Multi-School Support**: Each school maintains own payment gateway account
- **Credential Encryption**: Secure storage of sensitive API keys
- **Webhook Secret Management**: Store and validate webhook signatures
- **Gateway Testing**: Test mode support for development
- **Credential Rotation**: Update API keys without system downtime

#### Use Cases:
- **School Onboarding**: Configure Razorpay keys for new school
- **Credential Update**: Rotate API keys for security compliance
- **Testing**: Switch between test and production credentials
- **Multi-Gateway**: Support multiple payment providers per school

---

## E-Commerce Platform

### 25. Product Management Service ⭐
**Purpose**: Manage school store inventory and products

#### Features:
- **Product Catalog**: Comprehensive product listings with descriptions
- **Category Management**: Organize products into hierarchical categories
- **Stock Tracking**: Real-time inventory management and alerts
- **SKU Management**: Unique product identifiers for inventory control
- **Pricing**: Set and update product prices
- **Product Images**: Upload and manage product photos
- **Manufacturer Info**: Track product suppliers and manufacturers
- **Reorder Management**: Set reorder levels and quantities
- **Multi-School Products**: Each school maintains own inventory
- **Product Variants**: Manage size, color, and other variations
- **Bulk Updates**: Update multiple products simultaneously
- **Stock Adjustments**: Track inventory changes with audit trail
- **Active/Inactive Status**: Enable/disable product visibility

#### Use Cases:
- **Uniform Sales**: Add "School Uniform - Size 10" to product catalog
- **Book Store**: Stock textbooks for different grades
- **Stationery**: Manage pencils, notebooks, calculators inventory
- **Stock Alert**: Receive notification when inventory falls below threshold
- **Price Update**: Bulk update prices for all Grade 9 textbooks
- **New Product**: Add "Science Lab Coat" with photos and description
- **Inventory Audit**: Adjust stock for damaged or lost items

---

### 26. Product Category Service
**Purpose**: Organize products into logical categories

#### Features:
- **Category Hierarchy**: Create parent-child category relationships
- **Category Management**: Create, update, and delete categories
- **Product Filtering**: Browse products by category
- **School-Specific**: Each school maintains own category structure
- **Category Display**: Show products grouped by category

#### Use Cases:
- **Store Organization**: Create categories like Uniforms, Books, Stationery
- **Subcategories**: Books → Grade 9 Books → Science Books
- **Category Update**: Rename "Sports" to "Sports Equipment"
- **Product Browser**: Display all products in "Uniforms" category

---

### 27. Product Package Service
**Purpose**: Create bundles of products sold together

#### Features:
- **Package Creation**: Bundle multiple products at discounted price
- **Package Items**: Define products and quantities in package
- **Package Pricing**: Set special price for bundled products
- **Stock Validation**: Ensure all package items are in stock
- **Package Activation**: Enable/disable package availability
- **School-Specific**: Each school creates own packages

#### Use Cases:
- **Grade 9 Starter Kit**: Bundle textbooks, notebooks, uniform at discount
- **Sports Package**: Cricket bat, ball, pads sold together
- **Science Kit**: Lab coat, safety goggles, practical manual as package
- **Back to School**: Complete stationery set for new students

---

### 28. Admin Product Management Service
**Purpose**: Administrative controls for product catalog

#### Features:
- **Bulk Operations**: Update multiple products simultaneously
- **Category Management**: Administrative category controls
- **Product Approval**: Review and approve new product listings
- **Reporting**: Generate inventory and sales reports
- **Audit Trails**: Track all product modifications

#### Use Cases:
- **Year-End Cleanup**: Bulk deactivate outdated products
- **Inventory Report**: Generate stock report for accounting
- **Product Audit**: Review all product changes in last month

---

### 29. Cart Service ⭐
**Purpose**: Manage shopping cart for parents purchasing school items

#### Features:
- **Persistent Cart**: Cart persists across sessions (not session-based)
- **One Cart Per User**: Each user has exactly one shopping cart
- **Add to Cart**: Add products with quantity validation
- **Stock Validation**: Real-time stock availability checking
- **Quantity Updates**: Modify item quantities in cart
- **Cart Clearing**: Remove all items from cart
- **Item Removal**: Remove specific items from cart
- **Hydrated Response**: Cart includes full product details (no N+1 queries)
- **Price Calculation**: Real-time total calculation
- **Cart Persistence**: Saved cart for later checkout

#### Use Cases:
- **Add Item**: Parent adds "School Uniform - Size 10" to cart
- **Stock Check**: System validates 5 units available before adding
- **Update Quantity**: Change quantity from 1 to 2 for notebooks
- **Remove Item**: Remove calculator from cart
- **View Cart**: Display cart with product images, prices, quantities
- **Clear Cart**: Empty cart after successful checkout

---

### 30. Order Service ⭐
**Purpose**: Process and manage product orders with inventory control

#### Features:
- **Cart Checkout**: Convert cart to order with atomic transaction
- **Manual Order Creation**: Admin creates orders on behalf of users
- **Stock Locking**: Pessimistic locking prevents overselling (SELECT FOR UPDATE)
- **Inventory Management**: Automatic stock decrement on order creation
- **Order Status Workflow**: Pending → Processing → Shipped → Delivered
- **Order Cancellation**: Cancel orders with stock restoration
- **Student Assignment**: Associate orders with specific students
- **Parent Authorization**: Verify parent-student relationship
- **Order History**: Complete order history per parent/student
- **Order Tracking**: Track order status and delivery
- **Order Statistics**: Admin dashboard with order metrics
- **Race Condition Prevention**: Atomic operations for concurrent checkouts
- **Refund Integration**: Link cancelled orders to refund process

#### Order Lifecycle:
1. **Pending Payment**: Order created, awaiting payment
2. **Processing**: Payment received, preparing shipment
3. **Shipped**: Order dispatched with tracking number
4. **Delivered**: Order successfully delivered
5. **Cancelled**: Order cancelled with refund

#### Use Cases:
- **Parent Checkout**: Parent places order for 2 uniforms + 3 notebooks
- **Stock Safety**: System prevents overselling when 2 users checkout last item
- **Manual Order**: Admin creates phone order for parent
- **Order Tracking**: Parent checks if uniform order has shipped
- **Cancellation**: Parent cancels order before shipping, stock restored
- **Admin Dashboard**: View all processing orders for current week
- **Student Filter**: Show all orders for a specific student
- **Order History**: Parent views past orders from last academic year

---

## Media & Albums

### 31. Album Service
**Purpose**: Organize and share media content in albums

#### Features:
- **Album Creation**: Create photo/video albums with metadata
- **Access Control**: Public, grade-specific, class-specific, or individual access
- **Album Types**: Profile pictures, cultural events, e-commerce products
- **Target Audiences**: Specify who can view albums
- **Album Filtering**: Get albums accessible to specific users
- **Multi-Tenancy**: Albums scoped to schools

#### Use Cases:
- **Cultural Event**: Create album of annual day photos for entire school
- **Class Trip**: Share field trip photos with Grade 9A only
- **Sports Day**: Public album visible to all parents and students
- **Individual Achievement**: Create album for specific student's award ceremony

---

### 32. Media Service
**Purpose**: Upload, store, and retrieve media files

#### Features:
- **File Upload**: Upload images and videos to secure cloud storage
- **Storage Buckets**: Separate buckets for profiles, events, products
- **Signed URLs**: Generate temporary URLs for secure file access
- **Access Control**: Verify user permissions before serving files
- **File Deletion**: Remove media files with authorization check
- **Metadata Tracking**: Store file size, MIME type, uploader info
- **Cloud Integration**: Supabase storage backend

#### Use Cases:
- **Photo Upload**: Teacher uploads 50 photos from sports day
- **Profile Picture**: Student uploads new profile photo
- **Product Image**: Admin uploads product photo for e-commerce
- **Secure Access**: Generate 1-hour signed URL for parent to view event photos
- **File Cleanup**: Delete old media files to free storage space

---

### 33. Album Target Service
**Purpose**: Define who can access specific albums

#### Features:
- **Target Types**: Grade-level, class-level, or individual student targeting
- **Access Validation**: Verify user eligibility to view album
- **Bulk Targeting**: Create multiple access rules per album
- **Flexible Rules**: Combine multiple targeting criteria

#### Use Cases:
- **Grade Filter**: Make album visible to all Grade 10 students
- **Class Specific**: Share album only with Grade 9A and 9B
- **Individual**: Create album for specific student's achievements
- **Mixed Access**: Album accessible to Grade 10 + Grade 11 Science students

---

## Clubs & Activities

### 34. Club Management Service
**Purpose**: Organize and manage extracurricular clubs

#### Features:
- **Club Creation**: Create clubs with name, description, objectives
- **Capacity Management**: Set maximum member limits
- **Membership Tracking**: Track active, pending, and inactive members
- **Academic Year Scoping**: Separate clubs per academic year
- **Teacher Sponsorship**: Assign faculty sponsors to clubs
- **Club Status**: Active/inactive club management
- **Member Enrollment**: Add students to clubs with approval workflow
- **Membership Updates**: Update member roles and contribution scores

#### Use Cases:
- **New Club**: Create "Robotics Club" with max 30 members
- **Student Join**: Add student to Drama Club with teacher approval
- **Club Roster**: View all active members of Science Club
- **Contribution Tracking**: Record student's participation level in club
- **Year Transition**: Create new club instances for new academic year

---

### 35. Club Activity Service
**Purpose**: Plan and track club events and activities

#### Features:
- **Activity Planning**: Schedule club events with date, time, venue
- **Activity Status**: Planned, ongoing, completed, cancelled statuses
- **Attendance Tracking**: Record which members attended activities
- **Activity History**: View past activities for a club
- **Upcoming Events**: Display scheduled activities calendar
- **Activity Reports**: Generate participation reports

#### Use Cases:
- **Event Planning**: Schedule robotics competition for next month
- **Activity Execution**: Mark Science Fair as "ongoing"
- **Completion**: Mark annual day performance as "completed"
- **Participation**: Record that 15 out of 20 members attended event
- **Calendar**: Display all upcoming club activities for current month

---

### 36. Club Membership Service
**Purpose**: Manage student membership in clubs

#### Features:
- **Membership Application**: Students request to join clubs
- **Approval Workflow**: Teachers approve/reject membership requests
- **Contribution Scoring**: Track individual member contributions
- **Role Assignment**: President, Vice-President, Member roles
- **Membership Status**: Active, pending, inactive statuses
- **Member Removal**: Remove students from clubs
- **Capacity Validation**: Prevent joining when club is full
- **Duplicate Prevention**: Prevent duplicate memberships

#### Use Cases:
- **Join Request**: Student applies to join Music Club
- **Approval**: Teacher approves student's membership application
- **Leadership**: Assign student as President of Debate Club
- **Contribution**: Award points for participating in club activity
- **Removal**: Remove inactive member from club
- **Capacity Check**: Reject application when club reaches maximum capacity

---

## Achievement & Gamification

### 37. Achievement System Service ⭐
**Purpose**: Gamify student engagement with point-based achievements

#### Features:
- **Achievement Point Rules**: Define points for different achievement types
- **Achievement Categories**: Academic, Sports, Cultural, Leadership, Service
- **Point Calculation**: Automatic point assignment based on rules
- **Verification Workflow**: Achievements require admin verification
- **Student Achievements**: Record student accomplishments
- **Point Allocation**: Automatic or manual point assignment
- **Achievement History**: Track all achievements per student
- **Leaderboards**: School-wide, class-wide, and club leaderboards
- **Multi-Source Points**: Combine exam marks, achievements, club contributions

#### Achievement Types:
- **Academic**: Exam scores, perfect attendance, improvement awards
- **Sports**: Tournament wins, records, participation
- **Cultural**: Competition victories, performances, exhibitions
- **Leadership**: Club leadership, event organization, peer mentoring
- **Service**: Community service, volunteer work, social initiatives

#### Leaderboard Features:
- **School Leaderboard**: Top performers across entire school
- **Class Leaderboard**: Top students within specific class
- **Club Leaderboard**: Most active clubs by total member contributions
- **Multi-Metric**: Combine achievement points, exam marks, club scores

#### Use Cases:
- **Academic Excellence**: Award 100 points for scoring 90%+ in exams
- **Sports Victory**: Grant 50 points for winning inter-school competition
- **Perfect Attendance**: Automatic 25 points for 100% attendance
- **Club Participation**: Earn 10 points per club activity attended
- **Leaderboard**: Display top 10 students in Grade 9 based on total points
- **Club Ranking**: Show most active clubs by total member contributions
- **Verification**: Teacher verifies student's reported achievement
- **Point History**: View all achievements and points earned by student

---

## Security & Compliance

### 38. Audit Service
**Purpose**: Track all system actions for compliance and security

#### Features:
- **Action Logging**: Record CREATE, UPDATE, DELETE, LOGIN actions
- **User Tracking**: Identify who performed each action
- **IP Address Logging**: Track source IP for security analysis
- **Data Snapshots**: Store before/after state for modifications
- **Table-Level Tracking**: Log changes to specific database tables
- **Record ID Tracking**: Link actions to specific records
- **Timestamp Recording**: Precise time of each action
- **Query Capabilities**: Search audit logs by user, action, date

#### Use Cases:
- **Discount Audit**: Track who applied student fee discount
- **Data Breach Investigation**: Review all actions from suspicious IP
- **Compliance Reporting**: Generate audit report for regulatory compliance
- **User Activity**: See all actions performed by a specific user
- **Change History**: View modification history for student record

---

### 39. Logging Service
**Purpose**: Application-level logging for monitoring and debugging

#### Features:
- **Log Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Structured Logging**: JSON-formatted logs with metadata
- **Contextual Details**: Additional context for each log entry
- **Error Tracking**: Capture exceptions and stack traces
- **Performance Monitoring**: Log slow operations
- **Log Querying**: Search logs by level, message, or timeframe

#### Use Cases:
- **Error Debugging**: Investigate payment failure with detailed logs
- **Performance Analysis**: Identify slow database queries
- **Security Monitoring**: Alert on suspicious login patterns
- **System Health**: Monitor critical system operations

---

### 40. Encryption Service
**Purpose**: Secure storage of sensitive data

#### Features:
- **API Key Encryption**: Encrypt Razorpay and other sensitive credentials
- **Decryption**: Safely decrypt for runtime usage
- **Key Rotation**: Support for cryptographic key updates
- **Per-School Encryption**: Isolated encryption per school tenant

#### Use Cases:
- **Payment Gateway**: Encrypt Razorpay API keys in database
- **Webhook Secrets**: Securely store webhook signature secrets
- **Credential Management**: Decrypt keys only when needed for API calls

---

### 41. PDF Service
**Purpose**: Generate PDF documents from HTML templates

#### Features:
- **Report Card Generation**: Convert report card data to PDF
- **Invoice PDFs**: Generate printable invoices
- **Certificate Generation**: Create achievement certificates
- **Custom Templates**: Support for school-specific branding

#### Use Cases:
- **Report Cards**: Generate PDF report cards for all students
- **Fee Receipts**: Create PDF receipts for payments
- **Certificates**: Generate achievement certificates with school logo

---

## API Architecture Highlights

### Multi-Tenancy
- **School-Level Isolation**: All data scoped to `school_id`
- **Row-Level Security (RLS)**: Supabase RLS policies enforce data isolation
- **JWT-Based Access**: User context from JWT tokens

### Performance Optimizations
- **Async Operations**: All database operations use `AsyncSession`
- **Eager Loading**: Prevent N+1 queries with `selectinload`
- **Pessimistic Locking**: `SELECT FOR UPDATE` for critical operations
- **Bulk Operations**: Batch inserts/updates for efficiency
- **Caching**: Pre-calculated summaries for frequently accessed data

### Security Features
- **Role-Based Access Control (RBAC)**: Admin, Teacher, Student, Parent roles
- **Input Validation**: Pydantic schemas for all endpoints
- **SQL Injection Prevention**: SQLAlchemy ORM usage
- **CORS Protection**: Configured CORS policies
- **Rate Limiting**: Prevent API abuse
- **Webhook Signature Verification**: Validate external callbacks

### Reliability Features
- **Idempotency**: Prevent duplicate webhook processing
- **Transaction Management**: Atomic operations with rollback
- **Error Handling**: Graceful failure with detailed error messages
- **Health Monitoring**: Payment and system health metrics
- **Background Jobs**: Reconciliation and cleanup tasks

---

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL via Supabase
- **ORM**: SQLAlchemy (Async)
- **Authentication**: Supabase Auth (JWT)
- **Payment Gateway**: Razorpay
- **File Storage**: Supabase Storage
- **API Documentation**: OpenAPI/Swagger

### Frontend (Admin Web)
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS

### DevOps
- **Containerization**: Docker
- **Package Management**: pnpm (monorepo)
- **Testing**: pytest (comprehensive test suite)

---

## Integration Points

### External Services
1. **Supabase**
   - Authentication (user management)
   - PostgreSQL database (with RLS)
   - File storage (media uploads)

2. **Razorpay**
   - Payment processing
   - Refund management
   - Webhook notifications

### Webhook Endpoints
- **Payment Webhooks**: Real-time payment status updates
- **Webhook Security**: Signature verification and idempotency

---

## Future Roadmap (Planned Features)

1. **Mobile Apps**: Native iOS and Android applications
2. **AI Teaching Assistant**: Chatbot for student queries
3. **Automated Report Generation**: AI-powered insights
4. **Parent Portal**: Dedicated portal for parent engagement
5. **Hostel Management**: Dormitory and mess management
6. **Transport Management**: School bus tracking and routing
7. **Library Management**: Book inventory and lending
8. **HR & Payroll**: Staff salary and attendance management
9. **Inventory Management**: Non-educational inventory tracking
10. **Analytics Dashboard**: Advanced reporting and insights

---

## Conclusion

SchoolOS is a comprehensive, production-ready school management platform that handles:

- **15+ modules** covering academic, administrative, and financial operations
- **40+ services** with specialized business logic
- **Multi-tenant architecture** supporting unlimited schools
- **Secure payment processing** with Razorpay integration
- **AI-powered features** like automated timetable generation
- **Complete student lifecycle** from admission to graduation
- **Parent engagement** through communication and payment portals
- **Teacher productivity** tools for attendance, marks, and timetables
- **E-commerce platform** for school store operations
- **Gamification system** to boost student engagement

The platform is built with scalability, security, and user experience as core principles, making it suitable for schools of all sizes—from small private institutions to large educational chains.
