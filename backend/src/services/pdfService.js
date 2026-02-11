import OpenAI from 'openai';
import { PDFParse } from 'pdf-parse';
import { uploadDocument } from './storageService.js';
import { getDynamicSummaryPrompt } from '../prompts/summaryPrompts.js';

/**
 * Parse PDF buffer, extract text, upload to Supabase, and summarize.
 * @param {Buffer} fileBuffer - Raw PDF file buffer
 * @param {string} originalName - Original filename
 * @param {object} options - { readingLevel, tone, depth }
 * @returns {{ summary: string, rawContent: string, pdfUrl: string }}
 */
export const summarizePdf = async (fileBuffer, originalName, options = {}) => {
  try {
    // Step 1: Extract text from PDF
    console.log('Parsing PDF:', originalName);
    
    // Create parser instance and get text
    const parser = new PDFParse({ data: fileBuffer });
    const pdfData = await parser.getText();
    const rawContent = pdfData.text?.trim();

    if (!rawContent || rawContent.length < 100) {
      throw new Error('PDF contains too little text to summarize (minimum 100 characters)');
    }

    if (rawContent.length > 100000) {
      throw new Error('PDF content is too large (maximum 100,000 characters)');
    }

    console.log('PDF parsed, text length:', rawContent.length, 'pages:', pdfData.total);

    // Step 2: Upload original PDF to Supabase
    const pdfUrl = await uploadDocument(fileBuffer, originalName, 'application/pdf');
    console.log('PDF uploaded to storage:', pdfUrl);

    // Step 3: Summarize using OpenRouter
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is not configured');
    }

    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'https://explainer-ai-two.vercel.app/',
        'X-Title': 'Explainer AI',
      },
    });

    const systemPrompt = getDynamicSummaryPrompt({ ...options, type: 'pdf' });

    console.log('Calling OpenRouter for PDF summary...');
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-oss-20b:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: rawContent },
      ],
    });

    const summary = completion.choices[0].message.content;
    console.log('PDF summary received, length:', summary?.length);

    return { summary, rawContent, pdfUrl };
  } catch (err) {
    console.error('PDF summarization error:', err);
    throw new Error(`Failed to summarize PDF: ${err.message}`);
  }
};
