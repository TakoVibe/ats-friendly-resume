import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
    value: string; // "MM/YYYY - MM/YYYY", "MM/YYYY - Present", or "MM/YYYY"
    onSave: (value: string) => void;
    className?: string;
    isEditable?: boolean;
    mode?: 'range' | 'single';
}

export function DatePicker({ value, onSave, className = '', isEditable = true, mode = 'range' }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const parseMonthYear = (str: string) => {
        if (!str || str === 'Present') return { month: '01', year: '2024' };

        // Handle MM/YYYY
        if (str.includes('/')) {
            const [m, y] = str.split('/');
            const cleanM = (m || '').trim().replace(/[^0-9]/g, '').slice(0, 2);
            const cleanY = (y || '').trim().replace(/[^0-9]/g, '').slice(0, 4);
            return { month: cleanM, year: cleanY };
        }

        // Handle MMM YYYY or any other space-separated format
        const parts = str.trim().split(/\s+/);
        if (parts.length >= 2) {
            const mStr = parts[0];
            const yStr = parts[parts.length - 1]; // Use last part as year

            const monthMap: Record<string, string> = {
                'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
                'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
            };
            const m = monthMap[mStr.toLowerCase().substring(0, 3)] || mStr.replace(/[^0-9]/g, '').slice(0, 2);
            const y = yStr.replace(/[^0-9]/g, '').slice(0, 4);
            return { month: m, year: y };
        }

        return { month: '01', year: '2024' };
    };

    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const years = Array.from({ length: 40 }, (_, i) => (new Date().getFullYear() + 2 - i).toString());

    // State initialized from props
    const [startMonth, setStartMonth] = useState('01');
    const [startYear, setStartYear] = useState('2024');
    const [endMonth, setEndMonth] = useState('01');
    const [endYear, setEndYear] = useState('2024');
    const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);

    // Sync state when menu opens
    useEffect(() => {
        if (isOpen) {
            const parts = value.split(' - ').map(p => p.trim());
            const startVal = parseMonthYear(parts[0] || '');
            const endVal = parseMonthYear(parts[1] || parts[0] || '');

            setStartMonth(months.includes(startVal.month.padStart(2, '0')) ? startVal.month.padStart(2, '0') : '01');
            setStartYear(years.includes(startVal.year) ? startVal.year : '2024');

            if (mode === 'range') {
                setIsCurrentlyWorking(parts[1] === 'Present');
                setEndMonth(months.includes(endVal.month.padStart(2, '0')) ? endVal.month.padStart(2, '0') : '01');
                setEndYear(years.includes(endVal.year) ? endVal.year : '2024');
            }
        }
    }, [isOpen, value, mode]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                const target = e.target as HTMLElement;
                if (!target.closest('[data-datepicker-popover="true"]')) {
                    setIsOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen || !containerRef.current) return;

        const updatePosition = () => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const popoverWidth = 288;
            const gutter = 12;
            const left = Math.min(
                Math.max(rect.left + rect.width / 2 - popoverWidth / 2, gutter),
                window.innerWidth - popoverWidth - gutter
            );
            const top = Math.min(rect.bottom + 8, window.innerHeight - 420);

            setPopoverPosition({
                top: Math.max(gutter, top),
                left
            });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen]);

    const handleApply = () => {
        const startVal = `${startMonth}/${startYear}`;
        if (mode === 'single') {
            onSave(startVal);
        } else {
            const endVal = isCurrentlyWorking ? 'Present' : `${endMonth}/${endYear}`;
            onSave(`${startVal} - ${endVal}`);
        }
        setIsOpen(false);
    };

    if (!isEditable) {
        if (!value) return null;
        return <span className={`${className} whitespace-nowrap`}>{value}</span>;
    }

    const popover = (
        <div
            data-datepicker-popover="true"
            className="fixed p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-[300] w-72 animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ top: popoverPosition.top, left: popoverPosition.left }}
        >
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">
                    {mode === 'single' ? 'Select Date' : 'Work Duration'}
                </h4>
                <button onClick={() => setIsOpen(false)} className="text-[var(--text-muted)] hover:text-red-500">
                    <X size={14} />
                </button>
            </div>

            <div className="space-y-4">
                {/* Start Date / Single Date */}
                <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                        {mode === 'single' ? 'Date' : 'Start Date'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={startMonth}
                            onChange={(e) => setStartMonth(e.target.value)}
                            className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs p-2 outline-none focus:border-[var(--accent)]"
                        >
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select
                            value={startYear}
                            onChange={(e) => setStartYear(e.target.value)}
                            className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs p-2 outline-none focus:border-[var(--accent)]"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* End Date - Only for range mode */}
                {mode === 'range' && (
                    <div className={isCurrentlyWorking ? 'opacity-50' : ''}>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] block">End Date</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isCurrentlyWorking}
                                    onChange={(e) => setIsCurrentlyWorking(e.target.checked)}
                                    className="w-3 h-3 rounded bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--accent)] focus:ring-0"
                                />
                                <span className="text-[9px] font-bold uppercase text-[var(--accent)]">Present</span>
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                disabled={isCurrentlyWorking}
                                value={endMonth}
                                onChange={(e) => setEndMonth(e.target.value)}
                                className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs p-2 outline-none focus:border-[var(--accent)] disabled:opacity-50"
                            >
                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <select
                                disabled={isCurrentlyWorking}
                                value={endYear}
                                onChange={(e) => setEndYear(e.target.value)}
                                className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs p-2 outline-none focus:border-[var(--accent)] disabled:opacity-50"
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            onSave('');
                            setIsOpen(false);
                        }}
                        className="px-4 py-3 bg-[var(--bg-input)] hover:bg-red-50 text-[var(--text-muted)] hover:text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                        Clear
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 py-3 bg-[var(--accent)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20"
                    >
                        Apply Filter
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative inline-block group/datepicker whitespace-nowrap" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`${className} cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 px-1 rounded transition-colors flex items-center gap-2 inline-flex group-hover/datepicker:text-[var(--accent)]`}
            >
                {value || (mode === 'single' ? 'Select Date' : 'Select Dates')}
                <Calendar size={12} className="opacity-0 group-hover/datepicker:opacity-100 transition-opacity flex-shrink-0" />
            </div>

            {isOpen && typeof document !== 'undefined' && createPortal(popover, document.body)}
        </div>
    );
}
