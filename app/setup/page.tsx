'use client';

import { useState } from 'react';
import { ArrowRight, Check, Copy, ExternalLink, Database, AlertCircle } from 'lucide-react';
import BouncyLoader from '@/components/BouncyLoader';

const SQL_SCHEMA = `-- Run this SQL in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/hxzfusqbdfkbsthajgoo/sql/new

-- First, clear the mismatched tables to start completely fresh
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;

-- Set up proper UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create perfectly matching tables
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  description TEXT DEFAULT ''
);

CREATE TABLE applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  email TEXT NOT NULL,
  resume_url TEXT NOT NULL,
  ai_summary TEXT DEFAULT '',
  ats_score INTEGER DEFAULT 0
);

-- Turn on Security features
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Add Permissions
CREATE POLICY "Allow all on jobs" ON jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on applications" ON applications FOR ALL USING (true) WITH CHECK (true);`;

export default function SetupPage() {
    const [copied, setCopied] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);

    const copySQL = () => {
        navigator.clipboard.writeText(SQL_SCHEMA);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const testConnection = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            const res = await fetch('/api/jobs');
            const data = await res.json();

            if (res.ok && !data.error) {
                // Try inserting a test job
                const createRes = await fetch('/api/create-job', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: 'Test Job - Delete Me',
                        company_name: 'Test Company',
                        description: 'This is a test job to verify the database connection.'
                    })
                });

                if (createRes.ok) {
                    setTestResult('success');
                } else {
                    setTestResult('fail');
                }
            } else {
                setTestResult('fail');
            }
        } catch {
            setTestResult('fail');
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F1117] text-white flex flex-col items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-600 rounded-2xl">
                        <Database className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter">Database Setup</h1>
                        <p className="text-slate-500 text-sm font-medium">One-time setup to get Resume Flipbook running</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="bg-[#11141B] rounded-2xl border border-white/5 p-6">
                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">
                            Step 1
                        </div>
                        <h3 className="text-lg font-black mb-2">Open Supabase SQL Editor</h3>
                        <p className="text-slate-400 text-sm mb-4">Go to your Supabase project and open the SQL Editor.</p>
                        <a
                            href="https://supabase.com/dashboard/project/hxzfusqbdfkbsthajgoo/sql/new"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open SQL Editor
                        </a>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-[#11141B] rounded-2xl border border-white/5 p-6">
                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">
                            Step 2
                        </div>
                        <h3 className="text-lg font-black mb-2">Copy & Run This SQL</h3>
                        <p className="text-slate-400 text-sm mb-4">Paste this into the SQL Editor and click &quot;Run&quot;.</p>

                        <div className="relative bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                            <button
                                onClick={copySQL}
                                className="absolute top-3 right-3 px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-white/20 transition-all z-10"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-400">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3 h-3" />
                                        Copy SQL
                                    </>
                                )}
                            </button>
                            <pre className="p-4 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-64 leading-relaxed">
                                {SQL_SCHEMA}
                            </pre>
                        </div>
                    </div>

                    {/* Step 3 - Storage Bucket */}
                    <div className="bg-[#11141B] rounded-2xl border border-white/5 p-6">
                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">
                            Step 3
                        </div>
                        <h3 className="text-lg font-black mb-2">Create Storage Bucket</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Go to <strong>Storage</strong> in the Supabase dashboard. Create a new bucket named <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-400">resumes</code> and set it to <strong>Public</strong>.
                        </p>
                        <a
                            href="https://supabase.com/dashboard/project/hxzfusqbdfkbsthajgoo/storage/buckets"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open Storage
                        </a>
                    </div>

                    {/* Step 4 - Test */}
                    <div className="bg-[#11141B] rounded-2xl border border-white/5 p-6">
                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">
                            Step 4
                        </div>
                        <h3 className="text-lg font-black mb-2">Test Connection</h3>
                        <p className="text-slate-400 text-sm mb-4">Click below to verify everything is working.</p>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={testConnection}
                                disabled={testing}
                                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                            >
                                {testing ? (
                                    <>
                                        <BouncyLoader size="sm" />
                                        Testing...
                                    </>
                                ) : (
                                    'Test Database Connection'
                                )}
                            </button>

                            {testResult === 'success' && (
                                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                                    <Check className="w-4 h-4" />
                                    Database is working! You can now use the dashboard.
                                </div>
                            )}
                            {testResult === 'fail' && (
                                <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
                                    <AlertCircle className="w-4 h-4" />
                                    Connection or RLS issue. Make sure you ran the SQL.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Continue Button */}
                    <a
                        href="/dashboard"
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-[0.98] transition-all mt-8"
                    >
                        Go to Dashboard
                        <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </div>
    );
}
