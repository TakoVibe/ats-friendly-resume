import type { ResumeSchema } from '../../types/resume';

interface Props {
    skills: ResumeSchema['skills'];
    onChange: (skills: ResumeSchema['skills']) => void;
}

export function SkillsEditor({ skills, onChange }: Props) {
    const updateSkill = (id: string, value: string) => {
        onChange(skills.map(skill =>
            skill.id === id ? { ...skill, items: value.split(',').map(s => s.trim()).filter(Boolean) } : skill
        ));
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-[var(--accent)] rounded-full"></div>
                <h3 className="text-lg font-black text-[var(--text-main)] tracking-tight">Technical Expertise</h3>
            </div>
            <div className="grid grid-cols-1 gap-6">
                {skills.map((skill) => (
                    <div key={skill.id} className="space-y-2">
                        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                            {skill.name === "AI & Data Engineering" ? "Intelligent Systems & Data" : skill.name}
                        </label>
                        <input
                            type="text"
                            className="w-full p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-sm focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)]/40 outline-none transition-all text-[var(--text-main)] placeholder:text-[var(--text-muted)]/30"
                            value={skill.items.join(', ')}
                            onChange={(e) => updateSkill(skill.id, e.target.value)}
                            placeholder="Comma separated values"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
