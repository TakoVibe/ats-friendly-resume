import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandSwitcher } from '../brand/BrandSwitcher';
import { Logo } from './Logo';
import { ChevronDown, LogIn, User, FileText, Settings, LogOut, Zap, Globe, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
    children?: React.ReactNode;
    showBrandOnly?: boolean;
}

import { WhyMenu } from './WhyMenu';

export function Navbar({ children, showBrandOnly = false }: NavbarProps) {
    const { user, isAuthenticated, logout } = useAuth();
    const { isDarkMode } = useTheme();
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <nav className="sticky top-0 z-[60] flex justify-between items-center px-3 md:px-8 py-2 md:py-4 bg-[var(--bg-main)] border-b border-[var(--border-color)] text-[var(--text-main)] shadow-2xl">
            <div className="flex items-center gap-2 md:gap-6 shrink-0">
                <div className="hidden md:block">
                    <BrandSwitcher />
                </div>
                <div className="md:hidden">
                    <BrandSwitcher compact />
                </div>

                <WhyMenu />
            </div>

            <div className="flex items-center gap-2 md:gap-4 py-0.5">
                {children}

                {isAuthenticated && <div className="w-px h-6 bg-[var(--border-color)] hidden md:block mx-1 shrink-0"></div>}

                {isAuthenticated ? (
                    <div className="relative shrink-0 ml-1">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-1 md:p-1.5 md:pr-3 bg-[var(--bg-input)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl transition-all shadow-sm group"
                        >
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center">
                                {user?.profile_image ? (
                                    <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={16} className="text-[var(--text-muted)]" />
                                )}
                            </div>
                            <div className="hidden sm:flex flex-col items-start leading-tight">
                                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] opacity-60">Account</span>
                                <span className="text-xs font-bold text-[var(--text-main)] max-w-[80px] truncate">{user?.first_name || 'User'}</span>
                            </div>
                            <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showUserMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-input)]/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--border-color)]">
                                                {user?.profile_image ? (
                                                    <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-[var(--bg-card)]">
                                                        <User size={20} className="text-[var(--text-muted)]" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-[var(--text-main)]">{user?.first_name} {user?.last_name}</span>
                                                <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[140px]">{user?.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2 flex flex-col gap-1">
                                        <a
                                            href="/profile"
                                            onClick={() => setShowUserMenu(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-input)] rounded-xl transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                                                <FileText size={16} />
                                            </div>
                                            Manage Resumes
                                        </a>
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                logout();
                                            }}
                                            className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors w-full text-left"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                                <LogOut size={16} />
                                            </div>
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('show-login-modal'))}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-xl transition-all active:scale-95"
                    >
                        <LogIn size={16} /> Login
                    </button>
                )}
            </div>
        </nav>
    );
}
