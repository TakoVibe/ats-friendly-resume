export interface ThemePreset {
    id: string;
    label: string;
    description: string;
    styles: {
        '--resume-bg'?: string;
        '--resume-text'?: string;
        '--resume-accent'?: string;
        '--resume-border'?: string;
        '--resume-card-bg'?: string;
        '--resume-card-border'?: string;
        '--resume-card-shadow'?: string;
        '--resume-glass-blur'?: string;
        '--resume-gradient'?: string;
        '--resume-section-spacing'?: string;
        '--resume-header-bg'?: string;
        '--resume-header-text'?: string;
    };
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
    standard: {
        id: 'standard',
        label: 'Standard',
        description: 'Clean, professional, and ATS-friendly.',
        styles: {
            '--resume-bg': '#ffffff',
            '--resume-text': '#1a1a1a',
            '--resume-accent': '#2563eb',
            '--resume-border': '#e5e7eb',
            '--resume-card-bg': 'transparent',
            '--resume-card-border': 'transparent',
            '--resume-card-shadow': 'none',
            '--resume-glass-blur': '0px',
            '--resume-section-spacing': '2rem',
        }
    }
};
