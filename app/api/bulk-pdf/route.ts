import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { PDFDocument } from 'pdf-lib';
import { getAuthenticatedUser, unauthorizedResponse, forbiddenResponse, serverErrorResponse } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const auth = await getAuthenticatedUser();
        if (!auth) return unauthorizedResponse();

        const userId = auth.user.id;
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get('jobId');

        // Tier is already in auth — no need for a second DB query
        const isEnterprise = auth.tier === 'enterprise';

        if (!isEnterprise) {
            return forbiddenResponse('Enterprise subscription required for bulk PDF aggregation.');
        }

        // Data Acquisition — only from this user's jobs
        let applicationLinks: string[] = [];
        let displayTitle = "Candidate_Database";

        if (jobId) {
            // Verify job belongs to user first
            const { data: job } = await supabaseAdmin
                .from('jobs')
                .select('title')
                .eq('id', jobId)
                .eq('user_id', userId)
                .single();

            if (!job) {
                return NextResponse.json({ error: 'Job not found' }, { status: 404 });
            }
            displayTitle = job.title;

            const { data: apps } = await supabaseAdmin
                .from('applications')
                .select('resume_url')
                .eq('job_id', jobId)
                .not('resume_url', 'is', null);
            applicationLinks = apps?.map(a => a.resume_url) || [];
        } else {
            const { data: jobs } = await supabaseAdmin.from('jobs').select('id').eq('user_id', userId);
            const jobIds = jobs?.map(j => j.id) || [];
            displayTitle = "Global_CRM_Export";

            if (jobIds.length > 0) {
                const { data: apps } = await supabaseAdmin
                    .from('applications')
                    .select('resume_url')
                    .in('job_id', jobIds)
                    .not('resume_url', 'is', null);
                applicationLinks = apps?.map(a => a.resume_url) || [];
            }
        }

        if (applicationLinks.length === 0) {
            return NextResponse.json({ error: 'No candidate resumes found for the specified scope.' }, { status: 404 });
        }

        // Document Stitching
        const mergedPdf = await PDFDocument.create();
        let pdfCount = 0;

        for (const url of applicationLinks) {
            try {
                const res = await fetch(url);
                if (!res.ok) continue;
                
                const pdfBytes = await res.arrayBuffer();
                const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
                pdfCount++;
            } catch (err) {
                console.error(`Omission: Failed to process resume at ${url}:`, err);
            }
        }

        if (pdfCount === 0) {
            return NextResponse.json({ error: 'Unable to process any resumes.' }, { status: 500 });
        }

        const mergedPdfBytes = await mergedPdf.save();

        const dateStamp = new Date().toISOString().split('T')[0];
        const sanitizedTitle = displayTitle.replace(/[^a-z0-9]/gi, '_');
        const fileName = `${sanitizedTitle}_${dateStamp}_${pdfCount}.pdf`;

        return new NextResponse(mergedPdfBytes as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Cache-Control': 'no-store'
            },
        });

    } catch (error: any) {
        console.error('Core Bulk PDF Fault:', error);
        return serverErrorResponse();
    }
}
