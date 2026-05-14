import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const keyword = url.searchParams.get('keyword') || 'developer';
        const location = url.searchParams.get('location') || '';
        const company = url.searchParams.get('company') || '';

        const finalKeyword = company ? `${company} ${keyword}` : keyword;

        const appId = import.meta.env.ADZUNA_APP_ID;
        const appKey = import.meta.env.ADZUNA_API_KEY; // The user named it ADZUNA_API_KEY in .env

        if (!appId || !appKey) {
            return new Response(
                JSON.stringify({ error: 'Adzuna credentials not configured' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        let adzunaUrl = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=50&what=${encodeURIComponent(finalKeyword)}`;
        if (location) {
            adzunaUrl += `&where=${encodeURIComponent(location)}`;
        }

        const response = await fetch(adzunaUrl);
        
        if (!response.ok) {
            throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        return new Response(
            JSON.stringify({
                success: true,
                count: data.count,
                results: data.results.map((job: any) => ({
                    id: job.id,
                    title: job.title,
                    company: job.company?.display_name || 'Unknown Company',
                    location: job.location?.display_name || 'Remote/India',
                    description: job.description,
                    url: job.redirect_url,
                    created_at: job.created,
                    salary_min: job.salary_min,
                    salary_max: job.salary_max
                }))
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Job API Error:', error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Failed to fetch jobs',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
