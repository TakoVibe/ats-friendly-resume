import { useState } from 'react';
import type { ResumeSchema } from '../../types/resume';
import { ExperienceEditor } from './ExperienceEditor';
import { InlineEditor } from './InlineEditor';
import { SkillsEditor } from './SkillsEditor';
import { ProjectsEditor } from './ProjectsEditor';
import { OpenSourceEditor } from './OpenSourceEditor';
import { EducationEditor } from './EducationEditor';
import { AchievementsEditor } from './AchievementsEditor';
import { CertificationsEditor } from './CertificationsEditor';
import { InlineAIButton } from '../ui/InlineAIButton';

interface Props {
    data: ResumeSchema;
    onChange: (data: ResumeSchema) => void;
}

export function Editor({ data, onChange }: Props) {
    const [mode, setMode] = useState<'form' | 'json'>('form');
    const [jsonError, setJsonError] = useState<string | null>(null);

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        try {
            const parsed = JSON.parse(e.target.value);
            onChange(parsed);
            setJsonError(null);
        } catch (err) {
            setJsonError((err as Error).message);
        }
    };

    const updatePersonalInfo = (field: keyof ResumeSchema['personalInfo'], value: string) => {
        onChange({
            ...data,
            personalInfo: {
                ...data.personalInfo,
                [field]: value
            }
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-bold">Editor</h2>
                <div className="bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('form')}
                        className={`px-3 py-1 text-sm rounded-md ${mode === 'form' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
                    >
                        Form
                    </button>
                    <button
                        onClick={() => setMode('json')}
                        className={`px-3 py-1 text-sm rounded-md ${mode === 'json' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
                    >
                        JSON
                    </button>
                </div>
            </div>

            {mode === 'json' ? (
                <div className="space-y-2">
                    <textarea
                        className="w-full h-[600px] font-mono text-sm p-4 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                        defaultValue={JSON.stringify(data, null, 2)}
                        onChange={handleJsonChange}
                    />
                    {jsonError && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
                            Error: {jsonError}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Personal Info Section */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">Personal Info</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={data.personalInfo.fullName}
                                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={data.personalInfo.title || ''}
                                    onChange={(e) => updatePersonalInfo('title', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={data.personalInfo.email}
                                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={data.personalInfo.phone}
                                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={data.personalInfo.location}
                                        onChange={(e) => updatePersonalInfo('location', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Socials - Now handled via Modal */}
                            <div className="md:col-span-1">
                                <p className="text-sm text-gray-500 italic mt-2">
                                    Manage social links and contacts by clicking "Edit Contact Info" on the resume header.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Summary */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">Summary</h3>
                        <div className="w-full group">
                            <div className="flex gap-2 items-start">
                                <div className="flex-1">
                                    <InlineEditor
                                        content={data.summary}
                                        onChange={(val) => onChange({ ...data, summary: val })}
                                        className="min-h-[128px] text-sm border border-gray-300 rounded px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent leading-relaxed"
                                        placeholder="Professional summary..."
                                    />
                                </div>
                                <InlineAIButton
                                    text={data.summary}
                                    type="summary"
                                    onAccept={(optimized) => onChange({ ...data, summary: optimized })}
                                />
                            </div>
                        </div>
                    </section>

                    <SkillsEditor
                        skills={data.skills}
                        onChange={(skills) => onChange({ ...data, skills })}
                    />

                    <ExperienceEditor
                        experience={data.experience}
                        onChange={(experience) => onChange({ ...data, experience })}
                    />

                    <ProjectsEditor
                        projects={data.projects}
                        onChange={(projects) => onChange({ ...data, projects })}
                    />

                    <OpenSourceEditor
                        items={data.openSource}
                        onChange={(items) => onChange({ ...data, openSource: items })}
                    />

                    <EducationEditor
                        education={data.education}
                        onChange={(education) => onChange({ ...data, education })}
                    />

                    <AchievementsEditor
                        achievements={data.achievements}
                        onChange={(achievements) => onChange({ ...data, achievements })}
                    />

                    <CertificationsEditor
                        certifications={data.certifications}
                        onChange={(certifications) => onChange({ ...data, certifications })}
                    />
                </div>
            )}
        </div>
    );
}
