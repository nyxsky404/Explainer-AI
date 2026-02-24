import { GoogleGenAI } from "@google/genai";
import { getGossipPrompt } from '../prompts/gossipPrompts.js';

/**
 * Generate a Gen Z-style gossip script from scraped content.
 * @param {string} scrapedText - The scraped article/blog content
 * @param {object} options - Options for script generation
 * @param {'quick'|'standard'|'detailed'} options.depth - Depth level for content length
 * @returns {Promise<string>} - The generated gossip script
 */
export const generateGossipScript = async (scrapedText, options = {}) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const Gemini_Response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: getGossipPrompt(scrapedText, options),
        });

        const result = Gemini_Response.text;

        if (!result) {
            throw new Error('Gemini returned an empty gossip script');
        }

        return result;
    } catch (err) {
        throw new Error(err.message);
    }
};