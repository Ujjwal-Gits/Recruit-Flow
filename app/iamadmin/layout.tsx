import React from 'react';

export const metadata = {
    title: 'Super Admin | Resume Flipbook Control Terminal',
    description: 'Central oversight and system management for Resume Flipbook.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
