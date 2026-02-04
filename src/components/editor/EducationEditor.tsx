import type { ResumeSchema } from '../../types/resume';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
    education: ResumeSchema['education'];
    onChange: (education: ResumeSchema['education']) => void;
}

export function EducationEditor({ education, onChange }: Props) {
    const addItem = () => {
        onChange([
            {
                id: crypto.randomUUID(),
                institution: 'University',
                degree: 'Degree',
                duration: 'Year',
                location: '',
                score: ''
            },
            ...education
        ]);
    };

    const removeItem = (id: string) => {
        onChange(education.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof ResumeSchema['education'][0], value: string) => {
        onChange(education.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    return (
        <section className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">Education</h3>
                <button onClick={addItem} className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                    <Plus size={14} /> Add
                </button>
            </div>

            <div className="space-y-4">
                {education.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                        <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    className="p-2 border rounded text-sm font-bold"
                                    value={item.institution}
                                    onChange={(e) => updateItem(item.id, 'institution', e.target.value)}
                                    placeholder="Institution"
                                />
                                <input
                                    type="text"
                                    className="p-2 border rounded text-sm"
                                    value={item.location || ''}
                                    onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                                    placeholder="Location"
                                />
                                <input
                                    type="text"
                                    className="p-2 border rounded text-sm col-span-2"
                                    value={item.degree}
                                    onChange={(e) => updateItem(item.id, 'degree', e.target.value)}
                                    placeholder="Degree / Major"
                                />
                                <input
                                    type="text"
                                    className="p-2 border rounded text-sm"
                                    value={item.duration}
                                    onChange={(e) => updateItem(item.id, 'duration', e.target.value)}
                                    placeholder="Duration (e.g. 2018-2022)"
                                />
                                <input
                                    type="text"
                                    className="p-2 border rounded text-sm"
                                    value={item.score || ''}
                                    onChange={(e) => updateItem(item.id, 'score', e.target.value)}
                                    placeholder="Score / CGPA"
                                />
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
