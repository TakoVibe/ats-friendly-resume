import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: import.meta.env.OPENAI_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
    try {
        const { text } = await request.json();

        if (!text || typeof text !== 'string') {
            return new Response(
                JSON.stringify({ error: 'Resume text is required' }),
                { status: 400 }
            );
        }

        if (!import.meta.env.OPENAI_API_KEY) {
            return new Response(
                JSON.stringify({ error: 'OpenAI API key not configured' }),
                { status: 500 }
            );
        }

        const prompt = `You are an expert resume parser. Parse the following resume text and extract structured information into a clean JSON format.

Return a JSON object with this exact structure:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "title": "string (optional job title)",
    "profiles": [{"network": "string", "username": "string", "url": "string"}]
  },
  "summary": "string (professional summary/objective)",
  "experience": [
    {
      "id": "string (generate unique id: exp-1, exp-2...)",
      "company": "string",
      "role": "string",
      "duration": "string",
      "location": "string",
      "metrics": ["bullet point 1", "bullet point 2"],
      "techStack": ["tech1", "tech2"]
    }
  ],
  "education": [
    {
      "id": "string (generate unique id: edu-1, edu-2...)",
      "institution": "string",
      "degree": "string",
      "duration": "string",
      "location": "string",
      "score": "string (optional GPA/percentage)",
      "details": ["detail 1", "detail 2"]
    }
  ],
  "skills": [
    {
      "id": "string (generate unique id: skill-1, skill-2...)",
      "name": "Category Name (e.g., Languages, Frameworks)",
      "items": ["skill1", "skill2", "skill3"]
    }
  ],
  "projects": [
    {
      "id": "string (generate unique id: proj-1, proj-2...)",
      "name": "string",
      "description": "string",
      "techStack": ["tech1", "tech2"],
      "link": "string (optional)",
      "date": "string (optional)",
      "metrics": ["achievement 1", "achievement 2"]
    }
  ],
  "certifications": [
    {
      "id": "string (generate unique id: cert-1, cert-2...)",
      "name": "string",
      "issuer": "string",
      "date": "string (optional)"
    }
  ]
}

Important Rules:
- Generate unique IDs for each item.
- Extract ALL information available.
- If a section is missing, return an empty array [].
- Preserve the exact achievements and bullet points.
- Extract technology names into techStack arrays where applicable.
- Return ONLY the JSON object, do not include markdown blocks or any other text.

Resume Text:
${text}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a professional resume parsing service. Output only valid JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
        });

        const generatedText = completion.choices[0]?.message?.content;

        if (!generatedText) {
            throw new Error('No response from AI');
        }

        const parsedResume = JSON.parse(generatedText);

        // Add default config and visibility settings
        const completeResume = {
            ...parsedResume,
            achievements: parsedResume.achievements || [],
            openSource: parsedResume.openSource || [],
            customSections: parsedResume.customSections || [],
            config: {
                baseFontSize: 10,
                fontFamily: 'Inter',
                margins: 'standard',
                lineHeight: 1.35
            },
            sectionOrder: [
                'summary',
                'experience',
                'projects',
                'skills',
                'education',
                'certifications'
            ],
            visibleSections: {
                summary: !!parsedResume.summary,
                experience: (parsedResume.experience?.length || 0) > 0,
                education: (parsedResume.education?.length || 0) > 0,
                skills: (parsedResume.skills?.length || 0) > 0,
                projects: (parsedResume.projects?.length || 0) > 0,
                certifications: (parsedResume.certifications?.length || 0) > 0
            }
        };

        return new Response(JSON.stringify(completeResume), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error parsing resume:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to parse resume',
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
