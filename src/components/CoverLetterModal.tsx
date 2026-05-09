import { useState } from 'react';
import { X, Sparkles, FileText, Copy, Check, Loader2 } from 'lucide-react';
import type { ResumeSchema } from '../types/resume';
import { toast } from 'react-hot-toast';

interface CoverLetterModalProps {
    isOpen: boolean;
    onClose: () => void;
    resume: ResumeSchema;
}

export function CoverLetterModal({ isOpen, onClose, resume }: CoverLetterModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [coverLetter, setCoverLetter] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!resume.targetJD) {
            setError('Please set a target Job Description in the Recruiter Panel first.');
            return;
        }

        setIsGenerating(true);
        setError(null);
        try {
            const response = await fetch('/api/generate-cover-letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resume,
                    jobDescription: resume.targetJD
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate cover letter');
            }

            if (data.success && data.coverLetter) {
                setCoverLetter(data.coverLetter);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (coverLetter) {
            navigator.clipboard.writeText(coverLetter);
            setIsCopied(true);
            toast.success('Cover letter copied to clipboard!');
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="relative w-full max-w-3xl bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow)] overflow-hidden flex flex-col max-h-[90vh] border border-[var(--border-color)] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-main)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[var(--text-main)] tracking-tight">Cover Letter Generator</h2>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">Create a tailored cover letter based on your Resume & Job Description.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-input)] rounded-full transition-colors active:scale-95"
                    >
                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-main)]/30">
                    {!resume.targetJD ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <FileText size={48} className="text-[var(--text-muted)] opacity-50 mb-4" />
                            <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest mb-2">Job Description Required</h3>
                            <p className="text-xs text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
                                Please paste a Job Description in the Recruiter Panel (AI Cockpit) on the right before generating a cover letter.
                            </p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-[var(--text-main)] text-[var(--bg-main)] rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                            >
                                Got it
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {!coverLetter && !isGenerating && !error && (
                                <div className="p-8 border border-dashed border-[var(--border-color)] rounded-2xl flex flex-col items-center text-center bg-[var(--bg-card)]">
                                    <Sparkles size={32} className="text-purple-500 mb-4" />
                                    <h3 className="text-sm font-black text-[var(--text-main)] mb-2">Ready to write your cover letter</h3>
                                    <p className="text-xs text-[var(--text-muted)] max-w-md mb-6 leading-relaxed">
                                        We will use OpenAI to craft a professional, 3-paragraph cover letter tailored precisely to your targeted Job Description.
                                    </p>
                                    <button
                                        onClick={handleGenerate}
                                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                    >
                                        <Sparkles size={16} /> Generate Letter
                                    </button>
                                </div>
                            )}

                            {isGenerating && (
                                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                    <div className="relative w-16 h-16">
                                        <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                        <Sparkles className="absolute inset-0 m-auto text-purple-500 w-6 h-6 animate-pulse" />
                                    </div>
                                    <p className="text-sm font-black text-[var(--text-main)] animate-pulse tracking-widest uppercase mt-4">Drafting Masterpiece...</p>
                                    <p className="text-xs text-[var(--text-muted)]">Analyzing your resume and matching to the Job Description.</p>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-sm font-bold text-red-500">Error</p>
                                    <p className="text-xs text-red-400 mt-1">{error}</p>
                                    <button 
                                        onClick={handleGenerate}
                                        className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-600 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {coverLetter && !isGenerating && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleCopy}
                                            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-input)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg text-xs font-bold transition-all"
                                        >
                                            {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                            {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                                        </button>
                                    </div>
                                    <div className="p-6 bg-white dark:bg-zinc-900 border border-[var(--border-color)] rounded-xl shadow-inner min-h-[300px]">
                                        <div 
                                            className="whitespace-pre-wrap font-sans text-sm text-[var(--text-main)] leading-relaxed"
                                        >
                                            {coverLetter}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
