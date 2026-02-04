import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string | number;
    label: string;
}

interface Props {
    value: string | number;
    options: Option[];
    onChange: (value: any) => void;
    icon?: React.ReactNode;
    className?: string;
}

export function CustomSelect({ value, options, onChange, icon, className = "" }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(o => o.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 hover:bg-[var(--bg-card)] rounded-lg text-xs sm:text-[13px] font-bold text-[var(--text-main)] min-w-fit justify-between group"
            >
                <div className="flex items-center gap-1 sm:gap-1.5">
                    {icon && <span className="text-[var(--text-muted)] group-hover:text-[var(--accent)]">{icon}</span>}
                    <span className="truncate whitespace-nowrap">{selectedOption.label}</span>
                </div>
                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--text-muted)] ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 min-w-full w-max bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-[var(--shadow)] py-1.5 z-[100] backdrop-blur-xl">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-input)] flex items-center justify-between gap-4 ${option.value === value
                                ? 'text-[var(--accent)] font-bold bg-[var(--accent)]/5'
                                : 'text-[var(--text-main)] font-medium'
                                }`}
                        >
                            {option.label}
                            {option.value === value && (
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
