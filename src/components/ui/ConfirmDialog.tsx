import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false
}: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            />

            {/* Dialog Panel */}
            <div className="relative bg-[var(--bg-card)] rounded-lg shadow-[var(--shadow)] w-full max-w-sm p-6 transform transition-all scale-100 opacity-100 border border-[var(--border-color)]">
                <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">
                    {title}
                </h3>

                <p className="text-sm text-[var(--text-muted)] mb-6">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); onCancel(); }}
                        className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onConfirm(); }}
                        className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 transition-all ${isDestructive
                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-lg shadow-red-900/20'
                            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-lg shadow-blue-900/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
