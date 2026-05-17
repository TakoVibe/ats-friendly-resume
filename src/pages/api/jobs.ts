import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const keyword = url.searchParams.get('keyword') || 'developer';
        const location = url.searchParams.get('location') || '';
        const company = url.searchParams.get('company') || '';

        const appId = import.meta.env.ADZUNA_APP_ID;
        const appKey = import.meta.env.ADZUNA_API_KEY; // The user named it ADZUNA_API_KEY in .env

        if (!appId || !appKey) {
            return new Response(
                JSON.stringify({ error: 'Adzuna credentials not configured' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const token = request.headers.get('authorization')?.replace('Bearer ', '')?.replace('Token ', '');
        
        if (!token) {
            return new Response(
                JSON.stringify({ error: 'Authentication required' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Consume 10 vibetokens for job search
        const useTokenResponse = await fetch('http://localhost:8000/api/users/tokens/use/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action_type: 'job_search',
                product: 'resumevibe',
                request_id: `job_search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            })
        });

        if (!useTokenResponse.ok) {
            const errorData = await useTokenResponse.json();
            if (errorData.error === 'Insufficient tokens') {
                return new Response(
                    JSON.stringify({ 
                        error: 'Insufficient tokens',
                        requires_tokens: true,
                        tokens_required: 5,
                        token_balance: errorData.token_balance || 0,
                        message: 'You need 5 VibeTokens to view job listings. Purchase tokens to continue.'
                    }),
                    { status: 402, headers: { 'Content-Type': 'application/json' } }
                );
            }
            return new Response(
                JSON.stringify({ error: errorData.error || 'Failed to use tokens' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const tokenData = await useTokenResponse.json();

        let adzunaUrl = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=50&what=${encodeURIComponent(keyword)}`;
        if (location) {
            adzunaUrl += `&where=${encodeURIComponent(location)}`;
        }
        if (company) {
            adzunaUrl += `&company=${encodeURIComponent(company)}`;
        }

        const response = await fetch(adzunaUrl);
        
        if (!response.ok) {
            throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        let results = data.results.map((job: any) => ({
            id: job.id,
            title: job.title,
            company: job.company?.display_name || 'Unknown Company',
            location: job.location?.display_name || 'Remote/India',
            description: job.description,
            url: job.redirect_url,
            created_at: job.created,
            salary_min: job.salary_min,
            salary_max: job.salary_max
        }));

        if (company) {
            const companyLower = company.toLowerCase().trim();
            results = results.filter((job: any) => 
                job.company.toLowerCase().includes(companyLower)
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                token_balance: tokenData.token_balance,
                count: results.length,
                results: results
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
