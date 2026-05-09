import { Bold, Italic, List, Type, LayoutTemplate, MessageSquarePlus, Keyboard } from 'lucide-react';
import { useResume } from '../../hooks/useResume';
import { useTheme } from '../../context/ThemeContext';
import { CustomSelect } from './CustomSelect';

export function EditorToolbar({ onAddSection, isMobile = false }: { onAddSection: () => void; isMobile?: boolean }) {
    const { data, updateResume } = useResume();
    const { isDarkMode } = useTheme();
    const config = data.config || {};

    const updateConfig = (key: keyof typeof config, val: any) => {
        updateResume({
            ...data,
            config: { ...config, [key]: val }
        });
    };

    const exec = (cmd: string, val?: string) => {
        document.execCommand(cmd, false, val);
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
        : "absolute top-6 left-1/2 -translate-x-1/2 z-[55] w-fit max-w-[95%] sm:max-w-screen-md bg-[var(--glass-bg-strong)] backdrop-blur-xl border border-[var(--glass-border)] rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 flex items-center justify-center gap-1.5 sm:gap-2.5 select-none animate-in fade-in slide-in-from-top-4 duration-500 sm:overflow-visible";

    const btnClass = "p-2 text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-main)] rounded-lg transition-colors";

    return (
        <div className={containerClasses} style={!isMobile ? { boxShadow: 'var(--shadow)' } : undefined}>

            {/* Formatting Group */}
            <div className={`flex items-center gap-0.5 px-1 py-1 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] ${isMobile ? 'justify-around' : 'shrink-0'}`}>
                <button
                    onMouseDown={(e) => { e.preventDefault(); exec('bold'); }}
                    className={`${btnClass} ${isMobile ? 'flex-1 flex justify-center' : ''}`}
                    title="Bold"
                >
                    <Bold size={15} />
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); exec('italic'); }}
                    className={`${btnClass} ${isMobile ? 'flex-1 flex justify-center' : ''}`}
                    title="Italic"
                >
                    <Italic size={15} />
                </button>
                <div className="w-px h-4 bg-[var(--border-color)] mx-0.5"></div>
                <div
                    className={`p-2 text-[var(--text-muted)] opacity-40 cursor-help ${isMobile ? 'flex-1 flex justify-center' : ''}`}
                    title="Press Ctrl+K to add link"
                >
                    <Keyboard size={15} />
                </div>
                <button
                    onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }}
                    className={`${btnClass} ${isMobile ? 'flex-1 flex justify-center' : ''}`}
                    title="Bullet List"
                >
                    <List size={15} />
                </button>
            </div>

            {/* Add Section */}
            <div className={`flex items-center ${isMobile ? 'w-full' : 'shrink-0'}`}>
                <button
                    className={`${isMobile ? 'flex-[3]' : 'px-4'} h-9 flex items-center justify-center gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors`}
                    style={{ boxShadow: '0 2px 8px var(--accent-glow)' }}
                    onClick={onAddSection}
                >
                    <MessageSquarePlus size={14} />
                    <span>Add</span>
                </button>
            </div>

            {/* Typography Group */}
            <div className={`flex items-center gap-1 px-1.5 py-1 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] ${isMobile ? 'w-full justify-between' : 'shrink-0'}`}>
                <CustomSelect
                    value={config.fontFamily || 'Inter'}
                    options={fontOptions}
                    onChange={(val) => updateConfig('fontFamily', val)}
                    icon={<Type size={13} />}
                    className={isMobile ? "flex-1 min-w-0" : "min-w-[120px]"}
                />
                <div className="w-px h-4 bg-[var(--border-color)]"></div>
                <CustomSelect
                    value={config.baseFontSize || 10}
                    options={fontSizeOptions}
                    onChange={(val) => updateConfig('baseFontSize', val)}
                    className={isMobile ? "w-14" : "min-w-[60px]"}
                />
            </div>

            {/* Layout Group */}
            <div className={`flex items-center gap-1 px-1.5 py-1 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] ${isMobile ? 'w-full' : 'shrink-0'}`}>
                <CustomSelect
                    value={config.margins || 'standard'}
                    options={marginOptions}
                    onChange={(val) => updateConfig('margins', val)}
                    icon={<LayoutTemplate size={13} />}
                    className={isMobile ? "flex-1" : "min-w-[110px]"}
                />
            </div>
        </div>
    );
}
