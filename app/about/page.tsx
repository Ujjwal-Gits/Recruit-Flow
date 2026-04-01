"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, Users, Target, Zap, Globe, Shield, Heart, Instagram, Facebook, Linkedin, Github } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import PublicNavbar from "@/components/PublicNavbar";
const FounderCursor = dynamic(() => import("@/components/FounderCursor"), { ssr: false });


const HOTSPOTS = [
    { top: '15.5%',   left: '50.5%',  w: 69, h: 26, line1: 'The mind that thinks —',             line2: 'every idea starts here.',                side: 'right' as const, xOffset: 20 },
    { top: '23.25%',  left: '44.25%', w: 18, h: 18, line1: 'Eyes that see the vision —',          line2: 'problems become blueprints.',            side: 'left'  as const },
    { top: '22%',     left: '55.5%',  w: 18, h: 18, line1: 'Eyes that see the vision —',          line2: 'problems become blueprints.',            side: 'right' as const },
    { top: '33%',     left: '49.25%', w: 14, h: 14, line1: 'Mouth that speaks with confidence —', line2: 'words that lead and inspire.',           side: 'right' as const },
    { top: '26.875%', left: '66.75%', w: 18, h: 18, line1: 'Ears that always listen —',           line2: 'hungry for new ideas.',                  side: 'right' as const },
    { top: '59.5%',   left: '55.5%',  w: 14, h: 14, line1: 'Heart that beats for hard work —',   line2: 'passion drives every line of code.',     side: 'right' as const, lineLen: 160, textOffset: 168 },
    { top: '78.25%',  left: '28%',    w: 14, h: 14, line1: 'Hands that write the code —',         line2: 'turning problems into solutions.',       side: 'left'  as const },
    { top: '75.75%',  left: '57%',    w: 14, h: 14, line1: 'Hands that write the code —',         line2: 'turning problems into solutions.',       side: 'right' as const, lineLen: 120, textOffset: 128 },
];

function BodyHotspotController() {
    const [autoIndex, setAutoIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (hoveredIndex !== null) return; // paused while hovering
        timerRef.current = setTimeout(() => {
            setAutoIndex(i => (i + 1) % HOTSPOTS.length);
        }, 3000);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [autoIndex, hoveredIndex]);

    const activeIndex = hoveredIndex !== null ? hoveredIndex : autoIndex;

    return (
        <>
            {HOTSPOTS.map((spot, i) => (
                <BodyHotspot
                    key={i}
                    {...spot}
                    active={activeIndex === i}
                    onHover={() => setHoveredIndex(i)}
                    onLeave={() => setHoveredIndex(null)}
                />
            ))}
        </>
    );
}

function BodyHotspot({ top, left, w, h, line1, line2, side, lineLen = 80, textOffset = 88, xOffset = 0, active, onHover, onLeave }: {
    top: string; left: string; w: number; h: number;
    line1: string; line2: string; side: 'left' | 'right';
    lineLen?: number; textOffset?: number; xOffset?: number;
    active: boolean; onHover: () => void; onLeave: () => void;
}) {
    return (
        <div
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            style={{
                position: 'absolute', top, left,
                width: w, height: h,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 40, cursor: 'none',
            }}
        >
            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 50, pointerEvents: 'none', transform: `translate(${xOffset}px, 0)` }}
                    >
                        <svg style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }} width="1" height="1">
                            <motion.line
                                x1={side === 'right' ? 10 : -10} y1="0"
                                x2={side === 'right' ? lineLen : -lineLen} y2="0"
                                stroke="rgba(71,85,105,0.8)" strokeWidth="1.2" strokeDasharray="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                exit={{ pathLength: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                            />
                        </svg>
                        <motion.div
                            initial={{ opacity: 0, x: side === 'right' ? -8 : 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, delay: 0.25 }}
                            style={{ position: 'absolute', top: -10, ...(side === 'right' ? { left: textOffset } : { right: textOffset }) }}
                        >
                            <motion.p
                                style={{ fontFamily: "'Caveat',cursive", fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden' }}
                                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                                exit={{ clipPath: 'inset(0 100% 0 0)' }}
                                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
                            >{line1}</motion.p>
                            <motion.p
                                style={{ fontFamily: "'Caveat',cursive", fontSize: 15, fontWeight: 600, color: 'rgba(15,23,42,0.5)', margin: 0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden' }}
                                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                                exit={{ clipPath: 'inset(0 100% 0 0)' }}
                                transition={{ duration: 0.45, ease: 'easeOut', delay: 0.55 }}
                            >{line2}</motion.p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function GlassesTooltip() {
    const [hover, setHover] = useState(false);
    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                position: 'absolute',
                top: '19%', left: '33%',
                width: '34%', height: '9%',
                zIndex: 30, cursor: 'none',
            }}
        >
            <AnimatePresence>
                {hover && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '108%',
                            transform: 'translateY(-50%)',
                            zIndex: 40,
                            pointerEvents: 'none',
                        }}
                    >
                        {/* Dashed line */}
                        <motion.svg width="32" height="2"
                            style={{ position: 'absolute', top: 10, left: -32, overflow: 'visible' }}>
                            <motion.line x1="0" y1="1" x2="32" y2="1"
                                stroke="rgba(15,23,42,0.3)" strokeWidth="1" strokeDasharray="3 2"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                exit={{ pathLength: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.svg>
                        <motion.p
                            style={{ fontFamily: "'Caveat',cursive", fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden' }}
                            initial={{ clipPath: 'inset(0 100% 0 0)' }}
                            animate={{ clipPath: 'inset(0 0% 0 0)' }}
                            exit={{ clipPath: 'inset(0 100% 0 0)' }}
                            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.25 }}
                        >Vision that sees beyond —</motion.p>
                        <motion.p
                            style={{ fontFamily: "'Caveat',cursive", fontSize: 13, fontWeight: 600, color: 'rgba(15,23,42,0.55)', margin: 0, lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden' }}
                            initial={{ clipPath: 'inset(0 100% 0 0)' }}
                            animate={{ clipPath: 'inset(0 0% 0 0)' }}
                            exit={{ clipPath: 'inset(0 100% 0 0)' }}
                            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.55 }}
                        >problems are just blueprints.</motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AboutPage() {
    const founderRef = useRef<HTMLElement>(null);
    const fadeInUp = {
        initial: { opacity: 0, y: 30, filter: "blur(10px)", scale: 0.98 },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 },
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any },
        viewport: { once: false, margin: "-50px" }
    };

    const staggerContainer = {
        initial: {},
        whileInView: { transition: { staggerChildren: 0.15 } }
    };


    const values = [
        { icon: Target, title: "Precision First", desc: "Every feature is engineered to eliminate noise and surface the signal that matters." },
        { icon: Zap, title: "Speed Protocol", desc: "Sub-second response times. Because your next great hire shouldn't wait." },
        { icon: Shield, title: "Security Core", desc: "SOC2 compliant infrastructure with end-to-end encryption on all data channels." },
        { icon: Heart, title: "Human Centered", desc: "Technology should amplify human judgment, not replace it. We design for people." },
    ];

    const stats = [
        { value: "8,400+", label: "Active Recruiters" },
        { value: "250K+", label: "Candidates Processed" },
        { value: "98.4%", label: "ATS Match Accuracy" },
        { value: "< 2s", label: "Average Processing" },
    ];

    return (
        <div className="bg-white font-display text-slate-900 antialiased min-h-screen">
            {/* Navigation */}
            <PublicNavbar />

            {/* Hero */}
            <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 z-0 opacity-[0.7] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                />
                <div className="relative max-w-5xl mx-auto px-6 z-10">
                    <motion.div className="text-center" {...fadeInUp}>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.05] mb-6">
                            We build the tools<br />
                            <span className="text-slate-400">recruiters deserve.</span>
                        </h1>
                        <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed font-medium">
                            Recruit Flow was born from a simple frustration: recruitment software shouldn't feel like a chore. We're building the Arctic Protocol — a system designed for speed, clarity, and precision.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Bar */}
            <motion.section className="py-12 border-y border-slate-100 bg-slate-50/50" {...fadeInUp}>
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Our Story */}
            <section className="py-20 md:py-28">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div {...fadeInUp}>
                            <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-4 block">Our Origin</span>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-6">
                                From frustration<br />to innovation.
                            </h2>
                            <div className="space-y-4 text-slate-500 text-sm leading-relaxed font-medium">
                                <p>
                                    In 2024, our founder experienced the recruitment process from both sides — as a hiring manager drowning in poorly formatted CVs, and as a candidate lost in application black holes.
                                </p>
                                <p>
                                    The existing tools were either overengineered for enterprise or too basic to be useful. There was nothing in between — nothing that was beautiful, fast, and intelligent all at once.
                                </p>
                                <p>
                                    So we built Recruit Flow. An AI-powered recruitment engine that transforms static resumes into living candidate profiles, scores them intelligently, and gives recruiters the clarity they need to make confident decisions — fast.
                                </p>
                            </div>
                        </motion.div>
                        <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.2 }}>
                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-8 md:p-12 space-y-8">
                                <div className="space-y-6">
                                    {[
                                        { year: "2024", event: "Concept validated. First prototype built." },
                                        { year: "2025", event: "Arctic Protocol v1.0 launched. AI Flipbook engine released." },
                                        { year: "2026", event: "Enterprise tier. 8,000+ recruiters onboarded." },
                                    ].map((milestone, i) => (
                                        <div key={i} className="flex gap-6 items-start">
                                            <div className="flex flex-col items-center">
                                                <div className="size-3 rounded-full bg-slate-900 border-4 border-white shadow-sm" />
                                                {i < 2 && <div className="w-px h-10 bg-slate-200 mt-1" />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{milestone.year}</p>
                                                <p className="text-sm font-bold text-slate-900 mt-1">{milestone.event}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 md:py-28 bg-slate-50 border-y border-slate-100">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div className="text-center mb-16" {...fadeInUp}>
                        <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-4 block">Core Principles</span>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">What drives us forward.</h2>
                    </motion.div>
                    <motion.div
                        className="grid md:grid-cols-2 gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: false, margin: "-50px" }}
                    >
                        {values.map((val, i) => (
                            <motion.div
                                key={i}
                                className="bg-white border border-slate-100 rounded-lg p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] hover:shadow-md transition-all group"
                                variants={fadeInUp}
                            >
                                <div className="size-10 bg-slate-50 rounded-md flex items-center justify-center mb-5 group-hover:bg-slate-900 transition-all">
                                    <val.icon className="size-5 text-slate-400 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">{val.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">{val.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* The Founder */}
            <section ref={founderRef} className="founder-section pt-20 md:pt-28 overflow-hidden bg-white pb-0">
                <FounderCursor containerRef={founderRef} />
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div className="text-center mb-14" {...fadeInUp}>
                        <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-3 block">The Architect</span>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Built by Ujjwal.</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-[1fr_420px] gap-10 md:gap-20 items-end">

                        {/* ── Text Side LEFT ── */}
                        <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.15 }} className="pb-8">
                            <h3 className="text-3xl md:text-[2.6rem] font-black text-slate-900 tracking-tight leading-none mb-3 whitespace-nowrap">
                                Ujjwal Rupakheti
                            </h3>
                            <div className="flex items-center gap-3 mb-7">
                                <div className="h-px w-6 bg-slate-900" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Architect of Arctic Protocol</span>
                            </div>
                            <div className="space-y-3 text-slate-500 text-sm leading-relaxed font-medium max-w-lg">
                                <p>A builder obsessed with precision. Ujjwal founded Recruit Flow to solve the broken recruitment experience — creating an intelligent system that transforms how companies discover and hire talent.</p>
                                <p>From concept to code, from design to deployment — every pixel of this platform was crafted with a single vision: recruitment should be fast, beautiful, and effortless.</p>
                            </div>
                            <div className="flex items-center gap-8 mt-8 pt-7 border-t border-slate-100">
                                {[{ val: '1', label: 'Founder' }, { val: '∞', label: 'Ambition' }, { val: '24/7', label: 'Dedication' }].map(({ val, label }, i, arr) => (
                                    <div key={label} className="flex items-center gap-8">
                                        <div>
                                            <p className="text-2xl font-black text-slate-900 tracking-tight">{val}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">{label}</p>
                                        </div>
                                        {i < arr.length - 1 && <div className="w-px h-8 bg-slate-100" />}
                                    </div>
                                ))}
                            </div>

                            {/* Social links — right below stats, clearly separated */}
                            <div className="flex items-center gap-2 mt-5 pt-5 border-t border-slate-100">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mr-2">Connect</span>
                                {[
                                    { href: "https://instagram.com/ujjwalrupakheti", icon: Instagram, label: "Instagram" },
                                    { href: "https://facebook.com/ujjwalrupakheti", icon: Facebook, label: "Facebook" },
                                    { href: "https://linkedin.com/in/ujjwalrupakheti", icon: Linkedin, label: "LinkedIn" },
                                    { href: "https://github.com/ujjwalrupakheti", icon: Github, label: "GitHub" },
                                    { href: "https://ujjwalrupakheti.com", icon: Globe, label: "Website" },
                                ].map(({ href, icon: Icon, label }) => (
                                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                                        className="size-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 hover:bg-slate-50 transition-all">
                                        <Icon className="size-3.5" />
                                    </a>
                                ))}
                            </div>
                        </motion.div>

                        {/* ── Image Side RIGHT ── */}
                        <motion.div className="relative flex flex-col items-center group" {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.05 }}>
                            <div className="relative w-full select-none">

                                {/* === PROFESSIONAL DOCUMENT-STYLE BACKGROUND === */}
                                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 420 560" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">

                                        {/* Clean white base */}
                                        <rect width="420" height="560" fill="#ffffff"/>

                                        {/* Fine grid lines — horizontal */}
                                        {[40,80,120,160,200,240,280,320,360,400,440,480,520].map(y=>(
                                            <line key={`h${y}`} x1="0" y1={y} x2="420" y2={y} stroke="#e8ecf0" strokeWidth="0.5"/>
                                        ))}
                                        {/* Fine grid lines — vertical */}
                                        {[60,120,180,240,300,360].map(x=>(
                                            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="560" stroke="#e8ecf0" strokeWidth="0.5"/>
                                        ))}

                                        {/* Row numbers — left margin */}
                                        {[40,80,120,160,200,240,280,320,360,400,440,480,520].map((y,i)=>(
                                            <text key={`n${y}`} x="8" y={y+4} fontSize="7" fill="#c0cad6" fontFamily="monospace" opacity="0.9">{String(i+1).padStart(2,'0')}</text>
                                        ))}

                                        {/* Column letters — top margin */}
                                        {['A','B','C','D','E','F'].map((l,i)=>(
                                            <text key={l} x={60*(i+1)-4} y="14" fontSize="7" fill="#c0cad6" fontFamily="monospace" opacity="0.9">{l}</text>
                                        ))}

                                        {/* Left border rule */}
                                        <line x1="28" y1="0" x2="28" y2="560" stroke="#d0d8e2" strokeWidth="1"/>
                                        {/* Top border rule */}
                                        <line x1="0" y1="22" x2="420" y2="22" stroke="#d0d8e2" strokeWidth="1"/>

                                        {/* Accent block — top right corner (like a stamp/seal area) */}
                                        <rect x="340" y="30" width="72" height="52" fill="none" stroke="#c8d4e0" strokeWidth="1"/>
                                        <line x1="340" y1="46" x2="412" y2="46" stroke="#c8d4e0" strokeWidth="0.7"/>
                                        <text x="376" y="41" fontSize="6" fill="#b0bfce" fontFamily="monospace" textAnchor="middle">REF NO.</text>
                                        <text x="376" y="72" fontSize="8" fill="#8fa3b8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">RF-001</text>

                                        {/* Annotation lines — like a technical drawing */}
                                        {/* Top left annotation */}
                                        <line x1="36" y1="60" x2="80" y2="60" stroke="#c8d4e0" strokeWidth="0.8"/>
                                        <line x1="80" y1="60" x2="80" y2="100" stroke="#c8d4e0" strokeWidth="0.8"/>
                                        <circle cx="80" cy="100" r="2" fill="#c8d4e0"/>
                                        <text x="36" y="57" fontSize="6.5" fill="#b0bfce" fontFamily="monospace">PROFILE</text>

                                        {/* Bottom right annotation */}
                                        <line x1="384" y1="460" x2="384" y2="500" stroke="#c8d4e0" strokeWidth="0.8"/>
                                        <line x1="340" y1="500" x2="384" y2="500" stroke="#c8d4e0" strokeWidth="0.8"/>
                                        <circle cx="340" cy="500" r="2" fill="#c8d4e0"/>
                                        <text x="348" y="497" fontSize="6.5" fill="#b0bfce" fontFamily="monospace">2026</text>

                                        {/* Coordinate markers */}
                                        <text x="36" y="540" fontSize="6" fill="#c0cad6" fontFamily="monospace">X:00 Y:00</text>
                                        <text x="340" y="18" fontSize="6" fill="#c0cad6" fontFamily="monospace">SCALE 1:1</text>

                                        {/* Small plus crosshairs */}
                                        <path d="M55 200 L65 200 M60 195 L60 205" stroke="#c8d4e0" strokeWidth="1"/>
                                        <path d="M355 350 L365 350 M360 345 L360 355" stroke="#c8d4e0" strokeWidth="1"/>
                                        <path d="M355 150 L365 150 M360 145 L360 155" stroke="#c8d4e0" strokeWidth="1"/>

                                        {/* Dotted measurement line — horizontal */}
                                        <line x1="36" y1="480" x2="200" y2="480" stroke="#c8d4e0" strokeWidth="0.8" strokeDasharray="3,4"/>
                                        <line x1="36" y1="476" x2="36" y2="484" stroke="#c8d4e0" strokeWidth="1"/>
                                        <line x1="200" y1="476" x2="200" y2="484" stroke="#c8d4e0" strokeWidth="1"/>
                                        <text x="110" y="476" fontSize="6" fill="#b8c8d8" fontFamily="monospace" textAnchor="middle">480px</text>

                                        {/* Dotted measurement line — vertical right */}
                                        <line x1="400" y1="30" x2="400" y2="200" stroke="#c8d4e0" strokeWidth="0.8" strokeDasharray="3,4"/>
                                        <line x1="396" y1="30" x2="404" y2="30" stroke="#c8d4e0" strokeWidth="1"/>
                                        <line x1="396" y1="200" x2="404" y2="200" stroke="#c8d4e0" strokeWidth="1"/>

                                        {/* Section label blocks */}
                                        <rect x="36" y="130" width="48" height="14" fill="#f0f4f8" rx="2"/>
                                        <text x="60" y="140" fontSize="6.5" fill="#8fa3b8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">SEC A</text>

                                        <rect x="36" y="310" width="48" height="14" fill="#f0f4f8" rx="2"/>
                                        <text x="60" y="320" fontSize="6.5" fill="#8fa3b8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">SEC B</text>

                                        {/* Subtle watermark text — rotated */}
                                        <text x="210" y="300" fontSize="52" fill="#e8ecf0" fontFamily="monospace" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" transform="rotate(-30 210 300)" opacity="0.6">RF</text>

                                    </svg>
                                </div>

                                {/* Image */}
                                <img src="/Uzal-Hero.png" alt="Ujjwal Rupakheti" draggable={false} onDragStart={(e) => e.preventDefault()}
                                    className="relative w-full h-auto object-contain select-none transition-all duration-700 ease-in-out grayscale-[10%] group-hover:grayscale-0"
                                    style={{ zIndex: 10, userSelect: 'none', pointerEvents: 'none', display: 'block' } as React.CSSProperties}
                                />

                                {/* BODY HOTSPOTS — auto-cycle + hover override */}
                                <BodyHotspotController />

                                {/* Handwritten text — left side of face */}
                                <div className="absolute z-20 pointer-events-none" style={{ left: '3%', top: '44.5%', overflow: 'visible' }}>
                                    <div style={{ transform: 'rotate(-8deg)', transformOrigin: 'left top', overflow: 'visible' }}>
                                        <motion.p
                                            style={{
                                                fontFamily: "'Caveat', cursive",
                                                fontSize: 16,
                                                fontWeight: 700,
                                                color: 'rgba(15,23,42,0.55)',
                                                lineHeight: 1.3,
                                                margin: 0,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                paddingRight: 8,
                                            }}
                                            animate={{
                                                clipPath: [
                                                    'inset(0 100% 0 0)',
                                                    'inset(0 0% 0 0)',
                                                    'inset(0 0% 0 0)',
                                                    'inset(0 100% 0 0)',
                                                ],
                                                opacity: [0, 1, 1, 0],
                                            }}
                                            transition={{
                                                duration: 5,
                                                times: [0, 0.3, 0.75, 1],
                                                repeat: Infinity,
                                                repeatDelay: 0.5,
                                                ease: 'easeInOut',
                                            }}
                                        >Founder & CEO</motion.p>
                                        <motion.p
                                            style={{
                                                fontFamily: "'Caveat', cursive",
                                                fontSize: 15,
                                                fontWeight: 600,
                                                color: 'rgba(15,23,42,0.4)',
                                                lineHeight: 1.3,
                                                margin: 0,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                            }}
                                            animate={{
                                                clipPath: [
                                                    'inset(0 100% 0 0)',
                                                    'inset(0 100% 0 0)',
                                                    'inset(0 0% 0 0)',
                                                    'inset(0 0% 0 0)',
                                                    'inset(0 100% 0 0)',
                                                ],
                                                opacity: [0, 0, 1, 1, 0],
                                            }}
                                            transition={{
                                                duration: 5,
                                                times: [0, 0.3, 0.55, 0.75, 1],
                                                repeat: Infinity,
                                                repeatDelay: 0.5,
                                                ease: 'easeInOut',
                                            }}
                                        >Recruit Flow</motion.p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ── Marquee ticker strip ── */}
                <div className="mt-0 bg-slate-900 overflow-hidden py-4">
                    <motion.div className="flex whitespace-nowrap"
                        animate={{ x: ['0%', '-50%'] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex items-center shrink-0">
                                {['Recruit Flow', 'Arctic Protocol', 'AI Recruitment', 'Hire Smarter', 'Resume Flipbook', 'Talent Discovery', 'Smart Screening', 'Recruit Flow'].map((item, j) => (
                                    <div key={j} className="flex items-center gap-5 px-6">
                                        <span className="text-white text-sm font-black uppercase tracking-widest" style={{ fontFamily: "'Caveat', cursive", fontSize: 16, fontWeight: 700, letterSpacing: 2 }}>{item}</span>
                                        <span className="text-slate-500 text-base">✦</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <motion.section className="py-20 md:py-28 bg-slate-900" {...fadeInUp}>
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">Ready to transform your hiring?</h2>
                    <p className="text-slate-400 text-base mb-10 max-w-md mx-auto font-medium">Join thousands of recruiters who trust the Arctic Protocol to find exceptional talent.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register" className="bg-white text-slate-900 px-8 py-4 rounded text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95 shadow-xl flex items-center gap-3">
                            Get Started Free <ArrowRight className="size-4" />
                        </Link>
                        <Link href="/contact" className="text-slate-400 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
                            Talk to Sales
                        </Link>
                    </div>
                </div>
            </motion.section>

            {/* Footer */}
            <footer className="bg-white py-12 px-6 border-t border-slate-100">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                        © 2026 Recruit Flow Systems Inc.
                    </div>
                    <div className="flex gap-8 font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                        <Link className="hover:text-slate-900 transition-colors" href="/privacy">Privacy Policy</Link>
                        <Link className="hover:text-slate-900 transition-colors" href="/terms">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
