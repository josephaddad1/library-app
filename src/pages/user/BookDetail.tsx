import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookInfoCard } from "@/components/user/BookInfoCard";
import { BorrowSection } from "@/components/user/BorrowSection";
import {
  RecommendationPanel,
  type Recommendation,
} from "@/components/user/RecommendationPanel";
import { useAuth } from "@/context/AuthContext";
import { useBook } from "@/hooks/useBook";
import { useBorrowRequests } from "@/hooks/useBorrowRequests";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { db } from "@/lib/firebase";
import { getBookRecommendations } from "@/lib/functions";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { book, loading } = useBook(id);
  const { borrowRequests } = useBorrowRequests();
  const { toast } = useToast();
  const [requesting, setRequesting] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  const activeRequest = useMemo(
    () =>
      borrowRequests.find(
        (request) =>
          request.bookId === id &&
          (request.status === "pending" || request.status === "approved"),
      ),
    [borrowRequests, id],
  );

  useEffect(() => {
    async function fetchRecommendations() {
      if (!book) return;

      try {
        setRecommendationsLoading(true);
        const result = await getBookRecommendations({
          bookId: book.id,
          title: book.title,
          author: book.author,
          tags: book.tags,
          categoryId: book.categoryId,
        });
        setRecommendations(result.data as Recommendation[]);
      } catch {
        setRecommendations([]);
      } finally {
        setRecommendationsLoading(false);
      }
    }

    void fetchRecommendations();
  }, [book]);

  async function handleBorrowRequest() {
    if (!book || !user || activeRequest || book.availableCopies <= 0) return;

    setRequesting(true);
    try {
      const requestRef = doc(collection(db, "borrowRequests"));
      const userName = profile?.name ?? user.email?.split("@")[0] ?? "User";

      await setDoc(requestRef, {
        id: requestRef.id,
        userId: user.uid,
        userName,
        bookId: book.id,
        bookTitle: book.title,
        status: "pending",
        requestedAt: serverTimestamp(),
        approvedAt: null,
        dueDate: null,
        returnedAt: null,
      });

      toast({ title: "Borrow request submitted" });
    } catch {
      toast({ title: "Request failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setRequesting(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading book...</p>;
  if (!book) return <p className="text-destructive">Book not found.</p>;

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <BookInfoCard book={book} />
        <BorrowSection
          activeRequest={activeRequest}
          availableCopies={book.availableCopies}
          requesting={requesting}
          onRequest={handleBorrowRequest}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>You might also like</CardTitle>
        </CardHeader>
        <CardContent>
          <RecommendationPanel loading={recommendationsLoading} items={recommendations} />
        </CardContent>
      </Card>
    </div>
  );
}
