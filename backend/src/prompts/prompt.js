import { buildPodcastPrompt } from './promptBuilder.js';

export const getPrompt = (content, options = {}) => {
  const basePrompt = buildPodcastPrompt(options);
  return `${basePrompt}\n\n**Input Data:** ${content}`;
};