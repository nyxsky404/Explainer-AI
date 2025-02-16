/**
 * Notes Generation Prompts
 * Generates structured handwritten-style notes from content
 */

/**
 * Build the notes generation prompt
 * @param {string} content - Source content to generate notes from
 * @param {object} options - Notes configuration options
 * @param {string} options.style - Note style: cornell, outline, flow, bullet
 * @param {number} options.pages - Number of pages worth of content (1-5)
 * @returns {string} The formatted prompt
 */
export const getNotesPrompt = (content, options = {}) => {
  const {
    style = 'outline',
    pages = 2,
  } = options;

  const styleInstructions = {
    cornell: `Cornell Method Style:
- Create a two-column layout structure
- Left column (Cue Column): Key questions, terms, prompts (30% width)
- Right column (Notes Column): Detailed notes, explanations (70% width)
- Bottom section: Summary of the entire page
- Use clear headings for each topic
- Include margin notes for important insights`,

    outline: `Outline Style:
- Use hierarchical structure with clear indentation
- Main topics as H1 (# Topic)
- Subtopics as H2 (## Subtopic)
- Details as bullet points with proper nesting
- Use numbered lists for sequential information
- Include margin notes for key insights`,

    flow: `Flow Notes Style:
- Create connected concepts with relationship indicators
- Use arrows (→, ←, ↔) to show relationships
- Circle or box key terms
- Draw connections between related ideas
- Use visual hierarchy (larger text for main concepts)
- Include margin notes for connections and insights`,

    bullet: `Bullet Journal Style:
- Clean, organized bullet points
- Use signifiers: • for tasks, ○ for events, - for notes
- Include key symbols: ! for important, * for priority
- Short, concise statements
- Group related items under headings
- Include margin notes for context`,
  };

  return `You are an expert note-taker creating concise, well-structured handwritten-style notes.

Content to create notes from:
---
${content}
---

Requirements:
- Style: ${style} — ${styleInstructions[style] || styleInstructions.outline}
- Length: Approximately ${pages} page${pages > 1 ? 's' : ''} worth of content
- Include: key formulas, definitions, important relationships
- Use natural note-taking conventions:
  - Arrows (→) for cause/effect or progression
  - Underlines for emphasis
  - Circles/boxes around key terms
  - Abbreviations: "w/" for "with", "b/c" for "because", "e.g." for "for example"
- Include margin annotations where helpful (mark these clearly)
- Extract and highlight any formulas or equations
- Identify high-importance vs medium-importance content

You MUST respond with valid JSON only. No markdown, no code blocks, no extra text.

Response format:
{
  "title": "Topic Title",
  "sections": [
    {
      "heading": "Section Name",
      "content": "Note content with markdown formatting. Use **bold** for emphasis, *italic* for terms, \`code\` for formulas. Include natural note-taking symbols like → and abbreviations.",
      "marginNote": "Optional key insight or reminder",
      "importance": "high"
    },
    {
      "heading": "Another Section",
      "content": "More notes...",
      "importance": "medium"
    }
  ],
  "quickReview": [
    "Key point 1 - brief summary",
    "Key point 2 - brief summary",
    "Key point 3 - brief summary"
  ],
  "formulas": [
    "E = mc²",
    "F = ma"
  ]
}

Notes:
- Each section should be substantial but concise
- Use markdown formatting within content
- Margin notes should be brief insights or reminders
- Quick review should capture the essence in 3-5 points
- Formulas array can be empty if no formulas present
- Importance levels: "high", "medium", "low"`;
};

/**
 * Build prompt for updating note sections
 * @param {string} originalContent - Original source content
 * @param {object} existingNote - The note to update
 * @param {string} updateInstructions - What to update
 * @returns {string} The formatted prompt
 */
export const getUpdateNotePrompt = (originalContent, existingNote, updateInstructions) => {
  return `You are an expert note-taker updating existing notes based on new instructions.

Original source content:
---
${originalContent}
---

Current note structure:
${JSON.stringify(existingNote, null, 2)}

Update instructions:
${updateInstructions}

Requirements:
- Maintain the same note style: ${existingNote.style}
- Keep the overall structure unless specifically asked to change it
- Apply the requested updates while preserving other content
- Ensure consistency with the original note-taking conventions

You MUST respond with valid JSON only. No markdown, no code blocks, no extra text.
Return the complete updated note structure in the same format as the original.`;
};

export default { getNotesPrompt, getUpdateNotePrompt };
