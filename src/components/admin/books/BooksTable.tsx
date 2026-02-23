import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Book, Category } from "@/types/models";

type BooksTableProps = {
  books: Book[];
  categories: Category[];
  onDelete: (book: Book) => void;
};

export function BooksTable({ books, categories, onDelete }: BooksTableProps) {
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cover</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Copies</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {books.map((book) => (
          <TableRow key={book.id}>
            <TableCell>
              {book.coverUrl ? <img src={book.coverUrl} alt={book.title} className="h-12 w-8 rounded object-cover" /> : <div className="h-12 w-8 rounded bg-muted" />}
            </TableCell>
            <TableCell className="font-medium">{book.title}</TableCell>
            <TableCell>{book.author}</TableCell>
            <TableCell>
              <Badge variant="outline">{categoryMap.get(book.categoryId) ?? "Unknown"}</Badge>
            </TableCell>
            <TableCell>{book.availableCopies}/{book.totalCopies}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/admin/books/${book.id}/edit`}><Pencil className="mr-2 h-4 w-4" />Edit</Link>
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(book)}>
                  <Trash2 className="mr-2 h-4 w-4" />Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
