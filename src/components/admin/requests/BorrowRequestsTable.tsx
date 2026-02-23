import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BorrowStatusBadge } from "@/components/user/BorrowStatusBadge";
import { formatDate } from "@/lib/borrow-utils";
import type { BorrowRequest } from "@/types/models";

type BorrowRequestsTableProps = {
  requests: BorrowRequest[];
  onApprove: (request: BorrowRequest) => void;
  onReject: (requestId: string) => Promise<void>;
  onReturn: (requestId: string) => Promise<void>;
  loadingActionId: string | null;
};

export function BorrowRequestsTable({
  requests,
  onApprove,
  onReject,
  onReturn,
  loadingActionId,
}: BorrowRequestsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User Name</TableHead>
          <TableHead>Book Title</TableHead>
          <TableHead>Requested Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>{request.userName}</TableCell>
            <TableCell className="font-medium">{request.bookTitle}</TableCell>
            <TableCell>{formatDate(request.requestedAt)}</TableCell>
            <TableCell><BorrowStatusBadge status={request.status} /></TableCell>
            <TableCell>{formatDate(request.dueDate)}</TableCell>
            <TableCell className="text-right">
              {request.status === "pending" ? (
                <div className="flex justify-end gap-2">
                  <Button size="sm" onClick={() => onApprove(request)}>Approve</Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void onReject(request.id)}
                    disabled={loadingActionId === request.id}
                  >
                    Reject
                  </Button>
                </div>
              ) : null}

              {request.status === "approved" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void onReturn(request.id)}
                  disabled={loadingActionId === request.id}
                >
                  Mark as Returned
                </Button>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
