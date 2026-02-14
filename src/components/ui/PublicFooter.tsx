import React from 'react';
import { Globe, Sparkles } from 'lucide-react';
import { Logo } from '../ui/Logo';

export function PublicFooter() {
    return (
        <div className="mt-10 pt-8 border-t border-[var(--border-color)]/30 w-full max-w-4xl flex flex-col items-center">
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-40 hover:opacity-100 transition-all duration-500">
                <a href="/" className="flex items-center gap-3 group/rv">
                    <div className="p-1.5 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)] group-hover/rv:border-purple-500/30 group-hover/rv:scale-110 transition-all duration-300 shadow-sm">
                        <Logo className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">Built with</span>
                        <span className="text-sm font-black text-[var(--text-main)] tracking-tight">ResumeVibe</span>
                    </div>
                </a>

                <div className="hidden md:block h-8 w-px bg-[var(--border-color)]/50"></div>

                <a href="https://takovibe.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group/tv">
                    <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20 group-hover/tv:bg-purple-500 group-hover/tv:text-white group-hover/tv:scale-110 transition-all duration-300 shadow-sm text-purple-500">
                        <Globe size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">Part of</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-[var(--text-main)] tracking-tight">TakoVibe</span>
                            <Sparkles size={10} className="text-purple-500 animate-pulse" />
                        </div>
                    </div>
                </a>
            </div>

        </div>
    );
}
