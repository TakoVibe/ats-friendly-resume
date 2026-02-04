import { useState } from 'react';
import { Upload, FileText, Sparkles, X, Loader2, CheckCircle2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: any) => void;
}

export function ImportResumeModal({ isOpen, onClose, onImport }: Props) {
    const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text');
    const [textInput, setTextInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleTextImport = async () => {
        if (!textInput.trim()) {
            setError('Please paste your resume text');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const response = await fetch('/api/parse-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textInput })
            });

            if (!response.ok) throw new Error('Failed to parse resume');

            const parsedData = await response.json();
            setIsSuccess(true);
            setTimeout(() => {
                onImport(parsedData);
                onClose();
            }, 1500);
        } catch (err) {
            setError('Failed to parse resume. Please check your internet or try again.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('pdf', file);

            const response = await fetch('/api/parse-resume-pdf', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to parse PDF');

            const parsedData = await response.json();
            setIsSuccess(true);
            setTimeout(() => {
                onImport(parsedData);
                onClose();
            }, 1500);
        } catch (err) {
            setError('Failed to parse PDF. The file might be protected or malformed.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl shadow-[var(--shadow)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--border-color)] animate-in zoom-in-95 duration-300">

                {/* Success Overlay */}
                {isSuccess && (
                    <div className="absolute inset-0 z-50 bg-[var(--bg-card)]/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300 text-center px-8">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 transition-transform scale-110 border border-green-500/20">
                            <CheckCircle2 size={40} className="text-green-500" />
                        </div>
                        <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Import Successful!</h3>
                        <p className="text-[var(--text-muted)] mt-2 font-medium">Your resume is ready for editing.</p>
                    </div>
                )}

                {/* Header */}
                <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-gradient-to-br from-purple-500/10 via-transparent to-transparent">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-purple-600 rounded-lg shadow-lg shadow-purple-900/40">
                                <Sparkles className="text-white" size={20} />
                            </span>
                            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">
                                Magic Resume Import
                            </h2>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mt-2 font-medium">
                            Choose your preferred method - we'll handle the rest with precision.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-[var(--bg-input)] rounded-full transition-all active:scale-90"
                    >
                        <X size={20} className="text-[var(--text-muted)]" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-[var(--bg-input)] mx-8 mt-6 rounded-xl border border-[var(--border-color)]">
                    <button
                        onClick={() => setActiveTab('text')}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'text'
                            ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm border border-[var(--border-color)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]/50'
                            }`}
                    >
                        <FileText size={16} />
                        Paste Text
                    </button>
                    <button
                        onClick={() => setActiveTab('pdf')}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'pdf'
                            ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm border border-[var(--border-color)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]/50'
                            }`}
                    >
                        <Upload size={16} />
                        Upload PDF
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto">
                    {activeTab === 'text' ? (
                        <div className="space-y-4">
                            <div className="relative group">
                                <textarea
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Paste your entire resume here... (Experience, Education, Skills, etc.)"
                                    className="w-full h-72 px-5 py-4 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/40 outline-none transition-all resize-none font-sans text-base leading-relaxed text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50"
                                />
                                <div className="absolute bottom-4 right-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] bg-[var(--bg-card)]/40 backdrop-blur px-2.5 py-1 rounded-md border border-[var(--border-color)]">
                                    {textInput.length} chars
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 h-72">
                            <div className="relative h-full">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handlePdfUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={isProcessing}
                                />
                                <div className={`h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${isProcessing ? 'border-purple-500/40 bg-purple-500/5' : 'border-[var(--border-color)] hover:border-purple-500/40 hover:bg-[var(--bg-input)]'}`}>
                                    {isProcessing ? (
                                        <div className="flex flex-col items-center text-center">
                                            <div className="relative">
                                                <Loader2 size={48} className="text-purple-500 animate-spin" />
                                                <Sparkles size={20} className="absolute -top-1 -right-1 text-purple-400 animate-pulse" />
                                            </div>
                                            <p className="mt-6 text-[var(--text-main)] font-black text-xl tracking-tight">Parser is reading your PDF...</p>
                                            <p className="text-[var(--text-muted)] text-sm mt-1 animate-pulse tracking-wide font-medium">Extracting details and structuring data</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-5 bg-[var(--bg-input)] rounded-2xl mb-5 group-hover:scale-110 transition-transform">
                                                <Upload size={40} className="text-[var(--text-muted)]" />
                                            </div>
                                            <h4 className="text-lg font-black text-[var(--text-main)] tracking-tight">Drop your resume here</h4>
                                            <p className="text-[var(--text-muted)] text-sm mt-1 font-medium">or click to browse your files</p>
                                            <div className="mt-6 flex items-center gap-2 px-3 py-1 bg-[var(--bg-input)] rounded-full text-[10px] font-black uppercase tracking-tighter text-[var(--text-muted)]">
                                                <CheckCircle2 size={10} />
                                                PDF format only
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                            <div className="mt-0.5 p-1 bg-red-500/20 rounded-full">
                                <X size={14} className="text-red-400" />
                            </div>
                            <span className="text-sm font-bold text-red-400 leading-tight">{error}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-[var(--border-color)] bg-[var(--bg-main)] flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border-2 border-[var(--bg-card)] shadow-sm flex items-center justify-center text-[10px] text-white font-black"><Sparkles size={12} /></div>
                        </div>
                        <p className="text-xs font-medium text-[var(--text-muted)] leading-tight">
                            Powered by Smart Analysis<br />
                            <span className="text-[10px] text-[var(--text-muted)]/60 uppercase tracking-widest font-black">Accuracy rate ~98%</span>
                        </p>
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 py-3 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-input)] rounded-xl transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        {activeTab === 'text' && (
                            <button
                                onClick={handleTextImport}
                                disabled={isProcessing || !textInput.trim()}
                                className="flex-1 sm:flex-none px-8 py-3 text-sm font-black text-white bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all shadow-xl shadow-purple-900/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-95"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Magic Import
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
