import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandSwitcher } from '../brand/BrandSwitcher';
import { ChevronDown, FileText, LogIn, LogOut, User, Wallet, Zap } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useToken } from '../../context/TokenContext';
import { WhyMenu } from './WhyMenu';
export { ThemeToggle };

interface NavbarProps {
    children?: React.ReactNode;
    showBrandOnly?: boolean;
}

export function Navbar({ children }: NavbarProps) {
    const { user, isAuthenticated, logout } = useAuth();
    const { tokenBalance } = useToken();
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <nav className="sticky top-0 z-[60] flex items-center px-3 md:px-6 py-2 md:py-3 bg-[var(--bg-main)] border-b border-[var(--border-color)] text-[var(--text-main)] shadow-sm gap-2 md:gap-4">

            {/* ── Zone 1: Brand (fixed left, never shrinks) ── */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <div className="hidden md:block"><BrandSwitcher /></div>
                <div className="md:hidden"><BrandSwitcher compact /></div>
                <WhyMenu />
            </div>

            {/* ── Zone 2: Page-specific actions (fluid center, takes all leftover space) ── */}
            {children && (
                <div className="flex-1 min-w-0 flex items-center">
                    {children}
                </div>
            )}

            {/* ── Zone 3: Account + Theme (fixed right, never shrinks) ── */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">

                {isAuthenticated ? (
                    <div className="relative">
                        {/* Avatar button */}
                        <button
                            onClick={() => setShowUserMenu(v => !v)}
                            className={`flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-2xl border transition-all bg-[var(--bg-input)] hover:bg-[var(--bg-card)] ${
                                tokenBalance <= 10
                                    ? 'border-orange-500/40 shadow-orange-500/10 shadow-sm'
                                    : 'border-[var(--border-color)]'
                            }`}
                        >
                            {/* Avatar */}
                            <div className="w-7 h-7 rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center shrink-0">
                                {user?.profile_image
                                    ? <img src={user.profile_image} alt="avatar" className="w-full h-full object-cover" />
                                    : <User size={14} className="text-[var(--text-muted)]" />}
                            </div>

                            {/* Name + token count — hidden on mobile */}
                            <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">Account</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-[11px] font-bold text-[var(--text-main)] max-w-[56px] truncate leading-none">
                                        {user?.first_name || 'Me'}
                                    </span>
                                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-black tabular-nums leading-none ${
                                        tokenBalance <= 10 ? 'text-orange-500' : 'text-purple-500'
                                    }`}>
                                        <Zap size={8} fill="currentColor" />{tokenBalance}
                                    </span>
                                </div>
                            </div>

                            <ChevronDown
                                size={12}
                                className={`text-[var(--text-muted)] transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {/* Dropdown */}
                        {showUserMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                <div className="absolute right-0 top-full mt-2 w-60 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden">

                                    {/* User info header */}
                                    <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-input)]/30">
                                        <div className="w-9 h-9 rounded-xl overflow-hidden border border-[var(--border-color)] shrink-0 flex items-center justify-center bg-[var(--bg-card)]">
                                            {user?.profile_image
                                                ? <img src={user.profile_image} alt="avatar" className="w-full h-full object-cover" />
                                                : <User size={18} className="text-[var(--text-muted)]" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold truncate">{user?.first_name} {user?.last_name}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] truncate">{user?.email}</p>
                                        </div>
                                    </div>

                                    {/* Token balance row */}
                                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
                                        <div className="flex items-center gap-2">
                                            <Zap size={13} className={tokenBalance <= 10 ? 'text-orange-500' : 'text-purple-500'} fill="currentColor" />
                                            <span className="text-xs font-bold">{tokenBalance} <span className="text-[var(--text-muted)] font-normal">tokens</span></span>
                                        </div>
                                        <a
                                            href="/buy-tokens"
                                            onClick={() => setShowUserMenu(false)}
                                            className="text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                                        >
                                            Top Up
                                        </a>
                                    </div>

                                    {/* Nav links */}
                                    <div className="p-1.5 flex flex-col gap-0.5">
                                        {[
                                            { href: '/profile',        icon: <User size={14} />,     label: 'My Profile',      color: 'text-purple-500 bg-purple-500/10' },
                                            { href: '/profile',        icon: <FileText size={14} />, label: 'Manage Resumes',  color: 'text-blue-500 bg-blue-500/10'   },
                                            { href: '/profile#tokens', icon: <Wallet size={14} />,   label: 'Token Wallet',    color: 'text-green-500 bg-green-500/10' },
                                        ].map(item => (
                                            <a
                                                key={item.label}
                                                href={item.href}
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--bg-input)] transition-colors"
                                            >
                                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                                                    {item.icon}
                                                </span>
                                                <span className="text-xs font-bold">{item.label}</span>
                                            </a>
                                        ))}

                                        <div className="my-1 border-t border-[var(--border-color)]" />

                                        <button
                                            onClick={() => { setShowUserMenu(false); logout(); }}
                                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors text-red-500 w-full text-left"
                                        >
                                            <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 shrink-0">
                                                <LogOut size={14} />
                                            </span>
                                            <span className="text-xs font-bold">Log Out</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('show-login-modal'))}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-xl transition-all"
                    >
                        <LogIn size={15} /> Login
                    </button>
                )}

                <ThemeToggle />
            </div>
        </nav>
    );
}
