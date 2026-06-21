import { GoogleGenAI } from "@google/genai";
import wav from 'wav';
import { uploadGossipAudioBuffer } from "./storageService.js";
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

/**
 * Generate gossip audio from script using Gemini TTS.
 * Uses Maya (Kore) and Jay (Enceladus) voices.
 * @param {string} script - The gossip script with Maya and Jay speakers
 * @param {string} gossipId - The gossip ID for file storage
 * @returns {Promise<{audioUrl: string, audioDuration: number}>}
 */
export const generateGossipAudio = async (script, gossipId) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const response = await ai.models.generateContent({
            model: process.env.GEMINI_TTS_MODEL,
            contents: [{ parts: [{ text: script }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: [
                            {
                                speaker: 'Maya',
                                voiceConfig: {
                                    prebuiltVoiceConfig: { voiceName: 'Kore' }
                                }
                            },
                            {
                                speaker: 'Jay',
                                voiceConfig: {
                                    prebuiltVoiceConfig: { voiceName: 'Enceladus' }
                                }
                            }
                        ]
                    }
                }
            }
        });

        const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!data) {
            console.error("Gemini TTS returned no audio data for gossip:", gossipId);
            throw new Error("No audio data received from Gemini TTS");
        }

        const audioBuffer = Buffer.from(data, 'base64');
        const wavBuffer = await pcmToWavBuffer(audioBuffer);

        // Extract duration with validation
        const metadata = await parseBuffer(wavBuffer, { mimeType: "audio/wav" });
        let audioDuration;
        
        // Validate metadata.format.duration
        if (metadata && metadata.format && typeof metadata.format.duration === 'number' && metadata.format.duration > 0) {
            audioDuration = metadata.format.duration;
        } else {
            // Fallback: compute duration from WAV buffer properties
            // WAV duration = (file size - header) / (sample rate * channels * bytes per sample)
            const sampleRate = 24000; // Default from pcmToWavBuffer
            const channels = 1;
            const bytesPerSample = 2;
            const headerSize = 44; // Standard WAV header size
            const dataSize = wavBuffer.length - headerSize;
            
            if (dataSize > 0) {
                audioDuration = dataSize / (sampleRate * channels * bytesPerSample);
            } else {
                throw new Error("Unable to determine audio duration: invalid WAV buffer");
            }
        }

        const audioUrl = await uploadGossipAudioBuffer(wavBuffer, gossipId);

        return { audioUrl, audioDuration };
    } catch (err) {
        console.error("Gossip audio generation error:", err.message);
        throw new Error(`Gossip audio generation failed: ${err.message}`);
    }
};