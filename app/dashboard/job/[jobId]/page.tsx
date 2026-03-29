import dynamic from 'next/dynamic';

const JobFlipbookClient = dynamic(() => import('@/components/JobFlipbookClient'), {
    loading: () => (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <div className="size-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        </div>
    )
});

export default async function JobFlipbookPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = await params;
    return <JobFlipbookClient jobId={jobId} />;
}
