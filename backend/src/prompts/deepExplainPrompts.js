/**
 * Deep Explain Prompts
 * Three modes: EASY, INTUITIVE, DEEP
 */

/**
 * Shared formatting rules prepended to every deep-explain prompt.
 * Keeping them in one place makes them easy to maintain and impossible to miss.
 */
const FORMATTING_RULES = `
---
STRICT FORMATTING RULES (follow exactly, no exceptions):

1. MARKDOWN HEADINGS — use proper heading levels, never plain text for section titles:
   - # H1  → main topic title only (once, at the top)
   - ## H2 → major sections
   - ### H3 → subsections
   - #### H4 → fine-grained subpoints if needed
   Never write a section title as plain bold text like **Section Name** — always use the # syntax.

2. MATH NOTATION — use KaTeX-compatible LaTeX only:
   - Inline math  →  $...$          e.g. $E = mc^2$
   - Display math →  $$...$$        e.g. $$ S = k_{\\mathrm{B}} \\ln \\Omega $$
   NEVER use \\[...\\], \\(...\\), or [ ... ] for math — they will not render.
   Every formula must be on its own line and wrapped in $$ $$.

3. SPACING — add a blank line between every paragraph and every heading. No walls of text.

4. BOLD / ITALIC — use **bold** for key terms on first mention, *italics* for subtle emphasis only.

5. LISTS — prefer tight bullet lists (–) or numbered lists; indent sub-items with two spaces.
---
`;

export const getDeepExplainPrompt = (topic, mode, sourceContent = null) => {
  const baseContext = sourceContent
    ? `\n\nContext provided:\n${sourceContent}\n\nUse this context to enhance your explanation if relevant.`
    : '';

  const prompts = {
    easy: `Explain "${topic}" as if teaching a curious 15-year-old. Use analogies and everyday examples.${baseContext}
${FORMATTING_RULES}
Structure your response EXACTLY as Markdown:

# ${topic}

### TL;DR
One sentence summary.

### The Simple Version
Use analogies, everyday examples, visual metaphors. No jargon.
Explain like you're chatting with a friend. Keep paragraphs to 2–3 sentences.

### How It Actually Works
Step-by-step breakdown with simple language. Use a numbered list:

1. **Step one** – explanation
2. **Step two** – explanation
3. **Step three** – explanation

### Real-World Example
Concrete, relatable example from daily life or popular culture.

### Key Takeaways
- Point one
- Point two
- Point three

### Common Misconceptions
- ❌ **Wrong belief** → ✅ **What's actually true**
- ❌ **Wrong belief** → ✅ **What's actually true**

### Want to Go Deeper?
List 3–4 related topics to explore next.`,

    intuitive: `Explain "${topic}" from first principles — build genuine intuition by showing WHY things work, not just what they are.${baseContext}
${FORMATTING_RULES}
Structure your response EXACTLY as Markdown:

# ${topic}

## The Core Idea
What is this really about? Strip away complexity to the single fundamental concept.

## Why Does It Exist?
What problem does it solve? What historical tension or pain point led to its creation?

## Building Block by Block
Derive the concept from fundamentals. Show WHY each step follows logically:

1. **Foundation** – the base principle and why it must be true
2. **Next layer** – how this follows from the foundation
3. **The connection** – how the pieces lock together

## The "Aha!" Insight
The key mental model that makes everything click. The moment of clarity.
What do people usually get wrong before they understand it?

## Mathematical Framework
*Include only if the topic has meaningful math; skip this section otherwise.*

Walk through the key formula(s) with full KaTeX display math:

$$
S = k_{\\mathrm{B}} \\ln \\Omega
$$

Then explain each symbol intuitively — not just what it means, but why that quantity matters:

- $S$ — entropy; measures how many ways a system could be arranged
- $k_{\\mathrm{B}}$ — Boltzmann constant; converts "number of arrangements" into energy units
- $\\Omega$ — the count of microscopic configurations compatible with what you observe

If there is more than one formula, show them one at a time with an explanation after each.

## Connections
How this concept relates to other ideas — draw links that deepen understanding:

- **Related concept 1** – how they're connected and why that's surprising
- **Related concept 2** – how they're connected

## Edge Cases & Nuances
When does this break down? What are the limits? What subtle points do people often miss?`,

    deep: `Provide an expert-level, comprehensive explanation of "${topic}". Target audience: advanced students or professionals who want depth, not simplification.${baseContext}
${FORMATTING_RULES}
Structure your response EXACTLY as Markdown:

# ${topic}

## Formal Definition
Rigorous definition with precise terminology and notation.

## Historical Context
Origin story, key contributors, evolution of the concept — what changed and when.

## Theoretical Foundation

### Axioms & Principles
The non-negotiable starting points everything else rests on:

- **Principle 1** – statement and why it's taken as given
- **Principle 2** – statement and why it's taken as given

### Mathematical Formulation
Full treatment with display math. Introduce each formula, then derive or explain it:

$$
[central equation]
$$

Where:
- $[var]$ — precise definition
- $[var]$ — precise definition

Show key derivations step by step. Use $$...$$ for every standalone equation.

### Derivation
Walk through the derivation of the central result, one logical step at a time.
Each non-obvious step should have a one-sentence justification.

## Detailed Analysis

### Aspect 1
Deep dive into the first major dimension of the topic.

### Aspect 2
Deep dive into the second major dimension.

*Add more ### subsections as needed.*

## Applications & Examples
Concrete, technical applications with enough detail to be useful:

1. **Application 1** – what it does, why this theory is the right tool, real numbers if possible
2. **Application 2** – same structure

## Current Research & Open Problems
Active frontiers: what is still unknown, disputed, or being actively worked on.

## Common Pitfalls
Subtle errors even experts make — not beginner mistakes:

- ⚠️ **Pitfall 1** – what goes wrong and the correct way to think about it
- ⚠️ **Pitfall 2** – same structure

## Further Reading
Key papers, textbooks, or primary sources — with a one-line reason to read each:

- *[Resource 1]* — why it matters
- *[Resource 2]* — why it matters`,
  };

  return prompts[mode] || prompts.easy;
};

export const getFollowUpPrompt = (originalTopic, originalMode, chatHistory, userQuestion) => {
  const mode = (originalMode || 'default').toUpperCase();
  const history = Array.isArray(chatHistory) ? chatHistory : [];
  const question = String(userQuestion || '');
  const recentHistory = history.slice(-2).map((msg) => {
    const role = String(msg?.role || 'unknown');
    const content = typeof msg?.content === 'string' ? msg.content.substring(0, 500) : '';
    return `${role}: ${content}`;
  }).join('\n\n');

  return `You are continuing a deep explanation session about "${originalTopic}" in ${mode} mode.

Previous explanation context:
${recentHistory}

User's follow-up question: "${question}"

Provide a focused answer. Match the depth and style of the original ${(originalMode || 'default')} explanation.

STRICT FORMATTING RULES:
- Use ## / ### headings for any sub-sections (never plain bold text as a heading)
- Inline math: $...$   |   Display math: $$...$$ on its own line
- NEVER use \\[...\\] or [ ... ] for math
- Blank line between every paragraph and heading
- Bold (**) for key terms, italics (*) for light emphasis only

Length: 200–500 words unless the question genuinely requires more depth.`;
};
