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
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="relative w-full max-w-3xl bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow)] overflow-hidden max-h-[80vh] flex flex-col border border-[var(--border-color)] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white shadow-lg relative z-10">
                    <h2 className="text-xl font-black tracking-tight">Version History</h2>
                    <p className="mt-1 text-xs font-medium text-indigo-100 uppercase tracking-widest opacity-80">
                        {versions.length} versions archived
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-main)]/5">
                    {versions.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="bg-[var(--bg-input)] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--border-color)]">
                                <Clock className="w-8 h-8 text-[var(--text-muted)]" />
                            </div>
                            <p className="text-[var(--text-main)] font-bold">No versions yet</p>
                            <p className="text-xs text-[var(--text-muted)] mt-2 uppercase tracking-widest leading-loose">
                                Optimized versions will appear here <br /> for easy restoration.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {versions.map((version) => {
                                const isCurrent = isCurrentVersion(version);
                                const isSelected = selectedVersion === version.id;

                                return (
                                    <div
                                        key={version.id}
                                        className={`group border rounded-xl p-5 transition-all duration-300 ${isSelected
                                            ? 'border-purple-500 bg-purple-500/5 shadow-lg'
                                            : isCurrent
                                                ? 'border-green-500/50 bg-green-500/5'
                                                : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-purple-500/30 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-[var(--text-main)] truncate text-sm tracking-tight">{version.label}</h3>
                                                    {isCurrent && (
                                                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-md border border-green-500/20">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)] font-medium">
                                                    <p className="flex items-center gap-1.5">
                                                        <Clock size={12} className="opacity-70" />
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
                                                    className="w-8 h-8 flex items-center justify-center text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all active:scale-90"
                                                    title="Preview"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {!isCurrent && (
                                                    <button
                                                        onClick={() => onRestore(version)}
                                                        className="w-8 h-8 flex items-center justify-center text-green-500 hover:bg-green-500/10 rounded-lg transition-all active:scale-90"
                                                        title="Restore baseline"
                                                    >
                                                        <RotateCcw size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => onDelete(version.id)}
                                                    className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-90"
                                                    title="Permanently remove"
                                                >
                                                    <Trash2 size={16} />
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
                <div className="px-6 py-4 bg-[var(--bg-card)] border-t border-[var(--border-color)] flex justify-between items-center relative z-10">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                        Local storage archive • {versions.length}/20 slots used
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] rounded-xl transition-all active:scale-95"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}
