import { Bold, Italic, Link, List, Download, Type, LayoutTemplate, AlignJustify, MessageSquarePlus, Save, Sun, Moon, ChevronDown } from 'lucide-react';
import { useResume } from '../../hooks/useResume';
import { useState } from 'react';
import { PromptDialog } from './PromptDialog';
import { useTheme } from '../../context/ThemeContext';
import { CustomSelect } from './CustomSelect';

export function EditorToolbar({ onAddSection, isMobile = false }: { onAddSection: () => void; isMobile?: boolean }) {
    const { data, updateResume } = useResume();
    const { isDarkMode } = useTheme();
    const config = data.config || {};
    const [showLinkPrompt, setShowLinkPrompt] = useState(false);
    const [savedRange, setSavedRange] = useState<Range | null>(null);

    // Helper to generic config update
    const updateConfig = (key: keyof typeof config, val: any) => {
        updateResume({
            ...data,
            config: { ...config, [key]: val }
        });
    };

    // Text formatting commands
    const exec = (cmd: string, val?: string) => {
        document.execCommand(cmd, false, val);
    };

    const handleLink = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            setSavedRange(selection.getRangeAt(0));
        }
        setShowLinkPrompt(true);
    };

    const confirmLink = (url: string) => {
        // Restore selection
        if (savedRange) {
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(savedRange);
            }
        }

        if (url) exec('createLink', url);
        setShowLinkPrompt(false);
        setSavedRange(null);
    };

    const fontOptions = [
        { value: 'Inter', label: 'Sans (Inter)' },
        { value: 'Merriweather', label: 'Serif' },
        { value: 'Roboto Mono', label: 'Mono' },
        { value: 'Outfit', label: 'Premium (Outfit)' },
        { value: 'Plus Jakarta Sans', label: 'Jakarta' },
    ];

    const fontSizeOptions = [9, 10, 11, 12, 13, 14].map(s => ({ value: s, label: `${s}px` }));

    const marginOptions = [
        { value: 'compact', label: 'Compact' },
        { value: 'narrow', label: 'Narrow' },
        { value: 'standard', label: 'Standard' },
        { value: 'wide', label: 'Wide' },
        { value: 'relaxed', label: 'Relaxed' },
    ];



    const containerClasses = isMobile
        ? "w-full grid grid-cols-2 gap-3 p-1 bg-[var(--bg-main)] overflow-visible"
        : "absolute top-6 left-1/2 -translate-x-1/2 z-[55] w-fit max-w-[95%] sm:max-w-screen-md bg-[var(--glass-bg)] backdrop-blur-2xl border border-[var(--glass-border)] shadow-[var(--shadow)] rounded-2xl p-1.5 sm:px-4 sm:py-2 flex items-center justify-center gap-2 sm:gap-4 select-none animate-in fade-in slide-in-from-top-4 duration-500 sm:overflow-visible";

    return (
        <div className={containerClasses}>

            {/* Formatting Group */}
            <div className={`flex items-center gap-0.5 sm:gap-1.5 px-1 sm:px-2 py-1.5 sm:py-1 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)] ${isMobile ? 'justify-around' : 'shrink-0'}`}>
                <button
                    onMouseDown={(e) => { e.preventDefault(); exec('bold'); }}
                    className={`p-2 sm:p-2 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] rounded-lg flex justify-center ${isMobile ? 'flex-1' : ''}`}
                    title="Bold"
                >
                    <Bold size={16} className="sm:w-4 sm:h-4" />
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}
                    className={`p-2 sm:p-2 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] rounded-lg flex justify-center ${isMobile ? 'flex-1' : ''}`}
                    title="Italic"
                >
                    <Italic size={16} className="sm:w-4 sm:h-4" />
                </button>
                <div className="w-[1px] h-4 bg-[var(--border-color)] mx-0.5"></div>
                <button
                    onMouseDown={(e) => { e.preventDefault(); handleLink(); }}
                    className={`p-2 sm:p-2 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] rounded-lg flex justify-center ${isMobile ? 'flex-1' : ''}`}
                    title="Insert Link"
                >
                    <Link size={16} className="sm:w-4 sm:h-4" />
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }}
                    className={`p-2 sm:p-2 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] rounded-lg flex justify-center ${isMobile ? 'flex-1' : ''}`}
                    title="Bullet List"
                >
                    <List size={16} className="sm:w-4 sm:h-4" />
                </button>
            </div>

            {/* Actions Group */}
            <div className={`flex items-center gap-1.5 sm:gap-2 ${isMobile ? 'w-full' : 'shrink-0 pr-2 sm:pr-0'}`}>
                <button
                    className={`${isMobile ? 'flex-[3]' : 'px-4'} h-9 sm:h-10 flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20`}
                    onClick={onAddSection}
                >
                    <MessageSquarePlus size={16} />
                    <span>Add</span>
                </button>
            </div>

            {/* Typography Group */}
            <div className={`flex items-center gap-1 px-1.5 sm:px-2 py-1.5 sm:py-1 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)] ${isMobile ? 'w-full justify-between' : 'shrink-0'}`}>
                <CustomSelect
                    value={config.fontFamily || 'Inter'}
                    options={fontOptions}
                    onChange={(val) => updateConfig('fontFamily', val)}
                    icon={<Type size={14} />}
                    className={isMobile ? "flex-1 min-w-0" : "min-w-[120px]"}
                />

                <div className="w-[1px] h-4 bg-[var(--border-color)]"></div>

                <CustomSelect
                    value={config.baseFontSize || 10}
                    options={fontSizeOptions}
                    onChange={(val) => updateConfig('baseFontSize', val)}
                    className={isMobile ? "w-14" : "min-w-[60px]"}
                />
            </div>

            {/* Layout Group */}
            <div className={`flex items-center gap-1 px-1.5 sm:px-2 py-1.5 sm:py-1 bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)] ${isMobile ? 'w-full' : 'shrink-0'}`}>
                <CustomSelect
                    value={config.margins || 'standard'}
                    options={marginOptions}
                    onChange={(val) => updateConfig('margins', val)}
                    icon={<LayoutTemplate size={14} />}
                    className={isMobile ? "flex-1" : "min-w-[110px]"}
                />
            </div>

            <PromptDialog
                isOpen={showLinkPrompt}
                title="Add link"
                placeholder="https://..."
                onConfirm={confirmLink}
                onCancel={() => setShowLinkPrompt(false)}
            />
        </div>
    );
}
