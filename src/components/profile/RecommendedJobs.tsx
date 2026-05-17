import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Briefcase, Building2, ExternalLink, Loader2, MapPin, Search, Target, Zap } from 'lucide-react';
import { useToken } from '../../context/TokenContext';

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

export function RecommendedJobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('Developer');
    const [searchLocation, setSearchLocation] = useState('');
    const [searchCompany, setSearchCompany] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { fetchTokenData } = useToken();

    useEffect(() => {
        const init = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const queryKeyword = params.get('keyword');
                
                if (queryKeyword) {
                    const loc = params.get('location') || '';
                    const comp = params.get('company') || '';
                    setSearchKeyword(queryKeyword);
                    setSearchLocation(loc);
                    setSearchCompany(comp);
                    await fetchJobs(queryKeyword, loc, comp);
                    return;
                }

                // 1. Fetch resumes to find the target role
                const resumeRes = await api.get('/api/resumes/');
                let keyword = 'Software Developer';
                if (resumeRes.ok) {
                    const data = await resumeRes.json();
                    const resumes = Array.isArray(data) ? data : (data.results || []);
                    if (resumes.length > 0) {
                        // Get the most recent resume's data
                        const latestResume = resumes[0];
                        const parsedData = typeof latestResume.resume_data === 'string' 
                            ? JSON.parse(latestResume.resume_data) 
                            : latestResume.resume_data;
                        
                        if (parsedData?.personalInfo?.title) {
                            keyword = parsedData.personalInfo.title;
                        } else if (parsedData?.skills && parsedData.skills.length > 0) {
                            const firstSkillCat = parsedData.skills[0];
                            if (firstSkillCat.items && firstSkillCat.items.length > 0) {
                                keyword = firstSkillCat.items[0];
                            }
                        }
                    }
                }
                setSearchKeyword(keyword);
                await fetchJobs(keyword, '', '');
            } catch (err) {
                console.error("Initialization error:", err);
                // Fallback
                await fetchJobs('Software Developer', '', '');
            }
        };

        init();
    }, []);

    const fetchJobs = async (keyword: string, location: string, company: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({
                keyword,
                location,
                company
            });
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/jobs?${queryParams.toString()}`, {
                headers: {
                    'Authorization': token ? `Token ${token}` : ''
                }
            });
            if (!response.ok) {
                if (response.status === 402) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Insufficient tokens for this search.');
                }
                throw new Error('Failed to fetch jobs');
            }
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            
            setJobs(data.results || []);
            fetchTokenData();
        } catch (err) {
            console.error("Error fetching jobs:", err);
            setError("We couldn't load jobs at this moment. Please try again later.");
        } finally {
            setIsLoading(false);
            setIsSearching(false);
        }
    };

    const handleManualSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchKeyword.trim()) return;
        setIsSearching(true);
        fetchJobs(searchKeyword, searchLocation, searchCompany);
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col gap-6 mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Automated Opportunities</h2>
                        <h3 className="font-serif-ed text-4xl text-[var(--text-main)] tracking-tight">Curated Jobs</h3>
                    </div>

                    <form onSubmit={handleManualSearch} className="flex flex-col gap-3 w-full max-w-2xl">
                        <div className="flex relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search size={14} className="text-[var(--text-muted)]" />
                            </div>
                            <input 
                                type="text" 
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Search role or skills..."
                                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-main)] pl-10 pr-24 py-3 text-sm rounded-none focus:outline-none focus:border-[var(--text-main)] transition-colors font-sans-ed"
                            />
                            <button 
                                type="submit"
                                disabled={isSearching || isLoading}
                                className="absolute inset-y-1 right-1 px-6 bg-[var(--text-main)] text-[var(--bg-main)] text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isSearching ? <Loader2 size={12} className="animate-spin" /> : 'Search'}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input 
                                type="text" 
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                                placeholder="Location (e.g. Bangalore)"
                                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-main)] px-4 py-2.5 text-[11px] uppercase tracking-widest rounded-none focus:outline-none focus:border-[var(--text-main)] transition-colors placeholder:normal-case placeholder:tracking-normal"
                            />

                            <input 
                                type="text" 
                                value={searchCompany}
                                onChange={(e) => setSearchCompany(e.target.value)}
                                placeholder="Company (e.g. Google)"
                                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-main)] px-4 py-2.5 text-[11px] uppercase tracking-widest rounded-none focus:outline-none focus:border-[var(--text-main)] transition-colors placeholder:normal-case placeholder:tracking-normal"
                            />
                        </div>
                    </form>
                </div>
            </div>

            {/* Status & Content */}
            {isLoading && !isSearching ? (
                <div className="py-24 flex flex-col items-center justify-center border border-[var(--border-color)] bg-[var(--bg-card)]">
                    <Target size={32} className="text-[var(--text-main)] mb-6 animate-pulse" />
                    <p className="font-sans-ed text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Scanning Job Market for your profile...</p>
                </div>
            ) : error ? (
                <div className="py-16 px-6 text-center border border-[var(--border-color)] bg-red-500/5">
                    <p className="text-sm font-bold text-red-500 dark:text-red-400">{error}</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center border border-[var(--border-color)] bg-[var(--bg-card)]">
                    <Briefcase size={32} className="text-[var(--text-muted)] mb-6 opacity-50" />
                    <p className="font-sans-ed text-lg text-[var(--text-main)] mb-2">No matching jobs found</p>
                    <p className="font-sans-ed text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Try adjusting your search criteria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {jobs.map((job) => (
                        <div key={job.id} className="group bg-[var(--bg-card)] border border-[var(--border-color)] p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between hover:border-[var(--text-main)] transition-colors relative overflow-hidden">
                            
                            {/* Decorative line */}
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
                                
                                <h4 className="font-serif-ed text-2xl md:text-3xl tracking-tight text-[var(--text-main)] mb-4 line-clamp-1">
                                    {job.title}
                                </h4>
                                
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-sans-ed text-[11px] uppercase tracking-widest text-[var(--text-muted)] mb-4">
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
                                   dangerouslySetInnerHTML={{ __html: job.description.replace(/<[^>]*>?/gm, '') }} />
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
                                    className="flex items-center gap-2 px-6 py-3 bg-[var(--text-main)] text-[var(--bg-main)] font-sans-ed text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
                                >
                                    Apply Now <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
