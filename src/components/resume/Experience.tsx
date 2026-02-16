import type { ResumeSchema } from '../../types/resume';
import { SectionTitle } from './SectionTitle';
import { EditableField } from '../ui/EditableField';
import { ItemControls } from '../ui/ItemControls';
import { Plus, List, ListMinus, Sparkles, X } from 'lucide-react';
import { InlineAIButton } from '../ui/InlineAIButton';

type ExperienceItem = ResumeSchema['experience'][0];

interface Props {
    experience: ExperienceItem[];
    isEditable?: boolean;
    onUpdate?: (experience: ExperienceItem[]) => void;
    title?: string;
    onTitleChange?: (newTitle: string) => void;
    showSeparator?: boolean;
    onToggleSeparator?: (show: boolean) => void;
    viewMode?: 'desktop' | 'mobile';
    auditResult?: any;
}

export function Experience({ experience, isEditable = false, onUpdate, title = "Work Experience", onTitleChange, showSeparator, onToggleSeparator, viewMode = 'desktop', auditResult }: Props) {
    const experienceGap = auditResult?.insights?.find((i: any) =>
        i.type === 'gap' && (i.category?.toLowerCase().includes('experience') || i.category?.toLowerCase().includes('impact') || i.category?.toLowerCase().includes('quant'))
    );
    const isMobile = viewMode === 'mobile';

    const updateJob = (id: string, field: keyof ExperienceItem, value: any) => {
        if (!onUpdate) return;
        const newExp = experience.map(job =>
            job.id === id ? { ...job, [field]: value } : job
        );
        onUpdate(newExp);
    };

    const updateMetric = (jobId: string, metricIndex: number, value: string) => {
        if (!onUpdate) return;
        const newExp = experience.map(job => {
            if (job.id !== jobId) return job;
            const newMetrics = [...(job.metrics || [])];
            const current = newMetrics[metricIndex];

            // Preserve object structure if it exists
            if (typeof current === 'object' && current !== null) {
                newMetrics[metricIndex] = { ...current, text: value };
            } else {
                newMetrics[metricIndex] = value;
            }
            return { ...job, metrics: newMetrics };
        });
        onUpdate(newExp);
    };

    const toggleBullet = (jobId: string, metricIndex: number) => {
        if (!onUpdate) return;
        const newExp = experience.map(job => {
            if (job.id !== jobId) return job;
            const newMetrics = [...(job.metrics || [])];
            const current = newMetrics[metricIndex];

            if (typeof current === 'string') {
                // Convert to object, toggle to false
                newMetrics[metricIndex] = { text: current, hasBullet: false };
            } else {
                // Toggle boolean
                newMetrics[metricIndex] = { ...current, hasBullet: !(current.hasBullet !== false) };
            }
            return { ...job, metrics: newMetrics };
        });
        onUpdate(newExp);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (!onUpdate) return;
        const newExp = [...experience];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newExp.length) return;
        [newExp[index], newExp[targetIndex]] = [newExp[targetIndex], newExp[index]];
        onUpdate(newExp);
    };

    const deleteItem = (index: number) => {
        if (!onUpdate) return;
        const newExp = experience.filter((_, i) => i !== index);
        onUpdate(newExp);
    };

    const duplicateItem = (index: number) => {
        if (!onUpdate) return;
        const itemToClone = experience[index];
        const newItem = {
            ...itemToClone,
            id: Math.random().toString(36).substr(2, 9),
            role: `${itemToClone.role} (Copy)`
        };
        const newExp = [...experience];
        newExp.splice(index + 1, 0, newItem);
        onUpdate(newExp);
    };

    const addItem = () => {
        if (!onUpdate) return;
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            company: 'Company Name',
            role: 'Job Title',
            duration: 'Aug 2018 - Present',
            // Default to string for new items (bullet)
            metrics: ['Key achievement or responsibility...'],
            techStack: ['Skill 1', 'Skill 2']
        };
        onUpdate([...experience, newItem]);
    };

    // Metric operations
    const addMetric = (jobId: string) => {
        if (!onUpdate) return;
        const newExp = experience.map(job => {
            if (job.id !== jobId) return job;
            // Default new metric to string (bullet)
            return { ...job, metrics: [...(job.metrics || []), 'New achievement...'] };
        });
        onUpdate(newExp);
    };

    const deleteMetric = (jobId: string, metricIndex: number) => {
        if (!onUpdate) return;
        const newExp = experience.map(job => {
            if (job.id !== jobId) return job;
            return { ...job, metrics: (job.metrics || []).filter((_, i) => i !== metricIndex) };
        });
        onUpdate(newExp);
    };

    return (
        <section className="resume-section">
            <SectionTitle
                title={title}
                isEditable={isEditable}
                onChange={onTitleChange}
                gapText={experienceGap?.text}
            />

            <div className="resume-space-y-6">
                {experience.map((job, index) => (
                    <ItemControls
                        key={job.id}
                        isFirst={index === 0}
                        isLast={index === experience.length - 1}
                        onMoveUp={() => moveItem(index, 'up')}
                        onMoveDown={() => moveItem(index, 'down')}
                        onDelete={() => deleteItem(index)}
                        onDuplicate={() => duplicateItem(index)}
                        isEditable={isEditable}
                        forceMobileControls={viewMode === 'mobile'}
                    >
                        <div className="resume-relative group/item-content">
                            {/* Role & Date */}
                            <div className={`resume-flex resume-items-baseline resume-mb-1 ${isMobile ? 'resume-flex-col resume-items-start resume-gap-0.5' : 'resume-justify-between'}`}>
                                <EditableField
                                    tagName="h3"
                                    value={job.role}
                                    onSave={(val) => updateJob(job.id, 'role', val)}
                                    isEditable={isEditable}
                                    className="resume-role"
                                />
                                <EditableField
                                    value={job.duration}
                                    onSave={(val) => updateJob(job.id, 'duration', val)}
                                    isEditable={isEditable}
                                    className={`resume-duration-gray ${isMobile ? 'resume-mt-0.5' : ''}`}
                                />
                            </div>

                            {/* Company & Location */}
                            <div className={`resume-flex resume-items-baseline resume-mb-1 ${isMobile ? 'resume-flex-col resume-items-start resume-gap-0.5' : 'resume-justify-between'}`}>
                                {job.company && (
                                    <EditableField
                                        tagName="h4"
                                        value={job.company}
                                        onSave={(val) => updateJob(job.id, 'company', val)}
                                        isEditable={isEditable}
                                        className="resume-company"
                                        placeholder="Company Name"
                                    />
                                )}
                                {job.location && (
                                    <EditableField
                                        value={job.location || ''}
                                        onSave={(val) => updateJob(job.id, 'location', val)}
                                        isEditable={isEditable}
                                        className={`resume-location-text ${isMobile ? 'resume-mt-0.5' : ''}`}
                                        placeholder="Location"
                                    />
                                )}
                            </div>

                            {/* Tech Stack */}
                            {(job.techStack && job.techStack.length > 0) && (
                                <div className={`resume-tech-stack ${isMobile ? 'flex flex-wrap gap-1.5 mt-2 mb-2' : ''}`}>
                                    {!isMobile && (
                                        <span className="resume-font-bold resume-text-dark resume-mr-1">
                                            <EditableField
                                                value={job.techStackLabel !== undefined ? job.techStackLabel : 'Technologies Used:'}
                                                onSave={(val) => updateJob(job.id, 'techStackLabel', val)}
                                                isEditable={isEditable}
                                                tagName="span"
                                                placeholder="Label"
                                            />
                                        </span>
                                    )}

                                    {isMobile ? (
                                        <>
                                            {(job.techStack || []).map((tech, i) => (
                                                <span key={i} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--bg-input,rgba(128,128,128,0.05))] text-[var(--text-main)] text-[11px] font-medium border border-[var(--border-color)] group/tag">
                                                    {isEditable ? (
                                                        <div className="flex items-center gap-1">
                                                            <EditableField
                                                                value={tech}
                                                                onSave={(val) => {
                                                                    const newStack = [...(job.techStack || [])];
                                                                    newStack[i] = val;
                                                                    updateJob(job.id, 'techStack', newStack);
                                                                }}
                                                                isEditable={true}
                                                                tagName="span"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const techStack = job.techStack || [];
                                                                    const newStack = techStack.filter((_, idx) => idx !== i);
                                                                    updateJob(job.id, 'techStack', newStack);
                                                                }}
                                                                className="hover:text-red-500 transition-colors opacity-40 hover:opacity-100"
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </div>
                                                    ) : tech}
                                                </span>
                                            ))}
                                            {isEditable && (
                                                <button
                                                    onClick={() => updateJob(job.id, 'techStack', [...(job.techStack || []), 'New'])}
                                                    className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 hover:bg-[var(--accent)] hover:text-white transition-all active:scale-90"
                                                    title="Add technology"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <EditableField
                                            value={job.techStack.join(', ')}
                                            onSave={(val) => updateJob(job.id, 'techStack', val.split(',').map(s => s.trim()).filter(Boolean))}
                                            isEditable={isEditable}
                                        />
                                    )}
                                </div>
                            )}

                            <ul className="resume-details-list">
                                {job.metrics
                                    .filter(metric => isEditable || (typeof metric === 'string' ? metric : metric.text)?.trim())
                                    .map((metric, idx) => {
                                        const metricText = typeof metric === 'string' ? metric : metric.text;
                                        const hasBullet = typeof metric === 'string' ? true : (metric.hasBullet !== false);

                                        return (
                                            <li key={idx} className={`resume-list-item resume-text-justify group/metric resume-relative ${hasBullet ? '' : 'resume-mb-1'}`}>
                                                {hasBullet && <span className="resume-bullet">•</span>}
                                                <div className="resume-flex-1">
                                                    <EditableField
                                                        tagName="span"
                                                        mode="html"
                                                        value={metricText}
                                                        onSave={(val) => updateMetric(job.id, idx, val)}
                                                        isEditable={isEditable}
                                                        controlsLayout="parent"
                                                        aiProps={{
                                                            type: 'bullet',
                                                            context: {
                                                                role: job.role,
                                                                company: job.company
                                                            }
                                                        }}
                                                        actions={
                                                            <>
                                                                <button
                                                                    onClick={() => toggleBullet(job.id, idx)}
                                                                    className="p-1 text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                                                    title={hasBullet ? "Hide Bullet" : "Show Bullet"}
                                                                >
                                                                    {hasBullet ? <ListMinus size={14} /> : <List size={14} />}
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteMetric(job.id, idx)}
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
                                            onClick={() => addMetric(job.id)}
                                            className="text-[9pt] text-[var(--accent)] hover:underline flex items-center gap-1"
                                        >
                                            <Plus size={12} /> Add Point
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </ItemControls>
                ))}
            </div>

            {isEditable && (
                <button
                    onClick={addItem}
                    aria-label="Add new work experience position"
                    className="mt-6 w-full py-3 bg-[var(--bg-input)] hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--accent)] border border-dashed border-[var(--border-color)] hover:border-[var(--accent)]/50 rounded-2xl flex items-center justify-center gap-2.5 font-bold uppercase tracking-widest text-[10px] group"
                >
                    <div className="p-1 bg-[var(--bg-card)] rounded-lg group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                        <Plus size={14} />
                    </div>
                    Add Position
                </button>
            )}
        </section>
    );
}
