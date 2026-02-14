import React from 'react';
import { Globe, Sparkles } from 'lucide-react';
import { Logo } from '../ui/Logo';

export function PublicFooter() {
    return (
        <div className="mt-16 pt-12 border-t border-[var(--border-color)]/30 w-full max-w-4xl flex flex-col items-center">
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
                {/* ResumeVibe Brand */}
                <a href="/" className="flex items-center gap-4 group/rv transition-all duration-500">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-hover/rv:from-purple-500/20 group-hover/rv:to-blue-500/20 rounded-2xl blur-xl transition-all duration-500" />
                        <div className="relative p-2.5 bg-[var(--bg-input)] rounded-2xl border border-[var(--border-color)] group-hover/rv:border-purple-500/40 group-hover/rv:bg-[var(--bg-card)] group-hover/rv:scale-110 transition-all duration-500 shadow-xl overflow-hidden">
                            <Logo className="w-6 h-6 object-contain" />
                            {/* Reflection effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-y-full group-hover/rv:translate-y-[-100%] transition-transform duration-1000" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] opacity-50 group-hover/rv:opacity-100 group-hover/rv:text-purple-500 transition-all">Built with</span>
                        <span className="text-lg font-black text-[var(--text-main)] tracking-tighter group-hover/rv:bg-gradient-to-r group-hover/rv:from-[var(--text-main)] group-hover/rv:to-purple-500 group-hover/rv:bg-clip-text group-hover/rv:text-transparent transition-all duration-500">ResumeVibe</span>
                    </div>
                </a>

                <div className="hidden md:block h-10 w-px bg-gradient-to-b from-transparent via-[var(--border-color)] to-transparent"></div>

                {/* TakoVibe Brand */}
                <a href="https://takovibe.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group/tv transition-all duration-500">
                    <div className="relative">
                        <div className="absolute -inset-3 bg-purple-500/10 rounded-full blur-2xl opacity-0 group-hover/tv:opacity-100 transition-opacity duration-700" />
                        <div className="relative w-14 h-14 p-0.5 rounded-full bg-gradient-to-tr from-purple-500/40 to-indigo-500/40 border border-purple-500/30 group-hover/tv:border-purple-400 group-hover/tv:scale-110 transition-all duration-500 shadow-2xl flex items-center justify-center bg-[var(--bg-card)]">
                            <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-white/20 shadow-xl relative z-10">
                                <img
                                    src="https://takovibe.com/images/logo.svg"
                                    alt="TakoVibe"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Inner glow */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-transparent opacity-0 group-hover/tv:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] opacity-50 group-hover/tv:opacity-100 group-hover/tv:text-purple-400 transition-all">Part of</span>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-[var(--text-main)] tracking-tighter group-hover/tv:text-purple-400 transition-all duration-500">TakoVibe</span>
                            <Sparkles size={12} className="text-purple-500 animate-bounce" />
                        </div>
                    </div>
                </a>
            </div>

            <div className="mt-12 text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-muted)] opacity-20 hover:opacity-100 transition-opacity duration-700 cursor-default">
                Future of Professional Identity
            </div>
        </div>
    );
}
