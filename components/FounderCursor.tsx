"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function FounderCursor({ containerRef }: { containerRef: React.RefObject<HTMLElement> }) {
    const [visible, setVisible] = useState(false);
    const [clicked, setClicked] = useState(false);

    const rawX = useMotionValue(-200);
    const rawY = useMotionValue(-200);
    const x = useSpring(rawX, { stiffness: 600, damping: 35 });
    const y = useSpring(rawY, { stiffness: 600, damping: 35 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onMove = (e: MouseEvent) => { rawX.set(e.clientX); rawY.set(e.clientY); };
        const onEnter = () => setVisible(true);
        const onLeave = () => setVisible(false);
        const onDown  = () => setClicked(true);
        const onUp    = () => setClicked(false);
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
        el.addEventListener("mousedown", onDown);
        el.addEventListener("mouseup", onUp);
        return () => {
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
            el.removeEventListener("mousedown", onDown);
            el.removeEventListener("mouseup", onUp);
        };
    }, [containerRef, rawX, rawY]);

    if (!visible) return null;

    return (
        <>
            <style>{".founder-section, .founder-section * { cursor: none !important; }"}</style>
            <motion.div style={{ position: "fixed", top: 0, left: 0, x, y, translateX: "-4px", translateY: "-4px", pointerEvents: "none", zIndex: 9999 }}>
                <motion.div animate={{ scale: clicked ? 0.8 : 1 }} transition={{ duration: 0.1 }}>
                    <svg width="18" height="18" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Nose at top-left (0,0), tail at bottom-right */}
                        <path d="M0 0 L28 10 L16 16 L10 28 Z" fill="#0f172a" stroke="white" strokeWidth="0.8" strokeLinejoin="round"/>
                        <path d="M0 0 L16 16" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" strokeLinecap="round"/>
                    </svg>
                </motion.div>
            </motion.div>
        </>
    );
}
