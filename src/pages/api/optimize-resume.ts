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
        name: z.string(),
        items: z.array(z.string())
    })),
    experience: z.array(z.object({
        id: z.string(),
        company: z.string(),
        role: z.string(),
        duration: z.string(),
        location: z.string().optional(),
        metrics: z.array(BulletItemSchema),
        techStack: z.array(z.string()).optional(),
        techStackLabel: z.string().optional()
    })),
    projects: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        techStack: z.array(z.string()).optional(),
        techStackLabel: z.string().optional(),
        link: z.string().optional(),
        date: z.string().optional(),
        metrics: z.array(BulletItemSchema).optional()
    })),
    openSource: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
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
11. **Custom Sections**: Maintain the structure of custom sections. The 'items' array content varies by section type (e.g., 'summary' expects an array of one string, 'experience' expects an array of objects).

**OUTPUT REQUIREMENTS:**
- You MUST respond with ONLY a valid JSON object, no additional text or explanation
- Return a complete, valid ResumeSchema JSON object
- Ensure all required fields are present
- Maintain all existing IDs
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

        // Preserve projects: Remove them from the resume sent to AI so they are not modified
        const { projects: originalProjects, ...resumeToOptimize } = resume;

        // Build context from Audit Result if available
        let auditContext = '';
        if (auditResult && auditResult.insights) {
            const gaps = auditResult.insights.filter((i: any) => i.type === 'gap').map((i: any) => `- ${i.text}`).join('\n');
            if (gaps) {
                auditContext = `\n\n**CRITICAL GAPS TO FIX (From Deep Audit):**\nThe following issues were identified in a deep diagnostic. YOU MUST ADDRESS THESE IN THE OPTIMIZATION:\n${gaps}`;
            }
        }

        // Create the user prompt
        const userPrompt = `**Job Description:**
${jobDescription}

**Current Resume (JSON):**
${JSON.stringify(resumeToOptimize, null, 2)}${auditContext}

Please optimize this resume for the job description above. Return a complete, optimized resume in the exact same JSON structure.
If critical gaps are listed above, prioritize fixing them by adding relevant skills, rewriting bullets to demonstrate those competencies, or adjusting the summary.`;

        // Call OpenAI with structured output
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
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
        try {
            const parsed = JSON.parse(responseText);

            // Normalize summary if it's an array (AI quirk)
            if (Array.isArray(parsed.summary)) {
                parsed.summary = parsed.summary.join('\n\n');
            }

            // Re-attach the original projects
            const fullResume = { ...parsed, projects: originalProjects };
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
