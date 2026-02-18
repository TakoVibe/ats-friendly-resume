import { useState } from 'react';
import { X, Linkedin, Copy, CheckCircle2, AlertCircle, Info, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import type { ResumeSchema } from '../../types/resume';

interface LinkedInExportProps {
    isOpen: boolean;
    onClose: () => void;
    data: ResumeSchema;
}

export function LinkedInExport({ isOpen, onClose, data }: LinkedInExportProps) {
    const [copiedSection, setCopiedSection] = useState<string | null>(null);
    const [aiParagraph, setAiParagraph] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const generateAIBio = async () => {
        setIsGenerating(true);
        try {
            const allContent = [
                data.summary,
                ...data.experience.map(e => `${e.role} at ${e.company}: ${e.metrics.map(m => typeof m === 'string' ? m : m.text).join('. ')}`),
                ...data.skills.map(s => `${s.name}: ${s.items.join(', ')}`),
                ...(data.openSource || []).map(os => `${os.name}: ${os.description}. ${os.metrics?.map(m => typeof m === 'string' ? m : m.text).join('. ')}`)
            ].join('\n\n');

            const response = await fetch('/api/optimize-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: allContent,
                    type: 'linkedin-paragraph'
                })
            });
            const result = await response.json();
            if (result.optimized) {
                setAiParagraph(result.optimized);
            }
        } catch (error) {
            console.error('LinkedIn AI generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const formatLinkedInExperience = (exp: ResumeSchema['experience'][0]) => {
        const bullets = exp.metrics.map(m => {
            const text = typeof m === 'string' ? m : m.text;
            const stripped = text.replace(/<[^>]*>?/gm, ''); // Remove any HTML tags
            return `• ${stripped}`;
        }).join('\n');

        return `${exp.role}\n${exp.company}\n\n${bullets}`;
    };

    const formatLinkedInProject = (project: ResumeSchema['projects'][0]) => {
        const bullets = (project.metrics || []).map(m => {
            const text = typeof m === 'string' ? m : m.text;
            const stripped = text.replace(/<[^>]*>?/gm, '');
            return `• ${stripped}`;
        }).join('\n');

        return `${project.name}\n${project.description || ''}\n\n${bullets}`;
    };

    const formatLinkedInOpenSource = (os: NonNullable<ResumeSchema['openSource']>[0]) => {
        const bullets = (os.metrics || []).map(m => {
            const text = typeof m === 'string' ? m : m.text;
            const stripped = text.replace(/<[^>]*>?/gm, '');
            return `• ${stripped}`;
        }).join('\n');

        return `${os.name}\n${os.description || ''}\n\n${bullets}`;
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSection(id);
        setTimeout(() => setCopiedSection(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-8 py-6 border-b border-[var(--border-color)] flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0077b5] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Linkedin size={20} fill="currentColor" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[var(--text-main)] uppercase tracking-widest">LinkedIn Sync</h2>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider opacity-60">AI Powered Personal Branding</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-input)] rounded-full transition-colors"
                    >
                        <X size={20} className="text-[var(--text-muted)]" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 scrollbar-hide space-y-8">

                    {/* AI Paragraph Generator Section */}
                    <div className="p-6 bg-gradient-to-br from-indigo-600/10 to-purple-600/5 border border-indigo-500/20 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                            <Sparkles size={48} className="text-indigo-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex flex-col">
                                    <h3 className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[.2em]">AI Condensed Paragraph</h3>
                                    <span className="text-[9px] font-bold text-[var(--text-muted)] mt-0.5 opacity-60 uppercase tracking-widest">Best for LinkedIn "About" section</span>
                                </div>
                                {!aiParagraph && (
                                    <button
                                        onClick={generateAIBio}
                                        disabled={isGenerating}
                                        className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isGenerating ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={14} />}
                                        {isGenerating ? 'Generating...' : 'Generate with AI'}
                                    </button>
                                )}
                            </div>

                            {aiParagraph ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="p-4 bg-white/50 dark:bg-black/20 border border-indigo-500/10 rounded-2xl text-[14px] leading-relaxed text-[var(--text-main)] font-medium italic">
                                        "{aiParagraph}"
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleCopy(aiParagraph, 'ai-para')}
                                            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${copiedSection === 'ai-para'
                                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                                : 'bg-[var(--text-main)] text-[var(--bg-main)] hover:opacity-90'
                                                }`}
                                        >
                                            {copiedSection === 'ai-para' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                            {copiedSection === 'ai-para' ? 'Copied to Clipboard' : 'Copy Paragraph'}
                                        </button>
                                        <button
                                            onClick={generateAIBio}
                                            className="px-4 py-3 bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-indigo-500 rounded-xl transition-colors"
                                            title="Regenerate"
                                        >
                                            <TrendingUp size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed italic opacity-60">
                                    Condensed your entire professional journey into one high-impact, story-driven paragraph. Perfect for a quick read by recruiters.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="w-full h-px bg-[var(--border-color)] opacity-50" />

                    {/* Instructions */}
                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-3 items-start">
                        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">How to use</p>
                            <p className="text-[12px] text-[var(--text-main)] opacity-80 leading-relaxed">
                                LinkedIn's experience editor doesn't support rich formatting (bold/italic). We've converted your resume into clean, professional blocks using standard bullets that work perfectly in their interface.
                            </p>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="space-y-10">
                        {/* Summary Section */}
                        {data.summary && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Professional Summary</h3>
                                    <button
                                        onClick={() => handleCopy(data.summary.replace(/<[^>]*>?/gm, ''), 'summary')}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 transition-colors"
                                    >
                                        {copiedSection === 'summary' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                        {copiedSection === 'summary' ? 'Copied' : 'Copy Block'}
                                    </button>
                                </div>
                                <div className="p-4 bg-[var(--bg-input)]/50 border border-[var(--border-color)] rounded-2xl text-[13px] text-[var(--text-main)] opacity-80 font-mono whitespace-pre-wrap leading-relaxed">
                                    {data.summary.replace(/<[^>]*>?/gm, '')}
                                </div>
                            </div>
                        )}

                        {/* Experience Section */}
                        <div className="space-y-6">
                            <div className="px-1">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Experience Items</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {data.experience.map((exp) => {
                                    const formatted = formatLinkedInExperience(exp);
                                    return (
                                        <div key={exp.id} className="group relative p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl hover:border-blue-500/30 transition-all">
                                            <div className="flex items-center justify-between mb-3 border-b border-[var(--border-color)] pb-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-tight">{exp.role}</span>
                                                    <span className="text-[9px] font-bold text-[var(--text-muted)] opacity-60">{exp.company}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(formatted, exp.id)}
                                                    className={`h-8 px-3 rounded-lg flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all ${copiedSection === exp.id
                                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                                        : 'bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-blue-500'
                                                        }`}
                                                >
                                                    {copiedSection === exp.id ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                                    {copiedSection === exp.id ? 'Copied' : 'Copy'}
                                                </button>
                                            </div>
                                            <div className="text-[12px] text-[var(--text-main)] opacity-70 font-mono whitespace-pre-wrap line-clamp-3 overflow-hidden">
                                                {formatted}
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[var(--bg-card)] to-transparent pointer-events-none rounded-b-2xl" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Projects Section */}
                        {data.projects && data.projects.length > 0 && (
                            <div className="space-y-6">
                                <div className="px-1">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Projects</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {data.projects.map((project) => {
                                        const formatted = formatLinkedInProject(project);
                                        return (
                                            <div key={project.id} className="group relative p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl hover:border-blue-500/30 transition-all">
                                                <div className="flex items-center justify-between mb-3 border-b border-[var(--border-color)] pb-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-tight">{project.name}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCopy(formatted, project.id)}
                                                        className={`h-8 px-3 rounded-lg flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all ${copiedSection === project.id
                                                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                                            : 'bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-blue-500'
                                                            }`}
                                                    >
                                                        {copiedSection === project.id ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                                        {copiedSection === project.id ? 'Copied' : 'Copy'}
                                                    </button>
                                                </div>
                                                <div className="text-[12px] text-[var(--text-main)] opacity-70 font-mono whitespace-pre-wrap line-clamp-3 overflow-hidden">
                                                    {formatted}
                                                </div>
                                                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[var(--bg-card)] to-transparent pointer-events-none rounded-b-2xl" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Open Source Section */}
                        {data.openSource && data.openSource.length > 0 && (
                            <div className="space-y-6">
                                <div className="px-1">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Open Source</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {data.openSource.map((os) => {
                                        const formatted = formatLinkedInOpenSource(os);
                                        return (
                                            <div key={os.id} className="group relative p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl hover:border-blue-500/30 transition-all">
                                                <div className="flex items-center justify-between mb-3 border-b border-[var(--border-color)] pb-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-tight">{os.name}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCopy(formatted, os.id)}
                                                        className={`h-8 px-3 rounded-lg flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all ${copiedSection === os.id
                                                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                                            : 'bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-blue-500'
                                                            }`}
                                                    >
                                                        {copiedSection === os.id ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                                        {copiedSection === os.id ? 'Copied' : 'Copy'}
                                                    </button>
                                                </div>
                                                <div className="text-[12px] text-[var(--text-main)] opacity-70 font-mono whitespace-pre-wrap line-clamp-3 overflow-hidden">
                                                    {formatted}
                                                </div>
                                                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[var(--bg-card)] to-transparent pointer-events-none rounded-b-2xl" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-[var(--border-color)] bg-[var(--bg-input)]/20 flex flex-col items-center gap-2">
                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40 italic text-center">LinkedIn doesn't allow rich formatting (Bold/Italic) in Experience blocks.</p>
                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">TakoVibe Sync v1.1 • AI Powered</p>
                </div>
            </div>
        </div>
    );
}
