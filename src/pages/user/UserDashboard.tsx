import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useBorrowRequests } from "@/hooks/useBorrowRequests";
import { useUserProfile } from "@/hooks/useUserProfile";
import { daysUntil, formatDate } from "@/lib/borrow-utils";

export default function UserDashboard() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { borrowRequests, loading } = useBorrowRequests();

  const pendingRequests = borrowRequests.filter((request) => request.status === "pending");
  const currentlyBorrowed = borrowRequests.filter((request) => request.status === "approved");
  const booksBorrowedAllTime = borrowRequests.filter(
    (request) => request.status === "approved" || request.status === "returned",
  );

  const displayName = profile?.name ?? user?.displayName ?? user?.email?.split("@")[0] ?? "Reader";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {displayName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Here is your current borrowing activity overview.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Books Borrowed (All Time)" value={booksBorrowedAllTime.length} />
        <StatCard label="Currently Borrowed" value={currentlyBorrowed.length} />
        <StatCard label="Pending Requests" value={pendingRequests.length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Active Borrows</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading active borrows...</p> : null}
          {!loading && currentlyBorrowed.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active borrows right now.</p>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            {currentlyBorrowed.map((request) => {
              const remainingDays = daysUntil(request.dueDate);
              return (
                <Card key={request.id}>
                  <CardContent className="space-y-2 pt-6">
                    <p className="font-semibold">{request.bookTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {formatDate(request.dueDate)}
                    </p>
                    <p className="text-sm">
                      {remainingDays === null
                        ? "Due date pending"
                        : remainingDays >= 0
                          ? `${remainingDays} day(s) remaining`
                          : `${Math.abs(remainingDays)} day(s) overdue`}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
