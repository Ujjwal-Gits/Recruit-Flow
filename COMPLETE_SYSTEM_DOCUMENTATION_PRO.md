# CV Book System: Comprehensive Documentation

## Introduction

The CV Book system is a robust, scalable platform designed for modern recruitment workflows, integrating advanced job management, candidate review, secure communication, and financial asset verification. Built with Next.js, React, and Supabase, it offers a seamless experience for owners, managers, recruiters, and support staff. This documentation provides a detailed, professional, and SEO-optimized overview of the entire system, including architecture, features, APIs, database schema, security, and user roles.

---

## System Architecture

### Frontend

The frontend is developed using Next.js and React, leveraging Tailwind CSS for responsive and modern UI design. All components are modular, client-side rendered, and optimized for performance. Key features include:

- Dynamic routing for user, admin, and support dashboards
- Real-time updates via Supabase
- Secure authentication and role-based access

### Backend

The backend utilizes Next.js API routes to handle business logic, authentication, and CRUD operations. All sensitive endpoints are protected by middleware, ensuring only authorized users can access critical features. The backend communicates with Supabase for database operations, file storage, and authentication.

### Database

Supabase (PostgreSQL) serves as the primary database, providing:

- Relational data storage for jobs, applications, candidates, meetings, and profiles
- Authentication and user management
- Secure file storage for resumes, QR codes, and receipts

---

## User Roles & Permissions

### Owner

Owners have full administrative privileges, including:

- Access to the admin dashboard
- Uploading QR codes for Financial Asset Gateway Terminal
- Managing jobs, candidates, and system settings
- Viewing analytics and receipts

### Manager

Managers oversee job listings and candidate reviews. Their permissions include:

- Creating and editing job postings
- Reviewing applications
- Accessing analytics and reports

### Support

Support staff handle user queries and transaction verifications. Their responsibilities include:

- Accessing the support chat
- Verifying transaction proofs
- Activating user seats upon successful verification

### Recruiter

Recruiters focus on job posting and candidate communication. Their features include:

- Posting new jobs
- Reviewing candidate applications
- Messaging candidates directly

---

## Features & Workflows

### Job Management

The system allows owners, managers, and recruiters to create, edit, and delete job postings. Each job includes detailed descriptions, requirements, and company information. Applications are tracked and managed through the dashboard, with real-time status updates.

### Candidate Review

Candidates can apply for jobs by submitting resumes and additional information. The platform supports PDF extraction and flipbook viewing for resumes, enabling recruiters and managers to review applications efficiently. ATS scoring and AI-powered chat provide advanced analysis and feedback.

### Secure Support Chat

SupportChat enables secure, real-time communication between users and support staff. Users can upload transaction proofs, which are verified by support before seat activation. All messages and attachments are stored securely in Supabase Storage.

### Financial Asset Gateway Terminal

Owners can upload QR codes for financial asset verification. These QR codes are used by support staff to validate user transactions, ensuring secure and compliant activation processes.

### Admin Dashboard & Analytics

The AdminDashboardClient provides comprehensive analytics, receipt review, and system management tools. Owners can monitor system activity, review financial transactions, and manage user roles.

---

## API Endpoints & Operations

### Authentication

- `/api/auth/login` (POST): Authenticates users and returns session tokens.
- `/api/auth/register` (POST): Registers new users and assigns roles.
- `/api/auth/forgot-password` (POST): Initiates password reset workflow.
- `/api/auth/reset-password` (POST): Sets new password after verification.
- `/api/auth/verify-otp` (POST): Verifies OTP for secure actions.

### Job Management

- `/api/jobs` (GET, POST): Retrieves job listings or creates new jobs.
- `/api/job-info/[jobId]` (GET): Fetches detailed job information.
- `/api/apply/[jobId]` (POST): Submits candidate applications.
- `/api/applications/[id]/status` (GET, POST): Checks or updates application status.

### Candidate CRM

- `/api/crm/candidates` (GET, POST): Manages candidate records and reviews.

### Support

- `/api/support/messages` (GET, POST): Handles support chat messages and attachments.

### Bulk PDF

- `/api/bulk-pdf` (POST): Generates bulk PDFs for candidate dossiers.

### Miscellaneous

- `/api/meetings` (GET, POST): Schedules and manages meetings.
- `/api/profile` (GET, POST): Retrieves or updates user profiles.
- `/api/debug-user` (GET): Provides debug information for user accounts.

---

## Supabase Database Schema

### Tables

#### Profiles

Stores user information, roles, and company details.

- `id` (UUID): Unique user identifier
- `email` (string): User email address
- `tier` (string): Subscription tier
- `role` (string): User role (owner, manager, support, recruiter)
- `company_name` (string): Associated company
- `updated_at` (timestamp): Last update timestamp
- `logo_url` (string): Company logo URL

#### Jobs

Contains job postings and descriptions.

- `id` (UUID): Job identifier
- `title` (string): Job title
- `company_name` (string): Company offering the job
- `description` (text): Job description
- `created_at` (timestamp): Creation date

#### Applications

Tracks candidate applications and statuses.

- `id` (UUID): Application identifier
- `job_id` (UUID): Associated job
- `user_id` (UUID): Applicant user
- `resume_url` (string): Resume file URL
- `ats_score` (number): ATS score
- `status` (string): Application status
- `created_at` (timestamp): Submission date

#### Candidates

Stores candidate profiles and application data.

- `id` (UUID): Candidate identifier
- `name` (string): Candidate name
- `email` (string): Candidate email
- `resume_url` (string): Resume file URL
- `ats_score` (number): ATS score
- `status` (string): Application status
- `job_id` (UUID): Associated job
- `created_at` (timestamp): Creation date

#### Meetings

Manages scheduled meetings between users and recruiters.

- `id` (UUID): Meeting identifier
- `user_id` (UUID): Participant user
- `job_id` (UUID): Associated job
- `date` (timestamp): Meeting date
- `notes` (text): Meeting notes

### Storage Buckets

- `support-attachments`: Stores chat images and QR attachments
- `admin-assets`: Stores admin QR images and receipts

---

## Security & Compliance

The CV Book system employs industry-standard security practices:

- Authentication via Supabase Auth, ensuring only authorized users access sensitive features
- Role-based access control, restricting actions based on user roles
- Secure file uploads to Supabase Storage, with validation and encryption
- API endpoints protected by middleware, preventing unauthorized access
- Sensitive actions (activation, financial gateway) require multi-factor verification
- All operations are logged for audit and compliance

---

## Page Routing & Navigation

The platform uses Next.js dynamic routing for seamless navigation:

- `/dashboard`: User dashboard for job and candidate management
- `/admin`: Admin dashboard for system analytics and settings
- `/apply/[jobId]`: Job application page
- `/login`: User login
- `/register`: User registration
- `/setup`: Initial system setup
- `/forgot-password`: Password reset workflow
- `/support`: Support chat for user queries

---

## CRUD Operations & Use Cases

The system supports full CRUD operations for jobs, applications, candidates, meetings, and profiles:

- **Create:** Users can create jobs, applications, candidates, meetings, and profiles via dedicated forms and API endpoints.
- **Read:** All data can be retrieved through dashboards, listings, and detail pages, with real-time updates.
- **Update:** Users can edit job details, application statuses, profile information, and meeting notes.
- **Delete:** Owners and managers can remove jobs, candidates, and meetings as needed.

---

## Detailed Role Features & Permissions

### Owner

Owners have the highest level of access, enabling them to manage all aspects of the system. They can upload QR codes for financial asset verification, review analytics, manage jobs and candidates, and oversee system settings. Owners are responsible for ensuring compliance and security across the platform.

### Manager

Managers focus on job and candidate management. They can create and edit job postings, review applications, access reports, and manage candidate records. Managers play a key role in recruitment workflows and analytics.

### Support

Support staff are responsible for user verification and seat activation. They access the support chat, verify transaction proofs, and activate user seats upon successful validation. Support staff ensure users have a smooth onboarding experience and maintain compliance.

### Recruiter

Recruiters are the primary users for job posting and candidate communication. They can post new jobs, review applications, and message candidates directly. Recruiters drive the recruitment process and maintain candidate relationships.

---

## Advanced Features & Integrations

- **AI-Powered Chat:** The AIChatPanel enables recruiters to analyze candidate telemetry and receive intelligent feedback, enhancing the recruitment process.
- **PDF Extraction & Flipbook Viewing:** The platform supports advanced PDF extraction and flipbook viewing for resumes, providing a unique and efficient candidate review experience.
- **Bulk PDF Generation:** Recruiters and managers can generate bulk PDFs for candidate dossiers, streamlining documentation and reporting.
- **Meeting Scheduling:** Integrated meeting management allows users to schedule and track interviews and discussions.

---

## Supabase Triggers & Functions

Supabase triggers and functions are used to automate profile updates, meeting scheduling, and other critical workflows. These ensure data consistency, real-time updates, and compliance with business logic.

---

## Audit & Logging

All sensitive operations, including financial asset verification, seat activation, and user management, are logged for audit purposes. Logs are stored securely and can be reviewed by owners and managers to ensure compliance and traceability.

---

## Contact & Support

For further assistance, users can contact the system owner or support team via the support chat page. All queries are handled promptly, and transaction proofs are verified securely.

---

## Conclusion

The CV Book system is a comprehensive, secure, and scalable platform for modern recruitment workflows. Its advanced features, robust security, and detailed documentation ensure long-term maintainability and professional operation. For any questions or support, refer to the contact section or reach out via the support chat.

---

_End of Professional Documentation_
