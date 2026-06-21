export const getMermaidPrompt = (topic) => `
Generate a Mermaid.js diagram for: "${topic}"

Choose the most appropriate diagram type:
- flowchart (for processes, algorithms)
- sequenceDiagram (for interactions)
- classDiagram (for OOP structures)
- stateDiagram-v2 (for state machines)
- erDiagram (for data models)
- mindmap (for concept hierarchies)
- graph (for networks/topologies)

STRICT RULES (mermaid v11):
- Do NOT use double quotes anywhere — use single quotes instead (e.g. |Clicks 'Login'| not |Clicks "Login"|)
- Do NOT wrap subgraph names in quotes
- Edge labels must use pipe syntax: -->|label text| not -->["label"]
- Return ONLY valid Mermaid syntax. No markdown code blocks, no fences, no extra text.
`;

export const getImagePrompt = (topic) => `
Create a clean, professional, educational diagram of: "${topic}"

Specifications:
- Dimensions: 1024x1024 pixels
- Format: PNG
- Style: Technical illustration, white background, clear text labels
- High contrast, suitable for textbooks and academic papers
- Text labels: clear, legible, no garbled text
- No watermarks

Subject focus: Educational visualization, comprehensive and accurate.
`;
