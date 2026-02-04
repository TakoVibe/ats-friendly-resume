import { Newspaper, ChevronRight, TrendingUp, BookOpen } from 'lucide-react';

export function CareerInsights() {
    const posts = [
        {
            title: 'Application Security: AI Code Can Destroy',
            category: 'Security',
            readTime: '12 min read',
            url: 'https://takovibe.com/series/application-security/'
        },
        {
            title: 'Mastering the Senior Python Interview',
            category: 'Interview Prep',
            readTime: '8 min read',
            url: 'https://takovibe.com/series/advanced-python-internals-30-days/'
        },
    ];

    return (
        <div className="w-[340px] bg-[var(--bg-main)] border-l border-[var(--border-color)] flex flex-col hidden xl:flex shadow-[-10px_0_30px_rgba(0,0,0,0.1)] shrink-0">
            <div className="p-8 border-b border-[var(--border-color)] bg-gradient-to-b from-[var(--bg-input)] to-transparent">
                <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 bg-[#a78bfa]/10 rounded-lg">
                        <TrendingUp size={20} className="text-[#a78bfa]" />
                    </div>
                    <h2 className="font-bold text-[var(--text-main)] tracking-tight">Level Up Your Career</h2>
                </div>
                <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">Deep-dive technical series and career insights from TakoVibe's engineering collective.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8">
                <div className="space-y-6">
                    {posts.map((post, idx) => (
                        <a
                            key={idx}
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                        >
                            <div className="flex flex-col gap-2.5">
                                <span className="w-fit px-2.5 py-1 bg-[var(--bg-input)] text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-[0.15em] rounded-md group-hover:bg-[#a78bfa]/10 group-hover:text-[#a78bfa] transition-all">
                                    {post.category}
                                </span>
                                <h3 className="text-sm font-bold text-[var(--text-main)] tracking-tight group-hover:text-[#8b5cf6] transition-colors leading-[1.4]">
                                    {post.title}
                                </h3>
                                <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">
                                    <span className="flex items-center gap-1.5">
                                        <BookOpen size={14} className="opacity-70" />
                                        {post.readTime}
                                    </span>
                                    <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[#a78bfa] opacity-0 group-hover:opacity-100 font-bold">
                                        READ <ChevronRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                <div className="mt-12 p-6 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent border border-[var(--border-color)] rounded-2xl relative overflow-hidden group/bmc">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/bmc:scale-110 transition-transform duration-500">
                        <TrendingUp size={48} className="rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-[10px] font-bold text-[#a78bfa] uppercase tracking-[0.2em] mb-2">Support the Mission</h4>
                        <p className="text-xs font-semibold text-[var(--text-main)] mb-4 leading-relaxed opacity-90">
                            Fueling open source research and engineering insights.
                        </p>
                        <a
                            href="https://buymeacoffee.com/rahulbeniwal"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#FFDD00] text-[#000000] text-[11px] font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#FFDD00]/10 border border-white/10"
                        >
                            <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                                <line x1="6" y1="1" x2="6" y2="4" />
                                <line x1="10" y1="1" x2="10" y2="4" />
                                <line x1="14" y1="1" x2="14" y2="4" />
                            </svg>
                            <span>Buy me a coffee</span>
                        </a>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-input)]/30">
                <a
                    href="https://takovibe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[#a78bfa] transition-all"
                >
                    <Newspaper size={16} />
                    The Knowledge Hub
                </a>
            </div>
        </div>
    );
}
