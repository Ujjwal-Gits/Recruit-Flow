/**
 * PDFDossierViewer.tsx
 *
 * Renders candidate dossiers and resumes in PDF format for review.
 * Security: Only authenticated users can view PDFs. No file uploads.
 * APIs used: PDF.js for rendering, Supabase for fetching URLs.
 */
'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Menu, X, ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { getPdfjs } from '@/lib/pdf-init';

interface PDFDossierViewerProps {
    url: string;
}

const PDFPage = ({ pdf, pageNumber, scale = 2.5 }: { pdf: any, pageNumber: number, scale?: number }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsVisible(true);
            }
        }, { threshold: 0.1, rootMargin: '200px' });

        if (containerRef.current) observerRef.current.observe(containerRef.current);
        return () => observerRef.current?.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        
        let renderTask: any = null;
        let cancelled = false;

        async function renderPage() {
            try {
                const page = await pdf.getPage(pageNumber);
                if (cancelled) return;

                const viewport = page.getViewport({ scale });
                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d', { 
                    alpha: false,
                    willReadFrequently: false 
                });
                if (!context) return;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                renderTask = page.render({
                    canvasContext: context,
                    viewport,
                    intent: 'display',
                });

                await renderTask.promise;
                if (!cancelled) setLoading(false);
            } catch (err) {
                console.error('Page render error:', err);
                if (!cancelled) setLoading(false);
            }
        }

        renderPage();
        return () => {
            cancelled = true;
            renderTask?.cancel();
        };
    }, [pdf, pageNumber, scale, isVisible]);

    return (
        <div ref={containerRef} className="relative w-full bg-white transition-all overflow-hidden mb-4 min-h-[400px]">
            {loading && (
                <div className="aspect-[1/1.414] w-full flex items-center justify-center bg-white border border-slate-50">
                    <div className="size-8 rounded-full border-2 border-slate-100 border-t-slate-900 animate-spin" />
                </div>
            )}
            <canvas 
                ref={canvasRef} 
                className={`w-full h-auto block transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`} 
            />
        </div>
    );
};

const Thumbnail = ({ pdf, pageNumber, isActive, onClick }: { pdf: any, pageNumber: number, isActive: boolean, onClick: () => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let renderTask: any = null;
        async function renderThumb() {
            try {
                const page = await pdf.getPage(pageNumber);
                const viewport = page.getViewport({ scale: 0.3 });
                const canvas = canvasRef.current;
                if (!canvas) return;
                const context = canvas.getContext('2d');
                if (!context) return;
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                renderTask = page.render({ canvasContext: context, viewport });
                await renderTask.promise;
            } catch (err) {}
        }
        renderThumb();
        return () => renderTask?.cancel();
    }, [pdf, pageNumber]);

    return (
        <button 
            onClick={onClick}
            className={`w-full aspect-[1/1.414] rounded-sm overflow-hidden border-2 transition-all relative group mb-4 ${isActive ? 'border-slate-900 shadow-lg' : 'border-transparent hover:border-slate-200'}`}
        >
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-transparent transition-colors ${isActive ? 'bg-slate-900/5' : 'group-hover:bg-slate-900/5'}`} />
            <span className="absolute bottom-1 right-1 text-[8px] font-black text-slate-400 bg-white/80 px-1 rounded">{pageNumber}</span>
        </button>
    );
};

export default function PDFDossierViewer({ url }: PDFDossierViewerProps) {
    const [pdf, setPdf] = useState<any>(null);
    const [numPages, setNumPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showSidebar, setShowSidebar] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadPdf() {
            try {
                const pdfjs = await getPdfjs();
                const loadedPdf = await pdfjs.getDocument({
                    url,
                    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
                    cMapPacked: true,
                }).promise;
                setPdf(loadedPdf);
                setNumPages(loadedPdf.numPages);
                setLoading(false);
            } catch (err) {
                console.error('PDF load error:', err);
                setLoading(false);
            }
        }
        loadPdf();
    }, [url]);

    const scrollToPage = (page: number) => {
        if (!scrollContainerRef.current) return;
        const pageEl = scrollContainerRef.current.children[page - 1] as HTMLElement;
        if (pageEl) {
            pageEl.scrollIntoView({ behavior: 'smooth' });
            setCurrentPage(page);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 gap-4">
                <Loader2 className="size-8 animate-spin text-slate-300" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Candidate Data...</p>
            </div>
        );
    }

    if (!pdf) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
                <p className="text-xs font-bold text-slate-400">Failed to load dossier</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex relative bg-white overflow-hidden">
            {/* Page List */}
            <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-0 flex flex-col items-center bg-white scroll-smooth"
                onScroll={(e) => {
                    const container = e.currentTarget;
                    const scrollPos = container.scrollTop;
                    const pageHeight = container.scrollHeight / numPages;
                    const page = Math.floor(scrollPos / pageHeight) + 1;
                    if (page !== currentPage && page >= 1 && page <= numPages) {
                        setCurrentPage(page);
                    }
                }}
            >
                <div className="w-full">
                    {Array.from({ length: numPages }).map((_, i) => (
                        <PDFPage key={i} pdf={pdf} pageNumber={i + 1} />
                    ))}
                </div>
            </div>
        </div>
    );
}
