# Recruit Flow - AI Recruitment Intelligence 🚀

Recruit Flow is a high-fidelity recruitment platform designed to synchronize candidates and hiring squads through mission-critical AI intelligence. It leverages a modern tech stack to provide automated resume analysis, candidate evaluation dossiers, and a premium recruiter experience.

## ✨ High-Fidelity Features

- **AI-Powered Dossiers**: Automated generation of intelligence summaries and match scores using Gemini AI.
- **Interactive Resume Flipbook**: A sleek, high-performance viewer for reviewing candidate resumes and evaluations.
- **ATS Matrix Dashboard**: A central intelligence hub for managing applications across multiple tiers.
- **Tiered Engagement**: Integrated support for Essential, Pro, and Enterprise recruitment squads.
- **Smart Form Processing**: Manual form data synchronization ensuring 100% integrity of candidate profile links (LinkedIn, GitHub, etc.).
- **Privacy-First Architecture**: Comprehensive privacy protocols and secure data handling.

## 🛠️ Technology Architecture

- **Frontend**: Next.js 15+ (App Router), React, Framer Motion, Lucide Icons.
- **Styling**: Tailwind CSS with a custom design system for a premium aesthetic.
- **Intelligence**: Gemini 1.5 Flash (Google Generative AI).
- **Storage & DB**: Supabase (PostgreSQL, Auth, and Storage).
- **PDF Infrastructure**: PDF.js for robust client-side and server-side text extraction.

## 🚀 Deployment & Installation

### 1. Synchronize the Repository
```bash
git clone https://github.com/your-username/recruit-flow.git
cd recruit-flow
```

### 2. Configure Local Infrastructure
Create a `.env.local` file in the root directory and populate it with your mission-critical credentials:
```env
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
GEMINI_API_KEY="YOUR_GEMINI_KEY"

# EMAIL SETUP (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER="your.email@example.com"
SMTP_PASS="your_app_password"
```

### 3. Initialize Operations
```bash
npm install
npm run dev
```

## 🔒 Security & Privacy

This platform implements robust administrative protocols. Credentials and sensitive synchronization keys are stored exclusively in local environment variables and are excluded from version control via `.gitignore`. 

For inquiries regarding the privacy framework, please reach out to: `recruitflow@ujjwalrupakheti.com.np`

---

**Built with Precision by Recruit Flow Squad.**
