import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Book } from "@/types/models";

type BookInfoCardProps = {
  book: Book;
};

export function BookInfoCard({ book }: BookInfoCardProps) {
  return (
    <Card>
      <CardContent className="grid gap-4 p-6 md:grid-cols-[180px_1fr]">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="h-64 w-full rounded-md object-cover" />
        ) : (
          <div className="h-64 w-full rounded-md bg-muted" />
        )}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">{book.title}</h1>
          <p className="text-muted-foreground">{book.author}</p>
          <Badge variant="outline">ISBN: {book.isbn}</Badge>
          <p className="text-sm">{book.description}</p>
          <p className="text-sm">
            Available: <span className="font-medium">{book.availableCopies}</span> / {book.totalCopies}
          </p>
          <div className="flex flex-wrap gap-2">
            {book.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
