import { useState, useEffect, useRef } from 'react';
import { Search, Target, CheckCircle2, AlertCircle, MessageSquare, Info, Sparkles, UserCheck, Lock, LogIn, TrendingUp, Cpu, BarChart, Bug, Zap, BarChart3, Settings2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Logo } from './ui/Logo';
import type { ResumeSchema } from '../types/resume';

interface RecruiterPanelProps {
    data: ResumeSchema;
    onUpdateJD?: (jd: string) => void;
    onOpenGuidance?: (insights: Array<{ type: 'good' | 'warning' | 'info'; text: string }>, auditResult?: any) => void;
    onOpenOptimizer?: () => void;
    onAuditResult?: (result: any) => void;
    isAuthenticated?: boolean;
    onRequireAuth?: () => void;
    onClose?: () => void;
}

export function RecruiterPanel({ data, onUpdateJD, onOpenGuidance, onOpenOptimizer, onAuditResult, isAuthenticated, onRequireAuth, onClose }: RecruiterPanelProps) {
    const [score, setScore] = useState(0);
    const [showJDInput, setShowJDInput] = useState(false);
    const [activeTab, setActiveTab] = useState<'pulse' | 'strategy' | 'analysis'>('pulse');
    const [isJDExpanded, setIsJDExpanded] = useState(true);
    const jdRef = useRef<HTMLTextAreaElement>(null);
    const [insights, setInsights] = useState<Array<{ type: 'good' | 'warning' | 'info'; text: string }>>([]);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState<any>(null);
    const [auditError, setAuditError] = useState<string | null>(null);
    // Explicitly track if we are in "General Mode" (no JD)
    const [isGeneralMode, setIsGeneralMode] = useState(false);

    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const handleDeepAudit = async () => {
        if (!isAuthenticated) {
            onRequireAuth?.();
            return;
        }

        setIsAuditing(true);
        setAuditError(null);
        try {
            const response = await fetch('/api/deep-audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resume: data,
                    jobDescription: data.targetJD || (isGeneralMode ? "General Industry Standards" : "")
                })
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setAuditResult(result.audit);
                onAuditResult?.(result.audit);
            } else {
                setAuditError(result.details || result.error || 'Audit failed');
            }
        } catch (err) {
            setAuditError('Connection error: Check your API configuration.');
        } finally {
            setIsAuditing(false);
        }
    };

    // Autopilot: Audit + Optimize
    const handleAutopilot = async () => {
        if (!isAuthenticated) {
            onRequireAuth?.();
            return;
        }
        onOpenOptimizer?.();
        handleDeepAudit();
    };

    const handleBeginMission = () => {
        if (!isAuthenticated) {
            onRequireAuth?.();
            return;
        }
        setShowJDInput(true);
    };

    const handleSkipToGeneral = () => {
        if (!isAuthenticated) {
            onRequireAuth?.();
            return;
        }
        setIsGeneralMode(true);
        // Automatically switch to analysis tab and start audit? Or just show the tabs?
        // Let's just show the tabs (effectively forcing a "ready" state without JD)
        // We set a flag or just rely on manual state. 
        // Actually, the UI logic relies on `data.targetJD` to show tabs. 
        // We should probably have a local state override.
    };

    useEffect(() => {
        let newScore = 0;
        const newInsights = [];

        // Constants for resilience
        const METRICS_REGEX = /[0-9]+%|[0-9]+\+|[0-9]+x|\$[0-9]+|over [0-9]+|more than [0-9]+|[0-9]+ (million|billion|k|m|b)/i;
        const ACTION_VERBS = ['led', 'managed', 'achieved', 'launched', 'architected', 'designed', 'optimized', 'reduced', 'increased', 'coordinated', 'developed', 'implemented', 'transformed', 'delivered', 'automated', 'streamlined'];

        // Analysis: Summary
        if (data.summary && data.summary.trim().length > 60) {
            newScore += 15;
            newInsights.push({ type: 'good', text: 'Strong professional summary detected.' });
        } else {
            newInsights.push({ type: 'warning', text: 'Summary is too short or missing critical value proposition.' });
        }

        // Analysis: Experience Depth
        if (data.experience && data.experience.length >= 2) {
            newScore += 20;
            newInsights.push({ type: 'good', text: 'Good amount of professional experience.' });
        } else if (data.experience.length === 1) {
            newScore += 10;
            newInsights.push({ type: 'info', text: 'Consider adding more experience entries.' });
        }

        // Analysis: Metrics / Quantifiable results
        const metricBullets = data.experience.flatMap((exp: any) =>
            exp.metrics.filter((m: any) => METRICS_REGEX.test(typeof m === 'string' ? m : m.text))
        );

        if (metricBullets.length >= 3) {
            newScore += 25;
            newInsights.push({ type: 'good', text: 'Excellent use of quantifiable metrics across roles.' });
        } else if (metricBullets.length > 0) {
            newScore += 15;
            newInsights.push({ type: 'info', text: 'Good start with metrics, but try to add numbers to more bullets.' });
        } else {
            newInsights.push({ type: 'warning', text: 'No quantifiable metrics found ($ or %). Add numbers to show impact.' });
        }

        // Analysis: Action Verbs
        const actionVerbBullets = data.experience.flatMap((exp: any) =>
            exp.metrics.filter((m: any) => {
                const text = typeof m === 'string' ? m : m.text;
                const firstWord = text.trim().split(' ')[0].toLowerCase();
                return ACTION_VERBS.includes(firstWord);
            })
        );

        if (actionVerbBullets.length >= 5) {
            newScore += 15;
            newInsights.push({ type: 'good', text: 'Dynamic language: Strong action verbs start your bullets.' });
        } else {
            newInsights.push({ type: 'info', text: 'Use more action verbs like "Launched" or "Optimized" to start bullets.' });
        }

        // Analysis: Skills
        if (data.skills && data.skills.length >= 5) {
            newScore += 10;
            newInsights.push({ type: 'good', text: 'Skills section is robust and well-structured.' });
        } else if (data.skills.length > 0) {
            newScore += 5;
            newInsights.push({ type: 'info', text: 'Add more specific technical or soft skills.' });
        }

        // Analysis: Keywords from JD
        if (data.targetJD) {
            const jdKeywords = data.targetJD.toLowerCase().split(/[ ,.\n]+/)
                .map(w => w.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '')) // Clean punctuation
                .filter(w => w.length > 4 && !['about', 'using', 'working', 'experience', 'skills', 'responsibilities', 'candidate', 'company', 'requirements'].includes(w));

            const uniqueKeywords = [...new Set(jdKeywords)].slice(0, 20);

            // Critical Fix: Only search in actual resume content, NOT the entire data object (which includes targetJD)
            const resumeContent = [
                data.summary,
                ...data.experience.map((e: any) => `${e.company} ${e.role} ${(e.metrics || []).map((m: any) => typeof m === 'string' ? m : m.text).join(' ')}`),
                ...data.skills.map((s: any) => `${s.name} ${s.items.join(' ')}`),
                ...(data.projects || []).map((p: any) => `${p.name} ${p.description || ''} ${(p.metrics || []).map((m: any) => typeof m === 'string' ? m : m.text).join(' ')}`),
                ...(data.customSections || []).map((os: any) => `${os.title} ${os.items.map((m: any) => typeof m === 'string' ? m : m.text).join(' ')}`),
            ].join(' ').toLowerCase();

            const foundKeywords = uniqueKeywords.filter(k => {
                try {
                    const regex = new RegExp(`\\b${escapeRegExp(k)}\\b`, 'i');
                    return regex.test(resumeContent);
                } catch (e) {
                    return false;
                }
            });

            if (foundKeywords.length > 0) {
                const matchRate = (foundKeywords.length / uniqueKeywords.length) * 100;
                newScore += Math.floor(matchRate / 4); // Max 25 points
                newInsights.push({
                    type: matchRate > 50 ? 'good' : 'info',
                    text: `Keyword Match: Found ${foundKeywords.length} critical terms from the job description.`
                });
            } else {
                newInsights.push({ type: 'warning', text: 'No specific keywords from the Job Description found.' });
            }
        }

        if (auditResult && typeof auditResult.score === 'number') {
            setScore(auditResult.score);
        } else {
            setScore(Math.min(newScore, 100));
        }
        setInsights(newInsights as Array<{ type: 'good' | 'warning' | 'info'; text: string }>);
    }, [data, auditResult, isAuthenticated]);

    const getKeywords = () => {
        if (!data.targetJD) return [];
        const jdKeywords = data.targetJD.toLowerCase().split(/[ ,.\n]+/)
            .map((w: string) => w.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '')) // Clean punctuation
            .filter((w: string) => w.length > 5 && !['company', 'requirements', 'preferred', 'qualifications', 'excellent', 'strong'].includes(w));
        const unique = [...new Set(jdKeywords)].slice(0, 15);

        const resumeContent = [
            data.summary,
            ...data.experience.map((e: any) => `${e.company} ${e.role} ${(e.metrics || []).map((m: any) => typeof m === 'string' ? m : m.text).join(' ')}`),
            ...data.skills.map((s: any) => `${s.name} ${s.items.join(' ')}`),
            ...(data.projects || []).map((p: any) => `${p.name} ${p.description || ''} ${(p.metrics || []).map((m: any) => typeof m === 'string' ? m : m.text).join(' ')}`),
            ...(data.customSections || []).map((os: any) => `${os.title} ${os.items.map((m: any) => typeof m === 'string' ? m : m.text).join(' ')}`),
        ].join(' ').toLowerCase();

        return unique.map(word => ({
            word,
            found: (() => {
                try {
                    return new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i').test(resumeContent);
                } catch (e) {
                    return false;
                }
            })()
        }));
    };

    const keywordHeatmap = getKeywords();
    const hasMetrics = data.experience.some((exp: any) =>
        exp.metrics.some((m: any) => {
            const text = typeof m === 'string' ? m : m.text;
            return /[0-9]+%|[0-9]+\+|[0-9]+x|\$[0-9]+|over [0-9]+|more than [0-9]+/i.test(text);
        })
    );

    // Derived state for showing content: either we have a JD OR we are in General Mode
    const showContent = !!data.targetJD || isGeneralMode;

    // Workflow step calculation
    const currentStep = !showContent ? 1 : (!auditResult ? 2 : 3);

    return (
        <div className="w-full xl:w-96 h-full bg-[var(--bg-card)] border-l border-[var(--border-color)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 shadow-2xl relative">
            {/* HUD Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: 'radial-gradient(#8b5cf6 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }} />
            <div className="absolute inset-0 opacity-[0.01] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: 'linear-gradient(transparent 50%, #000 50%)', backgroundSize: '100% 4px' }} />
            {/* AI COCKPIT Header */}
            <div className="px-6 py-4 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex items-center justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col relative z-10">
                    <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-[.25em] drop-shadow-sm">AI Cockpit</h2>
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-purple-500/20" />
                        <div className="w-2 h-2 rounded-full bg-purple-500/20" />
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 hover:bg-[var(--bg-input)] rounded-full transition-colors xl:hidden"
                        >
                            <X size={20} className="text-[var(--text-muted)]" />
                        </button>
                    )}
                </div>
            </div>

            {/* Workflow Segment */}
            <div className="px-6 py-4 bg-[var(--bg-input)]/30 border-b border-[var(--border-color)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.05),transparent)] pointer-events-none" />
                <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest opacity-80">Phase 1</span>
                    <div className="flex gap-1.5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === 1 ? 'w-6 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'w-3 bg-[var(--border-color)]'}`} />
                        ))}
                    </div>
                </div>
                <div
                    onClick={handleBeginMission}
                    className="p-3 bg-[var(--bg-card)] rounded-xl border border-purple-500/20 flex items-center justify-between group cursor-pointer hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all shadow-sm relative overflow-hidden active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] duration-1000 transition-transform pointer-events-none" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 shadow-inner">
                            <Target size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[.1em]">1. Target Mission</span>
                            <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">Set Job Objective</span>
                        </div>
                    </div>
                    <Search size={14} className="text-[var(--text-muted)] group-hover:text-purple-500 group-hover:scale-110 transition-all" />
                </div>
            </div>

            {/* Score Matrix (The Circular Score) */}
            <div className={`px-6 py-6 flex items-center gap-8 relative ${!isAuthenticated ? 'overflow-hidden' : ''}`}>
                {!isAuthenticated && (
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-xl z-20 flex items-center justify-center rounded-xl animate-in fade-in duration-500 border border-white/10">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
                                <Lock size={18} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[.25em] text-purple-500">Locked</span>
                        </div>
                    </div>
                )}
                <div className={`relative w-24 h-24 flex-shrink-0 group ${!isAuthenticated ? 'blur-xl' : ''}`}>
                    <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all duration-500" />
                    <svg className="w-full h-full transform -rotate-90 relative z-10">
                        <circle
                            cx="48"
                            cy="48"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-[var(--border-color)] opacity-20"
                        />
                        <circle
                            cx="48"
                            cy="48"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray={263.9}
                            strokeDashoffset={263.9 - (263.9 * score) / 100}
                            strokeLinecap="round"
                            fill="transparent"
                            className="text-orange-500 transition-[stroke-dashoffset] duration-1000 ease-out shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <span className="text-2xl font-black text-[var(--text-main)] leading-none font-mono">{score}</span>
                        <span className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-tighter mt-1">Audit Score</span>
                    </div>
                </div>

                {/* Score Tabs Styling */}
                <div className="flex flex-col flex-1 gap-3">
                    <div className="flex bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-color)] h-fit shadow-inner">
                        {(['pulse', 'strategy', 'analysis'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] transition-all truncate border border-transparent ${activeTab === tab
                                    ? 'bg-[var(--bg-card)] text-purple-500 shadow-md border-purple-500/20'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                            >
                                {tab === 'pulse' ? 'Checklist' : tab === 'strategy' ? 'Strategy' : 'Audit'}
                            </button>
                        ))}
                    </div>
                    {/* Protocol Badge */}
                    <div className="px-2 py-1.5 bg-purple-500/5 rounded-lg border border-purple-500/10 flex items-center justify-between">
                        <span className="text-[7px] font-black text-purple-500/80 uppercase tracking-widest">Protocol</span>
                        <span className="text-[7px] font-mono text-[var(--text-muted)] opacity-60">RECRUITER_STD_v0.7</span>
                    </div>
                </div>
            </div>
            {/* Content Area */}
            <div className={`flex-1 overflow-y-auto px-6 py-4 scrollbar-hide space-y-6 relative ${!isAuthenticated ? 'overflow-hidden' : ''}`}>
                {!isAuthenticated && (
                    <div className="absolute inset-0 z-[30] flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-card)]/40 backdrop-blur-2xl animate-in fade-in duration-500">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl mb-6 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] duration-700 transition-transform" />
                            <Sparkles size={28} />
                        </div>
                        <h3 className="text-[12px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 uppercase tracking-[.4em] mb-6">
                            Unlock Elite Intelligence
                        </h3>
                        <p className="text-[9px] text-[var(--text-muted)] font-black mb-16 leading-relaxed max-w-[200px] uppercase tracking-widest opacity-60">
                            Make your resume perfect and outperform the competition.
                        </p>
                        <button
                            onClick={onRequireAuth}
                            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[.25em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20 active:scale-95"
                        >
                            <LogIn size={16} /> Login to Unlock
                        </button>
                    </div>
                )}
                <div className={!isAuthenticated ? 'blur-2xl opacity-20 select-none pointer-events-none' : ''}>
                    {!showContent ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/20 mb-6 group hover:scale-110 transition-transform">
                                <Logo className="w-full h-full" />
                            </div>
                            <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest mb-2">Ready for Autopilot?</h3>
                            <p className="text-[10px] text-[var(--text-muted)] font-medium max-w-[200px] mb-8 leading-relaxed">
                                Paste a Job Description to start the autonomous optimization workflow.
                            </p>
                            <div className="flex flex-col gap-3 w-full px-4">
                                <button
                                    onClick={handleBeginMission}
                                    className="w-full py-3 bg-[var(--text-main)] text-[var(--bg-main)] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Search size={14} /> Begin Mission
                                </button>
                                <button
                                    onClick={handleSkipToGeneral}
                                    className="w-full py-2 text-[var(--text-muted)] hover:text-[var(--text-main)] text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                                >
                                    Skip to General Audit <TrendingUp size={12} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Status Pulse Tab */}
                            {activeTab === 'pulse' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {/* Autopilot Call to Action */}
                                    {!isAuditing && data.targetJD && (
                                        <button
                                            onClick={handleAutopilot}
                                            className="w-full p-4 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl text-white shadow-xl shadow-purple-500/20 group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-95 border border-white/10"
                                        >
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                                    <Sparkles size={16} className="animate-pulse" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Power Autopilot</p>
                                                    <p className="text-[8px] font-bold opacity-70 mt-1">Audit & Fix All Gaps with AI</p>
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                    <div>
                                        <div className="flex items-center justify-between mb-4 px-1">
                                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-500/80 flex items-center gap-2">
                                                <Search size={12} /> System Readout
                                            </h3>
                                            <span className="text-[8px] font-mono text-[var(--text-muted)] opacity-50">v0.7_AUDIT</span>
                                        </div>
                                        <div className="space-y-4">
                                            {insights.map((insight, i) => (
                                                <div key={i} className={`group relative p-4 bg-[var(--bg-input)]/20 backdrop-blur-md rounded-xl border-t border-l transition-all hover:bg-[var(--bg-input)]/40 ${insight.type === 'good' ? 'border-green-500/20' :
                                                    insight.type === 'warning' ? 'border-amber-500/20' :
                                                        'border-blue-500/20'
                                                    }`}>
                                                    {/* Technical metadata */}
                                                    <div className="absolute top-2 right-3 flex items-center gap-2">
                                                        <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded border ${insight.type === 'good' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                                            insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                                'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                                            }`}>
                                                            {insight.type === 'good' ? '[OPTIMAL]' : insight.type === 'warning' ? '[ADJUST]' : '[INFO]'}
                                                        </span>
                                                        <span className="text-[7px] font-mono text-[var(--text-muted)] opacity-30">INS_{String(i + 1).padStart(2, '0')}</span>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <div className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${insight.type === 'good' ? 'bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' :
                                                            insight.type === 'warning' ? 'bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' :
                                                                'bg-blue-500/10 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                                            }`}>
                                                            {insight.type === 'good' ? <CheckCircle2 size={16} /> :
                                                                insight.type === 'warning' ? <AlertCircle size={16} /> :
                                                                    <MessageSquare size={16} />}
                                                        </div>
                                                        <div className="flex flex-col gap-1 pt-1 pr-12">
                                                            <p className="text-[11px] font-bold text-[var(--text-main)] leading-tight tracking-tight">
                                                                {insight.text}
                                                            </p>
                                                            <div className="w-12 h-[2px] bg-gradient-to-r from-purple-500/40 to-transparent rounded-full" />
                                                        </div>
                                                    </div>

                                                    {/* Corner Accent */}
                                                    <div className={`absolute bottom-0 right-0 w-2 h-2 border-r border-b opacity-40 ${insight.type === 'good' ? 'border-green-500' :
                                                        insight.type === 'warning' ? 'border-amber-500' :
                                                            'border-blue-500'
                                                        }`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {
                                activeTab === 'strategy' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div>
                                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-500/80 mb-4 px-1">Optimization Matrix</h3>
                                            <div className="space-y-3 uppercase">
                                                {[
                                                    { label: 'Summary', score: data.summary?.length > 50 ? 15 : 0, max: 15 },
                                                    { label: 'Experience', score: data.experience?.length >= 2 ? 30 : (data.experience?.length === 1 ? 15 : 0), max: 30 },
                                                    { label: 'Metrics', score: hasMetrics ? 25 : 0, max: 25 },
                                                    { label: 'Keywords', score: data.targetJD ? Math.min(25, Math.floor(((keywordHeatmap.filter(k => k.found).length / keywordHeatmap.length) || 0) * 100 / 4)) : 0, max: 25 },
                                                ].map((item, i) => (
                                                    <div key={i} className="bg-[var(--bg-input)]/30 backdrop-blur-sm px-4 py-3 rounded-xl border border-[var(--border-color)]">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[8px] font-mono font-bold text-[var(--text-main)]">{item.label}</span>
                                                            <span className="text-[8px] font-mono text-purple-500">{item.score}/{item.max}</span>
                                                        </div>
                                                        <div className="flex gap-[2px]">
                                                            {Array.from({ length: 10 }).map((_, step) => (
                                                                <div key={step} className={`flex-1 h-1.5 rounded-sm transition-all duration-1000 ${(item.score / item.max) * 10 > step ? 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.4)]' : 'bg-white/5'
                                                                    }`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">Keyword Match</h3>
                                            <div className="flex flex-wrap gap-1.5 p-3 bg-[var(--bg-input)]/50 rounded-xl border border-[var(--border-color)]">
                                                {keywordHeatmap.length > 0 ? (
                                                    keywordHeatmap.map((k, i) => (
                                                        <span key={i} className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border transition-colors ${k.found
                                                            ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
                                                            : 'bg-rose-500/5 border-rose-500/10 text-rose-400 opacity-60'
                                                            }`}>
                                                            {k.word}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <button onClick={() => setShowJDInput(true)} className="text-[10px] text-purple-500 font-bold hover:underline py-2">Set target Job Description →</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                activeTab === 'analysis' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        {/* Deep Audit Trigger */}
                                        <button
                                            onClick={handleDeepAudit}
                                            disabled={isAuditing}
                                            className={`w-full py-3.5 rounded-2xl border flex items-center justify-center gap-2.5 transition-all group relative overflow-hidden ${isAuditing
                                                ? 'bg-[var(--bg-input)] border-[var(--border-color)] cursor-wait opacity-80'
                                                : auditResult ? 'bg-[var(--bg-input)] border-purple-500/20 text-purple-600' : 'bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-400/30 text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95'
                                                }`}
                                        >
                                            {isAuditing ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Auditing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={12} className="group-hover:rotate-12 transition-transform" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{auditResult ? 'Re-Run Deep Audit' : 'Start Deep AI Audit'}</span>
                                                </>
                                            )}
                                        </button>

                                        {auditResult ? (
                                            <div className="space-y-6">
                                                <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/20 rounded-full">
                                                            <Zap size={10} className="text-indigo-500" />
                                                            <span className="text-[8px] font-black text-indigo-500 uppercase">{auditResult.aiScore}% Match</span>
                                                        </div>
                                                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">AI Audit</span>
                                                    </div>
                                                    <p className="text-[11px] text-[var(--text-main)] font-medium leading-relaxed italic opacity-80">
                                                        "{auditResult.narrativeAnalysis}"
                                                    </p>
                                                </div>

                                                <div className="space-y-3">
                                                    {auditResult.insights.map((insight: any, i: number) => (
                                                        <div key={i} className={`group flex gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] relative overflow-hidden ${insight.type === 'strength' ? 'bg-green-500/5 border-green-500/10' :
                                                            insight.type === 'gap' ? 'bg-rose-500/5 border-rose-500/10' :
                                                                'bg-blue-500/5 border-blue-500/10'
                                                            }`}>
                                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${insight.type === 'strength' ? 'bg-green-500/40' :
                                                                insight.type === 'gap' ? 'bg-rose-500/40' :
                                                                    'bg-blue-500/40'
                                                                }`} />
                                                            <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${insight.type === 'strength' ? 'bg-green-500/20 text-green-500' :
                                                                insight.type === 'gap' ? 'bg-rose-500/20 text-rose-500' :
                                                                    'bg-blue-500/20 text-blue-500'
                                                                }`}>
                                                                {insight.type === 'strength' ? <CheckCircle2 size={16} /> :
                                                                    insight.type === 'gap' ? <AlertCircle size={16} /> :
                                                                        <Info size={16} />}
                                                            </div>
                                                            <p className="text-[11px] font-bold text-[var(--text-main)] leading-tight self-center">{insight.text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                                                <Cpu size={32} className="mb-4 text-[var(--text-muted)]" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">No Audit Data</p>
                                                <p className="text-[9px] mt-2 max-w-[150px]">Run a Deep Audit to get nuanced career trajectory analysis.</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            }
                        </>
                    )}
                </div>

                {auditError && (
                    <div className="mx-5 mb-4 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
                        <Bug size={12} className="text-rose-500" />
                        <span className="text-[9px] font-black text-rose-500 uppercase">{auditError}</span>
                    </div>
                )}

                {/* Footer Action */}
                <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col gap-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between mb-1 px-1">
                        <span className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Optimization Engine</span>
                        <span className="text-[7px] font-mono text-purple-500">READY_FOR_DEPLOY</span>
                    </div>
                    <button
                        onClick={() => {
                            if (!isAuthenticated) {
                                onRequireAuth?.();
                                return;
                            }
                            onOpenGuidance?.(insights, auditResult);
                        }}
                        className={`w-full py-3.5 bg-[var(--text-main)] text-[var(--bg-main)] rounded-2xl text-[10px] font-black uppercase tracking-[.25em] transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] shadow-2xl shadow-black/20 group relative overflow-hidden ${!isAuthenticated ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] duration-700 transition-transform" />
                        <UserCheck size={16} className="relative z-10" /> <span className="relative z-10">{isAuthenticated ? 'Step-By-Step Guide' : 'Login to Unlock Guide'}</span>
                    </button>
                </div>

                {/* JD Input Overlay */}
                {
                    showJDInput && (
                        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-md animate-in fade-in duration-150 flex items-start justify-center pt-10 px-4">
                            <div className="w-full bg-[var(--bg-card)] rounded-3xl border border-purple-500/30 shadow-2xl p-6 animate-in zoom-in-95 duration-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-purple-500 flex items-center gap-2">
                                        <Search size={14} /> Target Job Description
                                    </h3>
                                    <button onClick={() => setShowJDInput(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                                        <X size={16} className="text-[var(--text-muted)]" />
                                    </button>
                                </div>
                                <textarea
                                    ref={jdRef}
                                    autoFocus
                                    value={data.targetJD || ''}
                                    onChange={(e) => onUpdateJD?.(e.target.value)}
                                    placeholder="Paste the job description here to enable the heatmap and deep AI audit..."
                                    className="w-full h-64 p-4 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl text-[12px] text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/40 outline-none resize-none transition-all leading-relaxed scrollbar-hide"
                                />
                                <div className="mt-6 flex flex-col gap-4">
                                    <div className="p-3 bg-purple-500/5 rounded-xl flex items-center gap-3">
                                        <Zap size={14} className="text-purple-500" />
                                        <p className="text-[10px] font-bold text-purple-600/80 uppercase tracking-tighter">
                                            Real-time scoring & heatmap active
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {data.targetJD && (
                                            <button
                                                onClick={() => {
                                                    onUpdateJD?.('');
                                                    setShowJDInput(false);
                                                }}
                                                className="flex-1 py-4 bg-rose-500/10 text-rose-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-500/20 active:scale-95 transition-all"
                                            >
                                                Clear JD
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setShowJDInput(false)}
                                            className="flex-[2] py-4 bg-[var(--text-main)] text-[var(--bg-main)] rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-xl"
                                        >
                                            {data.targetJD ? 'Apply Changes' : 'Close'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
            {/* Versioning Footer Citations */}
            <div className="px-6 py-5 border-t border-[var(--border-color)] bg-[var(--bg-input)]/20 flex items-center justify-center opacity-40">
                <span className="text-[7px] font-mono tracking-[.3em] uppercase">PROTOCOL: v0.7_ACTIVE</span>
            </div>
        </div>
    );
}
