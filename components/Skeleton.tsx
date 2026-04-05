'use client';

// Reusable skeleton shimmer component.
// Use this anywhere you'd normally show a spinner while data loads.
// The shimmer animation gives a sense of progress without being distracting.

interface SkeletonProps {
    className?: string;
}

// The base shimmer block — just pass a className with width/height
export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`relative overflow-hidden bg-slate-100 rounded-sm ${className}`}
        >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
    );
}

// Dashboard job card skeleton — matches the real job card layout
export function JobCardSkeleton() {
    return (
        <div className="bg-white border border-slate-100 rounded-sm p-6 space-y-4">
            <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3.5 w-1/3" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
            </div>
        </div>
    );
}

// Dashboard sidebar skeleton
export function DashboardSidebarSkeleton() {
    return (
        <div className="w-64 bg-white border-r border-slate-100 h-screen fixed left-0 top-0 p-6 space-y-6">
            <Skeleton className="h-8 w-32 mb-8" />
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-sm" />
                    <Skeleton className="h-4 w-28" />
                </div>
            ))}
        </div>
    );
}

// CRM table row skeleton
export function CRMRowSkeleton() {
    return (
        <tr>
            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
            <td className="px-6 py-4"><Skeleton className="h-4 w-36" /></td>
            <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-sm" /></td>
            <td className="px-6 py-4"><Skeleton className="h-4 w-10" /></td>
            <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-sm" /></td>
            <td className="px-6 py-4"><Skeleton className="h-4 w-14" /></td>
            <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
            <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
        </tr>
    );
}

// Admin user table row skeleton
export function AdminUserRowSkeleton() {
    return (
        <tr>
            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
            <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
            <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
            <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
            <td className="px-6 py-4"><Skeleton className="h-8 w-24 rounded-sm" /></td>
        </tr>
    );
}

// Support chat list item skeleton
export function ChatItemSkeleton() {
    return (
        <div className="flex items-center gap-3 p-4 border-b border-slate-50">
            <Skeleton className="size-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-3 w-10 shrink-0" />
        </div>
    );
}

// Apply page job info skeleton
export function ApplyPageSkeleton() {
    return (
        <div className="max-w-[1200px] mx-auto px-6 pt-16 flex flex-col md:flex-row gap-16">
            <div className="flex-1 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-14 w-3/4" />
                    <Skeleton className="h-6 w-48" />
                </div>
                <div className="bg-white border border-slate-100 p-8 rounded space-y-3">
                    <Skeleton className="h-3 w-24 mb-6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-6 rounded">
                            <Skeleton className="h-3 w-20 mb-2" />
                            <Skeleton className="h-5 w-28" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-full md:w-[480px]">
                <div className="bg-white border border-slate-100 p-10 rounded space-y-6">
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-10 w-full rounded-sm" />
                        </div>
                    ))}
                    <Skeleton className="h-12 w-full rounded-sm" />
                </div>
            </div>
        </div>
    );
}
