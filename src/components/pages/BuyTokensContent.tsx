import React from 'react';
import { AuthOnlyProviders } from '../Providers';
import { Navbar } from '../ui/Navbar';
import { Footer } from '../ui/Footer';
import { LoginModal } from '../ui/LoginModal';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToken } from '../../context/TokenContext';
import { Check, Lock, X, Zap } from 'lucide-react';

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
    const { tokenBalance, fetchTokenData } = useToken();
    const [loadingPack, setLoadingPack] = React.useState<number | null>(null);
    const [error, setError] = React.useState<string>('');
    const [paymentModal, setPaymentModal] = React.useState<{ state: 'processing' | 'success' | 'failed'; message: string } | null>(null);
    const pollTimerRef = React.useRef<number | null>(null);

    const stopPolling = () => {
        if (pollTimerRef.current !== null) {
            window.clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
        }
    };

    const pollStatus = async (requestId: string, orderId: string, paymentId?: string) => {
        try {
            const response = await api.get(
                `/api/users/tokens/payment-status/?request_id=${encodeURIComponent(requestId)}&payment_id=${encodeURIComponent(paymentId || '')}&payment_link_id=${encodeURIComponent(orderId)}`
            );
            if (!response.ok) return;

            const data = await response.json();
            if (data.status === 'success') {
                stopPolling();
                setPaymentModal({ state: 'success', message: data.message || 'Payment successful. Tokens credited.' });
                fetchTokenData();
                return;
            }

            if (data.status === 'failed') {
                stopPolling();
                setPaymentModal({ state: 'failed', message: data.message || 'Payment failed. Please try again.' });
                setError(data.message || 'Payment failed. Please try again.');
                return;
            }
        } catch (err) {
            console.error('Failed to poll payment status:', err);
        }
    };

    const loadRazorpayScript = async () => {
        if ((window as any).Razorpay) return true;
        return new Promise<boolean>((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePurchase = async (tokensAmount: number) => {
        setError('');
        if (!isAuthenticated) {
            window.dispatchEvent(new CustomEvent('show-login-modal'));
            setError('Please login first to purchase tokens.');
            return;
        }

        setLoadingPack(tokensAmount);
        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Unable to load Razorpay Checkout.');
            }

            const response = await api.post('/api/users/tokens/create-order/', {
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
            if (data.order_id && data.key) {
                const requestId = data.request_id || `ord-${Date.now()}`;
                setPaymentModal({ state: 'processing', message: 'Complete payment in the Razorpay popup. We will verify it automatically.' });

                const razorpay = new (window as any).Razorpay({
                    key: data.key,
                    amount: data.amount,
                    currency: data.currency || 'USD',
                    name: 'ResumeVibe',
                    description: `${tokensAmount} VibeTokens`,
                    order_id: data.order_id,
                    handler: async (paymentResponse: any) => {
                        try {
                            const verifyRes = await api.post('/api/users/tokens/verify-payment/', paymentResponse);
                            if (!verifyRes.ok) {
                                const verifyData = await verifyRes.json().catch(() => ({}));
                                throw new Error(verifyData?.message || verifyData?.error || 'Payment verification failed.');
                            }
                            const verifyData = await verifyRes.json();
                            setPaymentModal({ state: 'success', message: verifyData.message || 'Payment successful. Tokens credited.' });
                            fetchTokenData();
                        } catch (verifyErr) {
                            console.error('Payment verify failed:', verifyErr);
                            setPaymentModal({ state: 'processing', message: 'Payment received. Final verification in progress...' });
                            stopPolling();
                            pollTimerRef.current = window.setInterval(() => {
                                pollStatus(requestId, data.order_id, paymentResponse?.razorpay_payment_id);
                            }, 5000);
                            pollStatus(requestId, data.order_id, paymentResponse?.razorpay_payment_id);
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            setPaymentModal({ state: 'failed', message: 'Payment popup closed before completion.' });
                        },
                    },
                    prefill: {},
                    notes: {
                        request_id: requestId,
                    },
                    theme: {
                        color: '#7c3aed',
                    },
                });

                razorpay.on('payment.failed', () => {
                    setPaymentModal({ state: 'failed', message: 'Payment failed. Please try again.' });
                });

                razorpay.open();
            } else {
                setError('Order details were not returned by the server.');
            }
        } catch (error) {
            console.error('Failed to initiate checkout', error);
            setError(error instanceof Error ? error.message : 'Checkout could not be started.');
        } finally {
            setLoadingPack(null);
        }
    };

    React.useEffect(() => {
        return () => stopPolling();
    }, []);

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

            {paymentModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6">
                        <button
                            onClick={() => {
                                stopPolling();
                                setPaymentModal(null);
                            }}
                            className="absolute top-3 right-3 p-2 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)]"
                        >
                            <X size={16} />
                        </button>
                        <h3 className="text-lg font-black mb-2">
                            {paymentModal.state === 'success' ? 'Payment Successful' : paymentModal.state === 'failed' ? 'Payment Failed' : 'Processing Payment'}
                        </h3>
                        <p className="text-sm text-[var(--text-muted)] mb-2">{paymentModal.message}</p>
                        {paymentModal.state === 'processing' && (
                            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">
                                Verifying with backend every 5 seconds
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
