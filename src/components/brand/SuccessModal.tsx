import { CheckCircle2, ArrowRight, ShieldCheck, Trophy, ExternalLink } from 'lucide-react';

interface SuccessModalProps {
    onClose: () => void;
    fileName: string;
}

export function SuccessModal({ onClose, fileName }: SuccessModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow)] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-[var(--border-color)]">
                <div className="p-1 px-1">
                    <div className="h-40 bg-gradient-to-br from-purple-900/40 to-[var(--bg-main)] rounded-xl flex flex-col items-center justify-center text-[var(--text-main)] relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

                        <div className="bg-[var(--bg-card)] p-3 rounded-full mb-4 backdrop-blur-md border border-[var(--border-color)] shadow-xl">
                            <CheckCircle2 size={40} className="text-purple-500" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">Resume Ready!</h2>
                        <p className="text-[var(--text-muted)] text-sm mt-1 uppercase tracking-[0.2em] font-bold opacity-80">Exported successfully</p>
                    </div>
                </div>

                <div className="p-8">
                    <div className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-3 mb-6 flex items-center gap-4">
                        <div className="bg-[var(--bg-card)] p-2 rounded shadow-sm border border-[var(--border-color)]">
                            <ShieldCheck size={20} className="text-blue-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)]">File Name</p>
                            <p className="text-sm font-bold text-[var(--text-main)] truncate">{fileName}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                            <div className="bg-purple-500/10 p-2 rounded-lg mt-0.5">
                                <Trophy size={18} className="text-purple-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[var(--text-main)] leading-tight">Take your career further.</h3>
                                <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">Explore more tools and resources on our platform.</p>
                            </div>
                        </div>

                        <a
                            href="https://takovibe.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full px-6 py-3.5 bg-[var(--text-main)] hover:opacity-90 text-[var(--bg-main)] rounded-xl font-bold text-sm transition-all shadow-xl active:scale-95 no-underline"
                        >
                            Visit Takovibe <ArrowRight size={16} className="ml-2" />
                        </a>

                        <button
                            onClick={onClose}
                            className="w-full py-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] uppercase tracking-widest transition-colors"
                        >
                            Back to Editor
                        </button>
                    </div>
                </div>

                <div className="bg-[var(--bg-input)] p-4 border-t border-[var(--border-color)] flex items-center justify-center gap-2">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-60">Powered by Takovibe</span>
                </div>
            </div>
        </div>
    );
}
