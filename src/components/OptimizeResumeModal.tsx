import { useState, useEffect } from 'react';
import { Sparkles, Loader2, X, AlertCircle, History, Target } from 'lucide-react';
import { useResume } from '../hooks/useResume';
import ResumeDiffViewer from './ResumeDiffViewer';
import VersionHistory, { type ResumeVersion } from './VersionHistory';
import type { ResumeSchema } from '../types/resume';

interface OptimizeResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
    autoOptimize?: boolean;
    auditResult?: any;
}

type ModalView = 'input' | 'diff' | 'history';

const VERSIONS_STORAGE_KEY = 'resume-versions-v1';

export default function OptimizeResumeModal({ isOpen, onClose, autoOptimize, auditResult }: OptimizeResumeModalProps) {
    const { data: resume, updateResume } = useResume();
    const [view, setView] = useState<ModalView>('input');
    const [jobDescription, setJobDescription] = useState(resume.targetJD || '');

    // Sync JD if it changes elsewhere (e.g. sidebar)
    useEffect(() => {
        if (resume.targetJD !== jobDescription) {
            setJobDescription(resume.targetJD || '');
        }
    }, [resume.targetJD]);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [optimizedResume, setOptimizedResume] = useState<ResumeSchema | null>(null);
    const [originalResume, setOriginalResume] = useState<ResumeSchema | null>(null);
    const [versions, setVersions] = useState<ResumeVersion[]>(() => {
        try {
            const stored = localStorage.getItem(VERSIONS_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const saveVersions = (newVersions: ResumeVersion[]) => {
        setVersions(newVersions);
        localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(newVersions));
    };

    // Auto-Optimize trigger
    useEffect(() => {
        if (isOpen && autoOptimize && jobDescription && view === 'input' && !isOptimizing && !optimizedResume) {
            handleOptimize();
        }
    }, [isOpen, autoOptimize, jobDescription]);

    const handleOptimize = async () => {
        if (!jobDescription.trim()) {
            setError('Please paste a job description');
            return;
        }

        setIsOptimizing(true);
        setError(null);
        setOriginalResume(resume);

        try {
            const response = await fetch('/api/optimize-resume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resume,
                    jobDescription: jobDescription.trim(),
                    auditResult
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to optimize resume');
            }

            if (data.success && data.optimizedResume) {
                setOptimizedResume(data.optimizedResume);
                setView('diff');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleAcceptChanges = () => {
        if (!optimizedResume) return;

        // Save current version to history before applying changes
        const newVersion: ResumeVersion = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            label: `Optimized for: ${jobDescription.substring(0, 50)}...`,
            data: optimizedResume,
            jobDescription: jobDescription.trim(),
        };

        const updatedVersions = [newVersion, ...versions].slice(0, 20); // Keep last 20 versions
        saveVersions(updatedVersions);

        // Apply changes
        updateResume(optimizedResume);

        // Reset and close
        handleClose();
    };

    const handleRejectChanges = () => {
        setView('input');
        setOptimizedResume(null);
        setOriginalResume(null);
    };

    const handleRestoreVersion = (version: ResumeVersion) => {
        updateResume(version.data);
        handleClose();
    };

    const handleDeleteVersion = (versionId: string) => {
        const updatedVersions = versions.filter(v => v.id !== versionId);
        saveVersions(updatedVersions);
    };

    const handlePreviewVersion = (version: ResumeVersion) => {
        // Could implement a preview modal here
        console.log('Preview version:', version);
    };

    const handleClose = () => {
        setView('input');
        setError(null);
        setOptimizedResume(null);
        setOriginalResume(null);
        onClose();
    };

    if (!isOpen) return null;

    // Render version history view
    if (view === 'history') {
        return (
            <VersionHistory
                versions={versions}
                currentVersion={resume}
                onRestore={handleRestoreVersion}
                onDelete={handleDeleteVersion}
                onPreview={handlePreviewVersion}
                onClose={() => setView('input')}
            />
        );
    }

    // Render diff view
    if (view === 'diff' && optimizedResume && originalResume) {
        return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
                <div className="relative w-full max-w-5xl bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow)] overflow-hidden max-h-[90vh] flex flex-col border border-[var(--border-color)]">
                    <ResumeDiffViewer
                        original={originalResume}
                        optimized={optimizedResume}
                        onAccept={handleAcceptChanges}
                        onReject={handleRejectChanges}
                        onSelectiveApply={handleAcceptChanges}
                    />
                </div>
            </div>
        );
    }

    // Render input view (default)
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="relative w-full max-w-2xl bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow)] overflow-hidden border border-[var(--border-color)] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-5 text-white shadow-lg relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                            <h2 className="text-xl font-black tracking-tight">{auditResult ? 'Deep Contextual Rescue' : 'Expert Resume Optimizer'}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setView('history')}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors active:scale-95"
                                title="Version History"
                            >
                                <History className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors active:scale-95"
                                disabled={isOptimizing}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <p className="mt-2 text-xs font-medium text-purple-100 uppercase tracking-widest opacity-80">
                        {auditResult ? 'Fixing identified gaps for max ATS impact' : 'Maximize your ATS score with AI'}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 bg-[var(--bg-main)]/5">
                    {/* Job Description Input */}
                    <div>
                        <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 px-1">
                            Target Job Description
                        </label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => {
                                setJobDescription(e.target.value);
                                updateResume({ ...resume, targetJD: e.target.value });
                            }}
                            placeholder="Paste the full job description here..."
                            className="w-full h-64 px-4 py-4 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/40 outline-none transition-all resize-none font-sans text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 leading-relaxed"
                            disabled={isOptimizing}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-red-500">Optimization Error</p>
                                <p className="text-xs text-red-400 font-medium mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Contextual Context or Info Box */}
                    {auditResult ? (
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 group transition-all animate-in slide-in-from-bottom-2">
                            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Target size={14} /> Fixing {auditResult.insights?.filter((i: any) => i.type === 'gap').length || 'Critical'} Deep Audit Gaps
                            </h3>
                            <ul className="space-y-2 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-500/20">
                                {auditResult.insights?.filter((i: any) => i.type === 'gap').map((gap: any, idx: number) => (
                                    <li key={idx} className="text-[11px] text-[var(--text-muted)] font-medium flex items-start gap-2">
                                        <AlertCircle size={12} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                                        <span className="leading-tight opacity-90">{gap.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        !error && !isOptimizing && (
                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5 group transition-all">
                                <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Sparkles size={14} /> Optimization Process
                                </h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                    <li className="text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-2">
                                        <span className="w-1 h-1 bg-blue-500 rounded-full" />
                                        Smart analysis of core requirements
                                    </li>
                                    <li className="text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-2">
                                        <span className="w-1 h-1 bg-blue-500 rounded-full" />
                                        Rewrites for maximum impact
                                    </li>
                                    <li className="text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-2">
                                        <span className="w-1 h-1 bg-blue-500 rounded-full" />
                                        Side-by-side comparison
                                    </li>
                                    <li className="text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-2">
                                        <span className="w-1 h-1 bg-blue-500 rounded-full" />
                                        Version history saved
                                    </li>
                                </ul>
                            </div>
                        )
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-5 bg-[var(--bg-card)] border-t border-[var(--border-color)] flex items-center justify-between">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                        Powered by Expert Analysis • {versions.length} versions archived
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] rounded-xl transition-all active:scale-95"
                            disabled={isOptimizing}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleOptimize}
                            disabled={isOptimizing || !jobDescription.trim()}
                            className="px-8 py-2.5 text-xs font-black text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all shadow-xl shadow-purple-900/20 disabled:opacity-50 disabled:shadow-none active:scale-95 flex items-center gap-2"
                        >
                            {isOptimizing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analysing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    {auditResult ? 'Fix Audit Gaps & Optimize' : 'Optimize'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
