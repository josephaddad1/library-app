import { useMemo, useState } from "react";
import { collection, deleteDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BooksTable } from "@/components/admin/books/BooksTable";
import { useBooks } from "@/hooks/useBooks";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import type { Book } from "@/types/models";

export default function ManageBooks() {
  const { books, loading } = useBooks();
  const { categories } = useCategories();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase();
    return books.filter((book) => {
      const matchesText = !term || book.title.toLowerCase().includes(term) || book.author.toLowerCase().includes(term);
      const matchesCategory = categoryId === "all" || book.categoryId === categoryId;
      return matchesText && matchesCategory;
    });
  }, [books, categoryId, search]);

  async function handleDeleteBook() {
    if (!bookToDelete) return;
    try {
      await deleteDoc(doc(collection(db, "books"), bookToDelete.id));
      toast({ title: "Book deleted" });
      setBookToDelete(null);
    } catch {
      toast({ title: "Delete failed", description: "Please try again.", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Manage Books</h1>
        <Button asChild><Link to="/admin/books/new">Add Book</Link></Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Library Catalog</CardTitle>
          <CardDescription>Search and filter books, then edit or delete.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Search by title or author" value={search} onChange={(event) => setSearch(event.target.value)} />
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Filter by category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {loading ? <p className="text-sm text-muted-foreground">Loading books...</p> : null}
          {!loading && filteredBooks.length === 0 ? <p className="text-sm text-muted-foreground">No books found.</p> : null}
          {filteredBooks.length > 0 ? <BooksTable books={filteredBooks} categories={categories} onDelete={setBookToDelete} /> : null}
        </CardContent>
      </Card>

      <Dialog open={Boolean(bookToDelete)} onOpenChange={(open) => !open && setBookToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Book</DialogTitle>
            <DialogDescription>
              Delete <strong>{bookToDelete?.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteBook}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
