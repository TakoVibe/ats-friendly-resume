import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Props {
    isOpen: boolean;
    title: string;
    initialValue?: string;
    placeholder?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

export function PromptDialog({
    isOpen,
    title,
    initialValue = '',
    placeholder = '',
    onConfirm,
    onCancel,
    confirmText = "OK",
    cancelText = "Cancel"
}: Props) {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Reset value when dialog opens
    useEffect(() => {
        if (isOpen) {
            setValue(initialValue);
            // Focus input after a small delay to ensure rendering
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [isOpen, initialValue]);

    if (!isOpen || !mounted) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(value);
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-left">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            />

            {/* Dialog Panel */}
            <div className="relative bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow)] w-full max-w-sm p-8 transform transition-all scale-100 opacity-100 border border-[var(--border-color)] animate-in fade-in zoom-in-95 duration-300">
                <h3 className="text-xl font-bold text-[var(--text-main)] mb-6 tracking-tight">
                    {title}
                </h3>

                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)]/40 mb-8 text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 transition-all font-medium"
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onCancel(); }}
                            className="px-6 py-2.5 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 text-sm font-bold text-white bg-[var(--accent)] rounded-xl hover:bg-[var(--accent-hover)] transition-all active:scale-95 shadow-lg shadow-purple-500/20"
                        >
                            {confirmText}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
