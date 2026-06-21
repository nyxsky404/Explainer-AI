import { GoogleGenAI } from "@google/genai";
import { getGossipPrompt } from '../prompts/gossipPrompts.js';

// Validate GEMINI_API_KEY at startup
if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required but not defined');
}

// Initialize GoogleGenAI client once at module level
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate a Gen Z-style gossip script from scraped content.
 * @param {string} scrapedText - The scraped article/blog content
 * @param {object} options - Options for script generation
 * @param {'quick'|'standard'|'detailed'} options.depth - Depth level for content length
 * @returns {Promise<string>} - The generated gossip script
 */
export const generateGossipScript = async (scrapedText, options = {}) => {
    // Validate scrapedText upfront
    if (!scrapedText || typeof scrapedText !== 'string' || scrapedText.trim() === '') {
        throw new Error('scrapedText is required and must be a non-empty string');
    }
    
    try {
        const Gemini_Response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: getGossipPrompt(scrapedText, options),
        });

        const result = Gemini_Response.text;

        if (!result) {
            throw new Error('Gemini returned an empty gossip script');
        }

        return result;
    } catch (err) {
        // Re-throw the original error to preserve stack trace
        throw err;
    }
};