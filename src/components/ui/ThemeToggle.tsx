import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
    compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className={`${compact ? 'p-1.5' : 'p-2 md:p-2.5'} bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border-color)] text-[var(--text-main)] rounded-full hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-all shadow-[var(--shadow)] active:scale-95 shrink-0`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {isDarkMode ? <Sun size={compact ? 12 : 14} /> : <Moon size={compact ? 12 : 14} />}
        </button>
    );
}
