import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, securityHeaders } from '@/lib/auth-utils';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Initialize PDF.js worker for Node.js environment
const pdfjsWorker = require('pdfjs-dist/legacy/build/pdf.worker.js');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        const data = new Uint8Array(buffer);
        const loadingTask = pdfjsLib.getDocument({
            data,
            useSystemFonts: true,
            disableFontFace: true,
            isEvalSupported: false
        });
        
        const pdf = await loadingTask.promise;
        let fullText = '';
        const numPages = Math.min(pdf.numPages, 12); // Extraction cap

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .filter((item: any) => 'str' in item)
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n';
        }
        return fullText.trim();
    } catch (error) {
        console.error('PDF Extraction Local Error:', error);
        return 'Extraction failed. Raw document submitted.';
    }
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    const headers = securityHeaders();
    try {
        // 1. Rate Limiting (Prevent DDoS/spam)
        const ip = getClientIP(req);
        const rateCheck = await checkRateLimit(ip, 'api/process-application');
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Too many attempts. Retry after ${rateCheck.retryAfter}s.` },
                { status: 429, headers }
            );
        }

        const formData = await req.formData();
        const jobId = formData.get('jobId') as string;
        const name = String(formData.get('name') || '').trim().slice(0, 100);
        const email = String(formData.get('email') || '').trim().toLowerCase().slice(0, 255);
        const file = formData.get('file') as File;

        // 2. Strict Validation
        if (!jobId || !name || !email || !file) {
            return NextResponse.json({ error: 'Missing required application data' }, { status: 400, headers });
        }

        // 3. File Security (Size & Type)
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400, headers });
        }
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only PDF and Word documents are accepted.' }, { status: 400, headers });
        }

        // 3.1 Extract Text from PDF (Server-Side)
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const resumeText = await extractTextFromPdf(buffer);

        // 4. Upload to Cloud (Sanitize Filename)
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
        const safeExt = ['pdf', 'doc', 'docx'].includes(fileExt) ? fileExt : 'pdf';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${safeExt}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from('resumes')
            .upload(fileName, arrayBuffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error('File Upload Error:', uploadError);
            return NextResponse.json({ error: 'Storage failure' }, { status: 500, headers });
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('resumes')
            .getPublicUrl(fileName);

        // 5. Job Context Security
        const { data: job } = await supabaseAdmin
            .from('jobs')
            .select('title, description, user_id')
            .eq('id', jobId)
            .single();

        if (!job) {
            return NextResponse.json({ error: 'Invalid job identifier' }, { status: 404, headers });
        }

        // TIER LIMIT ENFORCEMENT for CV Processing
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('tier')
            .eq('id', job.user_id)
            .single();

        const tier = profile?.tier || 'essential';
        const capacityLimit = tier === 'enterprise' ? 200 : (tier === 'pro' ? 30 : 5);

        // Fetch user's job IDs to check total applications across all jobs for strictly tracking CV Processing Capacity
        const { data: userJobs } = await supabaseAdmin.from('jobs').select('id').eq('user_id', job.user_id);
        const jobIds = userJobs?.map(j => j.id) || [];
        
        let appCount = 0;
        if (jobIds.length > 0) {
            const { count } = await supabaseAdmin
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .in('job_id', jobIds);
            appCount = count || 0;
        }

        if (appCount >= capacityLimit) {
            return NextResponse.json({ error: `CV Processing Capacity Reached. This account supports up to ${capacityLimit} CVs.` }, { status: 403, headers });
        }

        const jobContext = `Position: ${job.title}\nRole requirements: ${job.description}`;

        // ===================== ATS INTELLIGENCE ENGINE =====================
        let analysis = { score: 50, summary: "Profile under review." };
        try {
            const model = genAI.getGenerativeModel({ 
                model: 'gemini-2.5-flash',
                generationConfig: { temperature: 0.2 }
            });

            const prompt = `You are a professional ATS (Applicant Tracking System) scoring engine used by real recruiters. Analyze this resume against the job description and produce an accurate, unbiased score.

IMPORTANT RULES:
- Score based ONLY on what is in the resume vs what the job requires
- Do NOT give bonus points for company names mentioned in the job description — candidates never worked at the hiring company
- Do NOT inflate scores — be honest and calibrated
- A score of 90+ means the candidate is an exceptional match. 70-89 is a good match. 50-69 is partial. Below 50 is a weak match.

SCORING CRITERIA (total 100 points):
1. Skills match (35 pts): How many required skills/tools from the JD appear in the resume? Score proportionally.
2. Experience relevance (25 pts): Does the candidate's work history align with the role's responsibilities? Consider years of experience, seniority level, and domain.
3. Job title alignment (20 pts): How closely does the candidate's current/recent title match the target role?
4. Education fit (10 pts): Does the candidate meet the education requirements stated or implied by the role?
5. Achievements & impact (10 pts): Does the resume show measurable results, not just responsibilities?

Return JSON with "score" (0-100) and "summary" (string).

Summary rules:
- Write EXACTLY 4 short paragraphs separated by newlines.
- Paragraph 1: Overall fit assessment — be direct and specific.
- Paragraph 2: Key strengths from the resume relevant to this role.
- Paragraph 3: Gaps or missing requirements.
- Paragraph 4: Clear recommendation — strong fit / possible fit / not a fit — and why.
- No bullet symbols, no asterisks, no markdown. Plain text only.

JOB: ${jobContext}

RESUME: ${resumeText.slice(0, 15000)}

Return ONLY valid JSON: {"score": number, "summary": "string"}`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                analysis = {
                    score: Math.min(100, Math.max(0, parseInt(String(parsed.score)))),
                    summary: String(parsed.summary || "No summary").slice(0, 2000)
                };
            }
        } catch (e: any) {
            console.error("AI Analysis failed, using local engine:", e?.message);
            
            // ==================== LOCAL ATS ENGINE (Fallback) ====================
            const textL = resumeText.toLowerCase();
            const jobTitle = (job.title || '').toLowerCase().trim();
            const jobTitleCap = job.title || 'the position';

            let jobDescText = job.description || '';
            try { jobDescText = JSON.parse(job.description).text || job.description; } catch {}
            const jobDesc = jobDescText.toLowerCase().trim();

            // ===== STEP 0: IS THIS ACTUALLY A RESUME? =====
            const resumeSectionHeaders = ['experience', 'education', 'skills', 'work history', 'employment',
                'qualifications', 'certification', 'internship', 'professional experience', 'work experience',
                'career objective', 'personal profile', 'summary', 'objective'];
            const strongMarkers = resumeSectionHeaders.filter(m => textL.includes(m)).length;
            const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText);
            const hasDateRanges = /\d{4}\s*[-–]\s*(present|\d{4})/i.test(resumeText);
            const resumeConfidence = strongMarkers + (hasEmail ? 1 : 0) + (hasDateRanges ? 1 : 0);
            const isResume = resumeConfidence >= 3;

            if (!isResume) {
                analysis = {
                    score: Math.min(10, Math.max(3, strongMarkers * 2)),
                    summary: `The uploaded document does not appear to be a resume or CV. Standard resume sections like work experience, education, or skills were not found. Please upload a proper resume for ATS analysis against the ${jobTitleCap} position.`
                };
            } else {
                // ===== FACTOR 1: SKILLS MATCH (35 points) =====
                // Extract skills from job description using a broad library
                const techSkills = [
                    'javascript','typescript','react','angular','vue','node','python','java','php','ruby','go','rust','swift','kotlin',
                    'html','css','sass','tailwind','bootstrap','sql','mysql','postgresql','mongodb','redis','elasticsearch',
                    'aws','azure','gcp','docker','kubernetes','terraform','ci/cd','git','linux','bash',
                    'figma','sketch','photoshop','illustrator','canva','adobe','ui/ux','wireframing','prototyping',
                    'machine learning','deep learning','tensorflow','pytorch','data science','data analysis','pandas','numpy',
                    'seo','sem','google analytics','google ads','facebook ads','social media','content marketing','email marketing','copywriting',
                    'project management','agile','scrum','jira','confluence','product management','roadmap',
                    'excel','powerpoint','word','tableau','power bi','salesforce','hubspot','zendesk',
                    'accounting','finance','bookkeeping','quickbooks','financial analysis','budgeting',
                    'communication','leadership','teamwork','problem solving','critical thinking','time management',
                    'customer service','sales','negotiation','presentation','public speaking',
                    'writing','editing','research','content creation','video editing','photography',
                    'next.js','express','django','flask','spring','laravel','wordpress','shopify',
                    'rest api','graphql','microservices','devops','testing','qa','automation',
                    'networking','cybersecurity','cloud computing','blockchain','iot',
                ];
                const jdSkills = techSkills.filter(s => jobDesc.includes(s) || jobTitle.includes(s));
                const resumeSkills = techSkills.filter(s => textL.includes(s));
                const matchedSkills = jdSkills.filter(s => resumeSkills.includes(s));
                const skillMatchRatio = jdSkills.length > 0 ? matchedSkills.length / jdSkills.length : (resumeSkills.length > 2 ? 0.4 : 0.15);
                const skillPoints = Math.round(skillMatchRatio * 35);

                // ===== FACTOR 2: EXPERIENCE RELEVANCE (25 points) =====
                const dateRanges = textL.match(/\d{4}\s*[-–]\s*(present|\d{4})/gi) || [];
                const roleCount = dateRanges.length;
                // Check if job description keywords appear in resume context (not just anywhere)
                const stopWords = new Set(['and','the','for','with','are','who','have','has','been','that','this','from','will','our','you','your','looking','seeking','need','must','should','role','position','join','team','work','able','using','including','responsible','strong','excellent','proven','required','minimum','preferred','ideal','please','provide','ensure','maintain','support','manage','create','build','develop','write','good','best','great','high','long','first','last','each','both','more','most','some','many','such','well','also','very','just','only','even','still','like','need','know','take','come','part','over','after','before','between','under','into','through','during','without','within','along','around','every','other','being']);
                const jdKeywords = jobDesc.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 4 && !stopWords.has(w));
                const uniqueJdKeywords = Array.from(new Set(jdKeywords)) as string[];
                const keywordMatches = uniqueJdKeywords.filter(w => textL.includes(w)).length;
                const keywordOverlap = uniqueJdKeywords.length > 0 ? keywordMatches / uniqueJdKeywords.length : 0;
                const expPoints = Math.round(
                    Math.min(15, roleCount * 3) + // up to 15 pts for number of roles
                    Math.min(10, keywordOverlap * 20) // up to 10 pts for keyword overlap
                );

                // ===== FACTOR 3: JOB TITLE ALIGNMENT (20 points) =====
                const titleWords = jobTitle.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
                const titleMatches = titleWords.filter(w => textL.includes(w));
                const titleRatio = titleWords.length > 0 ? titleMatches.length / titleWords.length : 0;
                // Fuzzy match — partial word stems
                let fuzzyBoost = 0;
                for (const tw of titleWords) {
                    if (!textL.includes(tw) && tw.length > 4) {
                        const stem = tw.slice(0, Math.max(4, tw.length - 2));
                        if (textL.includes(stem)) fuzzyBoost += 0.25;
                    }
                }
                const adjustedTitleRatio = Math.min(1, titleRatio + (fuzzyBoost / Math.max(1, titleWords.length)));
                const titlePoints = Math.round(adjustedTitleRatio * 20);

                // ===== FACTOR 4: EDUCATION FIT (10 points) =====
                const hasEduSection = /education|academic|qualification|degree|bachelor|master|diploma|university|college/i.test(resumeText);
                const hasDegree = /bachelor|b\.sc|b\.tech|b\.e\.|master|m\.sc|m\.tech|mba|phd|diploma|graduate/i.test(resumeText);
                const eduPoints = hasEduSection ? (hasDegree ? 10 : 6) : 2;

                // ===== FACTOR 5: ACHIEVEMENTS & IMPACT (10 points) =====
                const quantifiedAchievements = resumeText.match(/\d+[\+%]?\s*(years?|months?|projects?|clients?|users?|employees?|team|revenue|sales|growth|increase|decrease|reduction|improvement|million|thousand|hundred|k\b)/gi) || [];
                const achievementPoints = Math.min(10, quantifiedAchievements.length * 2);

                // ===== COMPOSITE SCORE =====
                const rawScore = skillPoints + expPoints + titlePoints + eduPoints + achievementPoints;
                const finalScore = Math.min(97, Math.max(8, rawScore));

                // ===== SUMMARY GENERATION =====
                const topSkills = matchedSkills.slice(0, 5).map(s => s.charAt(0).toUpperCase() + s.slice(1));
                const missingSkills = jdSkills.filter(s => !matchedSkills.includes(s)).slice(0, 3).map(s => s.charAt(0).toUpperCase() + s.slice(1));

                let para1 = '';
                if (finalScore >= 80) para1 = `This candidate is a strong match for the ${jobTitleCap} role. Their background closely aligns with the position requirements.`;
                else if (finalScore >= 60) para1 = `This candidate shows a reasonable match for the ${jobTitleCap} role with some relevant experience, though there are areas that need evaluation.`;
                else if (finalScore >= 40) para1 = `This candidate is a partial match for the ${jobTitleCap} role. Their background covers some requirements but misses key areas.`;
                else para1 = `This candidate does not appear to be a strong match for the ${jobTitleCap} role based on the resume content.`;

                const para2 = topSkills.length > 0
                    ? `Key strengths include proficiency in ${topSkills.join(', ')}. The resume shows ${roleCount > 0 ? `${roleCount} professional role${roleCount > 1 ? 's' : ''}` : 'limited documented experience'}.${quantifiedAchievements.length > 0 ? ' Measurable achievements are present in the resume.' : ''}`
                    : `The resume does not clearly demonstrate the specific technical skills required for this role.`;

                const para3 = missingSkills.length > 0
                    ? `Notable gaps include: ${missingSkills.join(', ')}. ${!hasDegree ? 'Educational qualifications are not clearly stated.' : ''}`
                    : `No significant skill gaps were identified based on the job description requirements.`;

                let para4 = '';
                if (finalScore >= 80) para4 = `Recommendation: Strong fit. This candidate is recommended for an interview.`;
                else if (finalScore >= 60) para4 = `Recommendation: Possible fit. An initial screening call would help determine suitability.`;
                else if (finalScore >= 40) para4 = `Recommendation: Weak fit. Consider only if the candidate pool is limited.`;
                else para4 = `Recommendation: Not a fit. The resume does not meet the core requirements for this role.`;

                analysis = {
                    score: finalScore,
                    summary: [para1, para2, para3, para4].join('\n')
                };
            }
        }

        // Extract provided links from form fields (sent as a dedicated JSON payload)
        const linksJson = String(formData.get('linksJson') || '[]');
        let providedLinks = '';
        try {
            const manualLinks = JSON.parse(linksJson);
            if (Array.isArray(manualLinks) && manualLinks.length > 0) {
                providedLinks = '\n\n--- PROVIDED CANDIDATE LINKS ---\n' + 
                    manualLinks.map(l => `${l.label}: ${l.url}`).join('\n');
            }
        } catch (e) {
            console.warn('Manual links parsing failed:', e);
        }

        const finalAiSummary = (analysis.summary || '').trim() + providedLinks;

        // 7. Save to DB
        const { error: dbError } = await supabaseAdmin
            .from('applications')
            .insert({
                job_id: jobId,
                candidate_name: name,
                email: email,
                resume_url: publicUrl,
                ai_summary: finalAiSummary,
                ats_score: analysis.score
            });

        if (dbError) {
            console.error('DB Error:', dbError);
            return NextResponse.json({ error: 'Synchronization failure' }, { status: 500, headers });
        }

        return NextResponse.json({ success: true }, { headers });
    } catch (error: any) {
        console.error('Processing error:', error);
        return NextResponse.json({ error: 'Internal system fault' }, { status: 500, headers });
    }
}

