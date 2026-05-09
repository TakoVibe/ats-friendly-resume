import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Target, CheckCircle2, AlertCircle, MessageSquare, Info, Sparkles, UserCheck, Lock, LogIn, TrendingUp, Cpu, BarChart, Bug, Zap, BarChart3, Settings2, X, ChevronDown, ChevronUp, Calendar, Terminal, Activity, ShieldAlert, Crosshair } from 'lucide-react';
import { Logo } from './ui/Logo';
import { ATSWarning } from './ui/ATSWarning';
import type { ResumeSchema } from '../types/resume';
import { useToken } from '../context/TokenContext';

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
    const [isStartingAutopilot, setIsStartingAutopilot] = useState(false);
    const { useTokens } = useToken();

    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const handleDeepAudit = async (skipTokens = false) => {
        if (!isAuthenticated) {
            onRequireAuth?.();
            return;
        }
        
        if (isAuditing) return;
        setIsAuditing(true);
        setAuditError(null);

        if (!skipTokens) {
            const hasTokens = await useTokens('deep_audit', 30, 'resumevibe');
            if (!hasTokens) {
                setIsAuditing(false);
                return;
            }
        }
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
        if (isStartingAutopilot || isAuditing) return;
        
        setIsStartingAutopilot(true);
        try {
            const hasTokens = await useTokens('pilot_mode', 30, 'resumevibe');
            if (!hasTokens) return;

            onOpenOptimizer?.();
            await handleDeepAudit(true); // skip deep_audit token deduction to prevent double-deduction
        } finally {
            setIsStartingAutopilot(false);
        }
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
                ...(data.openSource || []).map((os: any) => `${os.name} ${os.description || ''}`),
                ...(data.customSections || []).map((cs: any) => `${cs.title} ${cs.items.map((m: any) => typeof m === 'string' ? m : m.text).join(' ')}`),
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
            ...(data.openSource || []).map((os: any) => `${os.name} ${os.description || ''}`),
            ...(data.customSections || []).map((cs: any) => `${cs.title} ${cs.items.map((m: any) => typeof m === 'string' ? m : m.text).join(' ')}`),
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
        <div className="w-full xl:w-[420px] h-full bg-[var(--bg-card)] text-[var(--text-main)] border-l border-[var(--border-color)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 relative font-sans-ed selection:bg-[#8B7355]/30"
             style={{ boxShadow: '-10px 0 30px rgba(0,0,0,0.5)' }}>
             
            {/* Technical Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20" 
                 style={{
                     backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                     backgroundSize: '24px 24px'
                 }} 
            />

            {/* HEADER */}
            <div className="px-5 py-4 bg-[var(--bg-card)] border-b border-[var(--border-color)]/80 flex items-center justify-between relative z-10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-sm animate-pulse" style={{ boxShadow: '0 0 10px #a855f7' }} />
                        <div className="absolute w-4 h-4 border border-purple-500/50 rounded-sm rotate-45" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-[12px] font-black text-[var(--text-main)] uppercase tracking-[0.3em] leading-none">SYS.COCKPIT</h2>
                        <span className="text-[8px] font-mono text-[var(--text-muted)] mt-1 uppercase tracking-widest">Target Acquisition Mode</span>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-1.5 hover:bg-[var(--bg-input)] rounded-md transition-colors xl:hidden text-[var(--text-muted)] hover:text-[var(--text-main)]">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className={`flex-1 overflow-y-auto scrollbar-hide relative z-10 flex flex-col ${!isAuthenticated ? 'overflow-hidden' : ''}`}>
                
                {/* LOCKED OVERLAY */}
                {!isAuthenticated && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-card)]/90 backdrop-blur-xl">
                        <div className="w-16 h-16 border border-[var(--border-color)] bg-[var(--bg-input)] rounded-none flex items-center justify-center text-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)] mb-6 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-purple-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <Lock size={24} className="relative z-10" />
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500" />
                        </div>
                        <h3 className="text-[12px] font-black text-[var(--text-main)] uppercase tracking-[0.4em] mb-4">
                            System Locked
                        </h3>
                        <p className="text-[10px] font-mono text-[var(--text-muted)] mb-8 max-w-[220px] leading-relaxed">
                            &gt; AUTHENTICATION REQUIRED TO ACCESS TELEMETRY AND AUTOPILOT PROTOCOLS.
                        </p>
                        <button
                            onClick={onRequireAuth}
                            className="w-full py-4 bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white rounded-none text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <LogIn size={14} /> AUTHENTICATE
                        </button>
                    </div>
                )}

                <div className={`flex flex-col flex-1 ${!isAuthenticated ? 'blur-md opacity-20 pointer-events-none select-none' : ''}`}>
                    
                    {/* MISSION PHASE / WORKFLOW INDICATOR */}
                    <div className="px-5 py-4 border-b border-[var(--border-color)]/80 bg-[var(--bg-input)]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-[0.2em]">SEQ_{String(currentStep).padStart(2, '0')}</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`h-1 transition-all duration-500 ${i === currentStep ? 'w-6 bg-purple-500' : i < currentStep ? 'w-3 bg-zinc-600' : 'w-3 bg-[var(--bg-input)]'}`} />
                                ))}
                            </div>
                        </div>
                        <div
                            onClick={handleBeginMission}
                            className="p-3 border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-purple-500/50 flex items-center justify-between group cursor-pointer transition-all relative overflow-hidden"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500/0 group-hover:bg-purple-500/50 transition-colors" />
                            <div className="flex items-center gap-4 pl-2">
                                <Target size={16} className="text-[var(--text-muted)] group-hover:text-purple-400 transition-colors" />
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-widest">Target Objective</span>
                                    <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-0.5">{data.targetJD ? 'Objective Defined' : 'Awaiting Input'}</span>
                                </div>
                            </div>
                            <div className="w-6 h-6 border border-[var(--border-color)] group-hover:border-purple-500/30 flex items-center justify-center text-[var(--text-muted)] group-hover:text-purple-400 bg-[var(--bg-input)] transition-colors">
                                <Search size={12} />
                            </div>
                        </div>
                    </div>

                    {!showContent ? (
                        /* EMPTY STATE - AWAITING JD */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                                <Target size={240} strokeWidth={0.5} />
                            </div>
                            
                            <div className="w-full max-w-[280px] bg-[var(--bg-input)] border border-[var(--border-color)] p-5 relative">
                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-purple-500/50" />
                                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-purple-500/50" />
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-purple-500/50" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-purple-500/50" />
                                
                                <div className="flex items-center gap-2 mb-4 text-purple-400">
                                    <Terminal size={14} />
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Terminal</span>
                                </div>
                                <div className="space-y-2 text-[10px] font-mono text-[var(--text-muted)] leading-relaxed mb-6">
                                    <p className="text-[var(--text-muted)]">&gt; SYSTEM IDLE.</p>
                                    <p>&gt; AWAITING TARGET JOB DESCRIPTION.</p>
                                    <p>&gt; PASTE PARAMETERS TO INITIALIZE AUTOPILOT OR PROCEED TO GENERAL DIAGNOSTICS.</p>
                                    <p className="animate-pulse text-purple-500">_</p>
                                </div>
                                
                                <button
                                    onClick={handleBeginMission}
                                    className="w-full py-3 bg-[var(--text-main)] text-[var(--bg-card)] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-3"
                                >
                                    Input Parameters
                                </button>
                                <button
                                    onClick={handleSkipToGeneral}
                                    className="w-full py-2 text-[9px] font-mono text-[var(--text-muted)] hover:text-[var(--text-main)] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                    Override <TrendingUp size={10} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ACTIVE CONTENT STATE */
                        <div className="flex flex-col flex-1">
                            
                            {/* TELEMETRY DASHBOARD (Score + Tabs) */}
                            <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-input)]">
                                <div className="flex items-start gap-6">
                                    {/* Score Module */}
                                    <div className="relative w-28 h-28 shrink-0 flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm">
                                        {/* Decorative corners */}
                                        <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[var(--border-color)]" />
                                        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-[var(--border-color)]" />
                                        
                                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                            {/* Outer dashed track */}
                                            <circle cx="56" cy="56" r="46" stroke="#1f1f22" strokeWidth="1" fill="none" strokeDasharray="2 4" />
                                            {/* Inner solid track */}
                                            <circle cx="56" cy="56" r="38" stroke="#1f1f22" strokeWidth="4" fill="none" />
                                            {/* Progress Arc */}
                                            <circle
                                                cx="56"
                                                cy="56"
                                                r="38"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                strokeDasharray={238.76}
                                                strokeDashoffset={238.76 - (238.76 * score) / 100}
                                                strokeLinecap="butt"
                                                fill="transparent"
                                                className="text-purple-500 transition-[stroke-dashoffset] duration-1000 ease-out"
                                                style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.4))' }}
                                            />
                                        </svg>
                                        <div className="flex flex-col items-center justify-center z-10">
                                            <span className="text-3xl font-black font-mono text-[var(--text-main)] leading-none">{score}</span>
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">Match</span>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex flex-col flex-1 gap-2 pt-1">
                                        {(['pulse', 'strategy', 'analysis'] as const).map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`py-2 px-3 text-left text-[9px] font-black uppercase tracking-[0.2em] transition-all border-l-2 ${
                                                    activeTab === tab
                                                        ? 'border-purple-500 bg-purple-500/10 text-purple-100'
                                                        : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-muted)] hover:border-[var(--border-color)]'
                                                }`}
                                            >
                                                {tab === 'pulse' ? 'Diagnostics' : tab === 'strategy' ? 'Matrix' : 'Deep Scan'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* TAB CONTENT AREA */}
                            <div className="flex-1 p-5 relative">
                                
                                {activeTab === 'pulse' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        {!isAuditing && data.targetJD && (
                                            <button
                                                onClick={handleAutopilot}
                                                disabled={isStartingAutopilot || isAuditing}
                                                className={`w-full p-4 border flex items-center justify-between group relative overflow-hidden transition-all ${
                                                    isStartingAutopilot || isAuditing 
                                                    ? 'border-[var(--border-color)] bg-[var(--bg-input)] cursor-wait' 
                                                    : 'border-purple-500/50 bg-purple-500/5 hover:bg-purple-500/20 hover:border-purple-500'
                                                }`}
                                            >
                                                {/* Scanline effect on hover */}
                                                {!(isStartingAutopilot || isAuditing) && (
                                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent -translate-y-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                                                )}
                                                
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className="w-8 h-8 border border-purple-500/30 bg-[var(--bg-card)] flex items-center justify-center text-purple-400">
                                                        <Zap size={14} className={!(isStartingAutopilot || isAuditing) ? "animate-pulse" : ""} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-widest leading-none">
                                                            {isStartingAutopilot ? 'Initializing...' : 'Engage Autopilot'}
                                                        </p>
                                                        <p className="text-[9px] font-mono text-[var(--text-muted)] mt-1.5 uppercase tracking-wider">Execute Auto-Optimization</p>
                                                    </div>
                                                </div>
                                                <ChevronDown size={14} className="text-purple-500/50 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        )}

                                        <div>
                                            <h3 className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4 border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
                                                <Activity size={12} /> Diagnostic Logs
                                            </h3>
                                            <div className="space-y-3">
                                                {insights.map((insight, i) => (
                                                    <div key={i} className={`p-3 border-l-2 bg-[var(--bg-input)] flex gap-3 ${
                                                        insight.type === 'good' ? 'border-green-500/50' :
                                                        insight.type === 'warning' ? 'border-amber-500/50' :
                                                        'border-blue-500/50'
                                                    }`}>
                                                        <div className={`mt-0.5 shrink-0 ${
                                                            insight.type === 'good' ? 'text-green-500/80' :
                                                            insight.type === 'warning' ? 'text-amber-500/80' :
                                                            'text-blue-500/80'
                                                        }`}>
                                                            {insight.type === 'good' ? <CheckCircle2 size={14} /> :
                                                             insight.type === 'warning' ? <ShieldAlert size={14} /> :
                                                             <Info size={14} />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className={`text-[8px] font-mono font-bold uppercase tracking-wider ${
                                                                    insight.type === 'good' ? 'text-green-500/70' :
                                                                    insight.type === 'warning' ? 'text-amber-500/70' :
                                                                    'text-blue-500/70'
                                                                }`}>
                                                                    {insight.type === 'good' ? 'PASS' : insight.type === 'warning' ? 'WARN' : 'INFO'} // {String(i).padStart(2,'0')}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] font-medium text-[var(--text-main)] leading-snug">
                                                                {insight.text}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'strategy' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div>
                                            <h3 className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4 border-b border-[var(--border-color)] pb-2">Optimization Matrix</h3>
                                            <div className="space-y-4">
                                                {[
                                                    { label: 'Summary', score: data.summary?.length > 50 ? 15 : 0, max: 15 },
                                                    { label: 'Experience', score: data.experience?.length >= 2 ? 30 : (data.experience?.length === 1 ? 15 : 0), max: 30 },
                                                    { label: 'Metrics', score: hasMetrics ? 25 : 0, max: 25 },
                                                    { label: 'Keywords', score: data.targetJD ? Math.min(25, Math.floor(((keywordHeatmap.filter(k => k.found).length / keywordHeatmap.length) || 0) * 100 / 4)) : 0, max: 25 },
                                                ].map((item, i) => (
                                                    <div key={i} className="flex flex-col gap-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9px] font-black text-[var(--text-main)] uppercase tracking-widest">{item.label}</span>
                                                            <span className="text-[9px] font-mono text-[var(--text-muted)]">{item.score} / {item.max}</span>
                                                        </div>
                                                        <div className="flex gap-[2px] h-1.5">
                                                            {Array.from({ length: 10 }).map((_, step) => (
                                                                <div key={step} className={`flex-1 transition-all ${
                                                                    (item.score / item.max) * 10 > step ? 'bg-purple-500' : 'bg-[var(--bg-input)]'
                                                                }`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4 border-b border-[var(--border-color)] pb-2">Keyword Heatmap</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {keywordHeatmap.length > 0 ? (
                                                    keywordHeatmap.map((k, i) => (
                                                        <div key={i} className={`px-2 py-1 border text-[9px] font-mono font-bold uppercase tracking-wider ${
                                                            k.found 
                                                            ? 'border-green-500/30 bg-green-500/10 text-green-400' 
                                                            : 'border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] line-through'
                                                        }`}>
                                                            {k.word}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <button onClick={() => setShowJDInput(true)} className="text-[10px] font-mono text-purple-400 hover:text-purple-300 uppercase tracking-widest py-2">
                                                        &gt; INPUT TARGET JD
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'analysis' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <button
                                            onClick={() => handleDeepAudit(false)}
                                            disabled={isAuditing}
                                            className={`w-full py-3.5 border flex items-center justify-center gap-3 transition-all group ${
                                                isAuditing
                                                ? 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-muted)] cursor-wait'
                                                : auditResult 
                                                    ? 'bg-transparent border-purple-500/30 text-purple-400 hover:border-purple-500' 
                                                    : 'bg-[var(--text-main)] border-transparent text-[var(--bg-card)] hover:bg-white active:scale-[0.98]'
                                            }`}
                                        >
                                            {isAuditing ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-[var(--border-color)] border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Scanning...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Search size={14} className={!auditResult ? "text-[var(--bg-card)]" : "text-purple-400"} />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                                        {auditResult ? 'Rerun Deep Scan' : 'Initialize Deep Scan'}
                                                    </span>
                                                </>
                                            )}
                                        </button>

                                        {auditResult ? (
                                            <div className="space-y-6">
                                                <div className="p-4 border border-[var(--border-color)] bg-[var(--bg-input)] relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                                                        <Cpu size={64} />
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[9px] font-mono font-bold uppercase tracking-widest">
                                                            MATCH {auditResult.aiScore}%
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] font-mono text-[var(--text-main)] leading-relaxed">
                                                        &gt; {auditResult.narrativeAnalysis}
                                                    </p>
                                                </div>

                                                <div className="space-y-3">
                                                    {auditResult.aiScore < 76 && (
                                                        <div className="mb-4">
                                                            <ATSWarning type="score" />
                                                        </div>
                                                    )}
                                                    {auditResult.insights.map((insight: any, i: number) => (
                                                        <div key={i} className="flex gap-3 items-start border-b border-[var(--border-color)]/50 pb-3 last:border-0">
                                                            <div className={`mt-0.5 shrink-0 ${
                                                                insight.type === 'strength' ? 'text-green-500' :
                                                                insight.type === 'gap' ? 'text-amber-500' :
                                                                'text-blue-500'
                                                            }`}>
                                                                {insight.type === 'strength' ? <CheckCircle2 size={12} /> :
                                                                 insight.type === 'gap' ? <AlertCircle size={12} /> :
                                                                 <Info size={12} />}
                                                            </div>
                                                            <p className="text-[11px] font-medium text-[var(--text-muted)] leading-snug pt-0.5">{insight.text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                                                <div className="w-12 h-12 border border-[var(--border-color)] flex items-center justify-center mb-4">
                                                    <Cpu size={20} className="text-[var(--text-muted)]" />
                                                </div>
                                                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">NO DATA</p>
                                                <p className="text-[9px] font-mono text-[var(--text-muted)] max-w-[180px]">Execute deep scan to retrieve detailed trajectory analysis.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ERROR TOAST */}
            {auditError && (
                <div className="absolute bottom-20 left-5 right-5 p-3 bg-red-950/80 border border-red-500/30 backdrop-blur-md flex items-center gap-3 z-50">
                    <Bug size={14} className="text-red-500 shrink-0" />
                    <span className="text-[9px] font-mono font-bold text-red-200 uppercase tracking-widest">{auditError}</span>
                </div>
            )}

            {/* FOOTER ACTION */}
            <div className="p-5 border-t border-[var(--border-color)] bg-[var(--bg-card)] z-20">
                <button
                    onClick={() => {
                        if (!isAuthenticated) return onRequireAuth?.();
                        onOpenGuidance?.(insights, auditResult);
                    }}
                    className={`w-full py-4 border transition-all flex items-center justify-center gap-3 group relative overflow-hidden ${
                        !isAuthenticated 
                        ? 'border-[var(--border-color)] text-[var(--text-muted)] bg-[var(--bg-input)] cursor-not-allowed' 
                        : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:border-[var(--text-main)] hover:text-white'
                    }`}
                >
                    {isAuthenticated && (
                        <div className="absolute inset-0 bg-[var(--bg-input)]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    )}
                    <Settings2 size={14} className="relative z-10" /> 
                    <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em]">
                        {isAuthenticated ? 'Manual Override Guide' : 'Unlock Guide'}
                    </span>
                </button>
            </div>

            {/* JD INPUT OVERLAY */}
            {showJDInput && createPortal(
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans selection:bg-purple-500/30">
                    <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        {/* Grid Background */}
                        <div className="absolute inset-0 pointer-events-none opacity-10" 
                            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                        
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[var(--text-main)] flex items-center gap-3">
                                <Crosshair size={16} className="text-purple-500" /> Target Parameters
                            </h3>
                            <button onClick={() => setShowJDInput(false)} className="p-2 border border-transparent hover:border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="relative z-10 group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-500" />
                            <textarea
                                ref={jdRef}
                                autoFocus
                                value={data.targetJD || ''}
                                onChange={(e) => onUpdateJD?.(e.target.value)}
                                placeholder="> PASTE JOB DESCRIPTION RAW TEXT HERE..."
                                className="w-full h-80 p-5 bg-[var(--bg-card)] border border-[var(--border-color)] text-[12px] font-mono text-[var(--text-main)] placeholder:text-zinc-700 focus:outline-none focus:border-purple-500/50 resize-none transition-colors leading-relaxed scrollbar-hide relative z-10"
                            />
                        </div>
                        
                        <div className="mt-6 flex flex-col gap-4 relative z-10">
                            <div className="flex gap-4">
                                {data.targetJD && (
                                    <button
                                        onClick={() => {
                                            onUpdateJD?.('');
                                            setShowJDInput(false);
                                        }}
                                        className="px-6 py-3 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 active:scale-95 transition-all"
                                    >
                                        Abort
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowJDInput(false)}
                                    className="flex-1 py-3 bg-[var(--text-main)] text-[var(--bg-card)] border border-transparent hover:bg-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                >
                                    {data.targetJD ? 'Lock Parameters' : 'Close Terminal'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
