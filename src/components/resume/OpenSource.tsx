import type { ResumeSchema } from '../../types/resume';
import { SectionTitle } from './SectionTitle';
import { EditableField } from '../ui/EditableField';
import { ItemControls } from '../ui/ItemControls';
import { Plus } from 'lucide-react';

type OpenSourceItem = NonNullable<ResumeSchema['openSource']>[0];

interface Props {
    openSource?: OpenSourceItem[];
    isEditable?: boolean;
    onUpdate?: (items: OpenSourceItem[]) => void;
    title?: string;
    onTitleChange?: (newTitle: string) => void;
    showSeparator?: boolean;
    onToggleSeparator?: (show: boolean) => void;
    viewMode?: 'desktop' | 'mobile';
}

export function OpenSource({ openSource, isEditable = false, onUpdate, title = "Open Source Contributions", onTitleChange, showSeparator, onToggleSeparator, viewMode = 'desktop' }: Props) {
    if (!openSource && !isEditable) return null;
    const safeOpenSource = openSource || [];

    const updateItem = (id: string, field: keyof NonNullable<Props['openSource']>[0], value: any) => {
        if (!onUpdate) return;
        const newOS = safeOpenSource.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        onUpdate(newOS);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (!onUpdate) return;
        const newOS = [...safeOpenSource];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newOS.length) return;
        [newOS[index], newOS[targetIndex]] = [newOS[targetIndex], newOS[index]];
        onUpdate(newOS);
    };

    const deleteItem = (index: number) => {
        if (!onUpdate || !openSource) return;
        const newOS = openSource.filter((_, i) => i !== index);
        onUpdate(newOS);
    };

    const addItem = () => {
        if (!onUpdate) return;
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Project/Contribution Name',
            description: 'Description of your contribution...',
            link: 'Link'
        };
        onUpdate([...safeOpenSource, newItem]);
    };

    return (
        <section className="resume-section-mb-12">
            <SectionTitle
                title={title}
                isEditable={isEditable}
                onChange={onTitleChange}
                showSeparator={showSeparator}
                onToggleSeparator={onToggleSeparator}
            />
            <ul className="resume-details-list">
                {safeOpenSource.map((item, index) => (
                    <li key={item.id} className="resume-list-item resume-text-justify group/item-content resume-relative pr-8">
                        {/* hasBullet logic not present here, keeping simple dot for now or adding condition if needed */}
                        <span className="resume-bullet">•</span>
                        <div className="resume-flex-1">
                            <span className="resume-font-bold resume-text-dark">
                                <EditableField
                                    tagName="span"
                                    value={item.name}
                                    onSave={(val) => updateItem(item.id, 'name', val)}
                                    isEditable={isEditable}
                                />
                            </span>
                            <span>: </span>
                            <EditableField
                                tagName="span"
                                value={item.description}
                                onSave={(val) => updateItem(item.id, 'description', val)}
                                isEditable={isEditable}
                                controlsLayout="parent"
                                aiProps={{
                                    type: 'bullet',
                                    context: { jobDescription: title }
                                }}
                                actions={
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteItem(index); }}
                                        className="p-1 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        title="Delete item"
                                    >
                                        <span className="text-lg leading-none">×</span>
                                    </button>
                                }
                            />
                            {item.link && (
                                <span> (<EditableField
                                    tagName="span"
                                    value={item.link.replace(/^https?:\/\//, '')}
                                    onSave={(val) => updateItem(item.id, 'link', val)}
                                    isEditable={isEditable}
                                    className="resume-link-text"
                                />)</span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            {isEditable && (
                <button
                    onClick={addItem}
                    aria-label="Add new open source contribution"
                    className="mt-6 w-full py-3 bg-[var(--bg-input)] hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--accent)] border border-dashed border-[var(--border-color)] hover:border-[var(--accent)]/50 rounded-2xl flex items-center justify-center gap-2.5 font-bold uppercase tracking-widest text-[10px] group"
                >
                    <div className="p-1 bg-[var(--bg-card)] rounded-lg group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                        <Plus size={14} />
                    </div>
                    Add Contribution
                </button>
            )}
        </section>
    );
}
