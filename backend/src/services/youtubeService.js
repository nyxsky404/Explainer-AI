import OpenAI from "openai";
import { YoutubeTranscript } from "youtube-transcript";
import { getDynamicSummaryPrompt } from '../prompts/summaryPrompts.js';

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function fetchTranscript(url) {
  try {
    const segments = await YoutubeTranscript.fetchTranscript(url);
    return segments.map(s => s.text).join(' ');
  } catch {
    return null;
  }
}

export const summarizeYouTube = async (url, options = {}) => {
  try {
    const systemPrompt = getDynamicSummaryPrompt({ ...options, type: 'youtube' });
    const transcript = await fetchTranscript(url);

    if (!transcript) {
      throw new Error("This video has no captions available and cannot be summarized.");
    }

    const response = await openrouter.chat.completions.create({
      model: process.env.MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the full transcript of the YouTube video (${url}):\n\n${transcript}` },
      ],
    });

    const text = response.choices?.[0]?.message?.content || "Unable to extract summary from response";

    return { summary: text, rawContent: transcript };
  } catch (err) {
    console.error("YouTube summarization error:", err);
    throw new Error(`Failed to summarize YouTube video: ${err.message}`);
  }
};
