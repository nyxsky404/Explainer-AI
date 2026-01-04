import Firecrawl from '@mendable/firecrawl-js';

export const scrapeUrl = async(url) => {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY  });

    const result = await firecrawl.scrapeUrl(url, {
        formats: ["markdown"],
        onlyMainContent: true 
    });

    console.log(result)

    return result
}