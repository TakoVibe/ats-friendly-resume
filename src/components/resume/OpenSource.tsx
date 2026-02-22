import type { ResumeSchema } from '../../types/resume';
import { SectionTitle } from './SectionTitle';
import { EditableField } from '../ui/EditableField';
import { ItemControls } from '../ui/ItemControls';
import { Plus, Github } from 'lucide-react';
import { ATSWarning } from '../ui/ATSWarning';

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

    const duplicateItem = (index: number) => {
        if (!onUpdate || !openSource) return;
        const itemToClone = openSource[index];
        const newItem = {
            ...itemToClone,
            id: Math.random().toString(36).substr(2, 9),
            name: `${itemToClone.name} (Copy)`
        };
        const newOS = [...openSource];
        newOS.splice(index + 1, 0, newItem);
        onUpdate(newOS);
    };

    const addItem = () => {
        if (!onUpdate) return;
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Project Name',
            description: 'Core contribution description (#123)...',
            link: '',
            date: '2024',
            metrics: []
        };
        onUpdate([...safeOpenSource, newItem]);
    };


    return (
        <section className="resume-section mb-12">
            <SectionTitle
                title={title}
                isEditable={isEditable}
                onChange={onTitleChange}
                showSeparator={showSeparator}
                onToggleSeparator={onToggleSeparator}
            />
            <ul className="resume-details-list">
                {safeOpenSource.map((item, index) => (
                    <ItemControls
                        key={item.id}
                        isFirst={index === 0}
                        isLast={index === safeOpenSource.length - 1}
                        onMoveUp={() => moveItem(index, 'up')}
                        onMoveDown={() => moveItem(index, 'down')}
                        onDelete={() => deleteItem(index)}
                        onDuplicate={() => duplicateItem(index)}
                        isEditable={isEditable}
                    >
                        <li className="resume-list-item resume-text-justify group/item-content resume-relative">
                            <span className="resume-bullet">•</span>
                            <div className="resume-flex-1 resume-flex resume-items-baseline">
                                <span className="resume-font-bold resume-text-dark">
                                    <EditableField
                                        tagName="span"
                                        value={item.name}
                                        onSave={(val) => updateItem(item.id, 'name', val)}
                                        isEditable={isEditable}
                                        placeholder="Project Name"
                                    />
                                </span>
                                <span className="opacity-70 text-[var(--resume-gray)] mx-1">:</span>
                                <span className="resume-text-dark">
                                    <EditableField
                                        tagName="span"
                                        value={item.description || ''}
                                        onSave={(val) => updateItem(item.id, 'description', val)}
                                        isEditable={isEditable}
                                        placeholder="Contribution description & references..."
                                        aiProps={{
                                            type: 'bullet',
                                            context: { projectName: item.name }
                                        }}
                                    />
                                </span>
                            </div>
                        </li>
                    </ItemControls>
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
