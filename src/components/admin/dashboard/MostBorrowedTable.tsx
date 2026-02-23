import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type MostBorrowedRow = {
  bookId: string;
  title: string;
  count: number;
};

type MostBorrowedTableProps = {
  rows: MostBorrowedRow[];
};

export function MostBorrowedTable({ rows }: MostBorrowedTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Book</TableHead>
          <TableHead className="text-right">Approved Borrows</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.bookId}>
            <TableCell className="font-medium">{row.title}</TableCell>
            <TableCell className="text-right">{row.count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
