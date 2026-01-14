import { GoogleGenAI } from "@google/genai";
import wav from 'wav';
import { uploadAudioBuffer } from "./storageService.js";
import { parseBuffer } from "music-metadata";

async function pcmToWavBuffer(
    pcmData,
    channels = 1,
    rate = 24000,
    sampleWidth = 2,
) {
    return new Promise((resolve, reject) => {
        const chunks = [];

        const writer = new wav.Writer({
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
        });

        writer.on("data", chunk => chunks.push(chunk));
        writer.on("end", () => resolve(Buffer.concat(chunks)));
        writer.on("error", reject);

        writer.write(pcmData);
        writer.end();
    });
}

export const generateAudio = async (script, podcastId) => {
    try {
        console.log("Starting audio generation for podcast:", podcastId);
        console.log("Script length:", script?.length);

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        console.log("Calling Gemini TTS API...");
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: script }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: [
                            {
                                speaker: 'Sophia',
                                voiceConfig: {
                                    prebuiltVoiceConfig: { voiceName: 'Kore' }
                                }
                            },
                            {
                                speaker: 'Alex',
                                voiceConfig: {
                                    prebuiltVoiceConfig: { voiceName: 'Enceladus' }
                                }
                            }
                        ]
                    }
                }
            }
        });

        console.log("Gemini TTS API response received");
        const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!data) {
            console.error("No audio data in response:", JSON.stringify(response, null, 2));
            throw new Error("No audio data received from Gemini TTS");
        }

        const audioBuffer = Buffer.from(data, 'base64');
        console.log("Audio buffer size:", audioBuffer.length);

        const wavBuffer = await pcmToWavBuffer(audioBuffer);
        console.log("WAV buffer size:", wavBuffer.length);

        // extract duration
        const metadata = await parseBuffer(wavBuffer, {
            mimeType: "audio/wav",
        });

        const audioDuration = metadata.format.duration; // seconds (float)

        console.log("Uploading to Supabase...");
        const audioUrl = await uploadAudioBuffer(wavBuffer, podcastId);

        console.log("Audio Generated 🎉", { audioDuration, audioUrl });

        return { audioUrl, audioDuration };
    } catch (err) {
        console.error("Audio generation error:", err);
        throw new Error(`Audio generation failed: ${err.message}`);
    }
}