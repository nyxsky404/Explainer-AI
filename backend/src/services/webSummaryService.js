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

    // ~4 chars per token; reserve 30k tokens for system prompt + response headroom
    const MAX_CONTENT_CHARS = (131072 - 30000) * 4;
    const trimmedContent = content.length > MAX_CONTENT_CHARS
      ? content.slice(0, MAX_CONTENT_CHARS) + '\n\n[Content trimmed due to length]'
      : content;

    // Step 3: Summarize using OpenRouter
    const completion = await openai.chat.completions.create({
      model: process.env.MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: trimmedContent },
      ],
    });

    const summary = completion.choices[0]?.message?.content;
    if (!summary) throw new Error('AI model returned an empty response');

    return { summary, rawContent: trimmedContent };
  } catch (err) {
    console.error('Web page summarization error:', err.message);
    throw new Error(`Failed to summarize web page: ${err.message}`);
  }
};
