import React from 'react';
import { AuthOnlyProviders } from '../Providers';
import { Navbar } from '../ui/Navbar';
import { UserResumes } from './UserResumes';
import { LoginModal } from '../ui/LoginModal';
import { Footer } from '../ui/Footer';
import { ChevronLeft, ArrowRight, Zap, TrendingDown, TrendingUp } from 'lucide-react';
import { useToken } from '../../context/TokenContext';
import { api } from '../../lib/api';

export function ProfileDashboard() {
    return (
        <AuthOnlyProviders>
            <ProfileDashboardInner />
        </AuthOnlyProviders>
    );
}

function ProfileDashboardInner() {
    const [paymentMessage, setPaymentMessage] = React.useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const { tokenBalance, totalConsumed, history, isLoading: tokenLoading } = useToken();

    React.useEffect(() => {
        const verifyPaymentStatus = async () => {
            const params = new URLSearchParams(window.location.search);
            const paymentId = params.get('razorpay_payment_id');
            const paymentLinkId = params.get('razorpay_payment_link_id');
            const hasPaymentContext = params.get('payment') || paymentId || paymentLinkId;

            if (!hasPaymentContext) return;

            if (!paymentId && !paymentLinkId) {
                const payment = params.get('payment');
                if (payment === 'failed' || payment === 'cancelled') {
                    setPaymentMessage({
                        type: 'error',
                        text: 'Payment was not completed. No tokens were deducted. Please try again.'
                    });
                }
                return;
            }

            try {
                const response = await api.get(
                    `/api/users/tokens/payment-status/?payment_id=${encodeURIComponent(paymentId || '')}&payment_link_id=${encodeURIComponent(paymentLinkId || '')}`
                );

                if (!response.ok) {
                    setPaymentMessage({
                        type: 'info',
                        text: 'Payment is being verified. Please refresh in a few moments.'
                    });
                    return;
                }

                const data = await response.json();
                if (data.status === 'success') {
                    setPaymentMessage({ type: 'success', text: data.message || 'Payment successful. Tokens credited.' });
                } else if (data.status === 'failed') {
                    setPaymentMessage({ type: 'error', text: data.message || 'Payment failed. No tokens were deducted.' });
                } else {
                    setPaymentMessage({ type: 'info', text: data.message || 'Payment verification is in progress.' });
                }
            } catch (error) {
                console.error('Failed to verify payment status:', error);
                setPaymentMessage({
                    type: 'info',
                    text: 'Payment is being verified. Please refresh in a few moments.'
                });
            }
        };

        verifyPaymentStatus();
    }, []);

    return (
            <>
            <Navbar>
                <div className="flex items-center gap-4">
                    <a
                        href="/"
                        className="flex items-center gap-2 px-2 md:px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors whitespace-nowrap"
                    >
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Back to Editor</span>
                        <span className="sm:hidden">Back</span>
                    </a>
                </div>
            </Navbar>
            <LoginModal />

            <main
                className="min-h-screen bg-[var(--bg-main)] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
                style={{
                    backgroundImage: `
                        radial-gradient(at 0% 0%, hsla(270, 70%, 50%, 0.05) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, hsla(220, 70%, 50%, 0.05) 0px, transparent 50%)
                    `
                }}
            >
                <div className="max-w-6xl mx-auto">
                    <header className="mb-16">
                        {paymentMessage && (
                            <div className={`mb-6 rounded-2xl px-4 py-3 text-sm font-bold border ${
                                paymentMessage.type === 'success'
                                    ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                    : paymentMessage.type === 'error'
                                        ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                            }`}>
                                {paymentMessage.text}
                            </div>
                        )}
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-purple-500/20"
                        >
                            Dashboard
                        </div>
                        <div
                            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
                        >
                            <div className="max-w-3xl">
                                <h1
                                    className="text-5xl md:text-7xl font-black text-[var(--text-main)] tracking-tighter mb-6 leading-none"
                                >
                                    My <span
                                        className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500"
                                    >Resumes</span>
                                </h1>
                                <p
                                    className="text-[var(--text-muted)] font-medium text-xl leading-relaxed opacity-80"
                                >
                                    Your professional identities, all in one place.
                                    Manage, version, and share your journey with the
                                    world.
                                </p>
                            </div>
                            <a
                                href="/"
                                className="flex items-center justify-center gap-3 px-10 py-5 bg-[var(--text-main)] text-[var(--bg-main)] rounded-[24px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-2xl hover:translate-y-[-4px] active:translate-y-0 group"
                            >
                                Create New
                                <span
                                    className="group-hover:translate-x-1 transition-transform"
                                >
                                    <ArrowRight size={20} />
                                </span>
                            </a>
                        </div>
                    </header>

                    <section className="mb-12 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[28px] p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 mb-2">Personal Wallet</p>
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-main)]">Token Usage</h2>
                            </div>
                            <a
                                href="/buy-tokens"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Buy Tokens
                            </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)]/40 p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Current Balance</p>
                                <div className="flex items-center gap-2">
                                    <Zap size={16} className="text-purple-500" />
                                    <span className="text-2xl font-black text-[var(--text-main)]">{tokenBalance}</span>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)]/40 p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Total Debits</p>
                                <div className="flex items-center gap-2">
                                    <TrendingDown size={16} className="text-red-500" />
                                    <span className="text-2xl font-black text-[var(--text-main)]">{totalConsumed}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[var(--border-color)] overflow-hidden">
                            <div className="px-4 py-3 bg-[var(--bg-input)]/50 border-b border-[var(--border-color)]">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Recent Credits / Debits</p>
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                                {tokenLoading ? (
                                    <p className="p-4 text-sm text-[var(--text-muted)]">Loading token history...</p>
                                ) : history.length === 0 ? (
                                    <p className="p-4 text-sm text-[var(--text-muted)]">No token activity yet.</p>
                                ) : (
                                    history.slice(0, 12).map((entry, idx) => (
                                        <div key={`${entry.created_at}-${idx}`} className="px-4 py-3 border-b border-[var(--border-color)] last:border-b-0 flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-[var(--text-main)] truncate">
                                                    {entry.description || entry.action_type}
                                                </p>
                                                <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                                                    {new Date(entry.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className={`shrink-0 inline-flex items-center gap-1 text-xs font-black ${
                                                entry.transaction_type === 'credit' ? 'text-green-500' : 'text-red-500'
                                            }`}>
                                                {entry.transaction_type === 'credit' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {entry.transaction_type === 'credit' ? '+' : '-'}{entry.amount}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>

                    <UserResumes />
                </div>
            </main>
            <Footer />
        </>
    );
}
