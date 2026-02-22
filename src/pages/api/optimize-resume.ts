import type { APIRoute } from 'astro';
import OpenAI from 'openai';
import { z } from 'zod';

// Zod schema matching ResumeSchema
const BulletItemSchema = z.union([
    z.string(),
    z.object({
        text: z.string(),
        hasBullet: z.boolean().optional()
    })
]);

const PersonalInfoSchema = z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    profiles: z.array(z.object({
        network: z.string(),
        username: z.string(),
        url: z.string()
    })),
    title: z.string().optional()
});

const ResumeSchemaZod = z.object({
    personalInfo: PersonalInfoSchema,
    summary: z.string(),
    skills: z.array(z.object({
        id: z.string(),
        name: z.string().default(''),
        items: z.array(z.string()).default([])
    })).default([]),
    experience: z.array(z.object({
        id: z.string(),
        company: z.string().default(''),
        role: z.string().default(''),
        duration: z.string().default(''),
        location: z.string().optional(),
        metrics: z.array(BulletItemSchema).default([]),
        techStack: z.array(z.string()).optional(),
        techStackLabel: z.string().optional()
    })).default([]),
    projects: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().default(''),
        techStack: z.array(z.string()).optional(),
        techStackLabel: z.string().optional(),
        link: z.string().optional(),
        date: z.string().optional(),
        metrics: z.array(BulletItemSchema).default([])
    })).default([]),
    openSource: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        link: z.string().optional(),
        metrics: z.array(BulletItemSchema).optional()
    })).optional(),
    education: z.array(z.object({
        id: z.string(),
        institution: z.string(),
        degree: z.string(),
        duration: z.string(),
        location: z.string(),
        score: z.string().optional(),
        details: z.array(BulletItemSchema).optional()
    })),
    achievements: z.array(BulletItemSchema),
    certifications: z.array(z.object({
        id: z.string(),
        name: z.string(),
        issuer: z.string(),
        date: z.string().optional()
    })),
    customSections: z.array(z.object({
        id: z.string(),
        title: z.string(),
        type: z.enum(['custom', 'summary', 'experience', 'projects', 'education', 'skills', 'certifications']).optional(),
        items: z.array(z.any())
    })).optional(),
    config: z.object({
        baseFontSize: z.number().optional(),
        accentColor: z.string().optional(),
        fontFamily: z.string().optional(),
        margins: z.enum(['compact', 'standard', 'relaxed']).optional(),
        lineHeight: z.number().optional()
    }).optional(),
    sectionOrder: z.array(z.string()),
    visibleSections: z.record(z.boolean()),
    sectionTitles: z.record(z.string()).optional(),
    sectionSeparators: z.record(z.boolean()).optional()
});

const SYSTEM_PROMPT = `You are a Senior Technical Recruiter and ATS (Applicant Tracking System) Optimization Expert.

Your task is to rewrite the user's resume to align perfectly with the target job description.

**CRITICAL RULES:**
1. **Preserve ALL IDs**: Never change any 'id' fields - they must remain exactly as provided
2. **Preserve Personal Info**: Keep all personal information (name, email, phone, location, profiles) exactly as provided
3. **Preserve Structure**: Maintain the same number of items in each section unless explicitly removing weak entries
4. **Formatting**: Use standard headings. No tables, columns, or complex graphics
5. **Keyword Integration**: Identify top 10 high-priority keywords from JD and naturally integrate them
6. **Action-Oriented**: Start every bullet point with strong action verbs (e.g., "Architected," "Optimized," "Spearheaded")
7. **Quantifiable Impact**: Use the Google "XYZ Formula": Accomplished [X] as measured by [Y], by doing [Z]
8. **Skill Re-categorization**: Group skills into relevant categories matching JD requirements
9. **Tech Stack Alignment**: Highlight technologies mentioned in the JD
10. **Professional Summary**: Rewrite to mirror the JD's key requirements and desired qualifications
11. **Date Formatting**: Use a strict 'MMM YYYY - MMM YYYY' format for all dates (e.g., 'Aug 2018 - Aug 2022' or 'Dec 2020 - Present'). Never use numeric months or full month names.
12. **Custom Sections**: Maintain the structure of custom sections. The 'items' array content varies by section type (e.g., 'summary' expects an array of one string, 'experience' expects an array of objects).
13. **Formatting (Strategic Bolding)**: Use <strong> tags to emphasize high-impact, "weighty" terms that prove your value. This includes:
    - Major quantifiable results (e.g., <strong>99.9% uptime</strong>, <strong>$2M savings</strong>, <strong>10x scale</strong>).
    - High-impact technologies or niche skills (e.g., <strong>Kubernetes</strong>, <strong>Rust</strong>, <strong>Distributed Systems</strong>).
    - Leadership or strategic actions (e.g., <strong>Architected</strong>, <strong>Spearheaded</strong>).
    - **Balance**: Limit bolding to 2-3 truly important instances per section or bullet point. Do not bold entire sentences.
    - Ensure tags are properly closed.

**OUTPUT REQUIREMENTS:**
- You MUST respond with ONLY a valid JSON object, no additional text or explanation
- Return a JSON object with this exact structure:
{
    "optimizedResume": { ... }, // COMPLETE ResumeSchema JSON object
    "issues": [ "List of critical alignment issues if the Job Description is drastically different from the user's actual skills/experience. Leave empty if reasonable match." ],
    "odds": {
        "selectionChance": 85,
        "rejectionReasoning": "Brief explanation of what factors might cause rejection despite optimization."
    }
}
- **OMIT UNMODIFIED SECTIONS**: To save tokens, DO NOT include sections (like 'education', 'certifications', 'personalInfo', or others) if you made no changes to them.
- Ensure all required fields are present in the sections you DO return.
- Maintain all existing IDs for items in returned sections.
- Keep the same sectionOrder and visibleSections unless optimization requires changes`;

export const POST: APIRoute = async ({ request }) => {
    try {
        const { resume, jobDescription, auditResult } = await request.json();

        if (!resume || !jobDescription) {
            return new Response(
                JSON.stringify({ error: 'Missing resume or job description' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Initialize OpenAI
        const apiKey = import.meta.env.OPENAI_API_KEY;
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'OpenAI API key not configured' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const openai = new OpenAI({ apiKey });

        // Preserve projects and education: Remove them from the resume sent to AI so they are not modified
        const { projects: originalProjects, education: originalEducation, ...resumeToOptimize } = resume;

        // Build context from Audit Result if available
        let auditContext = '';
        if (auditResult && auditResult.insights) {
            const gaps = auditResult.insights.filter((i: any) => i.type === 'gap').map((i: any) => `- ${i.text}`).join('\n');
            if (gaps) {
                auditContext = `\n\n**CRITICAL GAPS TO FIX (From Deep Audit):**\nThe following issues were identified in a deep diagnostic. YOU MUST ADDRESS THESE IN THE OPTIMIZATION:\n${gaps}`;
            }
        }

        // Create the user prompt
        const userPrompt = `** Job Description:**
    ${jobDescription}

** Current Resume(JSON):**
    ${JSON.stringify(resumeToOptimize, null, 2)}${auditContext}

Please optimize this resume for the job description above. Return the data adhering to the required JSON structure including any 'issues' if they exist.
If critical gaps are listed above, prioritize fixing them by adding relevant skills, rewriting bullets to demonstrate those competencies, or adjusting the summary.`;

        // Call OpenAI with structured output
        const completion = await openai.chat.completions.create({
            model: 'gpt-5-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0].message.content;
        if (!responseText) {
            return new Response(
                JSON.stringify({ error: 'No response from AI' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Parse and validate the JSON response
        let optimizedResume;
        let issues: string[] = [];
        let odds: any = null;
        try {
            const parsed = JSON.parse(responseText);
            const rawResume = parsed.optimizedResume || parsed; // Fallback to root if model ignores wrapper
            issues = Array.isArray(parsed.issues) ? parsed.issues : [];
            odds = parsed.odds || null;

            // Normalize summary if it's an array (AI quirk)
            if (Array.isArray(rawResume.summary)) {
                rawResume.summary = rawResume.summary.join('\n\n');
            }

            // Ensure returned sections exist as arrays if missing (AI fallibility)
            const requiredArrays = ['skills', 'experience', 'education', 'achievements', 'certifications'];
            requiredArrays.forEach(key => {
                if (rawResume[key] !== undefined && !Array.isArray(rawResume[key])) {
                    rawResume[key] = [rawResume[key]];
                }
            });

            // Re-attach the original projects and education, and any sections the AI omitted to save tokens
            const fullResume = { ...resumeToOptimize, ...rawResume, projects: originalProjects, education: originalEducation };
            optimizedResume = ResumeSchemaZod.parse(fullResume);
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            return new Response(
                JSON.stringify({
                    error: 'Invalid response format from AI',
                    details: parseError instanceof Error ? parseError.message : 'Unknown error'
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Return the optimized resume
        return new Response(
            JSON.stringify({
                success: true,
                optimizedResume,
                issues,
                odds,
                usage: completion.usage
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error optimizing resume:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to optimize resume',
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
