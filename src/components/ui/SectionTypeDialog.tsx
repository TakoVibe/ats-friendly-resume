import { User, Briefcase, GraduationCap, Code, Award, Folder, FileText, Plus, Github } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: string, label?: string) => void;
    existingSections: { [key: string]: boolean };
}

export function SectionTypeDialog({
    isOpen,
    onClose,
    onSelect,
    existingSections
}: Props) {
    if (!isOpen) return null;

    const sections = [
        { id: 'summary', icon: User, label: 'Professional Summary', description: 'Brief overview of your career goals and achievements' },
        { id: 'experience', icon: Briefcase, label: 'Work Experience', description: 'Your detailed employment history' },
        { id: 'education', icon: GraduationCap, label: 'Education', description: 'Degrees, schools, and academic achievements' },
        { id: 'skills', icon: Code, label: 'Key Skills', description: 'Technical and soft skills relevant to the job' },
        { id: 'projects', icon: Folder, label: 'Projects', description: 'Key projects you have worked on' },
        { id: 'certifications', icon: Award, label: 'Certifications', description: 'Professional certifications and awards' },
        { id: 'openSource', icon: Github, label: 'Open Source', description: 'Your contributions to open source projects' },
        { id: 'achievements', icon: Award, label: 'Achievements', description: 'Highlight your notable career achievements' },
        { id: 'custom', icon: FileText, label: 'Custom Section', description: 'Create a section with your own title and content' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Dialog Panel */}
            <div className="relative bg-[var(--bg-card)] rounded-3xl shadow-[var(--shadow)] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-[var(--border-color)]">
                <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card)]/30 backdrop-blur-md">
                    <div>
                        <h3 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Add Section</h3>
                        <p className="text-sm font-medium text-[var(--text-muted)] mt-1 opacity-80">Enhance your professional story with new blocks</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-[var(--bg-input)] hover:bg-[var(--bg-input)]/80 rounded-2xl transition-all text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                        <Plus size={24} className="rotate-45" />
                    </button>
                </div>

                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {sections.map((section) => {
                            const Icon = section.icon;

                            return (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        onSelect(section.id, section.label);
                                        onClose();
                                    }}
                                    className="flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-300 group bg-[var(--bg-card)] border-[var(--border-color)] hover:border-[var(--accent)] hover:shadow-xl hover:shadow-[var(--accent)]/5 hover:translate-y-[-2px] cursor-pointer"
                                >
                                    <div className="p-4 rounded-xl bg-[var(--bg-input)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white group-hover:scale-110 transition-all duration-300">
                                        <Icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-[var(--text-main)] text-sm tracking-tight leading-none mb-1.5 transition-colors group-hover:text-[var(--accent)]">
                                            {section.label}
                                        </h4>
                                        <p className="text-[11px] font-medium text-[var(--text-muted)] leading-relaxed opacity-80">
                                            {section.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 bg-[var(--bg-main)] border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
                    Pro tip: You can rename custom sections after adding them.
                </div>
            </div>
        </div>
    );
}
