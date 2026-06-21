import prisma from '../config/db.js';
import { checkCredits, deductCredits, refundCredits } from './creditService.js';
import { CREDIT_COSTS } from '../config/credits.js';
import OpenAI from 'openai';
import { getMermaidPrompt, getImagePrompt } from '../prompts/visualizerPrompts.js';

/**
 * Get OpenAI client configured for OpenRouter
 */
const getClient = () => {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
      'X-Title': 'Explainer-AI',
    },
  });
};

/**
 * Detect most appropriate visualization mode
 */
const detectMode = (topic) => {
  const MERMAID_KEYWORDS = [
    'process', 'flow', 'workflow', 'algorithm', 'sequence', 'interaction',
    'class', 'object', 'hierarchy', 'structure', 'state', 'lifecycle',
    'timeline', 'planning', 'roadmap', 'mindmap', 'concept map',
    'database', 'schema', 'relationship', 'network', 'topology',
    'chart', 'graph', 'tree'
  ];
  
  const IMAGE_KEYWORDS = [
    'anatomy', 'human', 'body', 'organ', 'cell', 'biology',
    'circuit', 'schematic', 'electronics', 'hardware',
    'molecule', 'atom', 'chemical', 'compound',
    'physics', 'space', 'planet', 'star',
    'illustration', 'drawing', 'sketch', 'painting',
    'realistic', 'photo', 'view', 'scene'
  ];

  const topicLower = topic.toLowerCase();

  // Check specific overrides/strong keywords
  if (topicLower.includes('flowchart') || topicLower.includes('sequence diagram')) return 'MERMAID';
  if (topicLower.includes('realistic') || topicLower.includes('photograph')) return 'IMAGE';

  // Count matches
  const mermaidCount = MERMAID_KEYWORDS.filter(k => topicLower.includes(k)).length;
  const imageCount = IMAGE_KEYWORDS.filter(k => topicLower.includes(k)).length;

  if (imageCount > mermaidCount) return 'IMAGE';
  return 'MERMAID'; // Default to Mermaid as it's cheaper/structure-focused
};

/**
 * Generate Mermaid diagram
 */
const generateMermaid = async (topic) => {
  const client = getClient();
  const prompt = getMermaidPrompt(topic);

  const response = await client.chat.completions.create({
    model: process.env.MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  });

  let content = response.choices[0].message.content;

  // Extract mermaid block if fenced, otherwise strip any stray fences
  const fenced = content.match(/```(?:mermaid)?\s*\n([\s\S]*?)\n?```/i);
  if (fenced) {
    content = fenced[1];
  } else {
    content = content.replace(/^```(?:mermaid)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  }

  return content.trim();
};

/**
 * Generate Image
 */
const generateImage = async (topic) => {
  const client = getClient();
  const prompt = getImagePrompt(topic);

  // OpenRouter uses chat completions for image generation (FLUX)
  // We must specify modalities: ["image"] in extra_body for OpenRouter
  const response = await client.chat.completions.create({
    model: 'black-forest-labs/flux.2-pro',
    messages: [{ role: 'user', content: prompt }],
    // @ts-ignore
    extra_body: {
      modalities: ["image"]
    }
  });

  console.log('Flux response received, extracting image URL');

  // Check for OpenRouter specific image response format
  // @ts-ignore
  if (response.choices[0].message.images && response.choices[0].message.images.length > 0) {
    // @ts-ignore
    return response.choices[0].message.images[0].url;
  }

  // Fallback: Response might contain an image URL in markdown or raw text in content
  const content = response.choices[0].message.content;
  
  // Extract URL from markdown ![alt](url) or just raw URL
  const match = content.match(/\((.*?)\)/) || content.match(/(https?:\/\/[^\s]+)/);
  if (match) {
    return match[1] || match[0];
  }
  
  return content; // Fallback if no URL pattern found
};

/**
 * Main generation function
 */
export const generateVisualization = async (userId, topic, forceMode = null) => {
  const mode = forceMode ? forceMode.toUpperCase() : detectMode(topic);
  const cost = mode === 'IMAGE' ? CREDIT_COSTS.VISUALIZER_IMAGE : CREDIT_COSTS.VISUALIZER_MERMAID;

  // Check credits
  const creditCheck = await checkCredits(userId, cost);
  if (!creditCheck.allowed) {
    throw new Error(creditCheck.message || 'Insufficient credits');
  }

  try {
    let content;
    if (mode === 'IMAGE') {
      content = await generateImage(topic);
    } else {
      content = await generateMermaid(topic);
    }

    // Deduct credits
    await deductCredits(userId, cost);

    // Store in DB
    let visualization;
    try {
      visualization = await prisma.visualization.create({
        data: {
          userId,
          topic,
          type: mode,
          content,
          creditsUsed: cost,
        },
      });
    } catch (dbError) {
      // Refund if DB save fails
      await refundCredits(userId, cost);
      throw dbError;
    }

    return visualization;
  } catch (error) {
    console.error(`Error generating ${mode} visualization:`, error);
    throw error;
  }
};

/**
 * Get user visualizations
 */
export const getUserVisualizations = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [visualizations, total] = await Promise.all([
    prisma.visualization.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.visualization.count({ where: { userId } }),
  ]);

  return {
    visualizations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get by ID
 */
export const getVisualizationById = async (id, userId) => {
  const viz = await prisma.visualization.findFirst({
    where: { id, userId },
  });

  if (!viz) throw new Error('Visualization not found');
  return viz;
};

/**
 * Delete
 */
export const deleteVisualization = async (id, userId) => {
  const viz = await prisma.visualization.findFirst({
    where: { id, userId },
  });

  if (!viz) throw new Error('Visualization not found');

  await prisma.visualization.delete({
    where: { id },
  });

  return { success: true };
};
