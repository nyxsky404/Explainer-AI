import { GoogleGenAI } from "@google/genai";

export const summarizeYouTube = async (url) => {
  try {
    // Initialize inside function to ensure env vars are loaded
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [`Summarize this YouTube video : ${url}`],
      config: {
        tools: [{ urlContext: {} }],
      },
    });
    
    // Debug logging
    console.log("Gemini response type:", typeof response);
    console.log("Gemini response.text type:", typeof response.text);
    
    // Handle different response formats
    let text;
    if (typeof response.text === 'function') {
      text = response.text();
    } else if (typeof response.text === 'string') {
      text = response.text;
    } else if (response.response?.text) {
      text = typeof response.response.text === 'function' 
        ? response.response.text() 
        : response.response.text;
    } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = response.candidates[0].content.parts[0].text;
    } else {
      console.log("Full response:", JSON.stringify(response, null, 2));
      text = "Unable to extract summary from response";
    }
    
    console.log("Extracted text:", text?.substring(0, 100));
    return text;
  } catch (err) {
    console.error("YouTube summarization error:", err);
    throw new Error(`Failed to summarize YouTube video: ${err.message}`);
  }
};
