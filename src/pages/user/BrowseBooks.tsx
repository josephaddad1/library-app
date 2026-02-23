import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBooks } from "@/hooks/useBooks";
import { useCategories } from "@/hooks/useCategories";

export default function BrowseBooks() {
  const { books, loading } = useBooks();
  const { categories } = useCategories();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase();
    return books.filter((book) => {
      const matchesSearch =
        !term ||
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.tags.some((tag) => tag.toLowerCase().includes(term));
      const matchesCategory = categoryId === "all" || book.categoryId === categoryId;
      return matchesSearch && matchesCategory;
    });
  }, [books, categoryId, search]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Browse Books</h1>
        <p className="text-muted-foreground">Search by title, author, tag, or category.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Input
          placeholder="Search books..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading books...</p> : null}
      {!loading && filteredBooks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No books found.</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="overflow-hidden">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="h-48 w-full object-cover" />
            ) : (
              <div className="h-48 w-full bg-muted" />
            )}
            <CardHeader className="space-y-2">
              <CardTitle className="line-clamp-1">{book.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{book.author}</p>
              <Badge variant="outline">{categoryMap.get(book.categoryId) ?? "Unknown"}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Available: <span className="font-medium">{book.availableCopies}</span> /{" "}
                {book.totalCopies}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to={`/user/books/${book.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
