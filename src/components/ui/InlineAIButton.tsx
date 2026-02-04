import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Loader2, Check, X } from 'lucide-react';

interface InlineAIButtonProps {
    text: string;
    type: 'bullet' | 'summary' | 'role' | 'description';
    context?: {
        jobDescription?: string;
        role?: string;
        company?: string;
        projectName?: string;
        techStack?: string[];
    };
    onAccept: (optimizedText: string) => void;
    className?: string;
}

export function InlineAIButton({
    text,
    type,
    context,
    onAccept,
    className = ''
}: InlineAIButtonProps) {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedText, setOptimizedText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleOptimize = async () => {
        if (!text.trim()) return;

        setIsOptimizing(true);
        setError(null);

        try {
            const response = await fetch('/api/optimize-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text.trim(),
                    type,
                    context,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to optimize text');
            }

            if (data.success && data.optimized) {
                setOptimizedText(data.optimized);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setTimeout(() => setError(null), 3000);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleAccept = () => {
        if (optimizedText) {
            onAccept(optimizedText);
            setOptimizedText(null);
        }
    };

    const handleReject = () => {
        setOptimizedText(null);
    };

    const modalContent = optimizedText ? (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-[9999] print:hidden backdrop-blur-md transition-opacity"
                onClick={handleReject}
            />

            {/* Floating Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] w-[90%] max-w-2xl print:hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow)] border border-[var(--border-color)] overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-gradient-to-br from-purple-500/10 to-transparent">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-purple-600 rounded-xl shadow-lg shadow-purple-900/20">
                                <Sparkles className="text-white" size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[var(--text-main)] tracking-tight">Smart Enhancement</h3>
                                <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5 tracking-wide">Review and apply high-impact suggestions</p>
                            </div>
                        </div>
                        <button
                            onClick={handleReject}
                            className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-2 hover:bg-[var(--bg-input)] rounded-full transition-all active:scale-90"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto no-scrollbar space-y-6">
                        {/* Side-by-side comparison */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Original */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">Original</p>
                                <div className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-5 h-full min-h-[160px] shadow-inner text-[var(--text-main)]">
                                    <p
                                        className="text-sm leading-relaxed whitespace-pre-wrap opacity-80 font-medium"
                                        dangerouslySetInnerHTML={{ __html: text }}
                                    />
                                </div>
                            </div>

                            {/* Optimized */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] flex items-center gap-1.5 ml-1">
                                    <Sparkles size={12} className="animate-pulse" /> Suggested
                                </p>
                                <div className="bg-purple-500/[0.03] border-2 border-purple-500/20 rounded-xl p-5 h-full min-h-[160px] ring-4 ring-purple-500/[0.02] shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                        <Sparkles size={24} className="text-purple-500" />
                                    </div>
                                    <p
                                        className="text-sm leading-relaxed font-bold text-[var(--text-main)] whitespace-pre-wrap relative z-10"
                                        dangerouslySetInnerHTML={{ __html: optimizedText || '' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 justify-end pt-4 border-t border-[var(--border-color)]">
                            <button
                                onClick={handleReject}
                                className="px-6 py-2.5 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] rounded-xl transition-all active:scale-95"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleAccept}
                                className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-black text-sm transition-all shadow-xl shadow-purple-900/20 active:scale-95"
                            >
                                <Check size={18} />
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    ) : null;

    const buttonElement = (
        <button
            onClick={handleOptimize}
            disabled={isOptimizing || !text.trim()}
            className={`flex items-center justify-center p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg shadow-xl shadow-black/5 active:scale-95 transition-all border border-zinc-700/50 ${isOptimizing ? 'opacity-80' : ''} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            title="Enhance with AI"
        >
            {isOptimizing ? (
                <Loader2 size={12} className="animate-spin" />
            ) : (
                <Sparkles size={12} className="text-purple-400" />
            )}
        </button>
    );

    if (error) {
        return (
            <div className={`text-xs text-red-600 ${className}`}>
                {error}
            </div>
        );
    }

    return (
        <>
            {buttonElement}
            {optimizedText && (typeof document !== 'undefined') && createPortal(modalContent, document.body)}
        </>
    );
}
