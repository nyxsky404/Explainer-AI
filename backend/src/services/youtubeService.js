import OpenAI from "openai";
import { YoutubeTranscript } from "youtube-transcript";
import { getDynamicSummaryPrompt } from '../prompts/summaryPrompts.js';

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function fetchTranscriptSupadata(url) {
  try {
    const res = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?url=${encodeURIComponent(url)}`,
      { headers: { 'x-api-key': process.env.SUPADATA_API_KEY } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const segments = data?.content;
    if (!Array.isArray(segments) || segments.length === 0) return null;
    return segments.map(s => s.text).join(' ');
  } catch {
    return null;
  }
}

async function fetchTranscriptLocal(url) {
  try {
    const segments = await YoutubeTranscript.fetchTranscript(url);
    if (!segments || segments.length === 0) return null;
    return segments.map(s => s.text).join(' ');
  } catch {
    return null;
  }
}

async function fetchTranscript(url) {
  return (await fetchTranscriptSupadata(url)) ?? (await fetchTranscriptLocal(url));
}

export const summarizeYouTube = async (url, options = {}) => {
  try {
    const systemPrompt = getDynamicSummaryPrompt({ ...options, type: 'youtube' });
    const transcript = await fetchTranscript(url);

    if (transcript) {
      // Primary path: full transcript → OpenRouter
      const response = await openrouter.chat.completions.create({
        model: process.env.MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the full transcript of the YouTube video (${url}):\n\n${transcript}` },
        ],
      });

      const text = response.choices?.[0]?.message?.content || "Unable to extract summary from response";
      return { summary: text, rawContent: transcript };
    }

    throw new Error("Something went wrong while fetching the video transcript. Please try again later.");
  } catch (err) {
    console.error("YouTube summarization error:", err);
    throw new Error(`Failed to summarize YouTube video: ${err.message}`);
  }
};
