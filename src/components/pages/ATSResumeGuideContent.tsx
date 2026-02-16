import React from 'react';
import { AuthOnlyProviders } from '../Providers';
import { Navbar } from '../ui/Navbar';
import { Footer } from '../ui/Footer';
import {
    ChevronLeft,
    Shield,
    CheckCircle,
    XCircle,
    ArrowRight,
} from "lucide-react";

export function ATSResumeGuideContent() {
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

            <main className="max-w-5xl mx-auto px-6 py-16 lg:py-24 selection:bg-purple-500/30">
                <header className="mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
                        <Shield size={12} className="text-blue-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">2026 Labor Market Research</span>
                    </div>
                    <h1 className="text-4xl lg:text-7xl font-black tracking-tighter mb-8 text-[var(--text-main)] leading-[0.9]">
                        Algorithmic <span className="text-purple-500">Sovereignty</span> <br />
                        <span className="text-3xl lg:text-5xl opacity-40">in 2026 Recruitment</span>
                    </h1>
                    <p className="text-xl text-[var(--text-muted)] leading-relaxed font-medium max-w-3xl">
                        The 2026 labor market is defined by a "low-hire, low-fire"
                        dynamic. With application volumes surging by 250% per role,
                        Applicant Tracking Systems (ATS) have transitioned from
                        screening tools to clinical gatekeepers of professional
                        visibility.
                    </p>
                </header>

                {/* Macroeconomic Section */}
                <section className="mb-24">
                    <div className="flex items-center gap-4 mb-12">
                        <h2 className="text-xs font-black uppercase tracking-widest text-purple-500">I. The 2026 Economic Framework</h2>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6 text-[var(--text-muted)] leading-relaxed font-medium">
                            <p>
                                Current economic consumption is disproportionately
                                buoyed by the top 10% of earners, while middle-income
                                groups pull back in response to inflation. This "Tale of
                                Two Economies" has intensified competition for
                                professional roles.
                            </p>
                            <p>
                                The <strong>"2% Rule"</strong> is now a statistical reality:
                                only 2-3 out of every 100 applicants successfully navigate
                                the automated gauntlet to secure an interview. For Fortune
                                500 roles, AI screening rejects 75% of the pool within 0.3
                                seconds of submission.
                            </p>
                        </div>
                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-input)]">
                                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-main)]">Projected 2026 Labor Scenarios</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-[11px] border-collapse">
                                    <thead>
                                        <tr className="border-b border-[var(--border-color)] text-[var(--text-main)] font-black uppercase">
                                            <th className="p-4">Metric</th>
                                            <th className="p-4">Consensus</th>
                                            <th className="p-4">Downside</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[var(--text-muted)] font-medium">
                                        <tr className="border-b border-[var(--border-color)]/50">
                                            <td className="p-4">Real GDP Growth</td>
                                            <td className="p-4 text-green-500">1.8%</td>
                                            <td className="p-4 text-red-500">0.9%</td>
                                        </tr>
                                        <tr className="border-b border-[var(--border-color)]/50">
                                            <td className="p-4">App Volume / Role</td>
                                            <td className="p-4">250+</td>
                                            <td className="p-4 text-red-500 text-bold">400+</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4">Remote Share</td>
                                            <td className="p-4">8.2%</td>
                                            <td className="p-4">7.5%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technical Anatomy */}
                <section className="mb-24">
                    <div className="flex items-center gap-4 mb-12">
                        <h2 className="text-xs font-black uppercase tracking-widest text-blue-500">II. Anatomy of the Digital Gatekeeper</h2>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                    </div>
                    <div className="prose prose-invert max-w-none mb-12">
                        <p className="text-[var(--text-muted)] font-medium text-lg leading-relaxed">
                            Modern systems like <span className="text-[var(--text-main)]">Workday, Greenhouse, and Lever</span> employ a multi-stage pipeline involving normalization, tokenization, and semantic vector similarity.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: "Normalization", desc: "Strip away images, logos, and complex markers. Scanned PDFs are immediately rejected as 'unreadable'." },
                            { title: "POS Tagging", desc: "Assigns grammatical categories to tokens to distinguish between 'Project' (noun) and 'Project' (verb)." },
                            { title: "Vector Similarity", desc: "LLMs like GPT-4o evaluate semantic alignment. Scores below 0.76 are typically auto-rejected." }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-blue-500/30 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500 font-black">
                                    {i + 1}
                                </div>
                                <h3 className="text-lg font-black mb-3 text-[var(--text-main)] group-hover:text-blue-500 transition-colors">{item.title}</h3>
                                <p className="text-sm text-[var(--text-muted)] leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Parsing Mechanics Table */}
                    <div className="mt-12 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-input)]">
                            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-main)]">The Multi-Stage Parsing Pipeline</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px] border-collapse">
                                <thead>
                                    <tr className="border-b border-[var(--border-color)] text-[var(--text-main)] font-black uppercase">
                                        <th className="p-4">Stage</th>
                                        <th className="p-4">Technical Mechanism</th>
                                        <th className="p-4">Candidate Impact</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[var(--text-muted)] font-medium">
                                    <tr className="border-b border-[var(--border-color)]/50">
                                        <td className="p-4 font-black">Ingestion</td>
                                        <td className="p-4">Format normalization and stripped metadata conversion.</td>
                                        <td className="p-4">Immediate rejection for scanned or image-based files.</td>
                                    </tr>
                                    <tr className="border-b border-[var(--border-color)]/50">
                                        <td className="p-4 font-black">Segmentation</td>
                                        <td className="p-4">Header-based pattern recognition.</td>
                                        <td className="p-4">Determines if your experience is "seen" or ignored.</td>
                                    </tr>
                                    <tr className="border-b border-[var(--border-color)]/50">
                                        <td className="p-4 font-black">Vectorization</td>
                                        <td className="p-4">Conversion of text into numerical semantic vectors.</td>
                                        <td className="p-4">Measures "closeness" to requirements (LLM scoring).</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-black">Ranking</td>
                                        <td className="p-4">Threshold-based priority scoring.</td>
                                        <td className="p-4">Only the top 2-3% of candidates ever reach a human.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Platform nuance */}
                <section className="mb-24">
                    <div className="p-12 lg:p-16 rounded-[4rem] bg-[var(--bg-card)] border border-[var(--border-color)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-500/5 to-transparent"></div>
                        <h2 className="text-2xl font-black mb-12 tracking-tighter text-[var(--text-main)]">Platform-Specific Behavior</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-purple-500 font-black uppercase text-[10px] tracking-widest mb-2">Workday (Enterprise)</h4>
                                    <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed">Rigid parsing. Sensitive to date formats (MM/YYYY). Rejects non-standard section labels immediately.</p>
                                </div>
                                <div>
                                    <h4 className="text-blue-500 font-black uppercase text-[10px] tracking-widest mb-2">Greenhouse / Lever (Modern)</h4>
                                    <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed">Utilizes contextual NLP. Can handle native columns with 80% confidence, but prone to contact info errors in text boxes.</p>
                                </div>
                            </div>
                            <div className="bg-[var(--bg-input)]/50 rounded-3xl p-8 border border-[var(--border-color)] shadow-inner">
                                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-main)] mb-6">The "Reading Order" Problem</h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <XCircle className="text-red-500 shrink-0" size={16} />
                                        <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed"><strong>Multi-Column Trap:</strong> Parsers may merge disjointed columns into an unreadable text block.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="text-green-500 shrink-0" size={16} />
                                        <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed"><strong>Solution:</strong> ResumeVibe's Optimized Single-Column architecture ensures a fail-safe linear path.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[4rem] blur-[80px] opacity-20"></div>
                    <div className="relative p-12 lg:p-20 rounded-[4rem] bg-gradient-to-br from-purple-600 to-indigo-800 text-white text-center overflow-hidden">
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
                        <h2 className="text-4xl lg:text-6xl font-black mb-8 tracking-tighter">Turn the Algorithm <br /> into your <span className="text-purple-300">Advantage.</span></h2>
                        <p className="mb-12 text-purple-100 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                            75% of candidates are rejected because they are <strong>unreadable</strong>, not <strong>unqualified</strong>. ResumeVibe engineers
                            your document for 100% parse rates and high semantic alignment.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <a href="/" className="group flex items-center gap-3 px-12 py-6 bg-white text-purple-700 rounded-[2rem] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">
                                Build Free Resume <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </a>
                        </div>
                    </div>
                </section>

                <footer className="mt-32 pt-12 border-t border-[var(--border-color)]/30 text-center mb-16">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] opacity-30 italic">
                        Derived from Indeed Hiring Lab, Blue Chip Forecasts, and TakoVibe Engineering Research
                    </p>
                </footer>
            </main>
            <Footer />
        </AuthOnlyProviders>
    );
}
