import { useState } from 'react';
import { Clock, Trash2, Eye, RotateCcw } from 'lucide-react';
import type { ResumeSchema } from '../types/resume';

export interface ResumeVersion {
    id: string;
    timestamp: number;
    label: string;
    data: ResumeSchema;
    jobDescription?: string;
}

interface VersionHistoryProps {
    versions: ResumeVersion[];
    currentVersion: ResumeSchema;
    onRestore: (version: ResumeVersion) => void;
    onDelete: (versionId: string) => void;
    onPreview: (version: ResumeVersion) => void;
    onClose: () => void;
}

export default function VersionHistory({
    versions,
    currentVersion,
    onRestore,
    onDelete,
    onPreview,
    onClose
}: VersionHistoryProps) {
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    const isCurrentVersion = (version: ResumeVersion) => {
        return JSON.stringify(version.data) === JSON.stringify(currentVersion);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 font-sans-ed">
            <div
                className="absolute inset-0 bg-[var(--text-main)]/10 backdrop-blur-sm transition-all duration-300"
                onClick={onClose}
            />
            <div className="relative w-full max-w-3xl bg-[var(--bg-card)] rounded-sm shadow-2xl overflow-hidden max-h-[80vh] flex flex-col border border-[var(--border-color)] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-[var(--border-color)] bg-[var(--bg-card)] relative z-10">
                    <h2 className="font-serif-ed text-4xl text-[var(--text-main)] tracking-tight mb-2">Version History</h2>
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--text-muted)]">
                        {versions.length} versions archived
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-main)]/5 custom-scrollbar">
                    {versions.length === 0 ? (
                        <div className="text-center py-20 border border-transparent">
                            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-[var(--text-muted)] opacity-50" />
                            </div>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">No versions yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {versions.map((version) => {
                                const isCurrent = isCurrentVersion(version);
                                const isSelected = selectedVersion === version.id;

                                return (
                                    <div
                                        key={version.id}
                                        className={`group border p-6 transition-all duration-300 ${isSelected
                                            ? 'border-[var(--text-main)] bg-[var(--text-main)]/5 shadow-lg'
                                            : isCurrent
                                                ? 'border-green-500/50 bg-green-500/5'
                                                : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--text-main)]'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <h3 className="font-serif-ed text-2xl text-[var(--text-main)] truncate tracking-tight">{version.label}</h3>
                                                    {isCurrent && (
                                                        <span className="font-sans-ed text-[9px] uppercase tracking-[0.2em] px-2 py-1 border border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/5">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mt-4">
                                                    <p className="flex items-center gap-1.5 opacity-80">
                                                        <Clock size={12} className="opacity-50" />
                                                        {formatDate(version.timestamp)}
                                                    </p>
                                                    {version.jobDescription && (
                                                        <p className="flex items-center gap-1.5 opacity-60 truncate">
                                                            <span className="w-1 h-1 bg-[var(--text-muted)] rounded-full" />
                                                            {version.jobDescription.substring(0, 50)}...
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onPreview(version)}
                                                    className="w-10 h-10 flex items-center justify-center border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--text-main)] hover:text-[var(--text-main)] transition-all"
                                                    title="Preview"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                {!isCurrent && (
                                                    <button
                                                        onClick={() => onRestore(version)}
                                                        className="w-10 h-10 flex items-center justify-center border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-all"
                                                        title="Restore baseline"
                                                    >
                                                        <RotateCcw size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => onDelete(version.id)}
                                                    className="w-10 h-10 flex items-center justify-center border border-[var(--border-color)] text-[var(--text-muted)] hover:border-red-500/50 hover:text-red-500 transition-all"
                                                    title="Permanently remove"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-[var(--bg-card)] border-t border-[var(--border-color)] flex justify-between items-center relative z-10">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">
                        Local storage archive • {versions.length}/20 slots used
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border border-transparent hover:border-[var(--text-main)] text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}
