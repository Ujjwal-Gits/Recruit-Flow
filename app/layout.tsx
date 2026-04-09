import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Caveat } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import SupportChat from "@/components/SupportChat";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
    weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-mono",
    weight: ["400", "500"],
});

const caveat = Caveat({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-caveat",
    weight: ["400", "500"],
});

const BASE_URL = "https://recruitflow.app";

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "Recruit Flow | AI Powered Recruitment Platform",
        template: "%s | Recruit Flow",
    },
    description: "Recruit Flow is an AI-powered recruitment platform that automates resume screening with ATS scoring, manages candidate pipelines, and helps teams hire faster. Post jobs, screen CVs with Gemini AI, and manage your entire hiring workflow in one place.",
    keywords: [
        "AI recruitment platform",
        "ATS scoring software",
        "resume screening automation",
        "candidate management system",
        "hiring automation",
        "applicant tracking system",
        "AI hiring tools",
        "recruitment software",
        "automated resume screening",
        "talent acquisition platform",
    ],
    authors: [{ name: "Recruit Flow", url: BASE_URL }],
    creator: "Recruit Flow",
    publisher: "Recruit Flow",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: BASE_URL,
        siteName: "Recruit Flow",
        title: "Recruit Flow | AI Powered Recruitment Platform",
        description: "Automate resume screening, score candidates with AI, and manage your entire hiring pipeline. Recruit Flow helps teams hire faster with less manual work.",
        images: [
            {
                url: `${BASE_URL}/og-image.png`,
                width: 1200,
                height: 630,
                alt: "Recruit Flow — AI Powered Recruitment Platform",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Recruit Flow | AI Powered Recruitment Platform",
        description: "Automate resume screening, score candidates with AI, and manage your entire hiring pipeline.",
        images: [`${BASE_URL}/og-image.png`],
    },
    alternates: {
        canonical: BASE_URL,
    },
    verification: {
        google: "your-google-verification-code",
    },
    category: "technology",
};

// Global Organization + WebSite JSON-LD for GEO/AEO
const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "Recruit Flow",
    url: BASE_URL,
    logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/recruit-flow-logo.png`,
        width: 200,
        height: 60,
    },
    description: "Recruit Flow is an AI-powered recruitment platform that automates resume screening with ATS scoring and helps teams hire faster.",
    foundingDate: "2024",
    contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "work@ujjwalrupakheti.com.np",
        availableLanguage: "English",
    },
    sameAs: [
        "https://linkedin.com/company/recruit-flow",
        "https://twitter.com/recruitflow",
    ],
};

const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "Recruit Flow",
    description: "AI-powered recruitment platform for automated resume screening and candidate management",
    publisher: { "@id": `${BASE_URL}/#organization` },
    potentialAction: {
        "@type": "SearchAction",
        target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/blog?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
    },
};

const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Recruit Flow",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: BASE_URL,
    description: "AI-powered recruitment platform with automated ATS scoring, resume flipbook viewer, candidate CRM, and interview scheduling.",
    offers: [
        {
            "@type": "Offer",
            name: "Essential",
            price: "0",
            priceCurrency: "USD",
            description: "Free plan with 1 active job and 5 CV processing slots",
        },
        {
            "@type": "Offer",
            name: "Arctic Pro",
            price: "6.99",
            priceCurrency: "USD",
            description: "Pro plan with 4 jobs, 30 CVs, CRM, and AI features",
        },
        {
            "@type": "Offer",
            name: "Enterprise",
            price: "9.99",
            priceCurrency: "USD",
            description: "Enterprise plan with 10 jobs, 200 CVs, AI shortlist, and interview calendar",
        },
    ],
    aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "127",
        bestRating: "5",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning
            className={`${inter.variable} ${jetbrainsMono.variable} ${caveat.variable}`}>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                />
                {/* Global JSON-LD Structured Data for GEO/AEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
                />
            </head>
            <body className={inter.className} suppressHydrationWarning>
                <SmoothScroll>
                    {children}
                </SmoothScroll>
                <SupportChat />
            </body>
        </html>
    );
}
