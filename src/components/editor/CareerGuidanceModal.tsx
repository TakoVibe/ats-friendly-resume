import { X, CheckCircle2, AlertCircle, Info, ArrowRight, Target, BarChart3, Briefcase, Sparkles, Cpu } from 'lucide-react';
import type { ResumeSchema } from '../../types/resume';

interface CareerGuidanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ResumeSchema;
    insights: Array<{ type: 'good' | 'warning' | 'info'; text: string }>;
    auditResult?: any;
    onFixAll?: () => void;
}

export function CareerGuidanceModal({ isOpen, onClose, data, insights, auditResult, onFixAll }: CareerGuidanceModalProps) {
    if (!isOpen) return null;

    const issues = insights.filter(i => i.type !== 'good');
    const wins = insights.filter(i => i.type === 'good');

    const aiObservations = auditResult?.insights?.filter((i: any) => i.type === 'gap') || [];
    const aiStrengths = auditResult?.insights?.filter((i: any) => i.type === 'strength') || [];

    const totalCritical = issues.length + aiObservations.length;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[var(--bg-card)] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[var(--border-color)] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-[var(--border-color)] flex items-start justify-between relative bg-gradient-to-br from-purple-500/5 to-transparent">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Target size={18} className="text-purple-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500">Career Strategy</span>
                        </div>
                        <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Expert Guidance</h2>
                        <p className="text-sm text-[var(--text-muted)] mt-1 font-medium italic opacity-70">
                            Actionable steps to make your resume "Elite" for recruiters.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-input)] rounded-full transition-colors">
                        <X size={24} className="text-[var(--text-muted)]" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-[500px]">
                    {/* Left Side: Tasks */}
                    <div className="flex-1 p-8 overflow-y-auto border-r border-[var(--border-color)] scrollbar-hide">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-6 flex items-center gap-2">
                            <ArrowRight size={14} className="text-purple-500" /> Critical Tasks ({totalCritical})
                        </h3>

                        <div className="space-y-4">
                            {/* AI Deep Audit Observations */}
                            {aiObservations.map((obs: any, i: number) => (
                                <div key={`ai-${i}`} className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex gap-4 transition-all hover:scale-[1.02]">
                                    <div className="mt-1">
                                        <Sparkles size={20} className="text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[var(--text-main)] leading-tight">{obs.text}</p>
                                        <p className="text-[10px] font-black uppercase tracking-tighter text-indigo-500 mt-1">Deep AI Insight</p>
                                    </div>
                                </div>
                            ))}

                            {issues.length > 0 || aiObservations.length > 0 ? (
                                issues.map((issue, i) => (
                                    <div key={i} className={`p-4 rounded-2xl border flex gap-4 transition-all hover:scale-[1.02] ${issue.type === 'warning'
                                        ? 'bg-red-500/5 border-red-500/10'
                                        : 'bg-blue-500/5 border-blue-500/10'
                                        }`}>
                                        <div className="mt-1">
                                            {issue.type === 'warning'
                                                ? <AlertCircle size={20} className="text-red-500" />
                                                : <Info size={20} className="text-blue-500" />
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[var(--text-main)] leading-tight">{issue.text}</p>
                                            <p className="text-xs text-[var(--text-muted)] mt-1 opacity-70">
                                                {issue.type === 'warning' ? 'Immediate action required for ATS matching.' : 'Optimization recommended for better visual impact.'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <div className="bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 size={32} className="text-green-500" />
                                    </div>
                                    <p className="font-bold text-[var(--text-main)]">You're elite!</p>
                                    <p className="text-xs text-[var(--text-muted)]">No critical issues found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Quick Stats & Tips */}
                    <div className="w-full md:w-64 bg-[var(--bg-input)]/50 p-8 overflow-y-auto scrollbar-hide">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 flex items-center gap-2">
                                    <BarChart3 size={12} /> Live Progress
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] uppercase">
                                        <span>Strength</span>
                                        <span>{wins.length + aiStrengths.length}/{insights.length + (auditResult?.insights?.length || 0)}</span>
                                    </div>
                                    <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
                                            style={{ width: `${((wins.length + aiStrengths.length) / (insights.length + (auditResult?.insights?.length || 0) || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {auditResult?.narrativeAnalysis && (
                                <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-2 flex items-center gap-1.5">
                                        <Cpu size={10} /> AI Narrative
                                    </h4>
                                    <p className="text-[10px] text-[var(--text-main)] font-medium leading-relaxed italic opacity-80">
                                        "{auditResult.narrativeAnalysis}"
                                    </p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 flex items-center gap-2">
                                    <Briefcase size={12} /> Expert Tips
                                </h3>
                                <ul className="space-y-4">
                                    <li className="text-[11px] text-[var(--text-muted)] leading-relaxed flex gap-2">
                                        <div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                                        <span>Use keywords from the JD at least **3 times** in your experience section.</span>
                                    </li>
                                    <li className="text-[11px] text-[var(--text-muted)] leading-relaxed flex gap-2">
                                        <div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                                        <span>Every experience bullet should contain exactly one **percentage or dollar sign**.</span>
                                    </li>
                                    <li className="text-[11px] text-[var(--text-muted)] leading-relaxed flex gap-2">
                                        <div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                                        <span>Ensure your summary defines your **Unique Value Proposition** (UVP).</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-[var(--bg-input)] flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    >
                        I'll fix manually
                    </button>
                    {onFixAll && (
                        <button
                            onClick={() => {
                                onFixAll();
                                onClose();
                            }}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Sparkles size={14} className="animate-pulse" /> Auto-Fix Issues with AI
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
