/**
 * Quiz Generation Prompts
 * Generates structured quiz questions from content
 */

/**
 * Build the quiz generation prompt
 * @param {string} content - Source content to generate questions from
 * @param {object} options - Quiz configuration options
 * @param {number} options.questionCount - Number of questions to generate
 * @param {string[]} options.types - Question types: mcq, true_false, fill_blank, short_answer
 * @param {string} options.difficulty - Difficulty level: easy, medium, hard
 * @param {string} [options.focusAreas] - Optional focus areas
 * @returns {string} The formatted prompt
 */
export const getQuizPrompt = (content, options = {}) => {
  const {
    questionCount = 10,
    types = ['mcq', 'true_false', 'fill_blank'],
    difficulty = 'medium',
    focusAreas = 'all key concepts',
  } = options;

  const typeDescriptions = {
    mcq: 'Multiple Choice (4 options A-D, one correct answer)',
    true_false: 'True/False (statement that is clearly true or false)',
    fill_blank: 'Fill in the Blank (sentence with one key term removed, shown as ___)',
    short_answer: 'Short Answer (question requiring a brief 1-2 sentence response)',
  };

  const selectedTypeDescriptions = types
    .map((t) => `- ${typeDescriptions[t] || t}`)
    .join('\n');

  const difficultyGuide = {
    easy: 'Focus on basic recall, definitions, and fundamental concepts. Questions should test recognition and basic understanding.',
    medium: 'Mix of recall and application. Include questions that require understanding relationships between concepts and applying knowledge.',
    hard: 'Focus on analysis, synthesis, and evaluation. Include questions that require deep understanding, edge cases, and connecting multiple concepts.',
  };

  return `You are an expert educator creating a quiz to test understanding of the following content.

Content to quiz on:
---
${content}
---

Requirements:
- Generate exactly ${questionCount} questions
- Difficulty: ${difficulty} — ${difficultyGuide[difficulty] || difficultyGuide.medium}
- Focus areas: ${focusAreas}
- Distribute questions across these types:
${selectedTypeDescriptions}
- Try to distribute question types roughly equally among the selected types
- Each question should test a different concept or aspect of the content
- Questions should be clear, unambiguous, and have definitively correct answers
- For MCQ: all distractors should be plausible but clearly wrong
- For True/False: avoid tricky wording; the statement should be clearly true or false
- For Fill in the Blank: the blank should replace a key term, not a trivial word
- For Short Answer: provide a sample answer and 2-3 key points that a correct answer should contain

You MUST respond with valid JSON only. No markdown, no code blocks, no extra text.

Response format:
{
  "title": "Quiz: [Brief Topic Description]",
  "description": "A short description of what this quiz covers",
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "What is...?",
      "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
      "correctAnswer": "B",
      "explanation": "Brief explanation of why B is correct",
      "concept": "The concept being tested"
    },
    {
      "id": 2,
      "type": "true_false",
      "question": "Statement that is true or false.",
      "correctAnswer": true,
      "explanation": "Why this is true/false",
      "concept": "The concept being tested"
    },
    {
      "id": 3,
      "type": "fill_blank",
      "question": "The process of ___ converts glucose into energy.",
      "correctAnswer": "cellular respiration",
      "explanation": "Explanation of the answer",
      "concept": "The concept being tested"
    },
    {
      "id": 4,
      "type": "short_answer",
      "question": "Explain briefly...",
      "sampleAnswer": "A complete sample answer",
      "keyPoints": ["key point 1", "key point 2"],
      "explanation": "What a good answer should include",
      "concept": "The concept being tested"
    }
  ]
}`;
};

/**
 * Build prompt for regenerating specific questions
 * @param {string} content - Original source content
 * @param {object} existingQuestion - The question to regenerate
 * @param {string} difficulty - Difficulty level
 * @returns {string} The formatted prompt
 */
export const getRegenerateQuestionPrompt = (content, existingQuestion, difficulty = 'medium') => {
  // Validate existingQuestion
  if (!existingQuestion || typeof existingQuestion !== 'object' || existingQuestion === null) {
    throw new TypeError('existingQuestion is required and must be a non-null object');
  }
  
  if (!existingQuestion.type || !existingQuestion.id) {
    throw new TypeError('existingQuestion must include type and id properties');
  }

  const questionType = existingQuestion.type;
  const questionId = existingQuestion.id;

  return `You are an expert educator. Regenerate a new version of the following quiz question based on the source content.

Source content:
---
${content}
---

Original question to replace:
${JSON.stringify(existingQuestion, null, 2)}

Requirements:
- Keep the same question type: ${questionType}
- Keep the same id: ${questionId}
- Difficulty: ${difficulty}
- Test a DIFFERENT aspect or concept from the content than the original
- Follow the same JSON structure as the original

You MUST respond with valid JSON only. No markdown, no code blocks, no extra text.
Return ONLY the single question object (not wrapped in an array or outer object).`;
};

export default { getQuizPrompt, getRegenerateQuestionPrompt };
