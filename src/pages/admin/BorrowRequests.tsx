import { useMemo, useState } from "react";
import { BorrowRequestsTable } from "@/components/admin/requests/BorrowRequestsTable";
import { ApproveRequestDialog } from "@/components/admin/requests/ApproveRequestDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBorrowRequestActions } from "@/hooks/useBorrowRequestActions";
import { useBorrowRequests } from "@/hooks/useBorrowRequests";
import type { BorrowRequest, BorrowStatus } from "@/types/models";

const tabValues: Array<"all" | BorrowStatus> = ["all", "pending", "approved", "returned"];

export default function BorrowRequests() {
  const { borrowRequests, loading } = useBorrowRequests();
  const { loadingActionId, approveRequest, rejectRequest, markReturned } = useBorrowRequestActions();
  const [activeTab, setActiveTab] = useState<(typeof tabValues)[number]>("all");
  const [approveTarget, setApproveTarget] = useState<BorrowRequest | null>(null);

  const visibleRequests = useMemo(
    () =>
      activeTab === "all"
        ? borrowRequests
        : borrowRequests.filter((request) => request.status === activeTab),
    [activeTab, borrowRequests],
  );

  async function handleApprove(dueDate: Date) {
    if (!approveTarget) return;
    const approved = await approveRequest(approveTarget, dueDate);
    if (approved) setApproveTarget(null);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Borrow Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Request Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as (typeof tabValues)[number])}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="returned">Returned</TabsTrigger>
            </TabsList>
            {tabValues.map((value) => (
              <TabsContent key={value} value={value} className="mt-4">
                {loading ? <p className="text-sm text-muted-foreground">Loading requests...</p> : null}
                {!loading && visibleRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No requests found.</p>
                ) : null}
                {visibleRequests.length > 0 ? (
                  <BorrowRequestsTable
                    requests={visibleRequests}
                    onApprove={setApproveTarget}
                    onReject={rejectRequest}
                    onReturn={markReturned}
                    loadingActionId={loadingActionId}
                  />
                ) : null}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <ApproveRequestDialog
        request={approveTarget}
        open={Boolean(approveTarget)}
        onOpenChange={(open) => {
          if (!open) setApproveTarget(null);
        }}
        onConfirm={handleApprove}
        loading={Boolean(loadingActionId)}
      />
    </div>
  );
}
