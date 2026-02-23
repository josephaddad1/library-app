import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { BookForm, type BookFormValues } from "@/components/admin/books/BookForm";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";

export default function AddBook() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(values: BookFormValues) {
    try {
      setSaving(true);
      const tags = values.tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean);

      await addDoc(collection(db, "books"), {
        title: values.title,
        author: values.author,
        isbn: values.isbn,
        description: values.description,
        coverUrl: values.coverUrl,
        categoryId: values.categoryId,
        tags,
        totalCopies: values.totalCopies,
        availableCopies: values.totalCopies,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({ title: "Book created" });
      navigate("/admin/books");
    } catch {
      toast({ title: "Save failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add Book</h1>
      <BookForm categories={categories} onSubmit={handleSubmit} submitLabel="Create Book" submitting={saving} />
    </div>
  );
}
