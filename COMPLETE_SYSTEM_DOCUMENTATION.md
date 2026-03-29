# CV Book System Documentation

## Overview

This documentation covers the complete CV Book system, including frontend, backend, APIs, Supabase database structure, user roles, features, and page descriptions. It is intended for developers, managers, and support staff to understand, maintain, and extend the system.

---

## System Architecture

- **Frontend:** Built with Next.js, React, and Tailwind CSS. Components are modular and client-side rendered.
- **Backend:** API routes in Next.js (app/api/\*) handle business logic, authentication, and CRUD operations.
- **Database:** Supabase (PostgreSQL) is used for authentication, storage, and relational data.

---

## User Roles & Features

### Owner

- Full access to admin dashboard
- Can upload QR for Financial Asset Gateway Terminal
- Manage jobs, candidates, and system settings

### Manager

- Manage job listings
- Review applications
- Access analytics and reports

### Support

- Access support chat
- Verify transaction proofs
- Activate user seats

### Recruiter

- Post jobs
- Review candidate applications
- Communicate with candidates

---

## Pages & Components

- **AdminDashboardClient.tsx:** Admin dashboard, analytics, QR management, receipt review
- **SupportChat.tsx:** Support chat, secure messaging, QR attachment verification
- **SmoothScroll.tsx:** Custom scroll behavior for UI
- **PDFDossierViewer.tsx:** PDF viewing for candidate dossiers
- **JobFlipbookClient.tsx:** Job flipbook, candidate review, AI chat
- **FlipbookViewer.tsx:** Resume flipbook, PDF rendering
- **DashboardClient.tsx:** User dashboard, job management, candidate CRM
- **ApplyPageClient.tsx:** Job application page, form integration
- **ApplyForm.tsx:** Application form, PDF extraction, resume upload
- **AIChatPanel.tsx:** AI-powered chat for recruiter-candidate analysis

---

## API Endpoints

### Authentication

- `/api/auth/login` (POST): User login
- `/api/auth/register` (POST): User registration
- `/api/auth/forgot-password` (POST): Password reset
- `/api/auth/reset-password` (POST): Set new password
- `/api/auth/verify-otp` (POST): OTP verification

### Job Management

- `/api/jobs` (GET, POST): List jobs, create job
- `/api/job-info/[jobId]` (GET): Get job details
- `/api/apply/[jobId]` (POST): Submit application
- `/api/applications/[id]/status` (GET, POST): Application status

### Candidate CRM

- `/api/crm/candidates` (GET, POST): Candidate management

### Support

- `/api/support/messages` (GET, POST): Support chat messages

### Bulk PDF

- `/api/bulk-pdf` (POST): Generate bulk PDFs

### Miscellaneous

- `/api/meetings` (GET, POST): Meeting management
- `/api/profile` (GET, POST): User profile
- `/api/debug-user` (GET): Debug user info

---

## Supabase Database Structure

### Tables

- **profiles**
  - id (UUID)
  - email (string)
  - tier (string)
  - role (string)
  - company_name (string)
  - updated_at (timestamp)
  - logo_url (string)
- **jobs**
  - id (UUID)
  - title (string)
  - company_name (string)
  - description (text)
  - created_at (timestamp)
- **applications**
  - id (UUID)
  - job_id (UUID)
  - user_id (UUID)
  - resume_url (string)
  - ats_score (number)
  - status (string)
  - created_at (timestamp)
- **candidates**
  - id (UUID)
  - name (string)
  - email (string)
  - resume_url (string)
  - ats_score (number)
  - status (string)
  - job_id (UUID)
  - created_at (timestamp)
- **meetings**
  - id (UUID)
  - user_id (UUID)
  - job_id (UUID)
  - date (timestamp)
  - notes (text)

### Storage Buckets

- **support-attachments:** Stores chat images, QR attachments
- **admin-assets:** Stores admin QR images, receipts

---

## Security

- Authentication via Supabase Auth
- Role-based access control (owner, manager, support, recruiter)
- Secure file uploads to Supabase Storage
- API endpoints protected by middleware
- Sensitive actions (activation, financial gateway) require verification

---

## Features Summary

- Job posting and management
- Candidate application and review
- Resume flipbook and PDF extraction
- AI-powered recruiter chat
- Admin dashboard analytics
- Secure support chat with QR verification
- Bulk PDF generation
- Meeting scheduling
- User profile management

---

## Page Routing

- `/dashboard`: User dashboard
- `/admin`: Admin dashboard
- `/apply/[jobId]`: Job application
- `/login`: Login page
- `/register`: Registration page
- `/setup`: Initial setup
- `/forgot-password`: Password reset
- `/support`: Support chat

---

## CURD Operations

- **Create:** Job, application, candidate, meeting, profile
- **Read:** Job list, application status, candidate info, profile, support messages
- **Update:** Application status, profile info, job details
- **Delete:** Remove job, candidate, meeting

---

## Detailed Role Features

### Owner

- Manage all jobs, candidates, and system settings
- Upload QR for financial gateway
- Access analytics and receipts

### Manager

- Manage jobs and candidates
- Review applications
- Access reports

### Support

- Verify transaction proofs
- Activate seats
- Access support chat

### Recruiter

- Post jobs
- Review applications
- Communicate with candidates

---

## Additional Notes

- All API endpoints are RESTful and follow standard HTTP methods.
- Supabase triggers and functions are used for profile updates and meeting scheduling.
- All sensitive operations are logged for audit purposes.

---

## Contact & Support

For further assistance, contact the system owner or support team via the support chat page.

---

_End of Documentation_
