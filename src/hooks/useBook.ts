import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Book } from "@/types/models";

export function useBook(bookId?: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookId) {
      setBook(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "books", bookId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setBook(null);
          setLoading(false);
          return;
        }

        const data = snapshot.data() as Omit<Book, "id">;
        setBook({ id: snapshot.id, ...data });
        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsubscribe;
  }, [bookId]);

  return { book, loading };
}
