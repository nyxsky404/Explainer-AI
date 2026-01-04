import { GoogleGenAI } from "@google/genai";
import { getPrompt } from './prompt.js';
import { scrapeUrl } from "./scrapeService.js";

export const generateScript = async(blogURL) => {
    try{
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
        // scrapeUrl(blogURL) gives promise, we need to await first before getting the markdown
    
        const scrapeData = await scrapeUrl(blogURL)
        const content = scrapeData.markdown
    
        const Gemini_Response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: getPrompt(content),
        });
    
        const result = Gemini_Response.text
    
        console.log(result)
    
        return result
    }catch(err){
        throw new Error(err.message)
    }
}