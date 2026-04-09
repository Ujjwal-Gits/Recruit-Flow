import { MetadataRoute } from 'next';

const BASE_URL = 'https://recruitflow.app';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    return [
        // Core pages — highest priority
        { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
        { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${BASE_URL}/features`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${BASE_URL}/how-it-works`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },

        // Company pages
        { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/use-cases`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/security`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/careers`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/changelog`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },

        // Blog
        { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${BASE_URL}/blog/ai-resume-screening-guide`, lastModified: new Date('2026-04-02'), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/blog/reduce-time-to-hire`, lastModified: new Date('2026-03-28'), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/blog/ats-score-optimization`, lastModified: new Date('2026-03-20'), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/blog/recruitment-automation-small-business`, lastModified: new Date('2026-03-15'), changeFrequency: 'monthly', priority: 0.7 },

        // Legal
        { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ];
}
