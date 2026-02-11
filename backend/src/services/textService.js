import OpenAI from 'openai';
import { getDynamicSummaryPrompt } from '../prompts/summaryPrompts.js';

/**
 * Summarize plain text input.
 * @param {string} text - Raw text to summarize
 * @param {object} options - { readingLevel, tone, depth }
 * @returns {{ summary: string, rawContent: string }}
 */
export const summarizeText = async (text, options = {}) => {
  try {
    const rawContent = text?.trim();

    if (!rawContent || rawContent.length < 100) {
      throw new Error('Text is too short to summarize (minimum 100 characters)');
    }

    if (rawContent.length > 50000) {
      throw new Error('Text is too long (maximum 50,000 characters)');
    }

    console.log('Summarizing text, length:', rawContent.length);

    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'https://explainer-ai-two.vercel.app/',
        'X-Title': 'Explainer AI',
      },
    });

    const systemPrompt = getDynamicSummaryPrompt({ ...options, type: 'text' });

    console.log('Calling OpenRouter for text summary...');
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-oss-20b:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: rawContent },
      ],
    });

    const summary = completion.choices[0].message.content;
    console.log('Text summary received, length:', summary?.length);

    return { summary, rawContent };
  } catch (err) {
    console.error('Text summarization error:', err);
    throw new Error(`Failed to summarize text: ${err.message}`);
  }
};
