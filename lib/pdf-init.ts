import type * as PDFJS from 'pdfjs-dist';

let pdfjsInstance: typeof PDFJS | null = null;
let loadPromise: Promise<typeof PDFJS> | null = null;

export async function getPdfjs(): Promise<typeof PDFJS> {
    // Return cached instance immediately
    if (pdfjsInstance) return pdfjsInstance;

    // Deduplicate concurrent calls — only one load in flight
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
        // @ts-ignore
        const pdfjs = await import('pdfjs-dist');
        // Always use CDN worker to ensure high availability and prevent silent local 404s
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        pdfjsInstance = pdfjs;
        return pdfjs;
    })();

    return loadPromise;
}

// Pre-warm: call this early so the worker is ready before user needs it
export function prewarmPdfjs() {
    if (typeof window !== 'undefined' && !pdfjsInstance) {
        getPdfjs().catch(() => {});
    }
}
