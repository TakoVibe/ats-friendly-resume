import { useState } from 'react';
import { Check, X, ChevronDown, ChevronRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { ResumeSchema, BulletItem } from '../types/resume';

interface ResumeDiffViewerProps {
    original: ResumeSchema;
    optimized: ResumeSchema;
    onAccept: () => void;
    onReject: () => void;
    onSelectiveApply?: (sections: Partial<ResumeSchema>) => void;
    issues?: string[];
    odds?: {
        selectionChance: number;
        rejectionReasoning: string;
    };
}

interface DiffSection {
    title: string;
    key: keyof ResumeSchema;
    hasChanges: boolean;
}

type SectionAction = 'accept' | 'reject' | 'pending';

export default function ResumeDiffViewer({
    original,
    optimized,
    issues = [],
    odds,
    onAccept,
    onReject,
    onSelectiveApply
}: ResumeDiffViewerProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));
    const [sectionActions, setSectionActions] = useState<Record<string, SectionAction>>({});

    const toggleSection = (key: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedSections(newExpanded);
    };

    const stripIds = (obj: any): any => {
        if (Array.isArray(obj)) return obj.map(stripIds);
        if (obj !== null && typeof obj === 'object') {
            const newObj: any = {};
            Object.keys(obj).forEach(k => {
                if (k !== 'id') newObj[k] = stripIds(obj[k]);
            });
            return newObj;
        }
        return obj;
    };

    const hasChanges = (key: keyof ResumeSchema): boolean => {
        return JSON.stringify(stripIds(original[key])) !== JSON.stringify(stripIds(optimized[key]));
    };

    const sections: DiffSection[] = [
        { title: 'Professional Summary', key: 'summary', hasChanges: hasChanges('summary') },
        { title: 'Skills', key: 'skills', hasChanges: hasChanges('skills') },
        { title: 'Experience', key: 'experience', hasChanges: hasChanges('experience') },
        { title: 'Achievements', key: 'achievements', hasChanges: hasChanges('achievements') },
    ];

    const handleSectionAction = (key: string, action: SectionAction) => {
        setSectionActions(prev => ({ ...prev, [key]: action }));
    };

    const handleApplySelected = () => {
        const selectedChanges: Partial<ResumeSchema> = {};

        sections.forEach(section => {
            const action = sectionActions[section.key];
            if (action === 'accept' && section.hasChanges) {
                selectedChanges[section.key] = optimized[section.key] as any;
            } else if (action === 'reject' || action === undefined) {
                // Keep original
                selectedChanges[section.key] = original[section.key] as any;
            }
        });

        // Merge with original to create final resume
        const finalResume = { ...original, ...selectedChanges };

        if (onSelectiveApply) {
            onSelectiveApply(finalResume);
        } else {
            onAccept();
        }
    };

    const renderSummaryDiff = () => {
        if (original.summary === optimized.summary) {
            return <p className="text-sm text-[var(--text-muted)] italic">No changes</p>;
        }

        return (
            <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-500 mb-1">ORIGINAL</p>
                    <p className="text-sm text-[var(--text-main)] opacity-80">{original.summary}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-500 mb-1">OPTIMIZED</p>
                    <p className="text-sm text-[var(--text-main)] font-medium" dangerouslySetInnerHTML={{ __html: optimized.summary }} />
                </div>
            </div>
        );
    };

    const renderSkillsDiff = () => {
        if (JSON.stringify(original.skills) === JSON.stringify(optimized.skills)) {
            return <p className="text-sm text-[var(--text-muted)] italic">No changes</p>;
        }

        return (
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-500 mb-2">ORIGINAL</p>
                    {original.skills.map((skill, idx) => (
                        <div key={idx} className="mb-2 last:mb-0">
                            <p className="text-xs font-bold text-[var(--text-main)] opacity-70">{skill.name}</p>
                            <p className="text-[11px] text-[var(--text-muted)]">{skill.items.join(', ')}</p>
                        </div>
                    ))}
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-500 mb-2">OPTIMIZED</p>
                    {optimized.skills.map((skill, idx) => (
                        <div key={idx} className="mb-2 last:mb-0">
                            <p className="text-xs font-bold text-[var(--text-main)]">{skill.name}</p>
                            <p className="text-[11px] text-[var(--text-main)]">{skill.items.join(', ')}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderExperienceDiff = () => {
        if (JSON.stringify(original.experience) === JSON.stringify(optimized.experience)) {
            return <p className="text-sm text-[var(--text-muted)] italic">No changes</p>;
        }

        return (
            <div className="space-y-4">
                {optimized.experience.map((optExp, idx) => {
                    const origExp = original.experience.find(e => e.id === optExp.id)
                        || original.experience.find(e => e.role === optExp.role && e.company === optExp.company)
                        || original.experience[idx];

                    if (!origExp) return null;

                    const metricsChanged = JSON.stringify(stripIds(origExp.metrics)) !== JSON.stringify(stripIds(optExp.metrics));
                    const roleChanged = origExp.role !== optExp.role;

                    if (!metricsChanged && !roleChanged) return null;

                    return (
                        <div key={optExp.id} className="border border-[var(--border-color)] bg-[var(--bg-input)]/30 rounded-lg p-3">
                            <p className="text-sm font-bold text-[var(--text-main)] mb-2">
                                {optExp.company} - {optExp.role}
                            </p>

                            {roleChanged && (
                                <div className="mb-2 text-xs">
                                    <span className="text-red-500/70 line-through">{origExp.role}</span>
                                    <span className="mx-2 text-[var(--text-muted)]">→</span>
                                    <span className="text-green-500 font-bold">{optExp.role}</span>
                                </div>
                            )}

                            {metricsChanged && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-red-500/10 rounded p-2 border border-red-500/10">
                                        <p className="text-[10px] font-black uppercase text-red-500 mb-1.5 opacity-70">ORIGINAL</p>
                                        <ul className="text-xs text-[var(--text-muted)] space-y-1">
                                            {origExp.metrics.map((metric: BulletItem, i: number) => (
                                                <li key={i} className="opacity-70">• {typeof metric === 'string' ? metric : metric.text}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-green-500/10 rounded p-2 border border-green-500/10">
                                        <p className="text-[10px] font-black uppercase text-green-500 mb-1.5">OPTIMIZED</p>
                                        <ul className="text-xs text-[var(--text-main)] font-medium space-y-1">
                                            {optExp.metrics.map((metric: BulletItem, i: number) => (
                                                <li key={i} className="flex items-start gap-1">
                                                    <span>•</span>
                                                    <span dangerouslySetInnerHTML={{ __html: typeof metric === 'string' ? metric : metric.text }} />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderAchievementsDiff = () => {
        if (JSON.stringify(original.achievements) === JSON.stringify(optimized.achievements)) {
            return <p className="text-sm text-[var(--text-muted)] italic">No changes</p>;
        }

        return (
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-500 mb-2">ORIGINAL</p>
                    <ul className="text-xs text-[var(--text-muted)] space-y-1">
                        {original.achievements.map((achievement: BulletItem, i: number) => (
                            <li key={i} className="opacity-70">• {typeof achievement === 'string' ? achievement : achievement.text}</li>
                        ))}
                    </ul>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-500 mb-2">OPTIMIZED</p>
                    <ul className="text-xs text-[var(--text-main)] font-medium space-y-1">
                        {optimized.achievements.map((achievement: BulletItem, i: number) => (
                            <li key={i} className="flex items-start gap-1">
                                <span>•</span>
                                <span dangerouslySetInnerHTML={{ __html: typeof achievement === 'string' ? achievement : achievement.text }} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    const renderSectionContent = (key: keyof ResumeSchema) => {
        switch (key) {
            case 'summary':
                return renderSummaryDiff();
            case 'skills':
                return renderSkillsDiff();
            case 'experience':
                return renderExperienceDiff();
            case 'achievements':
                return renderAchievementsDiff();
            default:
                return <p className="text-sm text-[var(--text-muted)] italic">Diff view not implemented for this section</p>;
        }
    };

    const totalChanges = sections.filter(s => s.hasChanges).length;
    const acceptedCount = Object.values(sectionActions).filter(a => a === 'accept').length;
    const rejectedCount = Object.values(sectionActions).filter(a => a === 'reject').length;

    return (
        <div className="flex flex-col h-full max-h-[90vh] bg-[var(--bg-card)]">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-5 text-white shadow-lg relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Review Expert Enhancements</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-black uppercase tracking-widest">
                            {totalChanges} section{totalChanges !== 1 ? 's' : ''} modified
                        </span>
                        {acceptedCount > 0 && (
                            <span className="px-2 py-0.5 bg-green-500/30 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                <Check size={10} /> {acceptedCount} accepted
                            </span>
                        )}
                        {rejectedCount > 0 && (
                            <span className="px-2 py-0.5 bg-red-500/30 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                <X size={10} /> {rejectedCount} rejected
                            </span>
                        )}
                    </div>
                </div>
                {odds && (
                    <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex items-center gap-4 group">
                        <div className="relative w-12 h-12 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/20" />
                                <circle
                                    cx="24" cy="24" r="20"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeDasharray={125.6}
                                    strokeDashoffset={125.6 - (125.6 * odds.selectionChance) / 100}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    className={odds.selectionChance > 70 ? 'text-green-400' : odds.selectionChance > 40 ? 'text-amber-400' : 'text-red-400'}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-sm font-black ${odds.selectionChance > 70 ? 'text-green-400' : odds.selectionChance > 40 ? 'text-amber-400' : 'text-red-400'}`}>{odds.selectionChance}%</span>
                            </div>
                        </div>
                        <div className="flex flex-col flex-1 max-w-[200px]">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-0.5">Selection Odds</span>
                            <span className="text-[10px] leading-snug line-clamp-2 opacity-90 group-hover:line-clamp-none transition-all">{odds.rejectionReasoning}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Warning / Issues Banner */}
            {issues && issues.length > 0 && (
                <div className="mx-6 mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3 shadow-inner">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-orange-500 mb-1">Distant Job Match Detected</h4>
                        <p className="text-xs text-[var(--text-muted)] mb-2">
                            The target Job Description specifies requirements that differ significantly from your current resume. The AI tried its best to optimize, but be aware of these gaps:
                        </p>
                        <ul className="list-disc pl-4 space-y-1">
                            {issues.map((issue, idx) => (
                                <li key={idx} className="text-xs font-medium text-orange-500/80">{issue}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className={`flex-1 overflow-y-auto ${issues?.length ? 'p-6 pt-4' : 'p-6'} space-y-4 no-scrollbar bg-[var(--bg-main)]/30`}>
                {sections.filter(s => s.hasChanges).map((section) => {
                    const action = sectionActions[section.key];

                    return (
                        <div
                            key={section.key}
                            className={`border rounded-xl overflow-hidden transition-all duration-300 shadow-sm ${action === 'accept'
                                ? 'border-green-500/50 bg-green-500/5'
                                : action === 'reject'
                                    ? 'border-red-500/50 bg-red-500/5'
                                    : section.hasChanges
                                        ? 'border-blue-500/30 bg-[var(--bg-card)]'
                                        : 'border-[var(--border-color)] bg-[var(--bg-card)]/50 opacity-60'
                                }`}
                        >
                            <div className="flex items-center justify-between p-4">
                                <button
                                    onClick={() => toggleSection(section.key)}
                                    className="flex-1 flex items-center gap-4 hover:opacity-80 transition-opacity text-left"
                                >
                                    <div className="p-1 rounded bg-[var(--bg-input)] text-[var(--text-muted)]">
                                        {expandedSections.has(section.key) ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )}
                                    </div>
                                    <span className="font-bold text-[var(--text-main)] tracking-tight">{section.title}</span>
                                    {section.hasChanges && !action && (
                                        <span className="px-2 py-0.5 bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-md border border-blue-500/20">
                                            Modified
                                        </span>
                                    )}
                                    {action === 'accept' && (
                                        <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-1 shadow-sm shadow-green-900/20">
                                            <CheckCircle2 size={10} /> Accepted
                                        </span>
                                    )}
                                    {action === 'reject' && (
                                        <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-1 shadow-sm shadow-red-900/20">
                                            <XCircle size={10} /> Rejected
                                        </span>
                                    )}
                                </button>

                                {section.hasChanges && (
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleSectionAction(section.key, 'accept')}
                                            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all active:scale-90 ${action === 'accept'
                                                ? 'bg-green-600 text-white shadow-lg shadow-green-900/20'
                                                : 'bg-[var(--bg-input)] text-green-500 hover:bg-green-500/10'
                                                }`}
                                            title="Accept this section"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleSectionAction(section.key, 'reject')}
                                            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all active:scale-90 ${action === 'reject'
                                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                                : 'bg-[var(--bg-input)] text-red-500 hover:bg-red-500/10'
                                                }`}
                                            title="Reject this section"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {expandedSections.has(section.key) && (
                                <div className="px-6 pb-6 border-t border-[var(--border-color)] bg-[var(--bg-main)]/10">
                                    <div className="pt-6">
                                        {renderSectionContent(section.key)}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-5 bg-[var(--bg-card)] border-t border-[var(--border-color)]">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <p className="text-xs font-medium text-[var(--text-muted)] italic">
                        Select sections above to apply or discard specific optimizations.
                    </p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={onReject}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-input)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl transition-all active:scale-95"
                        >
                            <X size={16} />
                            Reject All
                        </button>
                        <button
                            onClick={handleApplySelected}
                            disabled={acceptedCount === 0 && rejectedCount === 0}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-black text-white bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50 disabled:shadow-none active:scale-95"
                        >
                            <Check size={18} />
                            Apply ({acceptedCount})
                        </button>
                        <button
                            onClick={onAccept}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-black text-white bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl transition-all shadow-xl shadow-green-900/20 active:scale-95"
                        >
                            <CheckCircle2 size={18} />
                            Accept All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
