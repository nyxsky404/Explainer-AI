import { DEFAULTS } from '../config/constants.js';

// Safe default character limit if config is missing
const SAFE_DEFAULT_CHAR_LIMIT = 8000;

/**
 * Get character limit for a given depth level for gossip.
 * @param {'quick' | 'standard' | 'detailed'} depth
 * @returns {number}
 */
export function getGossipCharLimit(depth = 'standard') {
  const limit = DEFAULTS?.GOSSIP?.CHAR_LIMITS?.[depth] ?? DEFAULTS?.GOSSIP?.CHAR_LIMITS?.standard;
  // Validate and return a safe number
  const parsedLimit = Number(limit);
  return Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : SAFE_DEFAULT_CHAR_LIMIT;
}

/**
 * Build a Gen Z-style gossip script prompt with Maya and Jay personas.
 * @param {object} options
 * @param {'quick'|'standard'|'detailed'} options.depth
 * @returns {string}
 */
export function buildGossipPrompt({ depth = 'standard' } = {}) {
  const charLimit = getGossipCharLimit(depth);

  return `**System Role:**
You are the lead writer for "The Tea," a viral Gen Z podcast where besties **Maya** and **Jay** break down complex topics while spilling the hottest takes. Your job is to transform the provided article into a conversation that feels like you're eavesdropping on two best friends discussing something fascinating they just read.

**The Hosts:**

**Maya (The Hype Queen):**
- She's obsessed with learning and gets SO excited about cool facts
- Uses expressions like: "bestie," "no literally," "I'm obsessed," "the way I screamed," "it's giving..."
- Loves a good analogy and makes everything relatable
- Gets dramatic but in a fun, engaging way
- She's the one who read the article and is DYING to tell Jay about it

**Jay (The Skeptic Bestie):**
- More chill and laid back but genuinely curious
- Uses expressions like: "wait what," "that's actually wild," "okay but," "no way," "say more"
- Asks the questions everyone's thinking
- Sometimes plays devil's advocate but always comes around
- Reacts with perfect comedic timing

**The Vibe:**
Think two smart besties discussing something fascinating over brunch. The conversation should feel natural, fun, and educational without feeling like you're learning. Gen Z slang intensity: MEDIUM - use current slang naturally without overdoing it.

**The Structure:**

1. **The Hook (Cold Open):**
   - Start mid-conversation with Maya dropping something shocking or fascinating
   - Jay should react with genuine surprise/confusion
   - NO "welcome to the show" or intros - we're dropping straight into the tea

2. **The Breakdown:**
   - Maya explains the key points while Jay asks clarifying questions
   - Use natural banter and interruptions
   - Break down complex ideas into digestible, relatable chunks
   - Include "wait, pause" moments where they zoom in on important details

3. **The Hot Takes:**
   - Both hosts share their opinions and reactions
   - Maya: "Okay but can we talk about how..."
   - Jay: "I'm honestly torn because..."
   - Real talk and genuine reactions

4. **The Wrap-Up:**
   - Summarize key takeaways casually
   - End with a killer closing line or thought-provoking question
   - Maybe a funny callback to something earlier

**Rules:**

1. **Keep it Educational:**
   - All the actual facts and information from the source must be preserved
   - Complex topics get explained through analogies and examples
   - The learning happens naturally through their conversation

2. **Natural Dialogue Flow:**
   - Short exchanges (1-4 sentences per turn typically)
   - Interruptions are encouraged when they feel natural
   - Verbal nods: "right," "exactly," "omg yes," "no for real"
   - They can finish each other's thoughts sometimes

3. **Slang Guidelines (Medium Intensity):**
   - USE NATURALLY: "bestie," "literally," "obsessed," "the way," "it's giving," "lowkey/highkey," "valid," "slay," "understood the assignment," "this is sending me," "I can't"
   - DON'T OVERUSE: No more than 2-3 slang phrases per exchange
   - Keep it feeling natural, not forced

4. **Pop Culture References:**
   - Occasional references to memes, trends, or relatable moments
   - Keep them general enough to stay relevant
   - Only use if it genuinely fits the conversation

5. **Speaker Labels:**
   - Use **Maya:** and **Jay:** for each line
   - No narration or stage directions in brackets

**Example Opening:**
**Maya:** Bestie, I need you to understand that I just read something that genuinely changed my brain chemistry.
**Jay:** Okay, you say that every week, but go off.
**Maya:** No literally this time it's different! So apparently...

**Output Format:**
- Return ONLY the dialogue script with speaker labels
- Total length: strictly not more than ${charLimit} characters
- No meta-commentary, explanations, or notes
- Jump straight into the conversation`;
}

// Maximum content length to prevent overly large prompts
const MAX_CONTENT_LENGTH = 50000;

/**
 * Sanitize content for use in prompts.
 * @param {string} content - The content to sanitize
 * @returns {string}
 */
/**
 * Safe truncate that respects UTF-16 surrogate pairs
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
function safeTruncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  
  // Check if we're about to cut a surrogate pair
  const charAtLimit = str.charCodeAt(maxLength - 1);
  const charAfterLimit = str.charCodeAt(maxLength);
  
  // High surrogate range: 0xD800-0xDBFF
  // Low surrogate range: 0xDC00-0xDFFF
  if (charAtLimit >= 0xD800 && charAtLimit <= 0xDBFF) {
    // We're cutting a high surrogate, back up one
    return str.substring(0, maxLength - 1);
  }
  if (charAfterLimit >= 0xDC00 && charAfterLimit <= 0xDFFF) {
    // We're about to leave a lone high surrogate
    return str.substring(0, maxLength - 1);
  }
  
  return str.substring(0, maxLength);
}

/**
 * Sanitize content for use in prompts.
 * @param {string} content - The content to sanitize
 * @returns {string}
 */
function sanitizeContent(content) {
  // Ensure content is a non-null string
  if (content == null) {
    return '';
  }
  
  // Convert to string and trim
  let sanitized = String(content).trim();
  
  // Neutralize closing XML/HTML fence tags to prevent prompt injection
  // Replace </tag> patterns with escaped version
  sanitized = sanitized.replace(/<\/([a-zA-Z0-9:_-]+)>/gi, '&lt;/$1&gt;');
  
  // Apply safe length limit (respects UTF-16 surrogate pairs)
  if (sanitized.length > MAX_CONTENT_LENGTH) {
    sanitized = safeTruncate(sanitized, MAX_CONTENT_LENGTH);
  }
  
  return sanitized;
}

/**
 * Get the gossip prompt with content injected.
 * @param {string} content - The scraped content to discuss
 * @param {object} options - Options for the prompt
 * @returns {string}
 */
export const getGossipPrompt = (content, options = {}) => {
  const basePrompt = buildGossipPrompt(options);
  const sanitizedContent = sanitizeContent(content);
  
  // Wrap content in XML-style fences for clear boundaries
  return `${basePrompt}

<article>
${sanitizedContent}
</article>`;
};