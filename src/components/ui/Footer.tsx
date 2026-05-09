import React from 'react';

export function Footer() {
    return (
        <footer className="w-full bg-[var(--bg-card)]/80 backdrop-blur-md py-16 px-6 border-t border-[var(--border-color)] mt-auto text-[var(--text-main)] font-sans-ed">
            <div className="max-w-[100rem] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start group">
                    <div className="flex items-center gap-2">
                        <span className="font-serif-ed text-3xl font-normal tracking-tight text-[var(--text-main)]">ResumeVibe</span>
                    </div>
                    <p className="text-[9px] font-sans-ed font-medium uppercase tracking-[0.25em] text-[var(--text-muted)] mt-2 opacity-80">
                        MADE WITH LOVE IN INDIA • © 2026 TAKOVIBE
                    </p>
                </div>

                <div className="flex items-center gap-10">
                    <a href="/ats-resume-guide" className="text-[10px] font-sans-ed uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all">ATS Guide</a>
                    <a href="/why-resumevibe" className="text-[10px] font-sans-ed uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all">Features</a>
                    <a href="https://takovibe.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-sans-ed uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all">Takovibe HQ</a>
                </div>
            </div>
        </footer>
    );
}
