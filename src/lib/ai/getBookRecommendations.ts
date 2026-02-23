import {
  collection,
  getDocs,
  limit,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { model } from "@/lib/gemini";
import type { Book } from "@/types/models";

type RecommendationResponseItem = {
  bookId: string;
  reason: string;
};

export type BookRecommendation = {
  book: Book;
  reason: string;
};

type CandidateBook = Book & { categoryName: string };

type BookLikeInput =
  & Pick<Book, "title" | "author" | "tags" | "categoryId">
  & {
    id?: string;
    bookId?: string;
  };

function cleanJsonResponse(rawText: string): string {
  return rawText.replace(/```json\s*|```/gi, "").trim();
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value).split(" ").filter(Boolean);
}

function buildConceptSet(book: {
  title?: string;
  author?: string;
  tags?: string[];
  categoryName?: string;
}): Set<string> {
  const concepts = new Set<string>();
  const add = (text: string) => tokenize(text).forEach((token) => concepts.add(token));

  add(book.title ?? "");
  add(book.author ?? "");
  add(book.categoryName ?? "");
  for (const tag of book.tags ?? []) add(tag);

  // Normalize common genre aliases.
  if (
    concepts.has("sci-fi") ||
    (concepts.has("sci") && concepts.has("fi")) ||
    (concepts.has("science") && concepts.has("fiction")) ||
    concepts.has("speculative")
  ) {
    concepts.add("science");
    concepts.add("fiction");
    concepts.add("scifi");
  }

  if (concepts.has("fiction") || concepts.has("classic")) {
    concepts.add("literary");
  }

  return concepts;
}

function overlapCount(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const value of a) {
    if (b.has(value)) count += 1;
  }
  return count;
}

function toBook(candidate: CandidateBook): Book {
  const { categoryName: _categoryName, ...book } = candidate;
  return book;
}

async function fetchCandidates(currentBook: BookLikeInput): Promise<CandidateBook[]> {
  const booksRef = collection(db, "books");
  const categoriesRef = collection(db, "categories");
  const currentBookId = currentBook.id ?? currentBook.bookId;
  const [categoriesSnapshot, booksSnapshot] = await Promise.all([
    getDocs(categoriesRef),
    getDocs(query(booksRef, limit(200))),
  ]);

  const categoryNamesById = new Map<string, string>();
  for (const categoryDoc of categoriesSnapshot.docs) {
    const data = categoryDoc.data() as { name?: string };
    categoryNamesById.set(categoryDoc.id, data.name?.trim() || "Unknown");
  }

  const currentConcepts = buildConceptSet({
    title: currentBook.title,
    author: currentBook.author,
    tags: currentBook.tags,
    categoryName: categoryNamesById.get(currentBook.categoryId) ?? "",
  });

  const scoredCandidates: Array<{ score: number; book: CandidateBook }> = [];

  for (const docSnap of booksSnapshot.docs) {
    const book = docSnap.data() as Book;
    const bookWithId = { ...book, id: docSnap.id };
    if (bookWithId.id === currentBookId) continue;

    const categoryName = categoryNamesById.get(bookWithId.categoryId) ?? "Unknown";
    const candidateConcepts = buildConceptSet({
      title: bookWithId.title,
      author: bookWithId.author,
      tags: bookWithId.tags,
      categoryName,
    });

    let score = 0;
    if (bookWithId.categoryId === currentBook.categoryId) score += 10;
    score += overlapCount(currentConcepts, candidateConcepts) * 2;

    // Lightweight lexical match boost.
    if (normalizeText(bookWithId.title).includes(normalizeText(currentBook.title))) score += 1;
    if (normalizeText(currentBook.title).includes(normalizeText(bookWithId.title))) score += 1;

    // Preserve broad diversity but prioritize related books.
    if (score > 0) {
      scoredCandidates.push({
        score,
        book: { ...bookWithId, categoryName },
      });
    }
  }

  scoredCandidates.sort((a, b) => b.score - a.score);
  return scoredCandidates.slice(0, 30).map((item) => item.book);
}

export async function getBookRecommendations(
  currentBook: BookLikeInput,
): Promise<BookRecommendation[]> {
  const candidates = await fetchCandidates(currentBook);

  if (candidates.length === 0) {
    return [];
  }

  const candidateList = candidates.map((book) => ({
    bookId: book.id,
    title: book.title,
    author: book.author,
    tags: book.tags,
    categoryId: book.categoryId,
    categoryName: book.categoryName,
    description: book.description,
  }));

  const currentBookId = currentBook.id ?? currentBook.bookId;

  const prompt = `You are a library recommendation engine.

Target book:
- title: "${currentBook.title}"
- author: "${currentBook.author}"
- tags: [${currentBook.tags.join(", ")}]
- categoryId: "${currentBook.categoryId}"

Task:
1) Evaluate ONLY the books in the Candidates array.
2) Rank candidates by overall relevance to the target book using this weighted rubric:
   - 45% theme/topic similarity (tags + description + title cues)
   - 25% category/genre proximity (treat related labels as close: fiction/classic fiction/speculative fiction and sci-fi/science fiction/speculative)
   - 20% audience/tone similarity
   - 10% author/style proximity (if inferable from metadata)
3) Choose exactly 3 recommendations with the highest relevance.
4) For each result, write one concise sentence explaining the match using concrete metadata (tags/category/title/description clues).

Hard constraints:
- Use only bookIds that exist in Candidates.
- Do not recommend the target book itself.
- Do not base choices on borrowing history or popularity assumptions.
- Keep reasons specific and non-generic.

Candidates:
${JSON.stringify(candidateList, null, 2)}

Respond with ONLY valid JSON (no markdown, no code fences):
[
  { "bookId": "...", "reason": "..." },
  { "bookId": "...", "reason": "..." },
  { "bookId": "...", "reason": "..." }
]`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(cleanJsonResponse(responseText)) as RecommendationResponseItem[];

    const candidateMap = new Map(candidates.map((book) => [book.id, book] as const));

    return parsed
      .map((item) => {
        const matchedBook = candidateMap.get(item.bookId);
        if (!matchedBook) return null;
        if (matchedBook.id === currentBookId) return null;
        return {
          book: toBook(matchedBook),
          reason: item.reason,
        };
      })
      .filter((item) => item !== null);
  } catch (error) {
    console.error("Failed to parse Gemini recommendations response", error);
    return candidates.slice(0, 3).map((book) => ({
      book: toBook(book),
      reason: "Related by category and theme overlap.",
    }));
  }
}
