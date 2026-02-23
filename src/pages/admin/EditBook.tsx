import { useMemo, useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { BookForm, type BookFormValues } from "@/components/admin/books/BookForm";
import { useBook } from "@/hooks/useBook";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";

export default function EditBook() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { book, loading } = useBook(id);
  const { categories } = useCategories();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const initialValues = useMemo(() => {
    if (!book) return undefined;
    return {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      categoryId: book.categoryId,
      tagsInput: book.tags.join(", "),
      totalCopies: book.totalCopies,
      coverUrl: book.coverUrl ?? "",
      description: book.description,
    };
  }, [book]);

  async function handleSubmit(values: BookFormValues) {
    if (!id || !book) return;

    try {
      setSaving(true);
      const tags = values.tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean);
      const availableAdjustment = values.totalCopies - book.totalCopies;

      await updateDoc(doc(db, "books", id), {
        title: values.title,
        author: values.author,
        isbn: values.isbn,
        description: values.description,
        coverUrl: values.coverUrl,
        categoryId: values.categoryId,
        tags,
        totalCopies: values.totalCopies,
        availableCopies: Math.max(0, book.availableCopies + availableAdjustment),
        updatedAt: serverTimestamp(),
      });

      toast({ title: "Book updated" });
      navigate("/admin/books");
    } catch {
      toast({ title: "Update failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading book...</p>;
  if (!book) return <p className="text-destructive">Book not found.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Book</h1>
      <BookForm
        categories={categories}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        submitting={saving}
      />
    </div>
  );
}
