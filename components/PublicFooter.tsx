import Link from 'next/link';

export default function PublicFooter() {
    return (
        <footer className="bg-white pt-16 pb-10 px-6 border-t border-slate-100">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2">
                        <div className="h-9 w-auto mb-5">
                            <img src="/recruit-flow-logo.png" alt="Recruit Flow" className="h-full w-auto object-contain" />
                        </div>
                        <p className="text-slate-500 text-sm max-w-xs leading-relaxed font-medium mb-5">
                            AI-powered recruitment platform. Screen resumes, manage candidates, and hire faster.
                        </p>
                        <Link href="/register" className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                            Start Free
                        </Link>
                    </div>
                    <div>
                        <h5 className="font-black text-[10px] mb-5 uppercase tracking-[0.2em] text-slate-400">Product</h5>
                        <ul className="space-y-3 text-sm font-medium text-slate-500">
                            <li><Link className="hover:text-slate-900 transition-colors" href="/features">Features</Link></li>
                            <li><Link className="hover:text-slate-900 transition-colors" href="/how-it-works">How It Works</Link></li>
                            <li><Link className="hover:text-slate-900 transition-colors" href="/pricing">Pricing</Link></li>
                            <li><Link className="hover:text-slate-900 transition-colors" href="/changelog">Changelog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-black text-[10px] mb-5 uppercase tracking-[0.2em] text-slate-400">Company</h5>
                        <ul className="space-y-3 text-sm font-medium text-slate-500">
                            <li><Link className="hover:text-slate-900 transition-colors" href="/about">About Us</Link></li>
                            <li><Link className="hover:text-slate-900 transition-colors" href="/use-cases">Use Cases</Link></li>
                            <li><Link className="hover:text-slate-900 transition-colors" href="/security">Security</Link></li>
                            <li><Link className="hover:text-slate-900 transition-colors" href="/careers">Careers</Link></li>
                            <li><Link className="hover:text-slate-900 transition-colors" href="/contact">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-black text-[10px] mb-5 uppercase tracking-[0.2em] text-slate-400">Resources</h5>
                        <ul className="space-y-3 text-sm font-medium text-slate-500">
                            <li><Link className="hover:text-slate-900 transition-colors" href="/blog">Blog</Link></li>
                            <li><Link className="hover:text-slate-900 transition-colors" href="/blog/ai-resume-screening-guide">AI Screening Guide</Link></li>
                            <li><Link className="hover:text-slate-900 transition-colors" href="/blog/reduce-time-to-hire">Reduce Time-to-Hire</Link></li>
                            <li><Link className="hover:text-slate-900 transition-colors" href="/blog/ats-score-optimization">ATS Score Guide</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                        © 2026 Recruit Flow. All rights reserved.
                    </span>
                    <div className="flex gap-6 font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                        <Link className="hover:text-slate-900 transition-colors" href="/privacy">Privacy Policy</Link>
                        <Link className="hover:text-slate-900 transition-colors" href="/terms">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
