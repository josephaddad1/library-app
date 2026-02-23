import { BorrowStatusBadge } from "@/components/user/BorrowStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBorrowRequests } from "@/hooks/useBorrowRequests";
import { formatDate } from "@/lib/borrow-utils";

export default function MyBorrows() {
  const { borrowRequests, loading } = useBorrowRequests();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">My Borrows</h1>
        <p className="text-muted-foreground">Track all your request statuses.</p>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading requests...</p> : null}
      {!loading && borrowRequests.length === 0 ? (
        <p className="text-sm text-muted-foreground">No borrow requests found.</p>
      ) : null}

      {borrowRequests.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Book Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Returned Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {borrowRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.bookTitle}</TableCell>
                <TableCell><BorrowStatusBadge status={request.status} /></TableCell>
                <TableCell>{formatDate(request.requestedAt)}</TableCell>
                <TableCell>{formatDate(request.dueDate)}</TableCell>
                <TableCell>{formatDate(request.returnedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </div>
  );
}
