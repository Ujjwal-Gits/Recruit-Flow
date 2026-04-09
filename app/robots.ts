import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/dashboard',
                    '/iamadmin',
                    '/setup',
                    '/login',
                    '/register',
                    '/forgot-password',
                ],
            },
            // Allow AI crawlers explicitly for GEO
            {
                userAgent: 'GPTBot',
                allow: ['/blog/', '/features', '/how-it-works', '/use-cases', '/pricing', '/about'],
            },
            {
                userAgent: 'PerplexityBot',
                allow: ['/blog/', '/features', '/how-it-works', '/use-cases', '/pricing', '/about'],
            },
            {
                userAgent: 'ClaudeBot',
                allow: ['/blog/', '/features', '/how-it-works', '/use-cases', '/pricing', '/about'],
            },
        ],
        sitemap: 'https://recruitflow.app/sitemap.xml',
        host: 'https://recruitflow.app',
    };
}
