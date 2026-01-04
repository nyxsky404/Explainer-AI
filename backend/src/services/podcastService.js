import { GoogleGenAI } from "@google/genai";
import wav from 'wav';
import { generateScript } from "./scriptService.js";

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

export const generatePodcast = async(blogUrl) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = await generateScript(blogUrl);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
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

    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const audioBuffer = Buffer.from(data, 'base64');

    const wavBuffer = await pcmToWavBuffer(audioBuffer );

    console.log("Audio Generated 🎉")

    return wavBuffer
}