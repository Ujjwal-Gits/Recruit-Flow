# Recruit Flow — AI-Powered Recruitment Platform

A full-stack recruitment management platform that uses AI to process resumes, score candidates, and help recruiters make faster hiring decisions. Built with Next.js 15, Supabase, and Google Gemini.

---

## What it does

Recruiters post jobs, share a public application link, and candidates submit their resumes. The system automatically extracts text from the PDF, runs it through Gemini AI to generate an ATS score (0–100) and a written summary, then presents everything in a clean flipbook interface. Recruiters can accept/reject candidates, send emails, schedule interviews, and chat with an AI assistant about their candidate pool.

There's also a full admin panel for the platform owner to manage users, handle support tickets, process upgrade requests, and track revenue.

---

## Features

### For Recruiters

- **Job Postings** — create jobs with title, work mode, deadline, education/experience requirements, and job type
- **AI Job Description Generator** — type a job title and click one button to get a full professional description (Pro/Enterprise)
- **Public Apply Link** — each job gets a shareable link where candidates submit their resume
- **Resume Flipbook** — browse candidate resumes in a page-flip interface (Pro/Enterprise)
- **ATS Scoring** — every resume gets an AI-generated score and written analysis
- **Candidate CRM** — searchable table of all applicants across all jobs (Pro/Enterprise)
- **Bulk Email** — send emails to accepted/rejected/all candidates at once
- **Interview Calendar** — schedule and track interviews with conflict detection (Enterprise)
- **Bulk PDF Export** — download all candidate resumes merged into one PDF (Enterprise)
- **AI Candidate Shortlist** — one-time AI ranking of top 5 candidates per job with explanations (Enterprise)
- **AI Recruiter Chat** — ask questions about your candidate pool, get data-driven answers

### For Admins (Owner/Manager/Support)

- **User Management** — view all users, upgrade/downgrade tiers, manage roles
- **Support Queue** — handle support tickets from recruiters
- **Activation Hub** — process upgrade requests from users
- **Fiscal Assets** — view all transactions and invoices
- **Staff Terminal** — add/remove support staff and managers
- **Action History** — audit log of admin actions (persists across sessions)

### Auth & Security

- Email + OTP registration (6-digit code, 2-minute expiry)
- Google OAuth login
- Password reset via OTP
- Role-based access: `owner`, `manager`, `support`, `recruiter`
- Tier-based feature gating: `essential`, `pro`, `enterprise`
- JWT caching to reduce auth server round-trips
- Rate limiting on all auth endpoints
- RLS policies on all database tables

---

## Tech Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| Framework    | Next.js 15 (App Router)                         |
| Frontend     | React 19, Tailwind CSS, Framer Motion           |
| Database     | Supabase (PostgreSQL)                           |
| Auth         | Supabase Auth + custom OTP                      |
| Storage      | Supabase Storage (resumes, logos)               |
| AI           | Google Gemini 2.5 Flash                         |
| PDF (server) | pdf-lib (merging), pdfjs-dist (text extraction) |
| Email        | Nodemailer (SMTP) or Resend                     |
| Charts       | Recharts                                        |
| Icons        | Lucide React                                    |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)
- A Gmail account with App Password, or a [Resend](https://resend.com) account

### 1. Clone and install

```bash
git clone https://github.com/Ujjwal-Gits/Recruit-Flow.git
cd resume-flipbook
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

```env
# Supabase — get these from your project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini — from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_key

# Email — Gmail with App Password (Settings > Security > App Passwords)
EMAIL_STRATEGY=smtp
EMAIL_FROM="Recruit Flow <you@gmail.com>"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@gmail.com
SMTP_PASS=your_app_password

# Contact form destination
CONTACT_EMAIL=you@yourdomain.com
```

Optional (for seeding demo accounts):

```env
ADMIN_EMAIL=owner@example.com
SUPPORT_EMAIL=support@example.com
PRO_EMAIL=pro@example.com
FREE_EMAIL=free@example.com
DEFAULT_PASSWORD=SecurePassword123!
```

### 3. Set up the database

Go to your Supabase project → SQL Editor and run the contents of `MIGRATION.sql`. This creates all tables, indexes, and RLS policies.

You also need to create a storage bucket:

- Go to Supabase → Storage → New Bucket
- Name: `resumes`
- Toggle **Public** on

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Seed demo accounts (optional)

Visit `http://localhost:3000/api/auth/seed?secret=terminal-recovery` to create demo accounts for testing different roles and tiers.

---

## Project Structure

```
resume-flipbook/
├── app/
│   ├── api/                    # All API routes (Next.js route handlers)
│   │   ├── auth/               # Login, register, OTP, password reset
│   │   ├── iamadmin/           # Admin dashboard data + verify endpoint
│   │   ├── ai-generate-jd/     # AI job description generator
│   │   ├── ai-shortlist/       # AI candidate shortlisting (Enterprise)
│   │   ├── job/                # Job + applicants data for flipbook
│   │   ├── jobs/               # Job list for dashboard
│   │   ├── crm/                # CRM candidates endpoint
│   │   ├── meetings/           # Interview scheduling
│   │   ├── support/            # Support chat messages
│   │   ├── bulk-pdf/           # Merge all resumes into one PDF
│   │   ├── process-application/# CV upload, AI analysis, DB save
│   │   └── profile/            # User profile read/update
│   ├── dashboard/              # Recruiter dashboard page
│   ├── iamadmin/               # Admin panel page
│   ├── apply/[jobId]/          # Public job application page
│   ├── login/                  # Login page
│   ├── register/               # Registration + OTP verification
│   └── pricing/                # Pricing page
├── components/
│   ├── DashboardClient.tsx     # Main recruiter dashboard (jobs, CRM, calendar, etc.)
│   ├── AdminDashboardClient.tsx# Admin panel (users, support, billing, etc.)
│   ├── JobFlipbookClient.tsx   # Candidate review page with flipbook + AI chat
│   ├── ApplyPageClient.tsx     # Public application page
│   ├── SupportChat.tsx         # Floating support/upgrade chat widget
│   └── dashboard/
│       ├── CRMSection.tsx      # Candidate CRM table
│       └── CalendarSection.tsx # Interview calendar
├── lib/
│   ├── auth-guard.ts           # Server-side auth with JWT caching
│   ├── supabase.ts             # Browser Supabase client
│   ├── supabase-server.ts      # Server-side Supabase client (cookies)
│   ├── supabase-admin.ts       # Admin client (bypasses RLS)
│   ├── auth-utils.ts           # Rate limiting, OTP generation, validation
│   └── email.ts                # Email sending (SMTP or Resend)
├── middleware.ts               # Route protection + JWT caching
├── MIGRATION.sql               # Full database schema + indexes + RLS policies
└── .env.example                # Template for environment variables
```

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Deploy

For best performance, set your Supabase project region to match your Vercel deployment region (e.g., `ap-southeast-1` for Asia).

### Environment notes for production

- The `secure` cookie flag is automatically handled — cookies are set to `SameSite=lax` which works on both HTTP (dev) and HTTPS (prod)
- `removeConsole` is enabled in production builds — no logs leak to client
- Static assets have 1-year cache headers set in `next.config.js`

---

## Tier Limits

| Feature                | Essential (Free) | Pro | Enterprise       |
| ---------------------- | ---------------- | --- | ---------------- |
| Active job postings    | 1                | 4   | 10               |
| CV processing capacity | 5                | 30  | 200              |
| Flipbook viewer        | ✗                | ✓   | ✓                |
| Candidate CRM          | ✗                | ✓   | ✓                |
| AI summaries           | ✗                | ✓   | ✓                |
| Email workflows        | ✗                | ✓   | ✓                |
| AI job description     | ✗                | ✓   | ✓                |
| Interview calendar     | ✗                | ✗   | ✓                |
| Bulk PDF export        | ✗                | ✗   | ✓                |
| AI candidate shortlist | ✗                | ✗   | ✓ (once per job) |

---

## License

Private — all rights reserved.
