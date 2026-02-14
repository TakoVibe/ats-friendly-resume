import { AuthOnlyProviders } from '../Providers';
import { Navbar } from '../ui/Navbar';
import { UserResumes } from './UserResumes';
import { LoginModal } from '../ui/LoginModal';
import { ChevronLeft, ArrowRight } from 'lucide-react';

export function ProfileDashboard() {
    return (
        <AuthOnlyProviders>
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
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-purple-500/20"
                        >
                            User Dashboard
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

                    <UserResumes />
                </div>
            </main>
        </AuthOnlyProviders>
    );
}
