'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BouncyLoaderProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const BouncyLoader = ({ size = 'md', className = '' }: BouncyLoaderProps) => {
    const isSm = size === 'sm';
    const isLg = size === 'lg';
    
    const containerSize = isSm ? 'size-5' : isLg ? 'size-16' : 'size-12';
    const ballSize = isSm ? 'size-1.5' : isLg ? 'size-6' : 'size-4';
    const shadowSize = isSm ? 'w-2 h-0.5' : isLg ? 'w-8 h-1.5' : 'w-5 h-1';
    const bounceY = isSm ? 12 : isLg ? 40 : 28;

    return (
        <div className={`flex flex-col items-center justify-center ${!isSm ? 'p-8 bg-white/50 backdrop-blur-sm rounded-lg min-h-[140px]' : ''} ${className}`}>
            <div className={`relative ${containerSize} flex flex-col items-center justify-between`}>
                {/* The Bouncing Ball */}
                <motion.div
                    className={`${ballSize} bg-slate-900 rounded-full shadow-lg`}
                    animate={{
                        y: [0, bounceY, 0],
                        scaleX: [1, 1.1, 1],
                        scaleY: [1, 0.9, 1]
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                
                {/* The Dynamic Shadow */}
                <motion.div
                    className={`${shadowSize} bg-slate-900/10 rounded-[100%] blur-[1px]`}
                    animate={{
                        scale: [0.4, 1.2, 0.4],
                        opacity: [0.2, 0.6, 0.2]
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>
            {!isSm && (
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-6 animate-pulse"
                >
                    Synchronizing Terminal
                </motion.p>
            )}
        </div>
    );
};

export default BouncyLoader;
