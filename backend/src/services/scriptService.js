import { GoogleGenAI } from "@google/genai";
import { getPrompt } from './prompt.js';

export const generateScript = async(scrapedText) => {
    try{
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const Gemini_Response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: getPrompt(scrapedText),
        });
    
        const result = Gemini_Response.text
    
        console.log("Script Generated")
    
        return result
    }catch(err){
        throw new Error(err.message)
    }
}