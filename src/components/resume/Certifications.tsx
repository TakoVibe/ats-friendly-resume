import type { ResumeSchema } from '../../types/resume';
import { SectionTitle } from './SectionTitle';
import { EditableField } from '../ui/EditableField';
import { ItemControls } from '../ui/ItemControls';
import { Plus } from 'lucide-react';
import { InlineAIButton } from '../ui/InlineAIButton';

type CertificationItem = ResumeSchema['certifications'][0];

interface Props {
    certifications: CertificationItem[];
    isEditable?: boolean;
    onUpdate?: (certifications: CertificationItem[]) => void;
    title?: string;
    onTitleChange?: (newTitle: string) => void;
    showSeparator?: boolean;
    onToggleSeparator?: (show: boolean) => void;
    viewMode?: 'desktop' | 'mobile';
}

export function Certifications({ certifications, isEditable = false, onUpdate, title = "Certifications", onTitleChange, showSeparator, onToggleSeparator, viewMode = 'desktop' }: Props) {
    if (!certifications) return null;

    const updateCert = (id: string, field: keyof CertificationItem, value: any) => {
        if (!onUpdate) return;
        const newCerts = certifications.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        );
        onUpdate(newCerts);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (!onUpdate) return;
        const newCerts = [...certifications];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newCerts.length) return;
        [newCerts[index], newCerts[targetIndex]] = [newCerts[targetIndex], newCerts[index]];
        onUpdate(newCerts);
    };

    const deleteItem = (index: number) => {
        if (!onUpdate) return;
        const newCerts = certifications.filter((_, i) => i !== index);
        onUpdate(newCerts);
    };

    const duplicateItem = (index: number) => {
        if (!onUpdate) return;
        const itemToClone = certifications[index];
        const newItem = {
            ...itemToClone,
            id: Math.random().toString(36).substr(2, 9),
            name: `${itemToClone.name} (Copy)`
        };
        const newCerts = [...certifications];
        newCerts.splice(index + 1, 0, newItem);
        onUpdate(newCerts);
    };

    const addItem = () => {
        if (!onUpdate) return;
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Certification Name',
            issuer: 'Issuer',
            date: 'Year'
        };
        onUpdate([...certifications, newItem]);
    };

    return (
        <section className="resume-mb-8">
            <SectionTitle
                title={title}
                isEditable={isEditable}
                onChange={onTitleChange}
            />
            <ul className="resume-details-list">
                {certifications.map((cert, index) => (
                    <ItemControls
                        key={cert.id}
                        isFirst={index === 0}
                        isLast={index === certifications.length - 1}
                        onMoveUp={() => moveItem(index, 'up')}
                        onMoveDown={() => moveItem(index, 'down')}
                        onDelete={() => deleteItem(index)}
                        onDuplicate={() => duplicateItem(index)}
                        isEditable={isEditable}
                        forceMobileControls={viewMode === 'mobile'}
                    >
                        <li className="resume-list-item resume-text-justify group/item-content resume-relative">
                            <span className="resume-bullet">•</span>
                            <div className="resume-flex-1 resume-break-avoid">
                                <div className="resume-flex resume-justify-between resume-items-baseline">
                                    <div className="resume-font-bold resume-text-dark resume-flex resume-gap-1 group/cert-row relative items-baseline">
                                        <EditableField
                                            value={cert.name}
                                            onSave={(val) => updateCert(cert.id, 'name', val)}
                                            isEditable={isEditable}
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
                                        <span>-</span>
                                        <EditableField
                                            value={cert.issuer}
                                            onSave={(val) => updateCert(cert.id, 'issuer', val)}
                                            isEditable={isEditable}
                                            className="resume-font-normal resume-text-gray"
                                        />
                                    </div>
                                    <EditableField
                                        value={cert.date || ''}
                                        onSave={(val) => updateCert(cert.id, 'date', val)}
                                        isEditable={isEditable}
                                        className="resume-duration-gray"
                                        placeholder="Date"
                                    />
                                </div>
                            </div>
                        </li>
                    </ItemControls>
                ))}
            </ul>

            {isEditable && (
                <button
                    onClick={addItem}
                    aria-label="Add new certification"
                    className="mt-6 w-full py-3 bg-[var(--bg-input)] hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--accent)] border border-dashed border-[var(--border-color)] hover:border-[var(--accent)]/50 rounded-2xl flex items-center justify-center gap-2.5 font-bold uppercase tracking-widest text-[10px] group"
                >
                    <div className="p-1 bg-[var(--bg-card)] rounded-lg group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                        <Plus size={14} />
                    </div>
                    Add Certification
                </button>
            )}
        </section >
    );
}
