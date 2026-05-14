import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Logo } from './Logo';

interface LoadingScreenProps {
    message?: string;
}

export function LoadingScreen({ message = "Summoning your career data..." }: LoadingScreenProps) {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-main)] text-[var(--text-main)] font-sans-ed">
            {/* Minimalist Grid Background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVoNDBWMGgtLjV2MzlIMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-20 pointer-events-none" />

            <div className="relative flex flex-col items-center max-w-sm w-full px-6">
                
                {/* Minimal Logo Box */}
                <div className="relative mb-12">
                    <div className="w-24 h-24 bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
                        <div className="absolute inset-0 bg-[var(--text-main)] opacity-0 animate-[pulse_2s_infinite]" />
                        <Logo className="w-12 h-12 text-[var(--text-main)] grayscale" />
                    </div>
                    {/* Decorative accent lines */}
                    <div className="absolute -left-12 top-1/2 w-8 h-[1px] bg-[var(--border-color)]" />
                    <div className="absolute -right-12 top-1/2 w-8 h-[1px] bg-[var(--border-color)]" />
                    <div className="absolute left-1/2 -top-12 w-[1px] h-8 bg-[var(--border-color)]" />
                    <div className="absolute left-1/2 -bottom-12 w-[1px] h-8 bg-[var(--border-color)]" />
                </div>

                {/* Typography & Message */}
                <div className="text-center w-full">
                    <h2 className="font-serif-ed text-3xl text-[var(--text-main)] mb-6 tracking-tight leading-tight">
                        {message}
                    </h2>

                    {/* Minimal Progress Bar */}
                    <div className="w-full h-[1px] bg-[var(--border-color)] relative overflow-hidden mb-8">
                        <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-[var(--text-main)] animate-[progress_1.5s_infinite_ease-in-out]" />
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-3 px-6 py-2 border border-[var(--border-color)] bg-[var(--bg-card)]">
                            <Loader2 size={12} className="animate-spin text-[var(--text-main)]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">
                                Initializing
                            </span>
                        </div>
                        <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-[0.4em] opacity-60">
                            Please wait
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
