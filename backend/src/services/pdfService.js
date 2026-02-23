import OpenAI from 'openai';
import { createRequire } from 'module';
import { uploadDocument } from './storageService.js';
import { getDynamicSummaryPrompt } from '../prompts/summaryPrompts.js';

// pdf-parse is a CommonJS module — must use createRequire in an ESM project
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');


/**
 * Parse PDF buffer, extract text, upload to Supabase, and summarize.
 * @param {Buffer} fileBuffer - Raw PDF file buffer
 * @param {string} originalName - Original filename
 * @param {object} options - { readingLevel, tone, depth }
 * @returns {{ summary: string, rawContent: string, pdfUrl: string }}
 */
export const summarizePdf = async (fileBuffer, originalName, options = {}) => {
  try {
    // Step 1: Extract text using pdf-parse (default export, returns a promise directly)
    const pdfData = await pdf(fileBuffer);
    const rawContent = pdfData.text?.trim();

    if (!rawContent || rawContent.length < 100) {
      throw new Error('PDF contains too little text to summarize (minimum 100 characters)');
    }

    if (rawContent.length > 100000) {
      throw new Error('PDF content is too large (maximum 100,000 characters)');
    }

    // Step 2: Upload original PDF to Supabase storage
    const pdfUrl = await uploadDocument(fileBuffer, originalName, 'application/pdf');

    // Step 3: Summarize using OpenRouter
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is not configured');
    }

    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.FRONTEND_URL || 'https://explainer-ai-two.vercel.app/',
        'X-Title': 'Explainer AI',
      },
    });

    const systemPrompt = getDynamicSummaryPrompt({ ...options, type: 'pdf' });

    const completion = await openai.chat.completions.create({
      model: process.env.MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: rawContent },
      ],
    });

    const summary = completion.choices[0]?.message?.content;
    if (!summary) throw new Error('AI model returned an empty response');

    return { summary, rawContent, pdfUrl };
  } catch (err) {
    console.error('PDF summarization error:', err.message);
    throw new Error(`Failed to summarize PDF: ${err.message}`);
  }
};
