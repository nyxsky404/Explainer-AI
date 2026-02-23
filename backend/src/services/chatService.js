import OpenAI from 'openai';

/**
 * Create an OpenRouter client instance.
 */
function getClient() {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      'HTTP-Referer': process.env.FRONTEND_URL || 'https://explainer-ai-two.vercel.app/',
      'X-Title': 'Explainer AI',
    },
  });
}

/**
 * Build the system prompt for contextual chat.
 */
function buildChatSystemPrompt(rawContent, summaryContent) {
  return `You are a helpful assistant that answers questions about a specific piece of content the user has read.

**CONTEXT — Original Source Content:**
${rawContent || '(Original content not available)'}

**CONTEXT — AI-Generated Summary:**
${summaryContent}

**Instructions:**
- Answer questions ONLY based on the provided context above.
- If the answer is not in the context, say so honestly — do not make things up.
- Be concise but thorough. Cite specific parts of the content when relevant.
- Use the same tone as the summary (conversational and clear).
- If the user asks to explain something, give a deeper breakdown with examples or analogies.`;
}

/**
 * Chat with content — RAG-style Q&A using stored source content.
 */
export async function chatWithContent(rawContent, summaryContent, chatHistory, userMessage) {
  const client = getClient();
  const systemPrompt = buildChatSystemPrompt(rawContent, summaryContent);
  const recentHistory = chatHistory.slice(-20);
  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentHistory.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: userMessage },
  ];
  const completion = await client.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages,
  });
  return completion.choices[0]?.message?.content ?? '';
}

/**
 * Explain a highlighted text selection from the summary.
 */
export async function explainSelection(rawContent, summaryContent, selectedText) {
  const client = getClient();
  const systemPrompt = `You are a helpful explainer. The user has highlighted a specific passage from a summary they're reading. Explain it in more depth.

**Original Source Content:**
${rawContent || '(Original content not available)'}

**Full Summary:**
${summaryContent}

**Instructions:**
- Explain the highlighted passage in simple, clear terms.
- Draw from the original source content for additional context and details.
- Use analogies or examples if the concept is complex.
- Keep your response focused and concise (2-4 paragraphs max).
- Do NOT repeat the highlighted text back — jump straight into the explanation.`;

  const completion = await client.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Please explain this passage:\n\n"${selectedText}"` },
    ],
  });
  return completion.choices[0]?.message?.content ?? '';
}
