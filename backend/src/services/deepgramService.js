import { createClient } from "@deepgram/sdk";

const getDeepgramClient = () => {
  return createClient(process.env.DEEPGRAM_API_KEY);
};

// Helper function to convert stream to audio buffer
const getAudioBuffer = async (response) => {
  const stream = await response.getStream();
  if (!stream) throw new Error("Failed to get stream from Deepgram response");

  const chunks = [];
  try {
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
  } catch (error) {
    // If for await fails, try getReader fallback (for web-standard streams in strict environments)
    if (stream.getReader) {
       const reader = stream.getReader();
       while (true) {
         const { done, value } = await reader.read();
         if (done) break;
         chunks.push(value);
       }
    } else {
      throw error;
    }
  }

  return Buffer.concat(chunks);
};


export async function textToSpeech(text) {
  console.error("Starting textToSpeech conversion...");
  try {
    const deepgram = getDeepgramClient();
    console.error("Deepgram client initialized. Has speak capability:", !!deepgram.speak);

    // Clean text for TTS - remove markdown formatting
    const cleanText = text
      .replace(/#{1,6}\s?/g, '') // Remove headers
      .replace(/\*\*/g, '') // Remove bold
      .replace(/\*/g, '') // Remove italic
      .replace(/`/g, '') // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
      .replace(/---/g, '') // Remove horizontal rules
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
      .trim();

    console.error("Generating audio for text length:", cleanText.length);

    const response = await deepgram.speak.request(
      { text: cleanText },
      {
        model: "aura-2-helena-en",
        encoding: "linear16",
        container: "wav",
      }
    );
    console.error("Deepgram request completed. Response received.");

    const buffer = await getAudioBuffer(response);
    console.error("Audio buffer generated, size:", buffer.length);

    return buffer;
  } catch (error) {
    console.error("Deepgram TTS error:", error);
    throw new Error(`Text-to-speech failed: ${error.message}`);
  }
}
