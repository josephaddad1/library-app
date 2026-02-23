import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { BorrowRequest } from "@/types/models";

type ApproveRequestDialogProps = {
  request: BorrowRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (dueDate: Date) => Promise<void>;
  loading: boolean;
};

function defaultDueDateValue() {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  return dueDate.toISOString().split("T")[0];
}

export function ApproveRequestDialog({
  request,
  open,
  onOpenChange,
  onConfirm,
  loading,
}: ApproveRequestDialogProps) {
  const [dueDate, setDueDate] = useState(defaultDueDateValue());
  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    if (open) {
      setDueDate(defaultDueDateValue());
    }
  }, [open]);

  async function handleConfirm() {
    if (!dueDate) return;
    await onConfirm(new Date(`${dueDate}T23:59:59`));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Borrow Request</DialogTitle>
          <DialogDescription>
            Set due date for <strong>{request?.bookTitle}</strong> requested by {request?.userName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm font-medium">Due Date</p>
          <Input
            type="date"
            value={dueDate}
            min={minDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={loading || !dueDate}>
            {loading ? "Approving..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
