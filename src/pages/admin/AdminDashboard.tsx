import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { MostBorrowedTable } from "@/components/admin/dashboard/MostBorrowedTable";
import { RecentRequestsTable } from "@/components/admin/dashboard/RecentRequestsTable";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBooks } from "@/hooks/useBooks";
import { useBorrowRequests } from "@/hooks/useBorrowRequests";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
  const { books, loading: booksLoading } = useBooks();
  const { borrowRequests, loading: requestsLoading } = useBorrowRequests();
  const [usersCount, setUsersCount] = useState(0);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        setUsersCount(snapshot.size);
        setUsersLoading(false);
      },
      () => setUsersLoading(false),
    );

    return unsubscribe;
  }, []);

  const pendingRequests = useMemo(
    () => borrowRequests.filter((request) => request.status === "pending").length,
    [borrowRequests],
  );

  const currentlyBorrowed = useMemo(
    () => borrowRequests.filter((request) => request.status === "approved").length,
    [borrowRequests],
  );

  const recentRequests = useMemo(() => borrowRequests.slice(0, 5), [borrowRequests]);

  const mostBorrowed = useMemo(() => {
    const counts = new Map<string, { title: string; count: number }>();

    for (const request of borrowRequests) {
      if (!request.approvedAt) continue;
      const current = counts.get(request.bookId);
      if (current) {
        current.count += 1;
      } else {
        counts.set(request.bookId, { title: request.bookTitle, count: 1 });
      }
    }

    return Array.from(counts.entries())
      .map(([bookId, data]) => ({ bookId, title: data.title, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [borrowRequests]);

  const isLoading = booksLoading || requestsLoading || usersLoading;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading dashboard...</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Books" value={books.length} />
        <StatCard title="Total Users" value={usersCount} />
        <StatCard title="Pending Requests" value={pendingRequests} />
        <StatCard title="Books Currently Borrowed" value={currentlyBorrowed} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests yet.</p>
            ) : (
              <RecentRequestsTable requests={recentRequests} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Borrowed Books</CardTitle>
          </CardHeader>
          <CardContent>
            {mostBorrowed.length === 0 ? (
              <p className="text-sm text-muted-foreground">No approved borrows yet.</p>
            ) : (
              <MostBorrowedTable rows={mostBorrowed} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
