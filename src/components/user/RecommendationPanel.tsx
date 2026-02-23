import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RecommendationBook = {
  id: string;
  title: string;
  author: string;
};

export type Recommendation = {
  book: RecommendationBook;
  reason: string;
};

type RecommendationPanelProps = {
  loading: boolean;
  items: Recommendation[];
};

export function RecommendationPanel({ loading, items }: RecommendationPanelProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <Card key={index}>
            <CardContent className="space-y-2 pt-6">
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No recommendations available yet.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.book.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{item.book.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{item.book.author}</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{item.reason}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
