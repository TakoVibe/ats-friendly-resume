import { ArrowUp, ArrowDown, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import type { ResumeSchema } from '../../types/resume';

interface Props {
    data: ResumeSchema;
    setData: (data: ResumeSchema) => void;
}

const SECTION_LABELS: Record<string, string> = {
    summary: "Professional Summary",
    skills: "Key Skills",
    experience: "Experience",
    projects: "Projects",
    openSource: "Open Source",
    education: "Education",
    achievements: "Achievements",
    certifications: "Certifications"
};

export function SectionManager({ data, setData }: Props) {
    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...data.sectionOrder];
        if (direction === 'up' && index > 0) {
            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
        } else if (direction === 'down' && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        }
        setData({ ...data, sectionOrder: newOrder });
    };

    const toggleVisibility = (key: string) => {
        setData({
            ...data,
            visibleSections: {
                ...data.visibleSections,
                [key]: !data.visibleSections[key]
            }
        });
    };

    const addCustomSection = () => {
        const id = `custom-${Date.now()}`;
        const newSection = {
            id,
            title: "New Custom Section",
            items: []
        };
        const newCustomSections = [...(data.customSections || []), newSection];
        const newOrder = [...data.sectionOrder, id];
        const newVisible = { ...data.visibleSections, [id]: true };

        setData({
            ...data,
            customSections: newCustomSections,
            sectionOrder: newOrder,
            visibleSections: newVisible
        });
    };

    const deleteSection = (key: string) => {
        if (!key.startsWith('custom-')) return;
        if (!confirm('Are you sure you want to delete this section?')) return;

        const newOrder = data.sectionOrder.filter(k => k !== key);
        const newCustomSections = data.customSections?.filter(s => s.id !== key) || [];

        // Clean up visibleSections entry if defined (optional)
        const newVisible = { ...data.visibleSections };
        delete newVisible[key];

        setData({
            ...data,
            sectionOrder: newOrder,
            customSections: newCustomSections,
            visibleSections: newVisible
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Resume Sections</h2>

            {/* Font Size Control */}
            <div className="mb-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Base Font Size (pt)</label>
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min="8"
                        max="14"
                        step="0.5"
                        value={data.config?.baseFontSize || 10}
                        onChange={(e) => setData({
                            ...data,
                            config: { ...data.config, baseFontSize: parseFloat(e.target.value) }
                        })}
                        className="flex-1 accent-blue-600"
                    />
                    <span className="font-mono text-sm bg-white px-2 py-1 rounded border border-gray-200 min-w-[3rem] text-center">
                        {data.config?.baseFontSize || 10}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                {data.sectionOrder.map((key, index) => {
                    const isCustom = key.startsWith('custom-');
                    const label = isCustom
                        ? data.customSections?.find(s => s.id === key)?.title || "Custom Section"
                        : SECTION_LABELS[key] || key;

                    return (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100 group">
                            <span className="font-medium text-gray-700 truncate mr-2" title={label}>{label}</span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => toggleVisibility(key)}
                                    className={`p-1.5 rounded hover:bg-gray-200 ${!data.visibleSections[key] ? 'text-gray-400' : 'text-blue-600'}`}
                                    title={data.visibleSections[key] ? "Hide Section" : "Show Section"}
                                >
                                    {data.visibleSections[key] ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>

                                {isCustom && (
                                    <button
                                        onClick={() => deleteSection(key)}
                                        className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
                                        title="Delete Section"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}

                                <div className="h-4 w-px bg-gray-300 mx-1" />

                                <button
                                    onClick={() => moveSection(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600"
                                >
                                    <ArrowUp size={16} />
                                </button>
                                <button
                                    onClick={() => moveSection(index, 'down')}
                                    disabled={index === data.sectionOrder.length - 1}
                                    className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600"
                                >
                                    <ArrowDown size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={addCustomSection}
                className="mt-4 w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2 transition-colors font-medium"
            >
                <Plus size={18} /> Add Custom Section
            </button>
        </div>
    );
}
