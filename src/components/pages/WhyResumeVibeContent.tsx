import React from 'react';
import { AuthOnlyProviders } from '../Providers';
import { Navbar } from '../ui/Navbar';
import { Footer } from '../ui/Footer';
import { LoginModal } from '../ui/LoginModal';
import {
    Sparkles,
    Zap,
    Shield,
    Target,
    Globe,
    Cpu,
    BarChart3,
    Rocket,
    MessageSquare,
    ArrowRight,
    BookOpen,
    History,
    ChevronLeft
} from "lucide-react";

export function WhyResumeVibeContent() {
    const features = [
        {
            icon: Globe,
            title: "Personalized Public URL",
            desc: "No more messy PDF attachments. Share your live, high-performance resume via a unique slug like /resume/your-name.",
            color: "blue",
            top: true
        },
        {
            icon: History,
            title: "10-Step Version Control",
            desc: "Mistakes happen. We save up to 10 full versions of your resume so you can roll back to any previous state instantly.",
            color: "purple",
            top: true
        },
        {
            icon: Cpu,
            title: "Power Autopilot",
            desc: "Our AI doesn't just suggest; it executes. One click to analyze job gaps and rewrite your experience for maximum impact.",
            color: "indigo",
        },
        {
            icon: BarChart3,
            title: "Deep AI Audit",
            desc: "Get a brutal, honest diagnostic of your resume from a simulated recruiter's perspective before you ever hit send.",
            color: "amber",
        },
        {
            icon: Shield,
            title: "ATS-Safe Engine",
            desc: "Built with a single-column architecture that guarantees 100% read rates across all major Applicant Tracking Systems.",
            color: "green",
        },
        {
            icon: Zap,
            title: "Smart PDF Parsing",
            desc: "Import your old, messy PDF and watch our high-performance parser convert it into a structured, clean data model instantly.",
            color: "rose",
        },
    ];

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

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 selection:bg-purple-500/30">
                {/* Background Orbs */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[110px] animate-pulse" style={{ animationDelay: '4s' }}></div>
                </div>

                {/* Hero Section */}
                <header className="mb-32 max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
                        <Sparkles size={12} className="text-purple-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-purple-500">The New Standard</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-8 bg-gradient-to-r from-[var(--text-main)] via-[var(--text-main)] to-[var(--text-main)]/40 bg-clip-text text-transparent">
                        Why settle for a <span className="text-purple-500">Static</span> Resume?
                    </h1>
                    <p className="text-xl text-[var(--text-muted)] leading-relaxed font-medium">
                        ResumeVibe isn't just a builder. It's an autonomous career
                        presentation engine designed for high-stakes engineering
                        roles where precision meets aesthetics.
                    </p>
                </header>

                {/* Features Grid */}
                <section className="mb-32">
                    <div className="flex items-center gap-4 mb-16">
                        <h2 className="text-xs font-black uppercase tracking-widest text-purple-500">Active Core Features</h2>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feat, i) => (
                            <div
                                key={i}
                                className="group p-8 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-purple-500/30 hover:bg-[var(--bg-input)] transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 shadow-sm hover:shadow-xl"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-input)] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-purple-500/10 transition-all duration-500 shadow-md">
                                    <feat.icon size={24} className="text-[var(--text-main)] group-hover:text-purple-500 transition-colors" />
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <h3 className="text-xl font-black tracking-tight text-[var(--text-main)] group-hover:text-purple-500 transition-colors">
                                        {feat.title}
                                    </h3>
                                    {feat.top && (
                                        <span className="text-[8px] font-black px-1.5 py-0.5 bg-purple-500/10 text-purple-500 rounded-md uppercase">Unique</span>
                                    )}
                                </div>
                                <p className="text-[var(--text-muted)] font-medium leading-relaxed group-hover:text-[var(--text-main)] transition-colors">
                                    {feat.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Engine Upgrades Section */}
                <section className="mb-32">
                    <div className="flex items-center gap-4 mb-16">
                        <h2 className="text-xs font-black uppercase tracking-widest text-emerald-500">Under the Hood: Engine Upgrades</h2>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        <div className="group p-8 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-emerald-500/30 hover:bg-[var(--bg-input)] transition-all duration-500 animate-in fade-in shadow-sm hover:shadow-xl wait-200">
                            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-input)] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all duration-500 shadow-md">
                                <Target size={24} className="text-[var(--text-main)] group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-[var(--text-main)] group-hover:text-emerald-500 transition-colors mb-4">
                                Distant Match Odds
                            </h3>
                            <p className="text-[var(--text-muted)] font-medium leading-relaxed group-hover:text-[var(--text-main)] transition-colors">
                                Applying for a wildly different role? The engine calculates your exact percentage odds of selection while presenting brutal, actionable warnings about core capability gaps.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Roadmap Section */}
                <section className="mb-32 relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                    <div className="relative p-12 lg:p-20 rounded-[4rem] bg-gradient-to-br from-[var(--bg-card)] to-transparent border border-[var(--border-color)] overflow-hidden shadow-2xl">
                        <div className="flex items-center gap-4 mb-20">
                            <h2 className="text-xs font-black uppercase tracking-widest text-blue-500">Roadmap: The Next Wave</h2>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div className="space-y-12">
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Globe size={20} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black mb-2 tracking-tight text-[var(--text-main)]">Deep Resume Analytics</h4>
                                        <p className="text-[var(--text-muted)] font-medium leading-relaxed">
                                            Track who sees your resume. Get insights on view duration, download triggers, and geographic interest.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Rocket size={20} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black mb-2 tracking-tight text-[var(--text-main)]">One-Click Identity Switch</h4>
                                        <p className="text-[var(--text-muted)] font-medium leading-relaxed">
                                            Instantly transform your resume's visual DNA. Toggle between minimalist, creative, and executive themes instantly.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[var(--bg-input)]/50 rounded-[3rem] p-8 border border-[var(--border-color)] flex flex-col justify-center items-center text-center shadow-inner">
                                <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 animate-bounce overflow-hidden border-2 border-blue-500/20 shadow-lg">
                                    <img src="/logo.png" className="w-full h-full object-contain" alt="Logo" />
                                </div>
                                <h3 className="text-2xl font-black mb-4 px-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                                    We're just getting started.
                                </h3>
                                <p className="text-sm text-[var(--text-muted)] font-medium max-w-xs leading-relaxed">
                                    Experience a resume builder that understands engineering depth. Build your next career move with unmatched precision.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TakoVibe Ecosystem Promo */}
                <section className="mb-32">
                    <div className="relative p-1 px-1 rounded-[3.5rem] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 shadow-2xl">
                        <div className="relative bg-[var(--bg-card)] rounded-[3.4rem] p-12 lg:p-20 overflow-hidden">
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/5 to-transparent"></div>

                            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
                                <div className="flex-1 space-y-8 text-center lg:text-left">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                                        <Globe size={14} className="text-purple-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">The Parent Ecosystem</span>
                                    </div>
                                    <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-tight mt-4 text-[var(--text-main)]">
                                        The Intelligent <br />
                                        <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Knowledge Platform.</span>
                                    </h1>
                                    <p className="text-lg text-[var(--text-muted)] font-medium max-w-2xl leading-relaxed">
                                        Don't just read. <strong>Experience it.</strong> Transform how you learn with interactive mental models, visual code execution, and AI tutors.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left py-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[var(--text-main)] font-bold text-sm tracking-tight">
                                                <BookOpen size={18} className="text-purple-500" />
                                                High-Depth Topics
                                            </div>
                                            <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed opacity-80">
                                                We create high-quality engineering topics. From containers to webframes, we decode the toughest concepts.
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[var(--text-main)] font-bold text-sm tracking-tight">
                                                <Cpu size={18} className="text-blue-500" />
                                                Visual Execution
                                            </div>
                                            <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed opacity-80">
                                                See the invisible. Watch code run step-by-step with real-time variable inspection and mental models.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-8">
                                        <a
                                            href="https://takovibe.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-3 px-10 py-5 bg-[var(--text-main)] text-[var(--bg-main)] rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all duration-500 shadow-xl active:scale-95"
                                        >
                                            Start Learning <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
                                        </a>
                                    </div>
                                </div>

                                <div className="w-full lg:w-[450px] aspect-square relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-[4rem] blur-3xl group-hover:opacity-100 opacity-40 transition-opacity duration-1000"></div>
                                    <div className="relative h-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[4rem] flex items-center justify-center p-12 backdrop-blur-2xl group-hover:bg-[var(--bg-card)] transition-all duration-700 shadow-2xl">
                                        <div className="flex flex-col items-center">
                                            <span className="text-4xl font-black tracking-tighter mb-2 text-[var(--text-main)]">TakoVibe</span>
                                            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mt-4">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Live Engineering HQ</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing / Token System */}
                <section className="mb-32">
                    <div className="flex items-center gap-4 mb-16">
                        <h2 className="text-xs font-black uppercase tracking-widest text-purple-500">VibeToken Pricing</h2>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="p-8 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-color)]">
                            <h3 className="text-lg font-black mb-1 text-[var(--text-main)]">Free Tier</h3>
                            <div className="text-3xl font-black text-purple-500 mb-6">50 Tokens <span className="text-xs font-medium text-[var(--text-muted)] uppercase">on signup</span></div>
                            <p className="text-[var(--text-muted)] font-medium leading-relaxed mb-6">
                                Every new user gets 50 free VibeTokens to explore the platform. Building, formatting, and exporting your resume remains 100% free always.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm text-[var(--text-main)] font-medium">
                                    <Sparkles size={16} className="text-purple-500 shrink-0" />
                                    <span>Free Resume Builder & Export</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-[var(--text-main)] font-medium">
                                    <Sparkles size={16} className="text-purple-500 shrink-0" />
                                    <span>50 tokens for AI Actions</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-[var(--bg-card)] border-2 border-purple-500/30 relative shadow-xl shadow-purple-500/5">
                            <div className="absolute top-0 right-8 -translate-y-1/2 bg-purple-500 text-white text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full">
                                Pay as you go
                            </div>
                            <h3 className="text-lg font-black mb-1 text-[var(--text-main)]">Starter Pack</h3>
                            <div className="text-3xl font-black text-[var(--text-main)] mb-6">$1 <span className="text-xs font-medium text-[var(--text-muted)] uppercase">/ 100 Tokens</span></div>
                            <p className="text-[var(--text-muted)] font-medium leading-relaxed mb-6">
                                Run out of tokens? No monthly subscriptions. Just simple, transparent pricing. Refill your tokens whenever you need to execute heavy AI operations.
                            </p>
                            <a href="/buy-tokens" className="block text-center w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[.25em] transition-all shadow-xl shadow-purple-500/20 active:scale-95 mb-4">
                                Buy Tokens
                            </a>
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-input)] border border-[var(--border-color)]">
                            <h3 className="text-lg font-black mb-4 text-[var(--text-main)]">Action Costs</h3>
                            <ul className="space-y-4">
                                <li className="flex justify-between items-center pb-4 border-b border-[var(--border-color)]">
                                    <span className="font-bold text-[var(--text-main)]">Pilot Mode</span>
                                    <span className="text-xs font-black bg-purple-500/10 text-purple-500 px-2 py-1 rounded-lg">30 Tokens</span>
                                </li>
                                <li className="flex justify-between items-center pb-4 border-b border-[var(--border-color)]">
                                    <span className="font-bold text-[var(--text-main)]">Deep AI Audit</span>
                                    <span className="text-xs font-black bg-purple-500/10 text-purple-500 px-2 py-1 rounded-lg">30 Tokens</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="font-bold text-[var(--text-main)]">Inline Enhancements</span>
                                    <span className="text-xs font-black bg-purple-500/10 text-purple-500 px-2 py-1 rounded-lg">5 Tokens</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Call to Action Footer */}
                <footer className="text-center pb-20 mb-20">
                    <a
                        href="/"
                        className="inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2rem] text-white text-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-purple-500/30"
                    >
                        Build Your Edge <ArrowRight size={24} />
                    </a>
                    <p className="mt-8 text-[var(--text-muted)] text-sm font-black uppercase tracking-widest opacity-40">
                        Propelled by TakoVibe Engineering Ecosystem
                    </p>
                </footer>
            </main>
            <Footer />
        </AuthOnlyProviders>
    );
}
