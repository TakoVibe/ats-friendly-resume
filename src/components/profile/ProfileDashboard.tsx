import React from 'react';
import { AuthOnlyProviders } from '../Providers';
import { Navbar } from '../ui/Navbar';
import { UserResumes } from './UserResumes';
import { LoginModal } from '../ui/LoginModal';
import { Footer } from '../ui/Footer';
import {
    ChevronLeft,
    FileText,
    Loader2,
    Plus,
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

type Tab = 'wallet' | 'resumes';

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

            <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">

                {/* ── Bento hero header ── */}
                <div
                    className="relative overflow-hidden border-b border-[var(--border-color)]"
                    style={{
                        background: 'radial-gradient(ellipse 80% 60% at 50% -20%, hsla(270,70%,40%,0.18) 0%, transparent 70%), var(--bg-card)',
                    }}
                >
                    {/* subtle grid pattern overlay */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'linear-gradient(var(--text-main) 1px, transparent 1px), linear-gradient(90deg, var(--text-main) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />

                    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-0">

                        {/* Payment flash */}
                        {paymentMessage && (
                            <div className={`mb-5 rounded-xl px-4 py-2.5 text-xs font-bold border ${
                                paymentMessage.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                : paymentMessage.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                            }`}>
                                {paymentMessage.text}
                            </div>
                        )}

                        {/* Bento grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-4 mb-6 items-start">

                            {/* ── Cell 1: Identity ── */}
                            <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-purple-500/30 flex items-center justify-center overflow-hidden text-lg font-black text-purple-300 shadow-lg shadow-purple-500/10">
                                        {user?.profile_image
                                            ? <img src={user.profile_image} alt="avatar" className="w-full h-full object-cover" />
                                            : initials}
                                    </div>
                                    {/* online dot */}
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[var(--bg-card)]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-purple-400 mb-0.5">Profile</p>
                                    <h1 className="text-base font-black tracking-tight leading-tight truncate max-w-[160px]">{displayName || 'Hello!'}</h1>
                                    {user?.email && <p className="text-[10px] text-[var(--text-muted)] truncate max-w-[160px]">{user.email}</p>}
                                </div>
                            </div>

                            {/* ── Cell 2: Token balance — hero centrepiece ── */}
                            <div className="flex flex-col items-center justify-center py-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400 mb-1">Token Balance</p>
                                <div className="flex items-end gap-2">
                                    {tokenLoading
                                        ? <div className="h-12 w-24 rounded-xl bg-purple-500/10 animate-pulse" />
                                        : (
                                            <>
                                                <span
                                                    className="text-5xl sm:text-6xl font-black tabular-nums leading-none"
                                                    style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                                                >
                                                    {tokenBalance.toLocaleString()}
                                                </span>
                                                <Zap size={22} className="text-purple-400 mb-1 shrink-0" fill="currentColor" />
                                            </>
                                        )
                                    }
                                </div>
                                <a
                                    href="/buy-tokens"
                                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-px"
                                >
                                    <Zap size={11} fill="currentColor" /> Top Up
                                </a>
                            </div>

                            {/* ── Cell 3: Mini stats ── */}
                            <div className="flex sm:flex-col gap-2 sm:gap-2 justify-start sm:justify-center">
                                <MiniStat
                                    icon={<TrendingUp size={12} className="text-green-400" />}
                                    label="Credited"
                                    value={tokenLoading ? null : totalCredits}
                                    color="green"
                                />
                                <MiniStat
                                    icon={<TrendingDown size={12} className="text-red-400" />}
                                    label="Spent"
                                    value={tokenLoading ? null : totalConsumed}
                                    color="red"
                                />
                                <MiniStat
                                    icon={<Wallet size={12} className="text-blue-400" />}
                                    label="Txns"
                                    value={tokenLoading ? null : history.length}
                                    color="blue"
                                />
                            </div>
                        </div>

                        {/* Tab bar */}
                        <div className="flex gap-0">
                            {([
                                { id: 'wallet',  label: 'Wallet',  icon: <Wallet size={13} /> },
                                { id: 'resumes', label: 'Resumes', icon: <FileText size={13} /> },
                            ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all -mb-px ${
                                        activeTab === tab.id
                                            ? 'border-purple-500 text-purple-400'
                                            : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                                >
                                    {tab.icon}{tab.label}
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
