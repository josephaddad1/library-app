import type { Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "user";
export type BorrowStatus = "pending" | "approved" | "rejected" | "returned";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  disabled: boolean;
  expiresAt?: Timestamp | null;
  createdAt: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  createdAt: Timestamp;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description: string;
  coverUrl?: string;
  categoryId: string;
  tags: string[];
  totalCopies: number;
  availableCopies: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BorrowRequest {
  id: string;
  userId: string;
  userName: string;
  bookId: string;
  bookTitle: string;
  status: BorrowStatus;
  requestedAt: Timestamp;
  approvedAt: Timestamp | null;
  dueDate: Timestamp | null;
  returnedAt: Timestamp | null;
}
