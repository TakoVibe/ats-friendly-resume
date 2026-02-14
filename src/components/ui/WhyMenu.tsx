import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Globe, History, Zap, ShieldCheck } from 'lucide-react';

export function WhyMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const features = [
        {
            title: 'Personalized Public URL',
            description: 'Get a professional slug like /resume/name-title',
            icon: <Globe className="w-4 h-4 text-blue-500" />,
            highlight: true
        },
        {
            title: 'Up to 10 History Versions',
            description: 'Save and restore points in time comfortably',
            icon: <History className="w-4 h-4 text-purple-500" />,
            highlight: true
        },
        {
            title: 'AI Deep Audit',
            description: 'Real-time recruiter-level analysis of your resume',
            icon: <Zap className="w-4 h-4 text-amber-500" />
        },
        {
            title: 'ATS-Proof Templates',
            description: 'Tested against major applicant tracking systems',
            icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />
        }
    ];

    return (
        <div className="relative hidden xl:block" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all group"
            >
                Why ResumeVibe?
                <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-[var(--bg-input)]/30 border-b border-[var(--border-color)]">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">Unique Advantages</h3>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                        {features.map((feature, idx) => (
                            <div key={idx} className="p-3 hover:bg-[var(--bg-input)] rounded-xl transition-all group/item cursor-default">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] group-hover/item:border-[var(--accent)]/30 transition-colors">
                                        {feature.icon}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-[var(--text-main)]">{feature.title}</span>
                                            {feature.highlight && (
                                                <span className="text-[8px] font-black px-1.5 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-md uppercase">Top</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 bg-[var(--bg-input)]/50 border-t border-[var(--border-color)]">
                        <a
                            href="/why-resumevibe"
                            className="flex items-center justify-center gap-2 w-full py-2 bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
                        >
                            Explore All Features <Sparkles size={12} />
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
