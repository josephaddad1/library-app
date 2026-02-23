import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Category } from "@/types/models";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const categoriesQuery = query(collection(db, "categories"), orderBy("name"));

    const unsubscribe = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        const nextCategories = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() as Omit<Category, "id">;
          return { id: docSnapshot.id, ...data };
        });
        setCategories(nextCategories);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsubscribe;
  }, []);

  return { categories, loading };
}
