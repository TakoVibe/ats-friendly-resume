import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: import.meta.env.OPENAI_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
    try {
        const { text, context, type } = await request.json();

        if (!import.meta.env.OPENAI_API_KEY) {
            return new Response(
                JSON.stringify({ error: 'OpenAI API key not configured' }),
                { status: 500 }
            );
        }

        if (!text || !type) {
            return new Response(
                JSON.stringify({ error: 'Text and type are required' }),
                { status: 400 }
            );
        }

        // Build context-aware prompt based on type
        let systemPrompt = '';
        let userPrompt = '';

        switch (type) {
            case 'bullet':
                systemPrompt = `You are an expert resume writer specializing in achievement-oriented bullet points. 
Your task is to rewrite resume bullet points to be more impactful, quantifiable, and ATS-friendly.

RULES:
1. Start with strong action verbs (Led, Developed, Implemented, Achieved, etc.)
2. Include metrics and quantifiable results when possible
3. Keep it concise (1-2 lines maximum)
4. Use professional language
5. Focus on impact and results
6. Make it ATS-friendly with relevant keywords
7. Maintain similar length and detail level unless the original is very short
8. Use <strong> tags to highlight key metrics and numbers (e.g. <strong>20% revenue growth</strong>)
9. Return ONLY the optimized text, no explanations`;

                userPrompt = `Original bullet point: "${text}"

${context?.jobDescription ? `Job context: ${context.jobDescription.substring(0, 200)}...` : ''}
${context?.role ? `Role: ${context.role}` : ''}
${context?.company ? `Company: ${context.company}` : ''}

Rewrite this bullet point to be more impactful. Return only the improved text.`;
                break;

            case 'summary':
                systemPrompt = `You are an expert resume writer specializing in professional summaries.
Your task is to rewrite professional summaries to be compelling, keyword-rich, and tailored to the target role.

RULES:
1. Keep it 2-3 sentences
2. Highlight key strengths and expertise
3. Include relevant keywords
4. Be specific about years of experience and specializations
5. Make it ATS-friendly
6. Verify you have not removed any hard metrics (numbers, years, percentages)
7. Use <strong> tags to highlight key metrics, numbers, and hard results (e.g. <strong>30% increase</strong>)
8. Return ONLY the optimized text, no explanations`;

                userPrompt = `Original summary: "${text}"

${context?.jobDescription ? `Target role: ${context.jobDescription.substring(0, 200)}...` : ''}

Rewrite this professional summary. Return only the improved text.`;
                break;

            case 'role':
                systemPrompt = `You are an expert at crafting impactful job titles for resumes.
Your task is to rewrite job titles to be more professional and industry-standard.

RULES:
1. Use standard industry terminology
2. Be specific but not overly verbose
3. Avoid jargon or internal company titles
4. Make it ATS-friendly
5. Return ONLY the optimized title, no explanations`;

                userPrompt = `Original role: "${text}"

${context?.company ? `Company: ${context.company}` : ''}

Rewrite this role title. Return only the improved title.`;
                break;

            case 'linkedin-paragraph':
                systemPrompt = `You are an expert LinkedIn profile optimizer. 
Your task is to condense a user's professional experience into a SINGLE, high-impact paragraph (50-80 words).

RULES:
1. Write in the first person ("I am...", "I have...") or high-impact professional third person.
2. Focus on the core value proposition and major achievements.
3. No bullet points. Just one solid, compelling paragraph.
4. Remove all HTML tags.
5. Make it "social media" friendly yet professional.
6. Return ONLY the paragraph, no preamble or quotes.`;

                userPrompt = `Original data to condense: "${text}"

Rewrite this into a single high-impact LinkedIn paragraph.`;
                break;

            case 'description':
                systemPrompt = `You are an expert resume writer specializing in project descriptions.
Your task is to rewrite project descriptions to be clear, impactful, and highlight technical skills.

RULES:
1. Keep it 1-2 sentences
2. Highlight the purpose and impact
3. Mention key technologies used
4. Be specific about outcomes
5. Make it ATS-friendly
6. Return ONLY the optimized text, no explanations`;

                userPrompt = `Original description: "${text}"

${context?.projectName ? `Project: ${context.projectName}` : ''}
${context?.techStack ? `Tech stack: ${context.techStack.join(', ')}` : ''}

Rewrite this project description. Return only the improved text.`;
                break;

            default:
                return new Response(
                    JSON.stringify({ error: 'Invalid type' }),
                    { status: 400 }
                );
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-5-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            // max_tokens: 1000,
        });

        const optimizedText = completion.choices[0]?.message?.content?.trim();

        if (!optimizedText) {
            throw new Error('No response from AI');
        }

        return new Response(
            JSON.stringify({
                success: true,
                original: text,
                optimized: optimizedText,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Inline optimization error:', error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Failed to optimize text',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
