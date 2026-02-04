import type { ResumeSchema, BulletItem } from '../../types/resume';

interface Props {
    data: ResumeSchema;
}

export function TextPreview({ data }: Props) {
    // Helper to extract text and strip markdown
    const stripMarkdown = (item: BulletItem) => {
        const text = typeof item === 'string' ? item : item.text;
        if (typeof text !== 'string') return '';
        return text.replace(/\*\*/g, '');
    };

    return (
        <div className="bg-white p-8 max-w-[210mm] mx-auto min-h-[297mm] shadow-lg font-mono text-sm whitespace-pre-wrap">
            <h2 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">ATS Parser Simulator (Plain Text View)</h2>

            {/* Header Info */}
            <div className="mb-6">
                {data.personalInfo.fullName.toUpperCase()}{'\n'}
                {data.personalInfo.title?.toUpperCase() || ''}{'\n'}
                {data.personalInfo.location} • {data.personalInfo.phone} • {data.personalInfo.email}{'\n'}
                {data.personalInfo.profiles?.map(p => p.url).join(' • ')}
            </div>

            {/* Summary */}
            <div className="mb-6">
                SUMMARY{'\n'}
                {data.summary}
            </div>

            {/* Skills */}
            <div className="mb-6">
                KEY SKILLS{'\n'}
                {Array.isArray(data.skills) ? data.skills.map(skillGroup => (
                    `${skillGroup.name}: ${skillGroup.items.join(', ')}\n`
                )).join('') : 'Skills data format mismatch'}
            </div>

            {/* Experience */}
            <div className="mb-6">
                PROFESSIONAL EXPERIENCE{'\n'}
                {data.experience.map(job => (
                    `
${job.role}
${job.company} | ${job.duration}
Technologies: ${job.techStack?.join(', ') || ''}
${job.metrics.map(m => `- ${stripMarkdown(m)}`).join('\n')}
`
                )).join('')}
            </div>

            {/* Open Source */}
            {data.openSource && data.openSource.length > 0 && (
                <div className="mb-6">
                    OPEN SOURCE CONTRIBUTIONS{'\n'}
                    {data.openSource.map(os => (
                        `- ${os.name}: ${os.description} (${os.link})`
                    )).join('\n')}
                </div>
            )}

            {/* Projects */}
            <div className="mb-6">
                KEY DEVELOPMENT PROJECTS{'\n'}
                {data.projects.map(p => (
                    `
${p.name}
${p.description}
Tech: ${p.techStack?.join(', ')}
${p.metrics?.map(m => `- ${stripMarkdown(m)}`).join('\n')}
`
                )).join('')}
            </div>

            {/* Education */}
            <div className="mb-6">
                EDUCATION{'\n'}
                {data.education.map(edu => (
                    `${edu.degree}
${edu.institution}, ${edu.location}
${edu.duration}
${edu.score ? `- ${edu.score}` : ''}`
                )).join('\n\n')}
            </div>

            {/* Achievements */}
            <div className="mb-6">
                ACHIEVEMENTS{'\n'}
                {data.achievements.map(a => `- ${stripMarkdown(a)}`).join('\n')}
            </div>

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
                <div className="mb-6">
                    CERTIFICATIONS{'\n'}
                    {data.certifications.map(c => `- ${c.name} (${c.issuer})`).join('\n')}
                </div>
            )}

        </div>
    );
}
