import type { ResumeSchema } from '../../types/resume';
import { Plus, Trash2 } from 'lucide-react';
import { InlineEditor } from './InlineEditor';

interface Props {
    items: ResumeSchema['openSource'];
    onChange: (items: ResumeSchema['openSource']) => void;
}

export function OpenSourceEditor({ items, onChange }: Props) {
    const addItem = () => {
        onChange([
            {
                id: crypto.randomUUID(),
                name: 'Project Name',
                description: 'Contribution description...',
                link: ''
            },
            ...(items || [])
        ]);
    };

    const removeItem = (id: string) => {
        onChange((items || []).filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof NonNullable<ResumeSchema['openSource']>[0], value: string) => {
        onChange((items || []).map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    return (
        <section className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">Open Source</h3>
                <button onClick={addItem} className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                    <Plus size={14} /> Add
                </button>
            </div>

            <div className="space-y-4">
                {(items || []).map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                        <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        className="p-2 border rounded text-sm font-bold"
                                        value={item.name}
                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                        placeholder="Project Name"
                                    />
                                    <input
                                        type="text"
                                        className="p-2 border rounded text-sm"
                                        value={item.link || ''}
                                        onChange={(e) => updateItem(item.id, 'link', e.target.value)}
                                        placeholder="Link (Optional)"
                                    />
                                </div>
                                <div className="w-full">
                                    <InlineEditor
                                        content={item.description}
                                        onChange={(val) => updateItem(item.id, 'description', val)}
                                        className="min-h-[40px] text-sm border border-gray-300 rounded px-2 py-1 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
                                        placeholder="Description of contribution"
                                    />
                                </div>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-1">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
