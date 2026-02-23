import { getFunctions, httpsCallable } from "firebase/functions";
import type { Book } from "@/types/models";

const functions = getFunctions();

export type GenerateBookDescriptionInput = {
  title: string;
  author: string;
  tags: string[];
};

export type GenerateBookDescriptionOutput = {
  description: string;
};

export const generateBookDescription = httpsCallable<
  GenerateBookDescriptionInput,
  GenerateBookDescriptionOutput
>(functions, "generateBookDescription");

export type GetBookRecommendationsInput = {
  bookId: string;
  title: string;
  author: string;
  tags: string[];
  categoryId: string;
};

export type RecommendationResult = {
  book: Pick<Book, "id" | "title" | "author" | "coverUrl" | "categoryId">;
  reason: string;
};

export type GetBookRecommendationsOutput = RecommendationResult[];

export const getBookRecommendations = httpsCallable<
  GetBookRecommendationsInput,
  GetBookRecommendationsOutput
>(functions, "getBookRecommendations");
