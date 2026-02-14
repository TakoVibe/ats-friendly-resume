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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="relative bg-[var(--bg-card)] p-[1px] rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 group">
                {/* Gradient Border */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-100"></div>

                <div className="relative bg-[var(--bg-card)] p-8 rounded-[23px] h-full flex flex-col items-center text-center overflow-hidden">
                    {/* Subtle Inner Glow */}
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                    <div className="relative mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-input)] flex items-center justify-center shadow-inner border border-[var(--border-color)]">
                            <Lock className="w-7 h-7 text-[var(--text-main)] opacity-70" strokeWidth={1.5} />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-[var(--text-main)] mb-3 tracking-tight">Unlock Full Access</h2>
                    <p className="mb-8 text-[var(--text-muted)] text-sm leading-relaxed px-2 font-medium">
                        Sign in to save your progress, create multiple versions, and share your resume with the world.
                    </p>

                    <div className="w-full flex justify-center mb-6 transform transition-transform hover:scale-[1.02]">
                        <GoogleLogin />
                    </div>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors py-2 px-6 rounded-full hover:bg-[var(--bg-input)]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
