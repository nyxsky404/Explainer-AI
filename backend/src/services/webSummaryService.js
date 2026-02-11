import OpenAI from 'openai';
import { scrapeUrl } from './scrapeService.js';
import { getDynamicSummaryPrompt } from '../prompts/summaryPrompts.js';

export const summarizeWebPage = async (url, options = {}) => {
  try {
    // Initialize inside function to ensure env vars are loaded
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'https://explainer-ai-two.vercel.app/',
        'X-Title': 'Explainer AI',
      },
    });

    // Step 1: Scrape the content using Firecrawl
    console.log("Scraping URL:", url);
    const content = await scrapeUrl(url);
    
    if (!content) {
      throw new Error('Failed to extract content from the webpage');
    }
    console.log("Scraped content length:", content.length);

    // Step 2: Build dynamic prompt based on user preferences
    const systemPrompt = getDynamicSummaryPrompt({ ...options, type: 'web' });

    // Step 3: Summarize using OpenRouter
    console.log("Calling OpenRouter API...");
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-oss-20b:free',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: content,
        },
      ],
    });

    const summary = completion.choices[0].message.content;
    console.log("Summary received, length:", summary?.length);
    console.log("Summary preview:", summary?.substring(0, 200));
    
    return { summary, rawContent: content };
  } catch (err) {
    console.error("Web page summarization error:", err);
    throw new Error(`Failed to summarize web page: ${err.message}`);
  }
};
