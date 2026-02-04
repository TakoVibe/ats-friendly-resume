import type { ResumeSchema } from '../../types/resume';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
    certifications: ResumeSchema['certifications'];
    onChange: (items: ResumeSchema['certifications']) => void;
}

export function CertificationsEditor({ certifications, onChange }: Props) {
    const addItem = () => {
        onChange([
            {
                id: crypto.randomUUID(),
                name: 'Certification Name',
                issuer: 'Issuer',
                date: ''
            },
            ...(certifications || [])
        ]);
    };

    const removeItem = (id: string) => {
        onChange((certifications || []).filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof NonNullable<ResumeSchema['certifications']>[0], value: string) => {
        onChange((certifications || []).map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    return (
        <section className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">Certifications</h3>
                <button onClick={addItem} className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                    <Plus size={14} /> Add
                </button>
            </div>

            <div className="space-y-3">
                {(certifications || []).map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg bg-gray-50 flex justify-between gap-3">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                className="p-2 border rounded text-sm font-bold col-span-2"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                placeholder="Certification Name"
                            />
                            <input
                                type="text"
                                className="p-2 border rounded text-sm"
                                value={item.issuer}
                                onChange={(e) => updateItem(item.id, 'issuer', e.target.value)}
                                placeholder="Issuer"
                            />
                            <input
                                type="text"
                                className="p-2 border rounded text-sm"
                                value={item.date || ''}
                                onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                                placeholder="Date (Optional)"
                            />
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-1 self-center">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
