import { DEFAULTS } from '../config/constants.js';

/**
 * Get character limit for a given depth level.
 * @param {'quick' | 'standard' | 'detailed'} depth
 * @param {'summary' | 'podcast'} type
 * @returns {number}
 */
export function getCharLimit(depth = 'standard', type = 'summary') {
  const limits = type === 'podcast'
    ? DEFAULTS.PODCAST.CHAR_LIMITS
    : DEFAULTS.SUMMARY.CHAR_LIMITS;
  return limits[depth] || limits.standard;
}

/**
 * Get reading level instructions for prompts.
 * @param {'beginner' | 'intermediate' | 'expert'} level
 * @returns {string}
 */
function getReadingLevelInstructions(level = 'intermediate') {
  const instructions = {
    beginner: `
Use very simple, everyday language. Assume the reader has no prior knowledge of the topic.
Explain any technical terms or jargon in plain English.
Use short sentences and familiar analogies (like comparing to cooking, sports, or daily life).
Avoid acronyms unless you spell them out first.`,
    intermediate: `
Use clear, accessible language suitable for a generally educated audience.
Brief explanations of specialized terms are helpful but not required for common concepts.
Balance depth with readability.`,
    expert: `
Use precise, domain-specific terminology where appropriate.
Assume the reader has strong background knowledge and skip basic explanations.
Focus on nuance, implications, and advanced insights rather than introductory context.
Be concise — experts value density over simplification.`,
  };
  return instructions[level] || instructions.intermediate;
}

/**
 * Get tone instructions for prompts.
 * @param {'casual' | 'conversational' | 'professional' | 'academic'} tone
 * @returns {string}
 */
function getToneInstructions(tone = 'conversational') {
  const instructions = {
    casual: `
Write in a relaxed, friendly tone — like texting a friend who's smart but informal.
Use contractions, humor, and colloquial expressions when they fit.
Keep it light and engaging.`,
    conversational: `
Write in a warm, natural tone — like a knowledgeable friend explaining something over coffee.
Use contractions and flowing sentences. Be personable but informative.
Smooth transitions between ideas.`,
    professional: `
Write in a clear, polished tone suitable for a business or professional audience.
Be direct and well-structured. Avoid slang but don't be stiff.
Prioritize clarity and actionable takeaways.`,
    academic: `
Write in a structured, analytical tone appropriate for scholarly discussion.
Use precise language and logical argumentation.
Reference methodology and evidence where applicable.
Maintain objectivity and measured conclusions.`,
  };
  return instructions[tone] || instructions.conversational;
}

/**
 * Build a dynamic summary prompt based on user preferences.
 * @param {object} options
 * @param {'beginner'|'intermediate'|'expert'} options.readingLevel
 * @param {'casual'|'conversational'|'professional'|'academic'} options.tone
 * @param {'quick'|'standard'|'detailed'} options.depth
 * @param {'youtube'|'web'} options.type
 * @returns {string}
 */
export function buildSummaryPrompt({ readingLevel = 'intermediate', tone = 'conversational', depth = 'standard', type = 'web' } = {}) {
  const charLimit = getCharLimit(depth, 'summary');
  const sourceLabel = type === 'youtube' ? 'YouTube video transcript' : 'web page content';

  return `You are an expert narrator and explainer. Summarize the following ${sourceLabel} into a spoken-style summary designed to be listened to as audio.

**Reading Level & Vocabulary:**
${getReadingLevelInstructions(readingLevel)}

**Tone & Style:**
${getToneInstructions(tone)}

**Output Requirements:**
- The output should sound like a human reading and explaining the content naturally.
- Structured like a smooth narration, not notes.
- No bullet-heavy formatting.
- Keep key ideas, insights, and conclusions.
- Remove ads, navigation text, sponsor content, and irrelevant page elements.
- Simplify complex sentences without losing meaning.
- Add light transitions so the story flows.
- Make it understandable without seeing the screen.

Write it as if you're teaching the content to a smart listener.

**Target length: strictly less than or equal to ${charLimit} characters.**`;
}

/**
 * Build a dynamic podcast script prompt based on user preferences.
 * @param {object} options
 * @param {'beginner'|'intermediate'|'expert'} options.readingLevel
 * @param {'casual'|'conversational'|'professional'|'academic'} options.tone
 * @param {'quick'|'standard'|'detailed'} options.depth
 * @returns {string}
 */
export function buildPodcastPrompt({ readingLevel = 'intermediate', tone = 'conversational', depth = 'standard' } = {}) {
  const charLimit = getCharLimit(depth, 'podcast');

  // Adapt the host dynamic based on reading level
  let dynamicInstructions = '';
  if (readingLevel === 'beginner') {
    dynamicInstructions = `
**Audience Note:** The listener is new to this topic. Alex should ask even more "basic" questions and Sophia should use lots of real-world analogies and examples. Avoid any unexplained jargon.`;
  } else if (readingLevel === 'expert') {
    dynamicInstructions = `
**Audience Note:** The listener is an expert. Skip introductory explanations. Alex's skepticism should be about nuance and methodology, not basics. Sophia can use technical terminology freely. Focus on implications and advanced analysis.`;
  }

  // Adapt tone instructions for podcast format
  let toneNote = '';
  if (tone === 'professional') {
    toneNote = `\n**Tone Note:** Keep the banter professional — more structured, less casual. Think NPR-style discussion rather than friends chatting.`;
  } else if (tone === 'academic') {
    toneNote = `\n**Tone Note:** Maintain analytical rigor in the dialogue. Both hosts should reference evidence carefully and discuss methodology.`;
  } else if (tone === 'casual') {
    toneNote = `\n**Tone Note:** Extra casual — more jokes, pop-culture references, and informal language. Think popular Gen-Z podcast energy.`;
  }

  return `**System Role:**
You are the lead producer for "The Explainers," a chart-topping podcast hosted by **Alex** and **Sophia**. Your goal is to transform the provided text into a script that feels like an eavesdropped conversation between two incredibly smart, high-energy friends.

**The Dynamic (The Secret Sauce):**
*   **Sophia (The Guide):** She has read the article and is obsessed with it. She is sharp, articulate, and speaks in vivid mental images.
*   **Alex (The Skeptic Proxy):** He represents the listener. He is curious but initially skeptical. He stops Sophia when things get too abstract, demands real-world examples, and asks the "dumb" questions everyone is thinking.
${dynamicInstructions}${toneNote}

**The Task:**
Read the input text and write the dialogue script.

**Rules of Engagement (Strict Guidelines):**

1.  **The "Cold Open" Hook:**
    *   **Do not** start with "Welcome to the show."
    *   Start immediately with Sophia dropping a mind-bending fact or a provocative statement from the article.
    *   Alex should immediately react with disbelief or confusion (e.g., "Wait, seriously? There's no way that's true.").

2.  **The "Skeptic" Narrative Arc:**
    *   Alex must not agree immediately. He should challenge the premise early on ("Okay, but isn't this just hype?").
    *   Sophia must "win him over" using facts and logic from the text. This conflict keeps the listener engaged.

3.  **Speak in Pictures (Visual Language):**
    *   **Banned:** Abstract corporate speak (e.g., "synergize," "paradigm shift," "optimize").
    *   **Required:** Concrete imagery. Don't say "The data is complex." Say "It's like trying to drink from a firehose." Use analogies that involve everyday objects (food, cars, sports, relationships).

4.  **The "Ping-Pong" Flow:**
    *   Keep it fast. No speaker should talk for more than 3-4 sentences at a time.
    *   Use "verbal nods" and interruptions. (e.g., Alex cutting in with: "Hold on, back up a second.")

5.  **The Mid-Point Reset (Signposting):**
    *   Halfway through the script, have Alex stop and summarize to ensure clarity.
    *   *Example:* "Okay, pause. So what you're saying is [Point A] leads to [Point B], and that's why [Point C] is happening?"
    *   Sophia confirms and pivots to the next big point.

6.  **Seamless Sourcing:**
    *   Mention the author or article title naturally in dialogue, not as a citation. (e.g., Sophia: "That's actually the core argument [Author] makes in this piece...")

7.  **The "Mic Drop" Ending:**
    *   Don't just say goodbye. End with a massive takeaway or a lingering question that leaves Alex (and the listener) stunned.

**Output Format:**
*   Return *only* the spoken dialogue script.
*   Use speaker labels: **Sophia:** and **Alex:**.
*   Keep the total **length strictly not more than ${charLimit} characters**.`;
}
