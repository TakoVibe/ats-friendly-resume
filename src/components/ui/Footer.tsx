import React from 'react';

export function Footer() {
    return (
        <footer className="w-full bg-[var(--bg-card)]/30 backdrop-blur-sm py-12 px-6 border-t border-[var(--border-color)] mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start group">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tighter text-[var(--text-main)] uppercase">ResumeVibe</span>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mt-1.5 opacity-60">
                        MADE WITH LOVE IN INDIA • © 2026 TAKOVIBE
                    </p>
                </div>

                <div className="flex items-center gap-10">
                    <a href="/ats-resume-guide" className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-purple-500 transition-all">ATS Guide</a>
                    <a href="/why-resumevibe" className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-purple-500 transition-all">Features</a>
                    <a href="https://takovibe.com" target="_blank" rel="noopener noreferrer" className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-purple-500 transition-all">Takovibe HQ</a>
                </div>
            </div>
        </footer>
    );
}
