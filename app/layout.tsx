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

export const metadata: Metadata = {
    title: {
        default: "Recruit Flow | AI Powered Recruitment Platform",
        template: "%s | Recruit Flow",
    },
    description: "Recruit Flow is an AI-powered recruitment platform that automates resume screening, scores candidates with ATS intelligence, and helps teams hire faster. Post jobs, screen CVs, and manage your entire hiring pipeline in one place.",
    keywords: "AI recruitment platform, ATS scoring, resume screening software, candidate management, hiring automation, applicant tracking system",
    openGraph: {
        siteName: "Recruit Flow",
        type: "website",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning
            className={`${inter.variable} ${jetbrainsMono.variable} ${caveat.variable}`}>
            <head>
                {/* Material Symbols — just load it normally, it's small enough */}
                <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
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
