import {
  generateBookDescription as generateBookDescriptionDirect,
  type GenerateBookDescriptionInput,
} from "./ai/generateBookDescription";
import {
  getBookRecommendations as getBookRecommendationsDirect,
} from "./ai/getBookRecommendations";
import type { Book } from "@/types/models";

export type GenerateBookDescriptionOutput = {
  description: string;
};

export async function generateBookDescription(
  input: GenerateBookDescriptionInput,
): Promise<{ data: GenerateBookDescriptionOutput }> {
  const description = await generateBookDescriptionDirect(input);
  return { data: { description } };
}

export type GetBookRecommendationsInput = {
  bookId: string;
  title: string;
  author: string;
  tags: string[];
  categoryId: string;
};

export type RecommendationResult = {
  book: Book;
  reason: string;
};

export type GetBookRecommendationsOutput = RecommendationResult[];

export async function getBookRecommendations(
  input: GetBookRecommendationsInput,
): Promise<{ data: GetBookRecommendationsOutput }> {
  const recommendations = await getBookRecommendationsDirect(input);
  return { data: recommendations };
}
