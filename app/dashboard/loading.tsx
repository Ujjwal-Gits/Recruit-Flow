// This file is shown INSTANTLY when navigating to /dashboard
// before the page component finishes loading.
// It mirrors the exact dashboard skeleton so there's no blank flash.

export default function DashboardLoading() {
    const Sk = ({ className = '' }: { className?: string }) => (
        <div className={`bg-slate-100 rounded-sm relative overflow-hidden ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fafafa] flex">
            <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>
            <aside className="w-64 bg-white border-r border-slate-100 h-screen fixed left-0 top-0 hidden lg:flex flex-col">
                <div className="p-8 border-b border-slate-100 mb-6 flex items-center gap-2">
                    <Sk className="h-8 w-24" /><Sk className="h-5 w-10" />
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    {['w-24','w-28','w-24','w-32','w-36','w-32'].map((w,i)=>(
                        <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-sm ${i===0?'bg-slate-100':''}`}>
                            <Sk className="h-4 w-4" /><Sk className={`h-3 ${w}`} />
                        </div>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-50">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-sm mb-3">
                        <Sk className="h-10 w-10 shrink-0" />
                        <div className="flex-1 space-y-1.5"><Sk className="h-3 w-28" /><Sk className="h-2.5 w-16" /></div>
                    </div>
                </div>
            </aside>
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center px-5 z-10">
                <Sk className="h-6 w-24" />
            </div>
            <main className="lg:ml-64 flex-1 min-h-screen pt-16 lg:pt-0">
                <div className="hidden lg:flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
                    <div className="space-y-2"><Sk className="h-2.5 w-16" /><Sk className="h-7 w-40" /></div>
                    <div className="flex gap-3"><Sk className="h-9 w-24" /><Sk className="h-9 w-36" /></div>
                </div>
                <div className="p-6 lg:p-8">
                    <div className="flex gap-2 mb-6"><Sk className="h-8 w-20" /><Sk className="h-8 w-20" /><Sk className="h-8 w-20" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {[...Array(3)].map((_,i)=>(
                            <div key={i} className="bg-white border border-slate-100 rounded-sm p-6 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-2 flex-1"><Sk className="h-5 w-3/4" /><Sk className="h-3 w-1/2" /></div>
                                    <Sk className="h-6 w-14 rounded-full shrink-0" />
                                </div>
                                <div className="flex gap-2"><Sk className="h-6 w-16 rounded-full" /><Sk className="h-6 w-20 rounded-full" /></div>
                                <div className="flex items-center gap-4 py-2 border-t border-slate-50"><Sk className="h-3 w-10" /><Sk className="h-3 w-16" /></div>
                                <div className="flex gap-2"><Sk className="h-9 flex-1" /><Sk className="h-9 w-9" /><Sk className="h-9 w-9" /></div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
