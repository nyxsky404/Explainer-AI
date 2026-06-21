import { GoogleGenAI } from "@google/genai";
import { getPrompt } from '../prompts/prompt.js';

export const generateScript = async (scrapedText, options = {}) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const Gemini_Response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: getPrompt(scrapedText, options),
        });

        const result = Gemini_Response.text;

        if (!result) {
            throw new Error('Gemini returned an empty script');
        }

        return result;
    } catch (err) {
        throw new Error(err.message);
    }
};