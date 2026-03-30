export default function RegisterLoading() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center p-8">
                <div className="relative size-12 flex flex-col items-center justify-between">
                    <div className="size-4 bg-slate-900 rounded-full shadow-lg animate-bounce" />
                    <div className="w-5 h-1 bg-slate-900/10 rounded-[100%] blur-[1px] animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-6 animate-pulse">
                    Loading
                </p>
            </div>
        </div>
    );
}
