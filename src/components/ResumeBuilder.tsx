import { useState, useEffect } from 'react';
import { useResume } from '../hooks/useResume';
import { ResumePreview } from './ResumePreview';
import { Download, RotateCcw, FileText, Eye, Edit, Loader2, Sparkles, UserCheck, Zap, LogIn, Save, Lock, Globe, X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../context/ThemeContext';
import { TextPreview } from './parser/TextPreview';
import { EditorToolbar } from './ui/EditorToolbar';
import { Logo } from './ui/Logo';

import { PersonalInfoModal } from './editor/PersonalInfoModal';
import { ResumeProvider } from '../context/ResumeContext';
import { BrandSwitcher } from './brand/BrandSwitcher';
import { CareerInsights } from './brand/CareerInsights';
import { SuccessModal } from './brand/SuccessModal';
import OptimizeResumeModal from './OptimizeResumeModal';
import { ImportResumeModal } from './ImportResumeModal';
import { SectionTypeDialog } from './ui/SectionTypeDialog';
import { RecruiterPanel } from './RecruiterPanel';
import { ShareModal } from './ShareModal';
import { CareerGuidanceModal } from './editor/CareerGuidanceModal';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { GoogleLogin } from './GoogleLogin';
import { api } from '../lib/api';

function ResumeBuilderContent() {
    const { data, updateResume, resetToDefault, isLoaded, undo, redo } = useResume();
    const { user, isAuthenticated, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'parser'>('editor');
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showOptimizeModal, setShowOptimizeModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showSectionTypeModal, setShowSectionTypeModal] = useState(false);
    const [showRecruiterAI, setShowRecruiterAI] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showGuidanceModal, setShowGuidanceModal] = useState(false);
    const [showAutoOptimize, setShowAutoOptimize] = useState(false);
    const [guidanceInsights, setGuidanceInsights] = useState<Array<{ type: 'good' | 'warning' | 'info'; text: string }>>([]);
    const [guidanceAuditResult, setGuidanceAuditResult] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [lastDownloadedFile, setLastDownloadedFile] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [resumeMetadata, setResumeMetadata] = useState<{ id?: string, name: string, isPublic: boolean } | null>(null);

    const [isPublicView, setIsPublicView] = useState(false);

    // Close login modal when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            setShowLoginModal(false);
        }
    }, [isAuthenticated]);

    // Check for public view mode
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') === 'public') {
            setIsPublicView(true);
        }
    }, []);

    // Auto-generate PDF preview when switching to 'preview' tab
    useEffect(() => {
        if (activeTab === 'preview') {
            generatePdfPreview();
        }
    }, [activeTab, data]); // Re-generate if data changes while in preview

    // Handle Undo/Redo keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const active = document.activeElement as HTMLElement;
            const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
            if (isInput) return;

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) redo();
                else undo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    if (!isLoaded) return <div className="p-10 text-center">Loading...</div>;

    if (isPublicView) {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] py-8 px-4 flex flex-col items-center">
                <div className="w-full max-w-4xl">
                    <ResumePreview
                        data={data}
                        id="public-resume-view"
                        isEditable={false}
                    />
                </div>

                {/* Professional Badge */}
                <div
                    className="mt-12 group flex items-center gap-3 px-6 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl transition-all"
                >
                    <div className="flex flex-col items-start translate-y-0.5">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">Verified View</span>
                        <span className="text-sm font-black text-[var(--text-main)] tracking-tight">Professional Resume</span>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-lg">
                        <UserCheck size={16} className="text-white" />
                    </div>
                </div>
            </div>
        );
    }

    const generatePdfPayload = async () => {
        const element = document.getElementById('resume-preview-for-generation');
        if (!element) return null;

        // Explicitly fetch the clean resume.css
        let resumeCss = '';
        try {
            const cssRes = await fetch('/resume.css');
            if (cssRes.ok) {
                resumeCss = await cssRes.text();
            } else {
                console.error('Failed to fetch resume.css');
            }
        } catch (e) {
            console.error('Error fetching resume.css:', e);
        }

        const html = element.outerHTML;
        return { html, css: resumeCss };
    };

    const handleDownload = async () => {
        try {
            setIsGenerating(true);
            const payload = await generatePdfPayload();
            if (!payload) throw new Error('Could not find resume element');

            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to generate PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const filename = `Resume_${data.personalInfo.fullName.replace(/\s+/g, '_')}.pdf`;
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setLastDownloadedFile(filename);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        setIsSaving(true);
        try {
            // Use existing name if available, otherwise prompt
            const defaultName = resumeMetadata?.name || data.personalInfo.fullName || "My Resume";
            const resumeName = prompt("Enter a name for your resume:", defaultName);

            if (!resumeName) {
                setIsSaving(false);
                return;
            }

            const response = await api.post('/api/resumes/', {
                resume_name: resumeName,
                resume_data: data,
                is_public: resumeMetadata?.isPublic || false
            });

            if (response.ok) {
                const responseData = await response.json();
                setResumeMetadata({
                    id: responseData.id,
                    name: responseData.resume_name,
                    isPublic: responseData.is_public
                });
                alert("Resume saved successfully!");
            } else {
                const err = await response.json();
                console.error("Save failed:", err);
                alert("Failed to save resume. " + (err.detail || "Unknown error"));
            }
        } catch (error) {
            console.error("Error saving resume:", error);
            alert("An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    const generatePdfPreview = async () => {
        try {
            // Small delay to allow render
            await new Promise(resolve => setTimeout(resolve, 100));

            const payload = await generatePdfPayload();
            if (!payload) return;

            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to generate preview');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setPdfPreviewUrl(url);
        } catch (error) {
            console.error('Error generating preview:', error);
        }
    };

    const handleAddSectionType = (type: string, label?: string) => {
        // Standard sections map to keys in visibleSections
        const standardSections = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'];

        let shouldCreateCustom = false;
        let sectionTitle = label || "New Section";

        if (standardSections.includes(type)) {
            // Check if it's already visible
            if (data.visibleSections[type as keyof typeof data.visibleSections]) {
                // Already visible? Treat as request for duplicate via custom section
                shouldCreateCustom = true;
            } else {
                // Enable the standard section
                updateResume({
                    ...data,
                    visibleSections: { ...data.visibleSections, [type]: true }
                });

                // Wait for render then scroll
                setTimeout(() => {
                    const element = document.getElementById(type);
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
                return;
            }
        } else if (type === 'custom') {
            shouldCreateCustom = true;
        }

        if (shouldCreateCustom) {
            // Create custom section
            const id = `custom-${Date.now()}`;
            // Determine type
            const supportedTypes = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'];
            const sectionType = supportedTypes.includes(type) ? type : 'custom';

            const newSection = {
                id,
                title: sectionTitle,
                type: sectionType as any,
                items: sectionType === 'summary' ? [''] : []
            };
            const newCustomSections = [...(data.customSections || []), newSection];
            const newOrder = [...data.sectionOrder, id];
            const newVisible = { ...data.visibleSections, [id]: true };

            updateResume({
                ...data,
                customSections: newCustomSections,
                sectionOrder: newOrder,
                visibleSections: newVisible
            });

            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[var(--bg-main)]">
            {/* Hidden instance for PDF generation scraping */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none opacity-0">
                <ResumePreview data={data} id="resume-preview-for-generation" />
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="relative bg-[var(--bg-card)] p-[1px] rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 group">
                        {/* Gradient Border */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-100"></div>

                        <div className="relative bg-[var(--bg-card)] p-8 rounded-[23px] h-full flex flex-col items-center text-center overflow-hidden">
                            {/* Subtle Inner Glow */}
                            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                            <div className="relative mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-input)] flex items-center justify-center shadow-inner border border-[var(--border-color)]">
                                    <Lock className="w-7 h-7 text-[var(--text-main)] opacity-70" strokeWidth={1.5} />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-[var(--text-main)] mb-3 tracking-tight">Unlock Full Access</h2>
                            <p className="mb-8 text-[var(--text-muted)] text-sm leading-relaxed px-2 font-medium">
                                Sign in to save your progress, create multiple versions, and share your resume with the world.
                            </p>

                            <div className="w-full flex justify-center mb-6 transform transition-transform hover:scale-[1.02]">
                                <GoogleLogin />
                            </div>

                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors py-2 px-6 rounded-full hover:bg-[var(--bg-input)]"
                            >
                                Continue as Guest
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Bar - Desktop */}
            <nav className="hidden md:flex sticky top-0 z-[60] justify-between items-center px-8 py-4 bg-[var(--glass-bg)] backdrop-blur-2xl border-b border-[var(--border-color)] text-[var(--text-main)] shadow-2xl">
                <div className="flex items-center gap-3 md:gap-6">
                    <BrandSwitcher />
                    <a
                        href="/why-resumevibe"
                        className="hidden lg:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-purple-500 transition-colors"
                    >
                        <Zap size={14} className="text-purple-500" />
                        Why ResumeVibe?
                    </a>
                </div>

                {/* Mobile Tab Switcher Centered on Mobile */}
                <div className="flex xl:hidden bg-[var(--bg-input)] rounded-lg p-1 border border-[var(--border-color)] shrink-0" role="tablist" aria-label="Editor Views">
                    <button
                        onClick={() => setActiveTab('editor')}
                        className={`p-1.5 sm:p-2 rounded-md transition-all ${activeTab === 'editor' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)]'}`}
                        title="Switch to Editor"
                        aria-label="Editor View"
                        aria-selected={activeTab === 'editor'}
                        role="tab"
                    >
                        <Edit size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`p-1.5 sm:p-2 rounded-md transition-all ${activeTab === 'preview' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)]'}`}
                        title="Switch to PDF Preview"
                        aria-label="PDF Preview View"
                        aria-selected={activeTab === 'preview'}
                        role="tab"
                    >
                        <FileText size={14} className="sm:w-4 sm:h-4" />
                    </button>
                </div>

                <div className="flex gap-1.5 md:gap-3 items-center">
                    {/* Desktop Tabs (XL only now) */}
                    <div className="hidden xl:flex bg-[var(--bg-input)] rounded-xl p-1 border border-[var(--border-color)]" role="tablist" aria-label="Editor Views">
                        <button
                            onClick={() => setActiveTab('editor')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'editor' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                            role="tab"
                            aria-selected={activeTab === 'editor'}
                            aria-label="Switch to Editor"
                        >
                            <Edit size={14} /> Editor
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'preview' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                            role="tab"
                            aria-selected={activeTab === 'preview'}
                            aria-label="Switch to PDF Preview"
                        >
                            <FileText size={14} /> Preview
                        </button>
                    </div>

                    <div className="w-px h-6 bg-[var(--border-color)] hidden xl:block mx-1"></div>

                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs bg-[var(--bg-input)] hover:bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl font-bold uppercase tracking-widest shadow-sm"
                        title="Import Resume"
                    >
                        <FileText size={16} />
                        <span className="hidden lg:inline">Import</span>
                    </button>

                    {/* Save Button - Temporarily Disabled */}
                    <div className="relative group/tooltip">
                        <button
                            disabled
                            className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)] rounded-xl font-bold uppercase tracking-widest opacity-50 cursor-not-allowed grayscale"
                        >
                            <Save size={16} />
                            <span className="hidden lg:inline">Save</span>
                        </button>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            Coming Soon
                        </div>
                    </div>

                    <button
                        onClick={resetToDefault}
                        className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors hidden sm:block"
                        title="Reset to Default"
                    >
                        <RotateCcw size={18} />
                    </button>

                    {isAuthenticated ? (
                        <div className="flex items-center gap-2 ml-2">
                            {user?.profile_image && (
                                <img src={user.profile_image} alt="Profile" className="w-8 h-8 rounded-full border border-[var(--border-color)]" />
                            )}
                            <button onClick={logout} className="text-xs text-[var(--text-muted)] hover:text-red-500 font-bold uppercase tracking-wide">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-xl transition-colors"
                        >
                            <LogIn size={16} /> Login
                        </button>
                    )}

                    {/* Share Button - Temporarily Disabled */}
                    <div className="relative group/tooltip">
                        <button
                            disabled
                            className="hidden md:flex items-center gap-2 px-3 md:px-4 py-2 text-xs bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)] rounded-xl font-bold uppercase tracking-widest opacity-50 cursor-not-allowed grayscale"
                        >
                            <Globe size={16} />
                            <span className="hidden lg:inline">Share</span>
                        </button>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            Coming Soon
                        </div>
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="flex items-center gap-3 px-3 md:px-6 py-2 text-xs bg-[var(--text-main)] hover:opacity-90 text-[var(--bg-main)] rounded-xl font-bold uppercase tracking-[0.1em] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                    >
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        <span className="hidden md:inline">{isGenerating ? 'Generating...' : 'Download'}</span>
                    </button>
                </div>
            </nav>

            {/* Top Bar - Mobile - Simplified */}
            <nav className="flex md:hidden sticky top-0 z-[60] justify-between items-center px-3 py-3 bg-[var(--glass-bg)] backdrop-blur-2xl border-b border-[var(--border-color)] text-[var(--text-main)] shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 p-1 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <Logo className="w-full h-full" />
                    </div>
                </div>

                <div className="flex-1 text-center font-bold text-sm truncate px-2">
                    {data.personalInfo.fullName || 'Untitled Resume'}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowRecruiterAI(!showRecruiterAI)}
                        className={`p-2 rounded-lg transition-all relative group ${showRecruiterAI ? 'text-purple-500 bg-purple-500/10' : 'text-[var(--text-muted)]'}`}
                    >
                        {showRecruiterAI && <div className="absolute inset-0 rounded-lg animate-ping bg-purple-500 opacity-20 pointer-events-none"></div>}
                        <Zap size={18} className={showRecruiterAI ? 'fill-purple-500/20' : ''} />
                    </button>
                    <button
                        onClick={() => setActiveTab(activeTab === 'editor' ? 'preview' : 'editor')}
                        className={`p-2 rounded-lg transition-all ${activeTab === 'preview' ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-muted)]'}`}
                    >
                        {activeTab === 'editor' ? <Eye size={18} /> : <Edit size={18} />}
                    </button>

                    {isAuthenticated ? (
                        <div className="flex items-center gap-2 ml-1">
                            {user?.profile_image ? (
                                <img
                                    src={user.profile_image}
                                    alt="Profile"
                                    className="w-7 h-7 rounded-full border border-[var(--border-color)]"
                                    onClick={logout}
                                />
                            ) : (
                                <button onClick={logout} className="p-2 text-red-500">
                                    <LogIn size={18} className="rotate-180" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="p-2 text-[var(--accent)] transition-colors"
                        >
                            <LogIn size={18} />
                        </button>
                    )}

                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="p-2 text-[var(--accent)] font-bold disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    </button>
                </div>
            </nav >

            {/* Hidden resume for generation */}
            < div className="absolute top-0 left-0 -z-50 invisible h-0 w-0 overflow-hidden" >
                <ResumePreview
                    data={data}
                    id="resume-preview-for-generation"
                    isEditable={false}

                />
            </div >

            {/* Main Content - Single Pane Layout */}
            < main className="flex flex-1 overflow-hidden bg-[var(--bg-main)] relative items-stretch" >
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {/* Desktop Toolbar */}
                    {activeTab === 'editor' && <div className="hidden md:block"><EditorToolbar onAddSection={() => setShowSectionTypeModal(true)} /></div>}

                    {/* Mobile Bottom Toolbar Spacer to prevent content overlapping */}
                    {activeTab === 'editor' && (
                        <div className="block xl:hidden fixed bottom-28 right-4 z-50 flex flex-col gap-4">
                            {/* Premium HUD FAB for AI Cockpit */}
                            <button
                                onClick={() => setShowRecruiterAI(true)}
                                className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-[20px] shadow-[0_8px_30px_rgb(126,34,206,0.3)] flex items-center justify-center active:scale-90 transition-all group relative overflow-hidden ring-1 ring-white/20"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] duration-700 transition-transform" />
                                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                                <Zap size={22} className="group-hover:rotate-12 transition-transform fill-white/20" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[var(--bg-main)] animate-pulse" />
                            </button>

                            <button
                                onClick={() => setShowSectionTypeModal(true)}
                                className="w-14 h-14 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] rounded-[20px] shadow-2xl flex items-center justify-center active:scale-95 transition-all relative"
                            >
                                <div className="absolute inset-0 rounded-[20px] animate-ping bg-[var(--accent)] opacity-5 pointer-events-none"></div>
                                <span className="text-3xl font-light mb-1 opacity-60">+</span>
                            </button>
                        </div>
                    )}

                    {/* Mobile Bottom Toolbar (Using EditorToolbar but styled to dock bottom) */}
                    {activeTab === 'editor' && (
                        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] pb-safe-area">
                            <div className="bg-[var(--glass-bg)] backdrop-blur-xl border-t border-[var(--border-color)] p-2 flex justify-around">
                                {/* We reuse EditorToolbar but it needs some CSS tweaks to look native bottom bar - for now just wrapping it might be clunky. 
                                     Let's render a custom simplified bottom bar here instead for speed and "Mobile tuning". 
                                 */}
                                <EditorToolbar onAddSection={() => setShowSectionTypeModal(true)} isMobile={true} />
                            </div>
                        </div>
                    )}
                    {activeTab === 'editor' && (
                        <div className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center bg-[var(--bg-main)] scroll-smooth pt-24 pb-32">
                            {/* Mobile-optimized Container - Fits Width Automatically */}
                            <div className="w-full md:w-auto relative mt-4 md:mt-8 px-2 md:px-0 flex justify-center">
                                {/* Only apply transform scale on non-mobile, on mobile we use CSS Zoom or Width constraints */}
                                <div className="hidden md:block scale-[0.7] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-300">
                                    <ResumePreview
                                        data={data}
                                        id="resume-preview-content"
                                        isEditable={true}
                                        onUpdate={updateResume}
                                        onEditHeader={() => setShowInfoModal(true)}
                                        auditResult={guidanceAuditResult}
                                    />
                                </div>
                                {/* Mobile Specific View - Force Width to 100% and Scale via Style */}
                                <div className="block md:hidden w-full">
                                    <ResumePreview
                                        data={data}
                                        id="resume-preview-content-mobile"
                                        isEditable={true}
                                        onUpdate={updateResume}
                                        onEditHeader={() => setShowInfoModal(true)}
                                        viewMode="mobile"
                                        auditResult={guidanceAuditResult}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {showInfoModal && (
                        <PersonalInfoModal
                            data={data.personalInfo}
                            onSave={(info) => updateResume({ ...data, personalInfo: info })}
                            onClose={() => setShowInfoModal(false)}
                        />
                    )}

                    {showSuccessModal && (
                        <SuccessModal
                            fileName={lastDownloadedFile}
                            onClose={() => setShowSuccessModal(false)}
                        />
                    )}

                    {showOptimizeModal && (
                        <OptimizeResumeModal
                            isOpen={showOptimizeModal}
                            onClose={() => {
                                setShowOptimizeModal(false);
                                setShowAutoOptimize(false);
                            }}
                            autoOptimize={showAutoOptimize}
                            auditResult={guidanceAuditResult}
                        />
                    )}

                    {showImportModal && (
                        <ImportResumeModal
                            isOpen={showImportModal}
                            onClose={() => setShowImportModal(false)}
                            onImport={(parsedData) => updateResume(parsedData)}
                        />
                    )}

                    {showSectionTypeModal && (
                        <SectionTypeDialog
                            isOpen={showSectionTypeModal}
                            onClose={() => setShowSectionTypeModal(false)}
                            onSelect={handleAddSectionType}
                            existingSections={data.visibleSections}
                        />
                    )}

                    <ShareModal
                        isOpen={showShareModal}
                        onClose={() => setShowShareModal(false)}
                        resumeId={resumeMetadata?.name || data.personalInfo.fullName.toLowerCase().replace(/\s+/g, '-')}
                        fullName={data.personalInfo.fullName}
                        username={user?.email?.split('@')[0] || 'user'}
                        isPublic={resumeMetadata?.isPublic || false}
                        onVisibilityChange={(isPublic) => {
                            if (resumeMetadata) {
                                setResumeMetadata({ ...resumeMetadata, isPublic });
                            }
                        }}
                        isAuthenticated={isAuthenticated}
                        onRequireAuth={() => setShowLoginModal(true)}
                    />

                    {showGuidanceModal && (
                        <CareerGuidanceModal
                            isOpen={showGuidanceModal}
                            onClose={() => setShowGuidanceModal(false)}
                            data={data}
                            insights={guidanceInsights}
                            auditResult={guidanceAuditResult}
                            onFixAll={() => {
                                setShowAutoOptimize(true);
                                setShowOptimizeModal(true);
                            }}
                        />
                    )}

                    {/* PDF Preview Mode */}
                    {activeTab === 'preview' && (
                        <div className="w-full h-full bg-[var(--bg-main)] overflow-y-auto p-4 md:p-8 flex justify-center">
                            <div className="w-full h-full max-w-[210mm] flex flex-col shadow-2xl">
                                {pdfPreviewUrl ? (
                                    <iframe
                                        src={pdfPreviewUrl}
                                        className="w-full flex-1 rounded-lg bg-white"
                                        title="PDF Preview"
                                    />
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-[var(--text-main)]">
                                        <div className="text-center">
                                            <Loader2 size={48} className="animate-spin mb-4 mx-auto" />
                                            <p>Generating PDF Preview...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Parser View */}
                    {activeTab === 'parser' && (
                        <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-[var(--bg-main)]">
                            <div className="max-w-4xl mx-auto bg-[var(--bg-card)] p-6 rounded-lg shadow border border-[var(--border-color)]">
                                <TextPreview data={data} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - ATS Expert (Responsive) */}
                {/* On XL screens: Always visible as sidebar */}
                {activeTab === 'editor' && showRecruiterAI && (
                    <div className="hidden xl:block h-full border-l border-[var(--border-color)]">
                        <RecruiterPanel
                            data={data}
                            onUpdateJD={(jd) => updateResume({ ...data, targetJD: jd })}
                            onOpenGuidance={(insights, auditResult) => {
                                setGuidanceInsights(insights);
                                setGuidanceAuditResult(auditResult);
                                setShowGuidanceModal(true);
                            }}
                            onOpenOptimizer={() => {
                                setShowAutoOptimize(true);
                                setShowOptimizeModal(true);
                            }}
                            onAuditResult={(result) => setGuidanceAuditResult(result)}
                            isAuthenticated={isAuthenticated}
                            onRequireAuth={() => setShowLoginModal(true)}
                        />
                    </div>
                )}

                {/* On Mobile/Tablet: Slide-over Drawer */}
                {activeTab === 'editor' && showRecruiterAI && (
                    <div className="fixed inset-0 z-[70] xl:hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setShowRecruiterAI(false)}
                        />
                        {/* Drawer Panel */}
                        <div className="absolute right-0 top-0 bottom-0 w-[90%] max-w-sm bg-[var(--bg-card)] shadow-2xl animate-in slide-in-from-right duration-300 border-l border-[var(--border-color)]">
                            <div className="h-full flex flex-col">
                                <div className="flex-1 overflow-hidden relative">
                                    <RecruiterPanel
                                        data={data}
                                        onUpdateJD={(jd) => updateResume({ ...data, targetJD: jd })}
                                        onClose={() => setShowRecruiterAI(false)}
                                        onOpenGuidance={(insights, auditResult) => {
                                            setGuidanceInsights(insights);
                                            setGuidanceAuditResult(auditResult);
                                            setShowGuidanceModal(true);
                                            // Optional: Close drawer on mobile when guidance opens? 
                                            // setShowRecruiterAI(false);
                                        }}
                                        onOpenOptimizer={() => {
                                            setShowAutoOptimize(true);
                                            setShowOptimizeModal(true);
                                            setShowRecruiterAI(false); // Close drawer to show modal
                                        }}
                                        onAuditResult={(result) => setGuidanceAuditResult(result)}
                                        isAuthenticated={isAuthenticated}
                                        onRequireAuth={() => setShowLoginModal(true)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main >
        </div >
    );
}

export function ResumeBuilder() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ResumeProvider>
                    <ResumeBuilderContent />
                    <Toaster position="bottom-center" toastOptions={{
                        style: {
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                        },
                    }} />
                </ResumeProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
