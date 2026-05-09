import type { APIRoute } from 'astro';
import OpenAI from 'openai';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { resume, jobDescription } = await request.json();

        if (!import.meta.env.OPENAI_API_KEY) {
            return new Response(
                JSON.stringify({ error: 'OpenAI API key not configured' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!resume || !jobDescription) {
            return new Response(
                JSON.stringify({ error: 'Resume and Job Description are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const openai = new OpenAI({
            apiKey: import.meta.env.OPENAI_API_KEY,
        });

        // Only send the parts of the resume we want the AI to base the cover letter on
        const targetedResumeElements = {
            personalInfo: resume.personalInfo,
            summary: resume.summary,
            skills: resume.skills,
            experience: resume.experience
        };

        const systemPrompt = `You are an expert career coach and professional writer.
Your task is to write a compelling, tailored cover letter based on the candidate's resume and the target job description.

RULES:
1. Write in a professional, confident, and engaging tone.
2. The letter should be exactly 3 paragraphs:
   - Paragraph 1: Enthusiastic introduction, stating the target role and a high-level summary of why the candidate is a perfect fit.
   - Paragraph 2: Highlight 1-2 specific, quantifiable achievements from the resume that directly align with the core needs of the job description.
   - Paragraph 3: A strong closing statement reiterating excitement for the role and a call to action for an interview.
3. Do NOT include placeholder addresses or dates at the top. Just return the core body of the letter.
4. Keep it concise (around 200-250 words).
5. Address the hiring manager directly if a name is inferable, otherwise use "Dear Hiring Manager,".
6. Return ONLY the cover letter text, no explanations.`;

        const userPrompt = `** Job Description:**
${jobDescription}

** Candidate Resume:**
${JSON.stringify(targetedResumeElements, null, 2)}

Write the cover letter now.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // or whatever model is used
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        });

        const coverLetter = completion.choices[0]?.message?.content?.trim();

        if (!coverLetter) {
            throw new Error('No response from AI');
        }

        return new Response(
            JSON.stringify({
                success: true,
                coverLetter
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error generating cover letter:', error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Failed to generate cover letter'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
