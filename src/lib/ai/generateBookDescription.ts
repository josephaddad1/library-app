import { model } from "@/lib/gemini";

export type GenerateBookDescriptionInput = {
  title: string;
  author: string;
  tags: string[];
};

export async function generateBookDescription({
  title,
  author,
  tags,
}: GenerateBookDescriptionInput): Promise<string> {
  const prompt = `You are a librarian writing catalog descriptions for a digital library system.

Book title: "${title}"
Author: ${author}
Themes/Tags: ${tags.join(", ")}

Write a compelling 3-sentence description for this book.
Requirements:
- First sentence: introduce the book's premise or subject.
- Second sentence: highlight what makes it notable or unique.
- Third sentence: indicate who would enjoy this book.
- Tone: informative and neutral, suitable for a library catalog.
- Do NOT include the title or author name in the description.
- Return ONLY the description text, no extra formatting.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
