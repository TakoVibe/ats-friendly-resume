import React from 'react';
import { AuthOnlyProviders } from '../Providers';
import { Navbar } from '../ui/Navbar';
import { UserResumes } from './UserResumes';
import { RecommendedJobs } from './RecommendedJobs';
import { LoginModal } from '../ui/LoginModal';
import { Footer } from '../ui/Footer';
import {
    ChevronLeft,
    FileText,
    Loader2,
    Plus,
    Briefcase,
    TrendingDown,
    TrendingUp,
    User,
    Wallet,
    Zap,
} from 'lucide-react';
import { useToken } from '../../context/TokenContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export function ProfileDashboard() {
    return (
        <AuthOnlyProviders>
            <ProfileDashboardInner />
        </AuthOnlyProviders>
    );
}

type Tab = 'wallet' | 'resumes' | 'jobs';

function ProfileDashboardInner() {
    const { user } = useAuth();
    const { tokenBalance, totalConsumed, history, isLoading: tokenLoading } = useToken();
    const [paymentMessage, setPaymentMessage] = React.useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [activeTab, setActiveTab] = React.useState<Tab>('wallet');

    React.useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash === '#resumes') {
            setActiveTab('resumes');
        }
    }, []);

    React.useEffect(() => {
        const verifyPaymentStatus = async () => {
            const params = new URLSearchParams(window.location.search);
            const paymentId = params.get('razorpay_payment_id');
            const paymentLinkId = params.get('razorpay_payment_link_id');
            const hasPaymentContext = params.get('payment') || paymentId || paymentLinkId;
            if (!hasPaymentContext) return;

            if (!paymentId && !paymentLinkId) {
                if (params.get('payment') === 'failed' || params.get('payment') === 'cancelled') {
                    setPaymentMessage({ type: 'error', text: 'Payment was not completed. No tokens were deducted.' });
                }
                return;
            }

            try {
                const res = await api.get(
                    `/api/users/tokens/payment-status/?payment_id=${encodeURIComponent(paymentId || '')}&payment_link_id=${encodeURIComponent(paymentLinkId || '')}`
                );
                const data = await res.json();
                if (data.status === 'success') setPaymentMessage({ type: 'success', text: data.message || 'Payment successful. Tokens credited.' });
                else if (data.status === 'failed') setPaymentMessage({ type: 'error', text: data.message || 'Payment failed.' });
                else setPaymentMessage({ type: 'info', text: data.message || 'Payment verification in progress.' });
            } catch {
                setPaymentMessage({ type: 'info', text: 'Payment is being verified. Please refresh in a moment.' });
            }
        };
        verifyPaymentStatus();
    }, []);

    const totalCredits = history.filter(e => e.transaction_type === 'credit').reduce((s, e) => s + e.amount, 0);
    const initials = user
        ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase()
        : '?';
    const displayName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : '';

    return (
        <>
            <Navbar>
                <a
                    href="/"
                    className="flex items-center gap-2 px-2 md:px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors whitespace-nowrap"
                >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Back to Editor</span>
                    <span className="sm:hidden">Back</span>
                </a>
            </Navbar>
            <LoginModal />

            <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans-ed">
                {/* Grain Overlay */}
                <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50" style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png")' }}></div>

                {/* ── Editorial Header ── */}
                <div className="relative border-b border-[var(--border-color)]">
                    <div className="relative max-w-[100rem] mx-auto px-6 md:px-12 pt-16 pb-0">

                        {/* Payment flash */}
                        {paymentMessage && (
                            <div className={`mb-8 border px-6 py-4 text-xs font-sans-ed tracking-widest uppercase ${
                                paymentMessage.type === 'success' ? 'bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400'
                                : paymentMessage.type === 'error' ? 'bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400'
                                : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                            }`}>
                                {paymentMessage.text}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-end">
                            
                            {/* Identity Section */}
                            <div className="lg:col-span-6 flex gap-6 items-center">
                                <div className="w-20 h-20 bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center font-serif-ed text-3xl tracking-tighter text-[var(--text-main)] shrink-0 shadow-sm relative group">
                                    {user?.profile_image
                                        ? <img src={user.profile_image} alt="avatar" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                        : initials}
                                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 border border-[var(--bg-main)]"></div>
                                </div>
                                <div>
                                    <p className="font-sans-ed text-[10px] uppercase tracking-[0.25em] mb-2 opacity-60">Identification</p>
                                    <h1 className="font-serif-ed text-5xl tracking-tight leading-none mb-2 truncate max-w-[300px]">{displayName || 'Hello'}</h1>
                                    {user?.email && <p className="font-sans-ed text-sm text-[var(--text-muted)] font-light truncate max-w-[300px]">{user.email}</p>}
                                </div>
                            </div>

                            {/* Token Section */}
                            <div className="lg:col-span-6 flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-0 md:border-l border-[var(--border-color)] md:pl-12">
                                <div>
                                    <p className="font-sans-ed text-[10px] uppercase tracking-[0.25em] mb-4 opacity-60">Token Balance</p>
                                    <div className="flex items-baseline gap-3">
                                        {tokenLoading ? (
                                            <div className="h-16 w-32 bg-[var(--border-color)] animate-pulse" />
                                        ) : (
                                            <>
                                                <span className="font-serif-ed text-7xl leading-none tracking-tighter text-[var(--accent)]">
                                                    {tokenBalance.toLocaleString()}
                                                </span>
                                                <span className="font-sans-ed text-sm uppercase tracking-widest text-[var(--text-muted)]">Tokens</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="pb-2">
                                    <a
                                        href="/buy-tokens"
                                        className="inline-flex items-center justify-center px-8 py-3 font-sans-ed text-[10px] uppercase tracking-[0.2em] font-medium border border-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-all duration-500"
                                    >
                                        Acquire Tokens
                                    </a>
                                </div>
                            </div>

                        </div>

                        {/* Tab bar */}
                        <div className="flex gap-12 border-b border-[var(--border-color)]">
                            {([
                                { id: 'wallet',  label: 'Ledger',  icon: <Wallet size={14} className="opacity-50" /> },
                                { id: 'resumes', label: 'Documents', icon: <FileText size={14} className="opacity-50" /> },
                                { id: 'jobs', label: 'Opportunities', icon: <Briefcase size={14} className="opacity-50" /> },
                            ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 pb-4 font-sans-ed text-[11px] uppercase tracking-[0.2em] transition-all -mb-[1px] ${
                                        activeTab === tab.id
                                            ? 'border-b border-[var(--text-main)] text-[var(--text-main)] font-medium'
                                            : 'border-b border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {activeTab === 'wallet' && (
                        <section id="tokens">
                            <h2 className="text-base font-black tracking-tight mb-5 text-[var(--text-muted)] uppercase tracking-widest text-[11px]">Transaction History</h2>

                            <div className="rounded-2xl border border-[var(--border-color)] overflow-hidden">
                                <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 px-4 py-2.5 bg-[var(--bg-input)]/50 border-b border-[var(--border-color)] text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                    <span>Description</span>
                                    <span className="text-right hidden sm:block">Date</span>
                                    <span className="text-right">Amount</span>
                                </div>

                                {tokenLoading ? (
                                    <div className="flex items-center justify-center gap-2 py-14 text-[var(--text-muted)]">
                                        <Loader2 size={18} className="animate-spin" />
                                        <span className="text-sm font-bold">Loading…</span>
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="py-16 flex flex-col items-center gap-3 text-[var(--text-muted)]">
                                        <Zap size={32} className="opacity-20" />
                                        <p className="text-sm font-bold">No transactions yet.</p>
                                        <a href="/buy-tokens" className="text-[10px] uppercase font-black tracking-widest text-purple-400 hover:text-purple-300 transition-colors">
                                            Buy your first pack →
                                        </a>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[var(--border-color)]">
                                        {history.map((entry, idx) => (
                                            <div key={`${entry.created_at}-${idx}`} className="grid grid-cols-[1fr_auto_auto] gap-x-6 px-4 py-3 items-center hover:bg-[var(--bg-input)]/20 transition-colors">
                                                <div className="min-w-0 flex items-center gap-3">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                                        entry.transaction_type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'
                                                    }`}>
                                                        {entry.transaction_type === 'credit'
                                                            ? <TrendingUp size={13} className="text-green-400" />
                                                            : <TrendingDown size={13} className="text-red-400" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-[var(--text-main)] truncate">
                                                            {entry.description || entry.action_type}
                                                        </p>
                                                        <p className="text-[10px] text-[var(--text-muted)] sm:hidden mt-0.5">
                                                            {new Date(entry.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-[var(--text-muted)] whitespace-nowrap hidden sm:block">
                                                    {new Date(entry.created_at).toLocaleString()}
                                                </p>
                                                <span className={`text-xs font-black tabular-nums ${
                                                    entry.transaction_type === 'credit' ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                    {entry.transaction_type === 'credit' ? '+' : '−'}{entry.amount}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === 'resumes' && (
                        <section id="resumes">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">My Resumes</h2>
                                <a
                                    href="/"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--text-main)] text-[var(--bg-main)] text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                                >
                                    <Plus size={12} /> Create New
                                </a>
                            </div>
                            <UserResumes />
                        </section>
                    )}

                    {activeTab === 'jobs' && (
                        <section id="jobs">
                            <RecommendedJobs />
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}

function MiniStat({ icon, label, value, color }: {
    icon: React.ReactNode;
    label: string;
    value: number | null;
    color: 'green' | 'red' | 'blue';
}) {
    const ring: Record<string, string> = {
        green: 'border-green-500/20 bg-green-500/5',
        red:   'border-red-500/20   bg-red-500/5',
        blue:  'border-blue-500/20  bg-blue-500/5',
    };
    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${ring[color]}`}>
            {icon}
            <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] leading-none mb-0.5">{label}</p>
                {value === null
                    ? <div className="h-3 w-8 rounded bg-[var(--border-color)] animate-pulse" />
                    : <p className="text-sm font-black tabular-nums leading-none text-[var(--text-main)]">{value.toLocaleString()}</p>}
            </div>
        </div>
    );
}
