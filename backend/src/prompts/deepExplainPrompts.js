/**
 * Deep Explain Prompts
 * Three modes: EASY, INTUITIVE, DEEP
 */

export const getDeepExplainPrompt = (topic, mode, sourceContent = null) => {
  const baseContext = sourceContent 
    ? `\n\nContext provided:\n${sourceContent}\n\nUse this context to enhance your explanation if relevant.`
    : '';

  const prompts = {
    easy: `Explain "${topic}" as if teaching a curious 15-year-old. Use analogies and everyday examples.${baseContext}

Structure your response EXACTLY as Markdown:

## ${topic}

### TL;DR
[One sentence summary]

### The Simple Version
[Use analogies, everyday examples, visual metaphors. No jargon. Explain like you're chatting with a friend.]

### How It Actually Works
[Step-by-step breakdown with simple language. Use numbered lists or bullet points.]

### Real-World Example
[Concrete, relatable example they'd encounter in daily life or popular culture]

### Key Takeaways
- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]

### Common Misconceptions
- ❌ **[Wrong belief]** → ✅ **[Reality]**
- ❌ **[Wrong belief]** → ✅ **[Reality]**

### Want to Go Deeper?
[List 3-4 related topics to explore next]

Use **bold** for key terms, *italics* for emphasis. Keep paragraphs short (2-3 sentences max).`,

    intuitive: `Explain "${topic}" focusing on first principles and building intuition. Help them understand WHY things work this way.${baseContext}

Structure your response EXACTLY as Markdown:

## ${topic}

### The Core Idea
[What is this really about? Strip away complexity to the fundamental concept.]

### Why Does It Exist?
[What problem does it solve? What was the historical motivation or pain point that led to its creation?]

### Building Block by Block
[Derive the concept from fundamentals. Show WHY each step follows logically. Use numbered steps:]

1. **[Foundation]** - [Explain the base principle]
2. **[Next Layer]** - [How this builds on the foundation]
3. **[Connection]** - [How things connect and why]

### The "Aha!" Insight
[The key insight or mental model that makes everything click. The moment of clarity.]

### Mathematical Framework (if applicable)
[If there are formulas, present them with LaTeX and explain what each term means intuitively]

$$
[Formula here]
$$

Where:
- [Variable 1] = [intuitive explanation]
- [Variable 2] = [intuitive explanation]

### Connections
[How this concept relates to other ideas. Draw connections that build understanding:]
- **[Related Concept 1]** - [How they're connected]
- **[Related Concept 2]** - [How they're connected]

### Edge Cases & Nuances
[When does this break down? What are the limits? What subtle points do people often miss?]`,

    deep: `Provide an expert-level, comprehensive explanation of "${topic}". Target audience: advanced students or professionals.${baseContext}

Structure your response EXACTLY as Markdown:

## ${topic}

### Formal Definition
[Rigorous definition with proper terminology and notation. Be precise.]

### Historical Context
[Origin story, key contributors, evolution of the concept over time]

### Theoretical Foundation
[Detailed theoretical framework. Include:]

**Axioms/Principles:**
- [Foundational principle 1]
- [Foundational principle 2]

**Mathematical Formulation:**
[For STEM topics, include full mathematical treatment with LaTeX]

$$
[Key equation or framework]
$$

**Derivation:**
[Show key derivations or proofs step-by-step]

### Detailed Analysis
[In-depth exploration of all major aspects. Break into subsections as needed:]

#### Aspect 1
[Detailed explanation]

#### Aspect 2  
[Detailed explanation]

### Applications & Examples
[Real-world applications with specific, technical examples]

1. **[Application 1]** - [Detailed technical description]
2. **[Application 2]** - [Detailed technical description]

### Current Research & Open Problems
[Latest developments in the field, ongoing research, unsolved questions]

### Common Pitfalls
[Subtle errors even experts make. Technical gotchas.]
- ⚠️ **[Pitfall 1]** - [Why it's wrong and how to avoid it]
- ⚠️ **[Pitfall 2]** - [Why it's wrong and how to avoid it]

### Further Reading
[Key papers, textbooks, or resources for deeper study]
- [Resource 1]
- [Resource 2]
- [Resource 3]

Use LaTeX for all mathematical notation: $inline$ and $$display$$`,
  };

  return prompts[mode] || prompts.easy;
};

export const getFollowUpPrompt = (originalTopic, originalMode, chatHistory, userQuestion) => {
  return `You are continuing a deep explanation session about "${originalTopic}" in ${originalMode.toUpperCase()} mode.

Previous explanation context:
${chatHistory.slice(-2).map(msg => `${msg.role}: ${msg.content.substring(0, 500)}`).join('\n\n')}

User's follow-up question: "${userQuestion}"

Provide a focused answer to this specific question while maintaining the same ${originalMode} level of complexity and style. Use Markdown formatting with LaTeX for math ($inline$ and $$display$$).

Keep your response concise but thorough (200-500 words unless the question requires more depth).`;
};
