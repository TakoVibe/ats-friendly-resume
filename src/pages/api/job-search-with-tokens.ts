import type { APIRoute } from 'astro';
import { api } from '../../lib/api';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { keyword, location, company, resume_data } = body;

        const token = request.headers.get('authorization')?.replace('Token ', '');
        
        if (!token) {
            return new Response(
                JSON.stringify({ error: 'Authentication required' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Extract keyword from resume data if not provided
        let searchKeyword = keyword || 'developer';
        if (resume_data?.personalInfo?.title) {
            searchKeyword = resume_data.personalInfo.title;
        } else if (resume_data?.skills && resume_data.skills.length > 0) {
            const firstSkillCat = resume_data.skills[0];
            if (firstSkillCat.items && firstSkillCat.items.length > 0) {
                searchKeyword = firstSkillCat.items[0];
            }
        }

        const finalKeyword = company ? `${company} ${searchKeyword}` : searchKeyword;

        // Consume 10 vibetokens for job search
        const useTokenResponse = await api.post('/api/users/tokens/use/', {
            action_type: 'job_search',
            product: 'resumevibe',
            request_id: `job_search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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

        // Fetch jobs from Adzuna
        const appId = import.meta.env.ADZUNA_APP_ID;
        const appKey = import.meta.env.ADZUNA_API_KEY;

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

        const jobsResponse = await fetch(adzunaUrl);
        
        if (!jobsResponse.ok) {
            throw new Error(`Adzuna API error: ${jobsResponse.status}`);
        }

        const jobsData = await jobsResponse.json();

        let results = jobsData.results.map((job: any) => ({
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
        console.error('Job Search API Error:', error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Failed to fetch jobs',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};