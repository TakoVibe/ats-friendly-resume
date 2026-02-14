import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Logo } from './Logo';

interface LoadingScreenProps {
    message?: string;
}

export function LoadingScreen({ message = "Summoning your career data..." }: LoadingScreenProps) {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-main)] overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />

            <div className="relative flex flex-col items-center">
                {/* Logo with pulsing effect */}
                <div className="relative mb-12">
                    <div className="absolute inset-x-[-20px] inset-y-[-20px] bg-purple-500/20 rounded-full blur-3xl animate-pulse" />

                    <div className="relative w-28 h-28 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[32px] flex items-center justify-center shadow-2xl overflow-hidden group">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <Logo className="w-16 h-16 transition-transform duration-700 group-hover:scale-110" />
                    </div>

                    {/* Orbiting particles/rings */}
                    <div className="absolute -inset-4 border-2 border-purple-500/10 rounded-[40px] animate-[spin_10s_linear_infinite]" />
                    <div className="absolute -inset-8 border border-blue-500/5 rounded-[48px] animate-[spin_15s_linear_infinite_reverse]" />

                    {/* Floating Sparkles */}
                    <Sparkles className="absolute -top-4 -right-4 text-purple-400 w-6 h-6 animate-bounce" />
                </div>

                {/* Loading Text */}
                <div className="text-center group">
                    <h2 className="text-2xl font-black text-[var(--text-main)] mb-4 tracking-tight">
                        <span className="bg-gradient-to-r from-[var(--text-main)] via-[var(--text-main)] to-[var(--text-main)]/40 bg-[length:200%_auto] animate-[textShimmer_3s_linear_infinite] bg-clip-text text-transparent">
                            {message}
                        </span>
                    </h2>

                    {/* Progress indicator */}
                    <div className="w-64 h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden border border-[var(--border-color)]/30 mx-auto relative shadow-inner">
                        <div className="absolute top-0 bottom-0 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 rounded-full animate-[progress_2s_infinite_ease-in-out]">
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-[var(--bg-input)] rounded-full border border-[var(--border-color)] backdrop-blur-sm">
                            <Loader2 size={12} className="animate-spin text-purple-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-80">
                                AI Engine Active
                            </span>
                        </div>
                        <p className="text-[9px] font-bold text-[var(--text-muted)] opacity-40 uppercase tracking-widest">
                            Refining your professional identity
                        </p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes progress {
                    0% { left: -40%; width: 40%; }
                    100% { left: 100%; width: 40%; }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                @keyframes textShimmer {
                    0% { background-position: 100% 50%; }
                    100% { background-position: -100% 50%; }
                }
            `}} />
        </div>
    );
}
