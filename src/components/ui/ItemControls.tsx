import React from 'react';
import { ArrowUp, ArrowDown, Trash2, Copy } from 'lucide-react';

interface Props {
    isFirst: boolean;
    isLast: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    onDuplicate?: () => void;
    children: React.ReactNode;
    isEditable: boolean;
    className?: string; // Allow passing extra classes for wrapper positioning if needed
    forceMobileControls?: boolean;
}

export function ItemControls({
    isFirst,
    isLast,
    onMoveUp,
    onMoveDown,
    onDelete,
    onDuplicate,
    children,
    isEditable,
    className = '',
    forceMobileControls = false
}: Props) {
    if (!isEditable) return <>{children}</>;

    const desktopClasses = "absolute right-0 top-0 -translate-y-[calc(100%+4px)] hidden group-hover/item:flex items-center gap-1 z-[75] bg-[var(--bg-card)] shadow-[var(--shadow)] border border-[var(--border-color)] rounded-xl p-1 animate-in fade-in slide-in-from-bottom-2 duration-200 [.group\/item:has(.stop-row-hover:hover)_&]:hidden";
    const mobileClasses = "flex justify-end items-center gap-2 mb-2 bg-[var(--glass-bg)] p-1.5 rounded-lg border border-[var(--border-color)]";

    const containerClasses = forceMobileControls ? mobileClasses : desktopClasses;

    return (
        <div className={`group/item relative rounded-lg py-1 ${className}`}>
            {/* Controls */}
            <div className={containerClasses}>
                {/* Bridge to prevent hover gap - only for desktop */}
                {!forceMobileControls && <div className="absolute -bottom-2 left-0 w-full h-2 bg-transparent" />}

                <button
                    onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                    disabled={isFirst}
                    className="p-1.5 hover:bg-[var(--bg-input)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-20 "
                    title="Move Up"
                >
                    <ArrowUp size={14} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                    disabled={isLast}
                    className="p-1.5 hover:bg-[var(--bg-input)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-20 "
                    title="Move Down"
                >
                    <ArrowDown size={14} />
                </button>
                <div className="w-px h-4 bg-[var(--border-color)] mx-0.5" />
                {onDuplicate && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                        className="p-1.5 hover:bg-[var(--bg-input)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] "
                        title="Duplicate Item"
                    >
                        <Copy size={14} />
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 hover:bg-red-500/10 text-red-500 hover:text-red-400 rounded-lg "
                    title="Delete Item"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Content with higher z-index to ensure it sits above the bridge and remains clickable */}
            <div className="relative z-30">
                {children}
            </div>
        </div>
    );
}
