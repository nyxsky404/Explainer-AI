import OpenAI from 'openai';

/**
 * Extract key concepts from content using OpenRouter.
 * Called during summary creation to auto-populate concept tags.
 *
 * @param {string} content - Raw or summarized content
 * @returns {Promise<Array<{term: string, definition: string, category: string}>>}
 */
export async function extractConcepts(content) {
  try {
    const client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'https://explainer-ai-two.vercel.app/',
        'X-Title': 'Explainer AI',
      },
    });

    const completion = await client.chat.completions.create({
      model: 'openai/gpt-oss-20b:free',
      messages: [
        {
          role: 'system',
          content: `You are a concept extractor. Analyze the content and extract the most important key terms, concepts, and ideas.

**Output Format:**
Return ONLY a valid JSON array (no markdown, no code fences, no extra text). Each item should have:
- "term": the concept name (1-4 words)
- "definition": a 1-2 sentence explanation
- "category": one of "concept", "person", "technology", "event", "organization", "metric", "theory"

**Rules:**
- Extract 5-12 concepts maximum
- Prioritize unique and important terms over generic ones
- Definitions should be self-contained and clear
- Return ONLY the JSON array, nothing else`,
        },
        {
          role: 'user',
          content: content,
        },
      ],
    });

    const responseText = completion.choices[0].message.content.trim();

    // Try to parse the JSON, handling potential markdown code fences
    let cleanedText = responseText;
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const concepts = JSON.parse(cleanedText);

    // Validate structure
    if (!Array.isArray(concepts)) return [];
    return concepts
      .filter(c => c.term && c.definition)
      .slice(0, 12)
      .map(c => ({
        term: String(c.term).slice(0, 100),
        definition: String(c.definition).slice(0, 300),
        category: String(c.category || 'concept').slice(0, 50),
      }));
  } catch (err) {
    console.error('Concept extraction failed:', err.message);
    // Non-critical — return empty array, don't block summary creation
    return [];
  }
}
