'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

type Phase = 'rolled' | 'unrolling' | 'open' | 'rolling';

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export default function AnimatedBook() {
  const [phase, setPhase] = useState<Phase>('rolled');

  useEffect(() => {
    let on = true;
    (async () => {
      while (on) {
        await delay(1200); if (!on) break;
        setPhase('unrolling');
        await delay(800);  if (!on) break;
        setPhase('open');
        await delay(3800); if (!on) break;
        setPhase('rolling');
        await delay(700);  if (!on) break;
        setPhase('rolled');
        await delay(1000);
      }
    })();
    return () => { on = false; };
  }, []);

  const isOpen    = phase === 'open';
  const expanding = phase === 'unrolling' || phase === 'open';
  const rolling   = phase === 'rolling';

  return (
    <div style={{ width: 130, height: 170, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>

      <div style={{ position: 'relative', zIndex: 10, width: 110 }}>
        <div style={{
          width: '100%', height: 22,
          background: 'linear-gradient(180deg, #c8a55a 0%, #e8c878 18%, #f5dfa0 35%, #e8c878 55%, #c8a55a 75%, #a07830 100%)',
          borderRadius: '50% / 11px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 3, left: '10%', right: '10%', height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.25)' }} />
          <div style={{ position: 'absolute', bottom: 4, left: '5%', right: '5%', height: 2, borderRadius: 1, background: 'rgba(0,0,0,0.15)' }} />
        </div>
      </div>

      <motion.div
        animate={{
          height: rolling ? 0 : expanding ? (isOpen ? 130 : 70) : 0,
          opacity: (expanding || rolling) ? 1 : 0,
        }}
        transition={{ duration: rolling ? 0.6 : 0.75, ease: rolling ? [0.4,0,1,1] : [0,0,0.2,1] }}
        style={{ width: 110, overflow: 'hidden', position: 'relative', zIndex: 5 }}
      >
        <div style={{
          width: '100%', minHeight: 130,
          background: 'linear-gradient(180deg,#f5e6b0 0%,#fdf3d0 12%,#fef8e4 40%,#fdf3d0 75%,#f5e6b0 100%)',
          position: 'relative', overflow: 'hidden',
          boxShadow: '2px 0 8px rgba(0,0,0,0.12),-2px 0 8px rgba(0,0,0,0.08)',
        }}>
          {[20,38,56,74,92,110].map(y => (
            <div key={y} style={{ position: 'absolute', top: y, left: 8, right: 8, height: 0.6, background: 'rgba(139,90,43,0.15)' }} />
          ))}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 8, background: 'linear-gradient(90deg,rgba(0,0,0,0.06) 0%,transparent 100%)' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 8, background: 'linear-gradient(270deg,rgba(0,0,0,0.06) 0%,transparent 100%)' }} />

          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              style={{ padding: '14px 12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
            >
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ width: 55, height: 1, background: 'rgba(101,67,33,0.45)' }} />
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.3 }} style={{ fontFamily: "'Caveat',cursive", fontSize: 9, color: 'rgba(101,67,33,0.5)', letterSpacing: 2 }}>✦ ✦ ✦</motion.span>
              <motion.span style={{ fontFamily: "'Caveat',cursive", fontSize: 16, color: '#2c1500', fontWeight: 700, textAlign: 'center', lineHeight: 1.1 }} initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }} animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }} transition={{ duration: 1.0, ease: 'easeInOut', delay: 0.5 }}>Founder & CEO</motion.span>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4, delay: 1.6 }} style={{ width: 40, height: 0.8, background: 'rgba(101,67,33,0.35)' }} />
              <motion.span style={{ fontFamily: "'Caveat',cursive", fontSize: 13, color: '#3d1f00', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }} initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }} animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }} transition={{ duration: 0.9, ease: 'easeInOut', delay: 1.8 }}>Ujjwal Rupakheti</motion.span>
              <motion.span style={{ fontFamily: "'Caveat',cursive", fontSize: 11, color: '#6b3a1f', fontStyle: 'italic', textAlign: 'center' }} initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }} animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }} transition={{ duration: 0.8, ease: 'easeInOut', delay: 2.8 }}>Recruit Flow</motion.span>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 3.5 }} style={{ width: 55, height: 1, background: 'rgba(101,67,33,0.45)', marginTop: 2 }} />
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, delay: 3.6, type: 'spring', stiffness: 220 }} style={{ width: 24, height: 24, borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%,#c0392b 0%,#7b241c 100%)', boxShadow: '0 2px 6px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 7, color: 'rgba(255,210,190,0.9)', fontFamily: 'Georgia,serif', fontWeight: 'bold' }}>RF</span>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{ width: 110, height: 14, zIndex: 10, background: 'linear-gradient(180deg,#c8a55a 0%,#e8c878 30%,#c8a55a 70%,#a07830 100%)', borderRadius: '0 0 50% 50% / 0 0 7px 7px', boxShadow: '0 4px 10px rgba(0,0,0,0.25)' }}
        />
      )}

      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 80, height: 6, borderRadius: '50%', background: 'rgba(0,0,0,0.12)', filter: 'blur(4px)' }} />
    </div>
  );
}
