import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BorrowStatusBadge } from "@/components/user/BorrowStatusBadge";
import { formatDate } from "@/lib/borrow-utils";
import type { BorrowRequest } from "@/types/models";

type BorrowSectionProps = {
  activeRequest?: BorrowRequest;
  availableCopies: number;
  requesting: boolean;
  onRequest: () => void;
};

export function BorrowSection({
  activeRequest,
  availableCopies,
  requesting,
  onRequest,
}: BorrowSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Borrow</CardTitle>
      </CardHeader>
      <CardContent>
        {activeRequest?.status === "pending" ? (
          <div className="flex items-center gap-2">
            <BorrowStatusBadge status="pending" />
            <span className="text-sm">Request Pending</span>
          </div>
        ) : null}

        {activeRequest?.status === "approved" ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BorrowStatusBadge status="approved" />
              <span className="text-sm">Currently Borrowed</span>
            </div>
            <p className="text-sm text-muted-foreground">Due date: {formatDate(activeRequest.dueDate)}</p>
          </div>
        ) : null}

        {!activeRequest && availableCopies > 0 ? (
          <Button onClick={onRequest} disabled={requesting}>
            {requesting ? "Submitting..." : "Request to Borrow"}
          </Button>
        ) : null}

        {!activeRequest && availableCopies <= 0 ? (
          <p className="text-sm text-muted-foreground">Currently unavailable.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
