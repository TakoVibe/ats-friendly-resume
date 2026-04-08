import React from 'react';
import { X, Zap, Check, Lock, ExternalLink } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const [loading, setLoading] = React.useState(false);

    if (!isOpen) return null;

    const handlePurchase = () => {
        setLoading(true);
        onClose();
        window.location.href = '/buy-tokens';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
                
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 mx-2 bg-[var(--bg-card)] hover:bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8 pb-6 text-center">
                    <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                        <Zap size={32} className="text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-black text-[var(--text-main)] mb-2">Out of VibeTokens!</h2>
                    <p className="text-[var(--text-muted)] text-sm mb-6">
                        You need more tokens to continue using advanced AI features like Pilot Mode and Deep Audit.
                    </p>

                    <div className="bg-[var(--bg-input)] rounded-2xl p-5 text-left border border-[var(--border-color)] mb-6">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--border-color)]">
                            <div>
                                <h3 className="font-bold text-[var(--text-main)] text-lg">Starter Pack</h3>
                                <p className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)] mt-1">100 VibeTokens</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black text-[var(--text-main)]">$1</span>
                                <span className="text-[var(--text-muted)] text-xs ml-1">USD</span>
                            </div>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm text-[var(--text-main)]">
                                <Check size={16} className="text-green-500 shrink-0" />
                                <span>Access to Deep Audit (30 tokens)</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-[var(--text-main)]">
                                <Check size={16} className="text-green-500 shrink-0" />
                                <span>Access to Pilot Mode (30 tokens)</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-[var(--text-main)]">
                                <Check size={16} className="text-green-500 shrink-0" />
                                <span>No expiration date</span>
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={handlePurchase}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-black text-sm tracking-widest uppercase shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                Buy 100 Tokens <ExternalLink size={16} />
                            </>
                        )}
                    </button>
                    
                    <p className="text-center text-[10px] text-[var(--text-muted)] mt-4 font-bold flex items-center justify-center gap-1.5 uppercase tracking-wider">
                        <Lock size={12} /> Secure Checkout using Stripe
                    </p>
                </div>
            </div>
        </div>
    );
}
