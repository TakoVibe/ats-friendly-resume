import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Edit, Trash2, Globe, Lock, Clock, ExternalLink, Loader2, FileText, Plus, LogIn, History, RotateCcw, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LoadingScreen } from '../ui/LoadingScreen';

interface Version {
    id: string;
    resume_data: any;
    version_number: number;
    created_at: string;
}

interface Resume {
    id: string;
    resume_name: string;
    slug: string;
    resume_data: any;
    is_public: boolean;
    updated_at: string;
    versions: Version[];
}

export function UserResumes() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [showVersionsFor, setShowVersionsFor] = useState<Resume | null>(null);
    const [isRestoring, setIsRestoring] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            fetchResumes();
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchResumes = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/resumes/');
            if (response.ok) {
                const data = await response.json();
                setResumes(Array.isArray(data) ? data : (data.results || []));
            } else if (response.status === 401) {
                setResumes([]);
            }
        } catch (error) {
            console.error("Failed to fetch resumes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (slug: string) => {
        if (!confirm(`Are you sure you want to delete this resume?`)) return;

        setIsDeleting(slug);
        try {
            const response = await api.delete(`/api/resumes/${slug}/`);
            if (response.ok) {
                setResumes(resumes.filter(r => r.slug !== slug));
                toast.success("Resume deleted");
            } else {
                toast.error("Failed to delete resume.");
            }
        } catch (error) {
            console.error("Error deleting resume:", error);
            toast.error("Error deleting resume.");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleRestoreVersion = async (resume: Resume, version: Version) => {
        if (!confirm(`Restore to version ${version.version_number}? This will overwrite your current resume data.`)) return;

        setIsRestoring(version.id);
        try {
            const response = await api.put(`/api/resumes/${resume.slug}/`, {
                resume_data: version.resume_data,
                is_public: resume.is_public
            });

            if (response.ok) {
                toast.success(`Restored to Version ${version.version_number}`);
                // Refresh list to update all versions and main data
                fetchResumes();
                setShowVersionsFor(null);
            } else {
                toast.error("Failed to restore version.");
            }
        } catch (error) {
            console.error("Restore failed:", error);
            toast.error("Error restoring version.");
        } finally {
            setIsRestoring(null);
        }
    };

    if (!localStorage.getItem("auth_token")) {
        return (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[32px] p-12 text-center flex flex-col items-center shadow-xl">
                <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mb-6 border border-purple-500/20">
                    <Lock className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-2xl font-black text-[var(--text-main)] mb-2 tracking-tight">Authentication Required</h3>
                <p className="text-[var(--text-muted)] font-medium mb-8 max-w-xs mx-auto text-sm">
                    Please log in to view and manage your saved resumes.
                </p>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('show-login-modal'))}
                    className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-purple-500/20"
                >
                    <LogIn size={18} />
                    Login Now
                </button>
            </div>
        );
    }

    if (isLoading) {
        return <LoadingScreen message="Retrieving your professional portfolio..." />;
    }

    if (resumes.length === 0) {
        return (
            <div className="bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-color)] rounded-[32px] p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-[var(--bg-input)] rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                    <FileText className="w-10 h-10 text-[var(--border-color)]" />
                </div>
                <h3 className="text-2xl font-black text-[var(--text-main)] mb-2 tracking-tight">No resumes found</h3>
                <p className="text-[var(--text-muted)] font-medium mb-8 max-w-xs mx-auto text-sm">
                    You haven't saved any resumes yet. Start creating your professional path now.
                </p>
                <a
                    href="/"
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--bg-input)] hover:bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] rounded-2xl font-bold uppercase tracking-widest transition-all shadow-sm"
                >
                    <Plus size={18} />
                    Create First Resume
                </a>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                    <div
                        key={resume.id}
                        className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[32px] p-6 transition-all hover:shadow-2xl hover:translate-y-[-4px] flex flex-col h-full relative overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[60px] pointer-events-none" />

                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-[var(--bg-input)] rounded-2xl flex items-center justify-center shadow-inner border border-[var(--border-color)] group-hover:scale-110 transition-transform">
                                <FileText size={20} className="text-[var(--text-main)] opacity-70" />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowVersionsFor(resume)}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all shadow-sm"
                                >
                                    <History size={10} /> {resume.versions?.length || 0} Versions
                                </button>
                                {resume.is_public ? (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                                        <Globe size={10} /> Public
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-input)] text-[var(--text-muted)] rounded-full text-[10px] font-black uppercase tracking-widest border border-[var(--border-color)]">
                                        <Lock size={10} /> Private
                                    </div>
                                )}
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-[var(--text-main)] mb-2 tracking-tight line-clamp-1" title={resume.resume_name}>
                            {resume.resume_name}
                        </h3>

                        <div className="flex items-center gap-2 text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-wider mb-8 opacity-70">
                            <Clock size={12} />
                            Updated {new Date(resume.updated_at).toLocaleDateString()}
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-3">
                            <a
                                href={`/?edit=${resume.slug}`}
                                className="flex items-center justify-center gap-2 py-3 bg-[var(--bg-input)] hover:bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm"
                            >
                                <Edit size={14} /> Edit
                            </a>
                            <button
                                onClick={() => handleDelete(resume.slug)}
                                disabled={isDeleting === resume.slug}
                                className="flex items-center justify-center gap-2 py-3 bg-[var(--bg-input)] hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 border border-[var(--border-color)] rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm disabled:opacity-50"
                            >
                                {isDeleting === resume.slug ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Trash2 size={14} />
                                )}
                                Delete
                            </button>
                        </div>

                        {resume.is_public && (
                            <a
                                href={`/resume/${typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').username || 'public' : 'public'}/${resume.slug}`}
                                target="_blank"
                                className="mt-3 flex items-center justify-center gap-2 py-3 bg-[var(--text-main)]/5 hover:bg-[var(--text-main)]/10 text-[var(--text-main)] rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all opacity-60 hover:opacity-100"
                            >
                                View Public Page <ExternalLink size={10} />
                            </a>
                        )}
                    </div>
                ))}
            </div>

            {/* Version History Modal */}
            {showVersionsFor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowVersionsFor(null)}
                    />
                    <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-input)]/20">
                            <div>
                                <h2 className="text-xl font-black text-[var(--text-main)] tracking-tight">Version History</h2>
                                <p className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-widest">
                                    {showVersionsFor.resume_name}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowVersionsFor(null)}
                                className="p-2 hover:bg-[var(--bg-input)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-3">
                                <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-purple-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                                            <Check size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[var(--text-main)]">Current Version</p>
                                            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                                                Active Now
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {showVersionsFor.versions?.map((version) => (
                                    <div
                                        key={version.id}
                                        className="p-4 bg-[var(--bg-input)]/50 border border-[var(--border-color)] rounded-2xl flex items-center justify-between group hover:border-purple-500/30 transition-all hover:bg-[var(--bg-input)]"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] rounded-xl flex items-center justify-center font-black text-xs">
                                                v{version.version_number}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[var(--text-main)]">Snapshot {version.version_number}</p>
                                                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                                                    Saved {new Date(version.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRestoreVersion(showVersionsFor, version)}
                                            disabled={isRestoring === version.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm disabled:opacity-50"
                                        >
                                            {isRestoring === version.id ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                <RotateCcw size={12} />
                                            )}
                                            Restore
                                        </button>
                                    </div>
                                ))}

                                {(!showVersionsFor.versions || showVersionsFor.versions.length === 0) && (
                                    <div className="py-12 text-center opacity-40">
                                        <History size={32} className="mx-auto mb-3" />
                                        <p className="text-xs font-bold uppercase tracking-[0.2em]">No versions yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-[var(--bg-input)]/10 text-center border-t border-[var(--border-color)]">
                            <p className="text-[10px] text-[var(--text-muted)] font-medium leading-relaxed max-w-[280px] mx-auto italic">
                                Note: Restoring a version will replace your current resume data. We recommend making a copy before restoring.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
