import { useState, useEffect } from 'react';
import { useResume } from '../hooks/useResume';
import { ResumePreview } from './ResumePreview';
import { Download, RotateCcw, FileText, Eye, Edit, Loader2, Sparkles, UserCheck, Zap } from 'lucide-react';
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

function ResumeBuilderContent() {
    const { data, updateResume, resetToDefault, isLoaded, undo, redo } = useResume();
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

    const [isPublicView, setIsPublicView] = useState(false);

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


                    <button
                        onClick={resetToDefault}
                        className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors hidden sm:block"
                        title="Reset to Default"
                    >
                        <RotateCcw size={18} />
                    </button>

                    <button
                        className="hidden md:hidden lg:hidden xl:hidden flex items-center gap-2 px-3 md:px-6 py-2 text-xs bg-[var(--bg-input)] text-[var(--text-muted)] rounded-xl font-bold uppercase tracking-[0.1em] border border-[var(--border-color)] opacity-60 cursor-not-allowed"
                        disabled
                    >
                        <Sparkles size={14} />
                        Upcoming
                    </button>

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
                        onClick={() => setActiveTab(activeTab === 'editor' ? 'preview' : 'editor')}
                        className={`p-2 rounded-lg transition-all ${activeTab === 'preview' ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-muted)]'}`}
                    >
                        {activeTab === 'editor' ? <Eye size={18} /> : <Edit size={18} />}
                    </button>
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
                    {activeTab === 'editor' && <div className="block md:hidden fixed bottom-4 right-4 z-50">
                        <button
                            onClick={() => setShowSectionTypeModal(true)}
                            className="w-12 h-12 bg-[var(--accent)] text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-all mb-14"
                        >
                            <div className="absolute inset-0 rounded-full animate-ping bg-[var(--accent)] opacity-20"></div>
                            <span className="text-2xl font-light mb-1">+</span>
                        </button>
                    </div>}

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
                        resumeId={data.personalInfo.fullName.toLowerCase().replace(/\s+/g, '-')}
                        fullName={data.personalInfo.fullName}
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

                {/* Right Sidebar - ATS Expert */}
                {activeTab === 'editor' && showRecruiterAI && (
                    <div className="hidden xl:block">
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
                        />
                    </div>
                )}
            </main >
        </div >
    );
}

export function ResumeBuilder() {
    return (
        <ThemeProvider>
            <ResumeProvider>
                <ResumeBuilderContent />
            </ResumeProvider>
        </ThemeProvider>
    );
}
