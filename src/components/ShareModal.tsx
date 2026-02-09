import { X, Link, Mail, MessageCircle, Copy, Check, Globe, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    resumeId: string;
    fullName: string;
}

export function ShareModal({ isOpen, onClose, resumeId, fullName }: ShareModalProps) {
    const [copied, setCopied] = useState(false);
    const mockPublicUrl = `https://resumevibe.com/v/${resumeId || 'user-123'}`;

    const handleCopy = async () => {
        const text = mockPublicUrl;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Clipboard API failed, using fallback', err);
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (copyErr) {
                console.error('Fallback copy failed', copyErr);
            }
            document.body.removeChild(textArea);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow)] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-[var(--border-color)]">
                {/* Header */}
                <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl flex items-center justify-center transform -rotate-3 group-hover:rotate-0 transition-transform">
                            <Globe size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[var(--text-main)] tracking-tight leading-none mb-1">Share Portfolio</h2>
                            <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em]">Personal Digital Resume</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                    {/* URL Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">Personal Portfolio Link</label>
                            <span
                                className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-40 flex items-center gap-1 cursor-not-allowed"
                            >
                                <Globe size={10} /> Live Preview (Upcoming)
                            </span>
                        </div>
                        <div className="relative group grayscale">
                            <div className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl pl-12 pr-32 py-4 flex items-center opacity-50 transition-all shadow-inner">
                                <Link size={18} className="absolute left-4 text-[var(--text-muted)] transition-colors" />
                                <span className="text-sm font-bold text-[var(--text-muted)] truncate select-all">{mockPublicUrl}</span>
                            </div>
                            <button
                                disabled
                                className="absolute right-2 top-2 bottom-2 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg z-30 bg-[var(--border-color)] text-[var(--text-muted)] cursor-not-allowed"
                            >
                                Upcoming
                            </button>
                        </div>
                    </div>

                    {/* Quick Share */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1 opacity-60">Instant Reach</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                {
                                    icon: Mail, label: 'Email', color: 'blue', bg: 'bg-blue-500/10', text: 'text-blue-500',
                                    url: `mailto:?subject=Professional Portfolio - ${fullName}&body=Hello, I'd like to share my professional portfolio with you: ${mockPublicUrl}`
                                },
                                {
                                    icon: MessageCircle, label: 'WhatsApp', color: 'green', bg: 'bg-green-500/10', text: 'text-green-500',
                                    url: `https://wa.me/?text=${encodeURIComponent(`Check out my professional portfolio: ${mockPublicUrl}`)}`
                                },
                                {
                                    icon: Sparkles, label: 'LinkedIn', color: 'purple', bg: 'bg-purple-500/10', text: 'text-purple-500',
                                    url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(mockPublicUrl)}`
                                }
                            ].map((social, i) => (
                                <button
                                    key={i}
                                    onClick={() => window.open(social.url, '_blank')}
                                    className="flex flex-col items-center justify-center p-4 bg-[var(--bg-input)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl gap-2 transition-all group hover:border-[var(--accent)]/30 hover:-translate-y-1"
                                >
                                    <div className={`p-3 ${social.bg} rounded-xl group-hover:scale-110 transition-transform`}>
                                        <social.icon size={20} className={social.text} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-[var(--text-muted)] group-hover:text-[var(--text-main)]">{social.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Premium Card */}
                    <div className="p-4 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent rounded-2xl border border-blue-500/10 flex items-start gap-4 ring-1 ring-blue-500/5">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-lg flex-shrink-0">
                            <TrendingUp size={16} className="text-white animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-[var(--text-main)] leading-tight uppercase tracking-wide">Dynamic Presentation</h3>
                            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-medium leading-relaxed opacity-80">
                                This link opens a high-performance web view with your selected theme.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-[var(--bg-input)]/50 border-t border-[var(--border-color)] flex items-center justify-center">
                    <button
                        onClick={onClose}
                        className="px-12 py-3 bg-[var(--bg-card)] hover:bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-main)] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-sm"
                    >
                        Back to Editor
                    </button>
                </div>
            </div>
        </div>
    );
}
