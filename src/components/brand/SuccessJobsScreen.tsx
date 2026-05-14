import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Building2, ExternalLink, Loader2, MapPin, Zap, ArrowLeft, Lock, Crown } from 'lucide-react';

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    url: string;
    created_at: string;
    salary_min?: number;
    salary_max?: number;
}

interface SuccessJobsScreenProps {
    resumeData: any;
    onBack: () => void;
}

export function SuccessJobsScreen({ resumeData, onBack }: SuccessJobsScreenProps) {
    const { user, isAuthenticated } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [isCheckingAccess, setIsCheckingAccess] = useState(true);
    const [tokenBalance, setTokenBalance] = useState(0);

    useEffect(() => {
        checkAccessAndFetchJobs();
    }, []);

    const checkAccessAndFetchJobs = async () => {
        if (!isAuthenticated || !user) {
            setIsCheckingAccess(false);
            setError('Please log in to access job listings.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/job-search-with-tokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    resume_data: resumeData
                })
            });

            const data = await response.json();

            if (response.status === 402) {
                setError(data.message || 'Insufficient tokens');
                setHasAccess(false);
            } else if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch jobs');
            } else {
                setJobs(data.results || []);
                setTokenBalance(data.token_balance || 0);
                setHasAccess(true);
            }
        } catch (err) {
            console.error("Error fetching jobs:", err);
            setError("We couldn't load jobs at this moment. Please try again later.");
            setHasAccess(false);
        } finally {
            setIsLoading(false);
            setIsCheckingAccess(false);
        }
    };

    if (isCheckingAccess || isLoading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-main)]">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Loader2 size={32} className="text-purple-500 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-main)] mb-2">Finding Your Perfect Jobs</h2>
                    <p className="text-[var(--text-muted)] text-sm">Analyzing your resume and matching with opportunities...</p>
                </div>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-main)]">
                <div className="w-full max-w-lg">
                    <button 
                        onClick={onBack}
                        className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-main)] mb-8 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-xs uppercase tracking-widest">Back to Editor</span>
                    </button>

                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-500/10 flex items-center justify-center">
                            <Lock size={28} className="text-yellow-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--text-main)] mb-3">10 VibeTokens Required</h2>
                        <p className="text-[var(--text-muted)] mb-6">
                            You've downloaded your resume! Now unlock curated job matches based on your profile.
                        </p>
                        
                        <div className="bg-[var(--bg-input)] rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] text-sm mb-2">
                                <Crown size={14} className="text-yellow-500" />
                                <span>Your Balance</span>
                            </div>
                            <div className="text-3xl font-bold text-[var(--text-main)]">{user?.vibe_tokens || 0}</div>
                            <div className="text-xs text-[var(--text-muted)] mt-1">VibeTokens</div>
                        </div>

                        <a 
                            href={import.meta.env.PUBLIC_BUY_TOKENS_URL || 'https://takovibe.com/profile?tab=tokens'}
                            className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-yellow-500 hover:opacity-90 text-black rounded-xl font-bold text-sm transition-all"
                        >
                            <Crown size={16} />
                            Buy VibeTokens
                        </a>

                        <p className="text-xs text-[var(--text-muted)] mt-4">
                            Need help? <a href="https://takovibe.com/contact" className="text-purple-500 underline">Contact Support</a>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[var(--bg-main)] overflow-y-auto">
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={onBack}
                        className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-xs uppercase tracking-widest">Back to Editor</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Token Balance</div>
                            <div className="text-lg font-bold text-[var(--text-main)]">{tokenBalance}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Crown size={18} className="text-purple-500" />
                        </div>
                    </div>
                </div>

                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full mb-4">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Resume Ready!</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-[var(--text-main)] mb-4">Now Let's Get You Hired</h1>
                    <p className="text-[var(--text-muted)] max-w-xl mx-auto">
                        Based on your resume, we've found {jobs.length} matching opportunities for you.
                    </p>
                </div>

                {jobs.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center border border-[var(--border-color)] bg-[var(--bg-card)]">
                        <Briefcase size={32} className="text-[var(--text-muted)] mb-6 opacity-50" />
                        <p className="font-serif text-xl text-[var(--text-main)] mb-2">No matching jobs found</p>
                        <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {jobs.map((job) => (
                            <div key={job.id} className="group bg-[var(--bg-card)] border border-[var(--border-color)] p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between hover:border-[var(--text-main)] transition-colors relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-2.5 py-1 bg-[var(--bg-input)] border border-[var(--border-color)] text-[9px] uppercase tracking-widest font-black text-[var(--text-muted)] flex items-center gap-1">
                                            <Zap size={10} className="text-yellow-500" /> Fast Match
                                        </span>
                                        <span className="text-[10px] text-[var(--text-muted)] tracking-widest uppercase">
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <h4 className="font-serif text-2xl md:text-3xl tracking-tight text-[var(--text-main)] mb-4 line-clamp-1">
                                        {job.title}
                                    </h4>
                                    
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <Building2 size={12} className="opacity-60" />
                                            <span className="truncate max-w-[200px] text-[var(--text-main)]">{job.company}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={12} className="opacity-60" />
                                            <span className="truncate max-w-[200px]">{job.location}</span>
                                        </div>
                                        {(job.salary_min || job.salary_max) && (
                                            <div className="flex items-center gap-1.5 text-[var(--text-main)]">
                                                ₹ {job.salary_min?.toLocaleString()} - {job.salary_max?.toLocaleString()}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm text-[var(--text-muted)] font-light line-clamp-2 md:line-clamp-3 leading-relaxed" 
                                       dangerouslySetInnerHTML={{ __html: job.description?.replace(/<[^>]*>?/gm, '') || '' }} />
                                </div>

                                <div className="flex flex-row md:flex-col items-center justify-between md:justify-center shrink-0 border-t md:border-t-0 md:border-l border-[var(--border-color)] pt-6 md:pt-0 md:pl-8 mt-4 md:mt-0">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] md:mb-4 text-center">
                                        Jobs by <br className="hidden md:block" />
                                        <span className="font-bold text-[var(--text-main)]">Adzuna</span>
                                    </p>
                                    <a 
                                        href={job.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-6 py-3 bg-[var(--text-main)] text-[var(--bg-main)] font-sans text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
                                    >
                                        Apply on Adzuna <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}