import React, { useState, useEffect } from "react";
import { Lock, Loader2 } from "lucide-react";
import { GoogleLogin } from "../GoogleLogin";

export function LoginModal() {
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        const handleShow = () => setIsOpen(true);
        window.addEventListener('show-login-modal', handleShow);
        return () => window.removeEventListener('show-login-modal', handleShow);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--text-main)]/10 backdrop-blur-sm animate-in fade-in duration-300 font-sans-ed">
            <div className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 group">

                <div className="relative p-10 h-full flex flex-col items-center text-center">

                    <div className="relative mb-8">
                        <div className="w-16 h-16 border border-[var(--text-main)] flex items-center justify-center bg-[var(--text-main)]/5">
                            <Lock className="w-6 h-6 text-[var(--text-main)] font-light" strokeWidth={1} />
                        </div>
                    </div>

                    <h2 className="font-serif-ed text-4xl text-[var(--text-main)] mb-4 tracking-tight">Unlock Access</h2>
                    <p className="mb-10 text-[var(--text-muted)] text-[10px] uppercase tracking-[0.2em] leading-loose px-2">
                        Sign in to save your progress, create multiple versions, and share your resume with the world.
                    </p>

                    <div className="w-full flex justify-center mb-8">
                        <GoogleLogin />
                    </div>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors py-3 px-8 border border-transparent hover:border-[var(--text-main)]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
