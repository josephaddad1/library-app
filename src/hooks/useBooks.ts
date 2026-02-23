import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Book } from "@/types/models";

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const booksQuery = query(collection(db, "books"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      booksQuery,
      (snapshot) => {
        const nextBooks = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() as Omit<Book, "id">;
          return { id: docSnapshot.id, ...data };
        });
        setBooks(nextBooks);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsubscribe;
  }, []);

  return { books, loading };
}
