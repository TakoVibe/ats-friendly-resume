import type { ResumeSchema } from '../../types/resume';
import { SectionTitle } from './SectionTitle';
import { EditableField } from '../ui/EditableField';
import { ItemControls } from '../ui/ItemControls';
import { Plus, List, ListMinus } from 'lucide-react';

type EducationItem = ResumeSchema['education'][0];

interface Props {
    education: EducationItem[];
    isEditable?: boolean;
    onUpdate?: (education: EducationItem[]) => void;
    title?: string;
    onTitleChange?: (newTitle: string) => void;
    showSeparator?: boolean;
    onToggleSeparator?: (show: boolean) => void;
    viewMode?: 'desktop' | 'mobile';
}

export function Education({ education, isEditable = false, onUpdate, title = "Education", onTitleChange, showSeparator, onToggleSeparator, viewMode = 'desktop' }: Props) {
    const updateEdu = (id: string, field: keyof Props['education'][0], value: any) => {
        if (!onUpdate) return;
        const newEdu = education.map(e =>
            e.id === id ? { ...e, [field]: value } : e
        );
        onUpdate(newEdu);
    };

    const updateDetail = (eduId: string, detailIndex: number, value: string) => {
        if (!onUpdate) return;
        const newEdu = education.map(e => {
            if (e.id !== eduId) return e;
            const newDetails = [...(e.details || [])];
            const current = newDetails[detailIndex];
            if (typeof current === 'object' && current !== null) {
                newDetails[detailIndex] = { ...current, text: value };
            } else {
                newDetails[detailIndex] = value;
            }
            return { ...e, details: newDetails };
        });
        onUpdate(newEdu);
    };

    const toggleBullet = (eduId: string, detailIndex: number) => {
        if (!onUpdate) return;
        const newEdu = education.map(e => {
            if (e.id !== eduId) return e;
            const newDetails = [...(e.details || [])];
            const current = newDetails[detailIndex];

            if (typeof current === 'string') {
                newDetails[detailIndex] = { text: current, hasBullet: false };
            } else {
                newDetails[detailIndex] = { ...current, hasBullet: !(current.hasBullet !== false) };
            }
            return { ...e, details: newDetails };
        });
        onUpdate(newEdu);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (!onUpdate) return;
        const newEdu = [...education];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newEdu.length) return;
        [newEdu[index], newEdu[targetIndex]] = [newEdu[targetIndex], newEdu[index]];
        onUpdate(newEdu);
    };

    const deleteItem = (index: number) => {
        if (!onUpdate) return;
        const newEdu = education.filter((_, i) => i !== index);
        onUpdate(newEdu);
    };

    const duplicateItem = (index: number) => {
        if (!onUpdate) return;
        const itemToClone = education[index];
        const newItem = {
            ...itemToClone,
            id: Math.random().toString(36).substr(2, 9),
            institution: `${itemToClone.institution} (Copy)`
        };
        const newEdu = [...education];
        newEdu.splice(index + 1, 0, newItem);
        onUpdate(newEdu);
    };

    const addItem = () => {
        if (!onUpdate) return;
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            institution: 'Institution Name',
            degree: 'Degree',
            duration: 'Year - Year',
            location: 'Location',
            details: []
        };
        onUpdate([...education, newItem]);
    };

    const addDetail = (eduId: string) => {
        if (!onUpdate) return;
        const newEdu = education.map(e => {
            if (e.id !== eduId) return e;
            return { ...e, details: [...(e.details || []), 'New detail...'] };
        });
        onUpdate(newEdu);
    };

    const deleteDetail = (eduId: string, detailIndex: number) => {
        if (!onUpdate) return;
        const newEdu = education.map(e => {
            if (e.id !== eduId) return e;
            return { ...e, details: e.details?.filter((_, i) => i !== detailIndex) };
        });
        onUpdate(newEdu);
    };

    return (
        <section className="resume-section">
            <SectionTitle
                title={title}
                isEditable={isEditable}
                onChange={onTitleChange}
            />
            <div className="resume-space-y-4">
                {education.map((edu, index) => (
                    <ItemControls
                        key={edu.id}
                        isFirst={index === 0}
                        isLast={index === education.length - 1}
                        onMoveUp={() => moveItem(index, 'up')}
                        onMoveDown={() => moveItem(index, 'down')}
                        onDelete={() => deleteItem(index)}
                        onDuplicate={() => duplicateItem(index)}
                        isEditable={isEditable}
                        forceMobileControls={viewMode === 'mobile'}
                    >
                        <div className="resume-relative group/item-content">
                            <div className="resume-flex resume-justify-between resume-items-baseline resume-mb-1">
                                <EditableField
                                    tagName="h3"
                                    value={edu.institution}
                                    onSave={(val) => updateEdu(edu.id, 'institution', val)}
                                    isEditable={isEditable}
                                    className="resume-role"
                                />
                                <div className="resume-text-right">
                                    {(edu.location?.trim() || isEditable) && (
                                        <EditableField
                                            value={edu.location || ''}
                                            onSave={(val) => updateEdu(edu.id, 'location', val)}
                                            isEditable={isEditable}
                                            className="resume-location-text"
                                        />
                                    )}
                                    {(edu.duration?.trim() || isEditable) && (
                                        <EditableField
                                            value={edu.duration}
                                            onSave={(val) => updateEdu(edu.id, 'duration', val)}
                                            isEditable={isEditable}
                                            className="resume-duration-gray"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="resume-flex resume-justify-between resume-items-baseline">
                                <EditableField
                                    value={edu.degree}
                                    onSave={(val) => updateEdu(edu.id, 'degree', val)}
                                    isEditable={isEditable}
                                    className="resume-degree"
                                />
                                {((edu.score) || isEditable) && (
                                    <EditableField
                                        value={edu.score || ''}
                                        placeholder="Score/GPA"
                                        onSave={(val) => updateEdu(edu.id, 'score', val)}
                                        isEditable={isEditable}
                                        className="resume-score"
                                    />
                                )}
                            </div>

                            {(edu.details || isEditable) && (
                                <ul className="resume-details-list">
                                    {edu.details
                                        ?.filter(detail => isEditable || (typeof detail === 'string' ? detail : detail.text)?.trim())
                                        .map((detail, idx) => {
                                            const detailText = typeof detail === 'string' ? detail : detail.text;
                                            const hasBullet = typeof detail === 'string' ? true : (detail.hasBullet !== false);

                                            return (
                                                <li key={idx} className={`resume-list-item group/metric resume-relative ${hasBullet ? '' : 'resume-pl-1'}`}>
                                                    {hasBullet && <span className="resume-bullet">•</span>}
                                                    <div className="resume-flex-1">
                                                        <EditableField
                                                            tagName="span"
                                                            mode="html"
                                                            value={detailText}
                                                            onSave={(val) => updateDetail(edu.id, idx, val)}
                                                            isEditable={isEditable}
                                                            aiProps={{
                                                                type: 'bullet',
                                                                context: {
                                                                    role: edu.degree,
                                                                    company: edu.institution
                                                                }
                                                            }}
                                                            actions={
                                                                <>
                                                                    <button
                                                                        onClick={() => toggleBullet(edu.id, idx)}
                                                                        className="p-1 text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                                                        title={hasBullet ? "Hide Bullet" : "Show Bullet"}
                                                                    >
                                                                        {hasBullet ? <ListMinus size={14} /> : <List size={14} />}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteDetail(edu.id, idx)}
                                                                        className="p-1 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                                        title="Delete point"
                                                                    >
                                                                        <span className="text-lg leading-none">×</span>
                                                                    </button>
                                                                </>
                                                            }
                                                        />
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    {isEditable && (
                                        <li className="flex justify-center mt-1 opacity-0 group-hover/item-content:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => addDetail(edu.id)}
                                                className="text-[9pt] text-[#2563eb] hover:underline flex items-center gap-1"
                                            >
                                                <Plus size={12} /> Add Point
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </ItemControls>
                ))}
            </div>

            {isEditable && (
                <button
                    onClick={addItem}
                    aria-label="Add new education entry"
                    className="mt-6 w-full py-3 bg-[var(--bg-input)] hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--accent)] border border-dashed border-[var(--border-color)] hover:border-[var(--accent)]/50 rounded-2xl flex items-center justify-center gap-2.5 font-bold uppercase tracking-widest text-[10px] group"
                >
                    <div className="p-1 bg-[var(--bg-card)] rounded-lg group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                        <Plus size={14} />
                    </div>
                    Add Education
                </button>
            )}
        </section>
    );
}
