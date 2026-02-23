import { Badge } from "@/components/ui/badge";
import type { BorrowStatus } from "@/types/models";

type BorrowStatusBadgeProps = {
  status: BorrowStatus;
};

const statusClasses: Record<BorrowStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  approved: "bg-green-500/15 text-green-700 border-green-500/30",
  rejected: "bg-red-500/15 text-red-700 border-red-500/30",
  returned: "bg-slate-500/15 text-slate-700 border-slate-500/30",
};

export function BorrowStatusBadge({ status }: BorrowStatusBadgeProps) {
  return (
    <Badge variant="outline" className={statusClasses[status]}>
      {status}
    </Badge>
  );
}
