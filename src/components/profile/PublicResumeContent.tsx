import React, { useState } from 'react';
import { ResumePreview } from '../../components/ResumePreview';
import { Providers } from '../../components/Providers';
import { PublicFooter } from '../ui/PublicFooter';
import { Download, Loader2 } from 'lucide-react';

interface PublicResumeContentProps {
    resumeData: any;
}

export function PublicResumeContent({ resumeData }: PublicResumeContentProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePdfPayload = async () => {
        const element = document.getElementById('resume-preview-for-generation');
        if (!element) return null;

        // Explicitly fetch the clean resume.css
        let resumeCss = '';
        try {
            const cssRes = await fetch('/resume.css');
            if (cssRes.ok) {
                resumeCss = await cssRes.text();
            } else {
                console.error('Failed to fetch resume.css');
            }
        } catch (e) {
            console.error('Error fetching resume.css:', e);
        }

        const html = element.outerHTML;
        return { html, css: resumeCss };
    };

    const handleDownload = async () => {
        try {
            setIsGenerating(true);
            const payload = await generatePdfPayload();
            if (!payload) throw new Error('Could not find resume element');

            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to generate PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const filename = `Resume_${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}.pdf`;
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to download PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Browser-native print approach as a secondary option or primary if requested
    const handleBrowserPrint = () => {
        window.print();
    };

    return (
        <Providers>
            {/* Hidden instance for PDF generation scraping */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none opacity-0">
                <ResumePreview data={resumeData} id="resume-preview-for-generation" />
            </div>

            <div className="w-full max-w-4xl animate-in fade-in duration-500">
                <div className="flex justify-end mb-6 gap-3 no-print">
                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--text-main)] text-[var(--bg-main)] rounded-xl font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
                    </button>
                    <button
                        onClick={handleBrowserPrint}
                        className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl font-bold uppercase tracking-widest hover:bg-[var(--bg-input)] active:scale-95 transition-all shadow-md"
                        title="Print with browser"
                    >
                        <span>Print</span>
                    </button>
                </div>

                <ResumePreview
                    data={resumeData}
                    id="public-resume-view"
                    isEditable={false}
                />

                <div className="mt-12 text-center no-print bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-color)] shadow-xl">
                    <h3 className="text-xl font-black text-[var(--text-main)] mb-2 uppercase tracking-tight">Impressed by this resume?</h3>
                    <p className="text-[var(--text-muted)] mb-6">Create your own professional resume with AI-powered insights in minutes.</p>
                    <a
                        href="/"
                        className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-[0_0_40px_rgba(126,34,206,0.3)] active:scale-95 transition-all"
                    >
                        Create Your Own Now
                    </a>
                </div>

                <PublicFooter />
            </div>
        </Providers>
    );
}
