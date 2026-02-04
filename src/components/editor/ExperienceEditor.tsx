import type { ResumeSchema } from '../../types/resume';
import { Plus, Trash2 } from 'lucide-react';
import { InlineEditor } from './InlineEditor';
import { InlineAIButton } from '../ui/InlineAIButton';

interface Props {
    experience: ResumeSchema['experience'];
    onChange: (experience: ResumeSchema['experience']) => void;
}

export function ExperienceEditor({ experience, onChange }: Props) {
    const addJob = () => {
        onChange([
            {
                id: crypto.randomUUID(),
                company: 'New Company',
                role: 'Role',
                duration: 'Present',
                metrics: ['Key achievement 1'],
                techStack: []
            },
            ...experience
        ]);
    };

    const removeJob = (id: string) => {
        onChange(experience.filter(job => job.id !== id));
    };

    const updateJob = (id: string, field: keyof ResumeSchema['experience'][0], value: any) => {
        onChange(experience.map(job =>
            job.id === id ? { ...job, [field]: value } : job
        ));
    };

    const updateMetric = (jobId: string, index: number, value: string) => {
        onChange(experience.map(job => {
            if (job.id !== jobId) return job;
            const newMetrics = [...job.metrics];
            newMetrics[index] = value;
            return { ...job, metrics: newMetrics };
        }));
    };

    const addMetric = (jobId: string) => {
        onChange(experience.map(job => {
            if (job.id !== jobId) return job;
            return { ...job, metrics: [...job.metrics, 'New Achievement'] };
        }));
    };

    const removeMetric = (jobId: string, index: number) => {
        onChange(experience.map(job => {
            if (job.id !== jobId) return job;
            return { ...job, metrics: job.metrics.filter((_, i) => i !== index) };
        }));
    };

    return (
        <section className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">Professional Experience</h3>
                <button onClick={addJob} className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                    <Plus size={14} /> Add Job
                </button>
            </div>

            <div className="space-y-6">
                {experience.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                        <div className="flex justify-between">
                            <div className="flex-1 grid grid-cols-2 gap-3 mr-4">
                                <input
                                    type="text"
                                    className="p-2 border rounded text-sm font-bold"
                                    value={job.company}
                                    onChange={(e) => updateJob(job.id, 'company', e.target.value)}
                                    placeholder="Company"
                                />
                                <input
                                    type="text"
                                    className="p-2 border rounded text-sm"
                                    value={job.duration}
                                    onChange={(e) => updateJob(job.id, 'duration', e.target.value)}
                                    placeholder="Duration"
                                />
                                <input
                                    type="text"
                                    className="p-2 border rounded text-sm w-full col-span-2"
                                    value={job.role}
                                    onChange={(e) => updateJob(job.id, 'role', e.target.value)}
                                    placeholder="Role"
                                />
                            </div>
                            <button onClick={() => removeJob(job.id)} className="text-red-500 hover:text-red-700 self-start p-1">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Metrics */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Achievements</label>
                            {job.metrics.map((metric, idx) => {
                                const metricText = typeof metric === 'string' ? metric : metric.text;

                                return (
                                    <div key={idx} className="group">
                                        <div className="flex gap-2 items-start">
                                            <div className="flex-1">
                                                <InlineEditor
                                                    content={metricText}
                                                    onChange={(val) => {
                                                        const original = job.metrics[idx];
                                                        if (typeof original === 'object') {
                                                            updateMetric(job.id, idx, { ...original, text: val } as any);
                                                        } else {
                                                            updateMetric(job.id, idx, val);
                                                        }
                                                    }}
                                                    className="min-h-[32px] text-sm border border-gray-300 rounded px-2 py-1 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
                                                />
                                            </div>
                                            <InlineAIButton
                                                text={metricText}
                                                type="bullet"
                                                context={{
                                                    role: job.role,
                                                    company: job.company,
                                                }}
                                                onAccept={(optimized) => updateMetric(job.id, idx, optimized)}
                                            />
                                            <button onClick={() => removeMetric(job.id, idx)} className="text-gray-400 hover:text-red-500 p-1">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            <button onClick={() => addMetric(job.id)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                <Plus size={12} /> Add Achievement
                            </button>
                        </div>

                        {/* Tech Stack */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Tech Stack (comma separated)</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded text-sm mt-1"
                                value={job.techStack?.join(', ') || ''}
                                onChange={(e) => updateJob(job.id, 'techStack', e.target.value.split(',').map(s => s.trim()))}
                                placeholder="e.g. React, Node.js"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
