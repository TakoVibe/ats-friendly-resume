import type { ResumeSchema } from '../../types/resume';
import { SectionTitle } from './SectionTitle';
import { EditableField } from '../ui/EditableField';
import { ItemControls } from '../ui/ItemControls';
import { Plus } from 'lucide-react';

type SkillGroup = ResumeSchema['skills'][0];

interface Props {
    skills: ResumeSchema['skills'];
    isEditable?: boolean;
    onUpdate?: (skills: ResumeSchema['skills']) => void;
    title?: string;
    onTitleChange?: (newTitle: string) => void;
    showSeparator?: boolean;
    onToggleSeparator?: (show: boolean) => void;
    viewMode?: 'desktop' | 'mobile';
    auditResult?: any;
}

export function Skills({ skills, isEditable = false, onUpdate, title = "Key Skills", onTitleChange, showSeparator, onToggleSeparator, viewMode = 'desktop', auditResult }: Props) {
    const skillsGap = auditResult?.insights?.find((i: any) =>
        i.type === 'gap' && (i.category?.toLowerCase().includes('skill') || i.category?.toLowerCase().includes('tech'))
    );
    const isMobile = viewMode === 'mobile';

    const updateSkillGroup = (id: string, field: keyof SkillGroup, value: any) => {
        // ... (same as before)
        if (!onUpdate) return;
        const newSkills = skills.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        );
        onUpdate(newSkills);
    };

    // ... (other handlers same as before)
    const addSkillGroup = () => {
        if (!onUpdate) return;
        const newGroup = {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Category Name',
            items: ['Skill 1', 'Skill 2']
        };
        onUpdate([...skills, newGroup]);
    };

    const deleteSkillGroup = (index: number) => {
        if (!onUpdate) return;
        const newSkills = skills.filter((_, i) => i !== index);
        onUpdate(newSkills);
    };

    const moveSkillGroup = (index: number, direction: 'up' | 'down') => {
        if (!onUpdate) return;
        const newSkills = [...skills];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newSkills.length) return;
        [newSkills[index], newSkills[targetIndex]] = [newSkills[targetIndex], newSkills[index]];
        onUpdate(newSkills);
    };

    return (
        <section className="resume-section-mb-12">
            <SectionTitle
                title={title}
                isEditable={isEditable}
                onChange={onTitleChange}
                showSeparator={showSeparator}
                onToggleSeparator={onToggleSeparator}
                gapText={skillsGap?.text}
            />
            <div className={`resume-skills-content ${isMobile ? 'flex flex-col gap-4' : ''}`}>
                {skills.map((skill, index) => (
                    <ItemControls
                        key={skill.id}
                        isFirst={index === 0}
                        isLast={index === skills.length - 1}
                        onMoveUp={() => moveSkillGroup(index, 'up')}
                        onMoveDown={() => moveSkillGroup(index, 'down')}
                        onDelete={() => deleteSkillGroup(index)}
                        isEditable={isEditable}
                    >
                        <div className={`resume-skill-group resume-break-avoid ${isMobile ? 'flex flex-col gap-2' : ''}`}>
                            <span className={`resume-skill-label ${isMobile ? 'text-[var(--text-main)] font-bold text-sm mb-1 uppercase tracking-wide' : ''}`}>
                                <EditableField
                                    value={skill.name}
                                    onSave={(val) => updateSkillGroup(skill.id, 'name', val)}
                                    isEditable={isEditable}
                                    tagName="span"
                                />
                                {!isMobile && ': '}
                            </span>

                            {isMobile ? (
                                <div className="flex flex-wrap gap-2">
                                    {skill.items.map((item, i) => (
                                        <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md bg-[var(--bg-input)] text-[var(--text-main)] text-sm border border-[var(--border-color)]">
                                            {isEditable ? (
                                                <input
                                                    className="bg-transparent border-none outline-none w-full min-w-[20px]"
                                                    value={item}
                                                    onChange={(e) => {
                                                        const newItems = [...skill.items];
                                                        newItems[i] = e.target.value;
                                                        updateSkillGroup(skill.id, 'items', newItems);
                                                    }}
                                                />
                                            ) : item}
                                        </span>
                                    ))}
                                    {isEditable && (
                                        <button
                                            onClick={() => updateSkillGroup(skill.id, 'items', [...skill.items, 'New Skill'])}
                                            className="inline-flex items-center px-2 py-1 rounded-md bg-[var(--accent)] text-white text-xs font-bold shadow-sm"
                                        >
                                            +
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <EditableField
                                    value={skill.items.join(', ')}
                                    onSave={(val) => updateSkillGroup(skill.id, 'items', val.split(',').map(s => s.trim()).filter(Boolean))}
                                    isEditable={isEditable}
                                />
                            )}
                        </div>
                    </ItemControls>
                ))}
            </div>

            {isEditable && (
                <button
                    onClick={addSkillGroup}
                    aria-label="Add new skill category"
                    className="mt-6 w-full py-3 bg-[var(--bg-input)] hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--accent)] border border-dashed border-[var(--border-color)] hover:border-[var(--accent)]/50 rounded-2xl flex items-center justify-center gap-2.5 font-bold uppercase tracking-widest text-[10px] group"
                >
                    <div className="p-1 bg-[var(--bg-card)] rounded-lg group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                        <Plus size={14} />
                    </div>
                    Add Skill Category
                </button>
            )}
        </section>
    );
}
