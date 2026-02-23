import Firecrawl from '@mendable/firecrawl-js';

export const scrapeUrl = async (url) => {
    try {
        if (!process.env.FIRECRAWL_API_KEY) {
            throw new Error('FIRECRAWL_API_KEY environment variable is not configured');
        }

        const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

        const result = await firecrawl.scrapeUrl(url, {
            formats: ["markdown"],
            onlyMainContent: true,
        });

        if (!result.markdown) {
            throw new Error('Firecrawl returned no content for this URL');
        }

        return result.markdown;
    } catch (err) {
        console.error('Scrape error:', err.message);
        throw new Error(`Failed to scrape URL: ${err.message}`);
    }
};