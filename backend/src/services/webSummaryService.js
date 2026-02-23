import OpenAI from 'openai';
import { scrapeUrl } from './scrapeService.js';
import { getDynamicSummaryPrompt } from '../prompts/summaryPrompts.js';

export const summarizeWebPage = async (url, options = {}) => {
  try {
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.FRONTEND_URL || 'https://explainer-ai-two.vercel.app/',
        'X-Title': 'Explainer AI',
      },
    });

    // Step 1: Scrape the content
    const content = await scrapeUrl(url);

    if (!content) {
      throw new Error('Failed to extract content from the webpage');
    }

    // Step 2: Build dynamic prompt based on user preferences
    const systemPrompt = getDynamicSummaryPrompt({ ...options, type: 'web' });

    // Step 3: Summarize using OpenRouter
    const completion = await openai.chat.completions.create({
      model: process.env.MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content },
      ],
    });

    const summary = completion.choices[0]?.message?.content;
    if (!summary) throw new Error('AI model returned an empty response');

    return { summary, rawContent: content };
  } catch (err) {
    console.error('Web page summarization error:', err.message);
    throw new Error(`Failed to summarize web page: ${err.message}`);
  }
};
