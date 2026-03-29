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
                model: 'gemini-1.5-flash',
                generationConfig: { temperature: 0.25 }
            });

            const prompt = `You are an ATS analysis engine. Analyze this resume against the job posting.

If the document is NOT a resume (e.g. essay, assignment), return score 5 and say it's not a resume.

Return JSON with "score" (0-100) and "summary" (string).

Scoring: Title match starts at 75. +5 per matching skill. +10 for quantified achievements. +5 per relevant role. +15 if JD names a specific company and candidate worked there. Cap at 99.

Summary rules:
- Write EXACTLY 4 short paragraphs separated by newlines. Use simple, clear English.
- Mention specific skills, companies, and achievements from the resume.
- If the job description names a company and the candidate worked there, mention it clearly.
- The LAST paragraph MUST be a recommendation: clearly state whether this candidate is a good fit, a possible fit, or not a fit for this role.
- No bullet symbols, no asterisks. Just 4 clean short paragraphs.

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
            const jobDesc = (job.description || '').toLowerCase().trim();
            const jobTitleCap = job.title || 'the position';
            const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
            
            // ===== STEP 0: IS THIS ACTUALLY A RESUME? =====
            // Must have structured resume sections — random documents/essays/assignments will fail
            const resumeSectionHeaders = ['experience', 'education', 'skills', 'work history', 'employment', 
                'qualifications', 'certification', 'internship', 'area of expertise', 'additional information',
                'professional experience', 'work experience', 'career objective', 'personal profile'];
            const strongMarkers = resumeSectionHeaders.filter(m => textL.includes(m)).length;
            // Also check for structured resume patterns: name + email, date ranges, job titles
            const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText);
            const hasDateRanges = /\d{4}\s*[-–]\s*(present|\d{4})/i.test(resumeText);
            const hasStructuredSections = /^(experience|education|skills|summary|objective)/im.test(resumeText);
            const resumeConfidence = strongMarkers + (hasEmail ? 1 : 0) + (hasDateRanges ? 1 : 0) + (hasStructuredSections ? 1 : 0);
            const isResume = resumeConfidence >= 4;
            
            if (!isResume) {
                // NOT A RESUME
                analysis = {
                    score: Math.min(10, Math.max(3, strongMarkers * 3)),
                    summary: `The uploaded document does not appear to be a resume or CV. The system could not find standard resume sections like work experience, education, or skills in a structured format. Please upload a proper resume for ATS analysis against the ${jobTitleCap} position.`
                };
            } else {
                // ===== THIS IS A RESUME — FULL DEEP SCAN =====
                
                // --- 1. TITLE MATCH ---
                const stopWords = new Set(['and', 'the', 'for', 'with', 'are', 'who', 'have', 'has', 'been', 'that', 'this', 'from', 'will', 'our', 'you', 'your', 'looking', 'seeking', 'need', 'must', 'should', 'role', 'position', 'join', 'team', 'work', 'able']);
                const titleWords = jobTitle.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
                const titleMatches = titleWords.filter(w => textL.includes(w));
                const titleScore = titleWords.length > 0 ? (titleMatches.length / titleWords.length) : 0;
                
                // --- 2. JOB DESCRIPTION KEYWORD MATCH ---
                const jdWords = jobDesc.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
                const jdUniqueWords = Array.from(new Set(jdWords)) as string[];
                const jdMatchesInResume = jdUniqueWords.filter((w: string) => textL.includes(w));
                const jdOverlap = jdUniqueWords.length > 0 ? (jdMatchesInResume.length / jdUniqueWords.length) : 0;
                
                // --- 3. COMPANY NAME MATCHING ---
                const commonWords = new Set(['The', 'This', 'That', 'With', 'From', 'Have', 'Will', 'They', 'Their', 'Your', 'About', 'Must', 'Looking', 'Seeking', 'Content', 'Writer', 'Developer', 'Manager', 'Remote', 'Experience', 'Skills', 'Team', 'Work', 'Based', 'Company', 'Role', 'Position', 'Join', 'Apply', 'Linked', 'Online', 'Digital', 'Creative', 'Article', 'Blog', 'Video', 'Script', 'Website', 'Social', 'Media', 'Marketing', 'Design', 'Front', 'Full', 'Back', 'Data', 'Project', 'Senior', 'Junior', 'Lead', 'Head', 'Chief', 'Officer', 'Mode', 'Make', 'Good', 'Best', 'Great', 'High', 'Long', 'First', 'Last', 'Each', 'Both', 'More', 'Most', 'Some', 'Many', 'Such', 'Well', 'Also', 'Very', 'Just', 'Only', 'Even', 'Still', 'Like', 'Need', 'Know', 'Take', 'Come', 'Part', 'Over', 'After', 'Before', 'Between', 'Under', 'Into', 'Through', 'During', 'Without', 'Within', 'Along', 'Around', 'Every', 'Other', 'Being', 'Using', 'Working', 'Including', 'Able', 'Responsible', 'Strong', 'Excellent', 'Proven', 'Required', 'Minimum', 'Preferred', 'Ideal', 'Please', 'Provide', 'Ensure', 'Maintain', 'Support', 'Manage', 'Create', 'Build', 'Develop', 'Write']);
                const companyPatterns: string[] = (job.description || '').match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
                const uniqueCompanies = Array.from(new Set(companyPatterns.filter((c: string) => c.length > 3 && !commonWords.has(c) && !commonWords.has(c.split(' ')[0])))) as string[];
                const matchedCompanies = uniqueCompanies.filter((c: string) => textL.includes(c.toLowerCase()));
                const singleWordCompanies: string[] = (job.description || '').match(/\b[A-Z][a-z]{3,}\b/g) || [];
                const uniqueSingleCompanies = Array.from(new Set(singleWordCompanies.filter((c: string) => !commonWords.has(c)))) as string[];
                const matchedSingleCompanies = uniqueSingleCompanies.filter((c: string) => textL.includes(c.toLowerCase()));
                const allMatchedCompanies = Array.from(new Set([...matchedCompanies, ...matchedSingleCompanies]));
                
                // --- 4. SKILL MATCH ---
                const skillLibrary = [
                    'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'python', 'java', 'php',
                    'html', 'css', 'sql', 'mongodb', 'aws', 'docker', 'git', 'figma',
                    'wordpress', 'seo', 'content writing', 'content', 'writing', 'blog', 'article', 'copywriting',
                    'marketing', 'social media', 'analytics', 'excel', 'photoshop', 'canva', 'design', 'editing',
                    'management', 'leadership', 'communication', 'agile', 'scrum',
                    'machine learning', 'data analysis', 'api', 'graphql', 'next.js', 'tailwind',
                    'ui/ux', 'responsive', 'mobile', 'testing', 'semrush', 'rankmath',
                    'front-end', 'backend', 'full stack', 'devops', 'script writing', 'video'
                ];
                const resumeSkills = skillLibrary.filter(s => textL.includes(s));
                const jobSkills = skillLibrary.filter(s => jobDesc.includes(s) || jobTitle.includes(s));
                const matchedSkills = resumeSkills.filter(s => jobSkills.includes(s));
                const unmatchedJobSkills = jobSkills.filter(s => !matchedSkills.includes(s));
                const skillScore = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) : (resumeSkills.length > 3 ? 0.5 : 0.2);
                
                // --- 5. EXPERIENCE ---
                const dateRanges = textL.match(/(\d{4})\s*[-–]\s*(present|\d{4})/gi) || [];
                const expCount = dateRanges.length;
                const quantifiedAll = resumeText.match(/(\d+)\+?\s*(articles?|blogs?|scripts?|projects?|clients?|videos?|years?|reels?)/gi) || [];
                const quantifiedStr = quantifiedAll.slice(0, 4).join(', ').replace(/\s+/g, ' ').trim();
                const isRemote = /remote/i.test(resumeText);
                
                // --- 6. EDUCATION (strict: must be in a resume education section context) ---
                const eduSectionMatch = resumeText.match(/(?:EDUCATION|ACADEMIC|QUALIFICATION)[S]?\s*\n([\s\S]{10,300}?)(?=\n[A-Z]{3,}|\n\n|$)/i);
                const eduDetail = eduSectionMatch ? eduSectionMatch[1].split('\n').filter(l => l.trim().length > 5).slice(0, 2).join(', ').trim() : '';
                const hasEdu = eduDetail.length > 10;
                const langMatch = resumeText.match(/Languages?:\s*([^\n]{5,80})/i);
                const languages = langMatch ? langMatch[1].trim() : '';
                
                // --- 7. COMPOSITE SCORE ---
                let fuzzyTitleBoost = 0;
                for (const tw of titleWords) {
                    if (!textL.includes(tw)) {
                        const prefix = tw.slice(0, Math.max(3, tw.length - 2));
                        if (textL.includes(prefix)) fuzzyTitleBoost += 0.3;
                    }
                }
                const adjustedTitleScore = Math.min(1, titleScore + (fuzzyTitleBoost / Math.max(1, titleWords.length)));
                
                let score = 0;
                score += adjustedTitleScore * 25;
                score += skillScore * 15;
                score += Math.min(jdOverlap * 25, 15);
                score += allMatchedCompanies.length > 0 ? 20 : 0;
                score += Math.min(expCount * 2.5, 10);
                score += quantifiedAll.length > 0 ? 8 : 0;
                score += hasEdu ? 5 : 1;
                if (adjustedTitleScore >= 0.5 && allMatchedCompanies.length > 0) score += 5;
                if (allMatchedCompanies.length > 0 && quantifiedAll.length > 0) score += 5;
                if (adjustedTitleScore >= 0.5 && skillScore >= 0.5) score += 3;
                if (expCount >= 4 && quantifiedAll.length > 0) score += 3;
                
                const finalScore = Math.min(99, Math.max(10, Math.round(score)));
                const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
                const topMatchedSkills = matchedSkills.slice(0, 6).map(cap);
                
                // --- 8. OVERVIEW GENERATION (3-4 concise bullets) ---
                const bullets: string[] = [];
                

                // BULLET 1: Core fit & Title alignment
                if (adjustedTitleScore > 0.5) {
                    bullets.push(`The candidate's field of expertise and professional title show strong alignment with the ${jobTitleCap} role.`);
                } else if (adjustedTitleScore > 0.1) {
                    bullets.push(`The candidate's background shows a partial match for the ${jobTitleCap} role, though their job title is not a direct correspondence.`);
                } else {
                    bullets.push(`This candidate's core background is outside the immediate scope of the ${jobTitleCap} position requirements.`);
                }

                // BULLET 2: Job-specific matches (Company + Skills)
                const specMatch: string[] = [];
                if (allMatchedCompanies.length > 0) {
                    specMatch.push(`notable direct experience at ${allMatchedCompanies.join(', ')} (referenced in job description)`);
                }
                if (topMatchedSkills.length > 0) {
                    specMatch.push(`proficiency in key skills like ${topMatchedSkills.join(', ')}`);
                }
                if (isRemote) {
                    specMatch.push('demonstrated experience in remote work environments');
                }
                
                if (specMatch.length > 0) {
                    bullets.push(`A detailed scan reveals ${specMatch.join(', ')}.`);
                }
                
                // BULLET 2: Experience, output, and education — combined naturally
                const detailParts: string[] = [];
                if (expCount > 0) detailParts.push(`${expCount} professional role${expCount > 1 ? 's' : ''}`);
                if (quantifiedStr) detailParts.push(`measurable output including ${quantifiedStr}`);
                if (hasEdu) detailParts.push(`education in ${eduDetail}`);
                if (languages) detailParts.push(`language skills in ${languages}`);
                
                if (detailParts.length > 0) {
                    bullets.push(`Their resume shows ${detailParts.join(', ')}.`);
                }
                
                // BULLET 3: Clear recommendation
                if (finalScore >= 80) {
                    bullets.push(`Overall, this candidate is a strong fit for the ${jobTitleCap} role and is recommended for interview.`);
                } else if (finalScore >= 60) {
                    bullets.push(`This candidate is a possible fit for the ${jobTitleCap} role.${unmatchedJobSkills.length > 0 ? ` They lack some required skills like ${unmatchedJobSkills.slice(0, 2).map(cap).join(', ')}.` : ''} An interview would help evaluate further.`);
                } else if (finalScore >= 35) {
                    bullets.push(`This candidate is a weak fit for the ${jobTitleCap} role. Their background does not meet most of the job requirements.`);
                } else {
                    bullets.push(`This candidate is not a fit for the ${jobTitleCap} role. Their resume does not match the required skills or experience.`);
                }
                
                analysis = {
                    score: finalScore,
                    summary: bullets.join('\n')
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

