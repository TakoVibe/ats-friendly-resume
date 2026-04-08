import React from 'react';
import { AuthOnlyProviders } from '../Providers';
import { Navbar } from '../ui/Navbar';
import { Footer } from '../ui/Footer';
import { LoginModal } from '../ui/LoginModal';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToken } from '../../context/TokenContext';
import { Check, Lock, Zap } from 'lucide-react';

const PACKS = [
    { tokens: 100, price: '$1.00', savings: null },
    { tokens: 500, price: '$4.50', savings: '10% off' },
    { tokens: 1000, price: '$8.00', savings: '20% off' },
];

export function BuyTokensContent() {
    return (
        <AuthOnlyProviders>
            <BuyTokensInner />
        </AuthOnlyProviders>
    );
}

function BuyTokensInner() {
    const { isAuthenticated } = useAuth();
    const { tokenBalance } = useToken();
    const [loadingPack, setLoadingPack] = React.useState<number | null>(null);
    const [error, setError] = React.useState<string>('');

    const handlePurchase = async (tokensAmount: number) => {
        setError('');
        if (!isAuthenticated) {
            window.dispatchEvent(new CustomEvent('show-login-modal'));
            setError('Please login first to purchase tokens.');
            return;
        }

        setLoadingPack(tokensAmount);
        try {
            const response = await api.post('/api/users/tokens/purchase/', {
                product: 'resumevibe',
                tokens_amount: tokensAmount,
            });
            if (!response.ok) {
                let message = 'Failed to create checkout session.';
                try {
                    const data = await response.json();
                    if (data?.error) message = data.error;
                } catch {
                    // Ignore parse failures and keep default message.
                }
                throw new Error(message);
            }
            const data = await response.json();
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                setError('Checkout URL was not returned by the server.');
            }
        } catch (error) {
            console.error('Failed to initiate checkout', error);
            setError(error instanceof Error ? error.message : 'Checkout could not be started.');
        } finally {
            setLoadingPack(null);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col">
            <Navbar />
            <LoginModal />

            <main className="max-w-6xl mx-auto w-full px-6 py-14 lg:py-20">
                <section className="mb-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 mb-4">VibeTokens</p>
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4">Purchase Tokens</h1>
                    <p className="text-sm lg:text-base text-[var(--text-muted)] max-w-2xl">
                        Use tokens for advanced AI actions like Pilot Mode, Deep Audit, and inline improvements.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                        <Zap size={16} className="text-purple-500" />
                        <span className="text-xs font-bold">Current Balance: {tokenBalance} tokens</span>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PACKS.map((pack) => (
                        <article
                            key={pack.tokens}
                            className={`rounded-3xl p-6 border bg-[var(--bg-card)] ${
                                pack.tokens === 500
                                    ? 'border-purple-500/40 shadow-xl shadow-purple-500/10'
                                    : 'border-[var(--border-color)]'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-black">{pack.tokens} Tokens</h2>
                                {pack.savings && (
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-purple-500/10 text-purple-500">
                                        {pack.savings}
                                    </span>
                                )}
                            </div>

                            <p className="text-4xl font-black mb-6">{pack.price}</p>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-sm">
                                    <Check size={16} className="text-green-500" />
                                    <span>No expiration date</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check size={16} className="text-green-500" />
                                    <span>Instantly applied to your account</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check size={16} className="text-green-500" />
                                    <span>Secure Stripe checkout</span>
                                </li>
                            </ul>

                            <button
                                onClick={() => handlePurchase(pack.tokens)}
                                disabled={loadingPack !== null}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:opacity-95 transition disabled:opacity-60"
                            >
                                {loadingPack === pack.tokens ? 'Processing...' : `Buy ${pack.tokens} Tokens`}
                            </button>
                        </article>
                    ))}
                </section>

                <p className="mt-8 text-[11px] text-[var(--text-muted)] font-bold flex items-center gap-2">
                    <Lock size={14} />
                    All payments are processed by Razorpay. We do not store card details.
                </p>
                {error && (
                    <p className="mt-3 text-[11px] font-bold text-red-500">{error}</p>
                )}
            </main>

            <Footer />
        </div>
    );
}
