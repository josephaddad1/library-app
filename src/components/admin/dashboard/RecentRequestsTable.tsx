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

type RecentRequestsTableProps = {
  requests: BorrowRequest[];
};

export function RecentRequestsTable({ requests }: RecentRequestsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Book</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell>{request.userName}</TableCell>
            <TableCell className="font-medium">{request.bookTitle}</TableCell>
            <TableCell>{formatDate(request.requestedAt)}</TableCell>
            <TableCell><BorrowStatusBadge status={request.status} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
