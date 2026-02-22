import { useState, useEffect } from 'react';
import { useResume } from '../hooks/useResume';
import { ResumePreview } from './ResumePreview';
import { Save, Download, FileText, Globe, History, Loader2, Edit, Check, Eye, Trash2, Zap, LogIn, RotateCcw, ChevronDown, User, LogOut, Settings, Sparkles, UserCheck, Lock, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { LoginModal } from './ui/LoginModal';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../context/ThemeContext';
import { TextPreview } from './parser/TextPreview';
import { EditorToolbar } from './ui/EditorToolbar';
import { Logo } from './ui/Logo';
import { Navbar, ThemeToggle } from './ui/Navbar';

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
import { LoadingScreen } from './ui/LoadingScreen';

function ResumeBuilderContent() {
    const { data, updateResume, resetToDefault, isLoaded, undo, redo, saveToBackend, saveVersionToBackend, isSaving, lastSaved, resumeMetadata, setResumeMetadata } = useResume();
    const { user, isAuthenticated, logout } = useAuth();
    const { isDarkMode } = useTheme();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMoreActions, setShowMoreActions] = useState(false);
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
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [lastDownloadedFile, setLastDownloadedFile] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isPublicView, setIsPublicView] = useState(false);

    // Close login modal when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            setShowLoginModal(false);
        }
    }, [isAuthenticated]);

    // Check for public view or edit mode
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') === 'public') {
            setIsPublicView(true);
        }

        const editResumeName = params.get('edit');
        if (editResumeName && isAuthenticated) {
            loadResume(editResumeName);
        }
    }, [isAuthenticated]);

    const loadResume = async (slug: string) => {
        try {
            const response = await api.get(`/api/resumes/${slug}/`);
            if (response.ok) {
                const resume = await response.json();
                updateResume(resume.resume_data);
                setResumeMetadata({
                    id: resume.id,
                    slug: resume.slug,
                    name: resume.resume_name,
                    isPublic: resume.is_public
                });
            }
        } catch (error) {
            console.error("Failed to load resume:", error);
        }
    };

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

    if (!isLoaded) return <LoadingScreen message="Unlocking your professional potential..." />;

    if (isPublicView) {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] py-8 px-4 flex flex-col items-center">
                <div className="w-full max-w-4xl">
                    <div className="hidden md:block print:block">
                        <ResumePreview
                            data={data}
                            id="public-resume-view-desktop"
                            isEditable={false}
                            viewMode="desktop"
                        />
                    </div>
                    <div className="block md:hidden print:hidden w-full">
                        <ResumePreview
                            data={data}
                            id="public-resume-view-mobile"
                            isEditable={false}
                            viewMode="mobile"
                        />
                    </div>
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

        // Add dynamic @page margins based on user config to ensure every page has correct margins
        const marginMap = {
            compact: '30pt',
            narrow: '40pt',
            standard: '50pt',
            wide: '60pt',
            relaxed: '72pt'
        };
        const currentMargin = marginMap[data.config?.margins || 'standard'] || '50pt';

        const dynamicStyles = `
            <style>
                @page { margin: ${currentMargin} !important; size: A4; }
                body { background: white !important; }
                #resume-preview-content, #resume-preview-for-generation { 
                    padding: 0 !important;
                    margin: 0 !important;
                    width: 100% !important;
                    box-shadow: none !important;
                }
            </style>
        `.replace(/\s+/g, ' ').trim();

        return { html: dynamicStyles + html, css: resumeCss };
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
        await saveToBackend();
    };

    const handleSaveVersion = async () => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }
        await saveVersionToBackend();
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
        const standardSections = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'openSource', 'achievements'];

        let shouldCreateCustom = false;
        let sectionTitle = label || "New Section";

        if (standardSections.includes(type)) {
            // Check if it's already visible
            if (data.visibleSections[type as keyof typeof data.visibleSections]) {
                // Already visible? Treat as request for duplicate via custom section
                shouldCreateCustom = true;
            } else {
                // Enable the standard section
                const newVisible = { ...data.visibleSections, [type]: true };
                let newOrder = [...data.sectionOrder];
                if (!newOrder.includes(type)) {
                    newOrder.push(type);
                }

                updateResume({
                    ...data,
                    visibleSections: newVisible,
                    sectionOrder: newOrder
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
            const supportedTypes = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'openSource'];
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
        <div className="flex flex-col h-screen bg-[var(--bg-main)] selection:bg-purple-500/30">
            {/* Hidden instance for PDF generation scraping */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none opacity-0">
                <ResumePreview data={data} id="resume-preview-for-generation" />
            </div>

            {/* Premium Unified Navbar - Responsive */}
            <Navbar>
                {/* Editor specific actions */}
                <div className="flex bg-[var(--bg-input)] rounded-lg p-1 border border-[var(--border-color)] shrink-0 h-10" role="tablist" aria-label="Editor Views">
                    <button
                        onClick={() => setActiveTab('editor')}
                        className={`px-1.5 sm:px-4 flex items-center gap-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'editor' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                        <Edit size={14} /> <span className="hidden md:inline">Editor</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-1.5 sm:px-4 flex items-center gap-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                        <FileText size={14} /> <span className="hidden md:inline">Preview</span>
                    </button>
                </div>

                <div className="w-px h-6 bg-[var(--border-color)] hidden lg:block mx-1 shrink-0"></div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {/* Secondary Actions - Responsive Grouping */}
                    <div className="hidden lg:flex items-center gap-1.5">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center gap-2 px-3 py-2 text-xs bg-[var(--bg-input)] hover:bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl font-bold uppercase tracking-widest shadow-sm transition-all"
                            title="Import Resume"
                        >
                            <FileText size={16} />
                            <span className="text-[10px]">Import</span>
                        </button>

                        <button
                            onClick={handleSaveVersion}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-3 py-2 text-xs bg-[var(--bg-input)] hover:bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl font-bold uppercase tracking-widest shadow-sm disabled:opacity-50 transition-all"
                            title="Save as New Version"
                        >
                            <History size={16} />
                            <span className="text-[10px]">Version</span>
                        </button>

                        <button
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center gap-2 px-3 py-2 text-xs bg-[var(--bg-input)] hover:bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl font-bold uppercase tracking-widest shadow-sm transition-all"
                        >
                            <Globe size={16} />
                            <span className="text-[10px]">Share</span>
                        </button>
                    </div>

                    {/* Mobile "More" Menu for secondary actions */}
                    <div className="lg:hidden relative">
                        <button
                            onClick={() => setShowMoreActions(!showMoreActions)}
                            className="w-10 h-10 flex items-center justify-center bg-[var(--bg-input)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-card)] transition-all shadow-sm active:scale-95"
                            title="More Actions"
                        >
                            <ChevronDown size={18} className={`transition-transform duration-300 ${showMoreActions ? 'rotate-180 text-purple-500' : ''}`} />
                        </button>

                        {showMoreActions && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMoreActions(false)} />
                                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-2 flex flex-col gap-1">
                                        <a
                                            href="/why-resumevibe"
                                            className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-[var(--text-main)] hover:bg-[var(--bg-input)] rounded-xl transition-colors w-full text-left uppercase tracking-widest"
                                        >
                                            <Zap size={16} className="text-purple-500" />
                                            Why ResumeVibe?
                                        </a>
                                        <button
                                            onClick={() => {
                                                setShowMoreActions(false);
                                                setShowImportModal(true);
                                            }}
                                            className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-[var(--text-main)] hover:bg-[var(--bg-input)] rounded-xl transition-colors w-full text-left uppercase tracking-widest"
                                        >
                                            <FileText size={16} className="text-blue-500" />
                                            Import
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowMoreActions(false);
                                                handleSaveVersion();
                                            }}
                                            className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-[var(--text-main)] hover:bg-[var(--bg-input)] rounded-xl transition-colors w-full text-left uppercase tracking-widest"
                                        >
                                            <History size={16} className="text-orange-500" />
                                            Version
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowMoreActions(false);
                                                setShowShareModal(true);
                                            }}
                                            className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-[var(--text-main)] hover:bg-[var(--bg-input)] rounded-xl transition-colors w-full text-left uppercase tracking-widest"
                                        >
                                            <Globe size={16} className="text-emerald-500" />
                                            Share
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowMoreActions(false);
                                                resetToDefault();
                                            }}
                                            className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors w-full text-left uppercase tracking-widest"
                                        >
                                            <RotateCcw size={16} />
                                            Reset All
                                        </button>
                                        <div className="px-3 py-2.5 flex items-center justify-between border-t border-[var(--border-color)] mt-1">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">Theme</span>
                                            <ThemeToggle compact />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="w-px h-6 bg-[var(--border-color)] hidden md:block mx-1 shrink-0"></div>

                    {/* Primary Actions - Always Visible */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-10 h-10 md:w-auto md:px-3 md:py-2 flex items-center justify-center gap-2 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/20 rounded-xl font-bold uppercase tracking-widest shadow-sm disabled:opacity-50 transition-all active:scale-95"
                        title="Save Changes"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        <span className="hidden md:inline text-[10px]">{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>

                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="w-10 h-10 sm:w-auto sm:px-4 md:px-6 flex items-center justify-center gap-2 md:gap-3 text-[10px] md:text-xs bg-[var(--text-main)] hover:opacity-90 text-[var(--bg-main)] rounded-xl font-bold uppercase tracking-[0.1em] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl active:scale-95 transition-all"
                    >
                        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Download'}</span>
                    </button>
                </div>
            </Navbar>

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

                    {/* Mobile Top Toolbar (Unified for editing context) */}
                    {activeTab === 'editor' && (
                        <div className="md:hidden sticky top-0 left-0 right-0 z-[55] bg-[var(--bg-main)] border-b border-[var(--border-color)] px-3 py-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
                            <EditorToolbar onAddSection={() => setShowSectionTypeModal(true)} isMobile={true} />
                        </div>
                    )}
                    {activeTab === 'editor' && (
                        <div className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center bg-[var(--bg-main)] scroll-smooth pt-4 md:pt-24 pb-32">
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
                        resumeId={resumeMetadata?.slug || data.personalInfo.fullName.toLowerCase().replace(/\s+/g, '-')}
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
                                        }}
                                        onOpenOptimizer={() => {
                                            setShowAutoOptimize(true);
                                            setShowOptimizeModal(true);
                                            setShowRecruiterAI(false);
                                        }}
                                        onAuditResult={(result) => setGuidanceAuditResult(result)}
                                        isAuthenticated={isAuthenticated}
                                        onRequireAuth={() => window.dispatchEvent(new CustomEvent('show-login-modal'))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main >

            <LoginModal />
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
