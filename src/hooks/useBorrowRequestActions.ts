import { useState } from "react";
import { Timestamp, doc, runTransaction, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import type { BorrowRequest } from "@/types/models";

export function useBorrowRequestActions() {
  const { toast } = useToast();
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  async function approveRequest(request: BorrowRequest, dueDate: Date) {
    setLoadingActionId(request.id);
    try {
      await runTransaction(db, async (tx) => {
        const requestRef = doc(db, "borrowRequests", request.id);
        const bookRef = doc(db, "books", request.bookId);

        const [requestSnapshot, bookSnapshot] = await Promise.all([
          tx.get(requestRef),
          tx.get(bookRef),
        ]);

        if (!requestSnapshot.exists() || !bookSnapshot.exists()) {
          throw new Error("Missing request or book document");
        }

        const requestData = requestSnapshot.data() as BorrowRequest;
        if (requestData.status !== "pending") {
          throw new Error("Request is no longer pending");
        }

        const bookData = bookSnapshot.data() as { availableCopies: number };
        if (bookData.availableCopies <= 0) {
          throw new Error("No available copies left");
        }

        tx.update(requestRef, {
          status: "approved",
          approvedAt: Timestamp.now(),
          dueDate: Timestamp.fromDate(dueDate),
        });

        tx.update(bookRef, {
          availableCopies: bookData.availableCopies - 1,
          updatedAt: Timestamp.now(),
        });
      });

      toast({ title: "Request approved" });
      return true;
    } catch (error) {
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoadingActionId(null);
    }
  }

  async function rejectRequest(requestId: string) {
    setLoadingActionId(requestId);
    try {
      await updateDoc(doc(db, "borrowRequests", requestId), {
        status: "rejected",
        approvedAt: null,
        dueDate: null,
      });
      toast({ title: "Request rejected" });
    } catch {
      toast({ title: "Reject failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoadingActionId(null);
    }
  }

  async function markReturned(requestId: string) {
    setLoadingActionId(requestId);
    try {
      await runTransaction(db, async (tx) => {
        const requestRef = doc(db, "borrowRequests", requestId);
        const requestSnapshot = await tx.get(requestRef);

        if (!requestSnapshot.exists()) {
          throw new Error("Request not found");
        }

        const requestData = requestSnapshot.data() as BorrowRequest;
        if (requestData.status !== "approved") {
          throw new Error("Request is not approved");
        }

        const bookRef = doc(db, "books", requestData.bookId);
        const bookSnapshot = await tx.get(bookRef);

        if (!bookSnapshot.exists()) {
          throw new Error("Book not found");
        }

        const bookData = bookSnapshot.data() as { availableCopies: number };

        tx.update(requestRef, {
          status: "returned",
          returnedAt: Timestamp.now(),
        });

        tx.update(bookRef, {
          availableCopies: bookData.availableCopies + 1,
          updatedAt: Timestamp.now(),
        });
      });

      toast({ title: "Book marked as returned" });
    } catch (error) {
      toast({
        title: "Return failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingActionId(null);
    }
  }

  return { loadingActionId, approveRequest, rejectRequest, markReturned };
}
