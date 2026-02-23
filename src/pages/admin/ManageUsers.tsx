import { useEffect, useMemo, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@/types/models";

type ManagedUser = UserProfile & {
  expiresAt?: Timestamp | null;
};

type RowAction = "role" | "disabled" | "expire" | "reset";

function isExpired(expiresAt?: Timestamp | null): boolean {
  if (!expiresAt) return false;
  return expiresAt.toMillis() <= Date.now();
}

export default function ManageUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [loadingActionKey, setLoadingActionKey] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const nextUsers = snapshot.docs.map((snapshotDoc) => {
          const data = snapshotDoc.data() as Omit<ManagedUser, "uid">;
          return {
            uid: snapshotDoc.id,
            ...data,
          };
        });
        setUsers(nextUsers);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsubscribe;
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    const sorted = [...users].sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });

    if (!term) return sorted;

    return sorted.filter((item) =>
      item.email.toLowerCase().includes(term) ||
      item.name.toLowerCase().includes(term),
    );
  }, [search, users]);

  async function withAction(userId: string, action: RowAction, task: () => Promise<void>) {
    const key = `${userId}:${action}`;
    setLoadingActionKey(key);
    try {
      await task();
    } finally {
      setLoadingActionKey(null);
    }
  }

  async function handleRoleToggle(targetUser: ManagedUser) {
    if (user?.uid === targetUser.uid && targetUser.role === "admin") {
      toast({
        title: "Action blocked",
        description: "You cannot remove your own admin role.",
        variant: "destructive",
      });
      return;
    }

    await withAction(targetUser.uid, "role", async () => {
      const nextRole = targetUser.role === "admin" ? "user" : "admin";
      await updateDoc(doc(db, "users", targetUser.uid), { role: nextRole });
      toast({ title: `Role updated to ${nextRole}` });
    });
  }

  async function handleDisabledToggle(targetUser: ManagedUser) {
    await withAction(targetUser.uid, "disabled", async () => {
      const nextDisabled = !targetUser.disabled;
      await updateDoc(doc(db, "users", targetUser.uid), { disabled: nextDisabled });
      toast({ title: nextDisabled ? "User disabled" : "User enabled" });
    });
  }

  async function handleExpireToggle(targetUser: ManagedUser) {
    await withAction(targetUser.uid, "expire", async () => {
      const targetRef = doc(db, "users", targetUser.uid);
      if (isExpired(targetUser.expiresAt)) {
        await updateDoc(targetRef, { expiresAt: null });
        toast({ title: "Expiration cleared" });
        return;
      }

      await updateDoc(targetRef, { expiresAt: serverTimestamp() });
      toast({ title: "User marked as expired" });
    });
  }

  async function handlePasswordReset(targetUser: ManagedUser) {
    if (!targetUser.email) {
      toast({
        title: "Missing email",
        description: "This user has no email address on record.",
        variant: "destructive",
      });
      return;
    }

    await withAction(targetUser.uid, "reset", async () => {
      await sendPasswordResetEmail(auth, targetUser.email);
      toast({ title: "Password reset email sent" });
    });
  }

  function isActionLoading(userId: string, action: RowAction): boolean {
    return loadingActionKey === `${userId}:${action}`;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">
          Manage roles, account status, expiration, and password resets.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>All users stored in Firestore.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {loading ? <p className="text-sm text-muted-foreground">Loading users...</p> : null}
          {!loading && filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found.</p>
          ) : null}

          {filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((item) => {
                  const expired = isExpired(item.expiresAt);
                  const statusLabel = item.disabled ? "Disabled" : expired ? "Expired" : "Active";
                  const expiresLabel = item.expiresAt
                    ? item.expiresAt.toDate().toLocaleString()
                    : "Never";

                  return (
                    <TableRow key={item.uid}>
                      <TableCell>{item.name || "Unknown"}</TableCell>
                      <TableCell>{item.email || "No email"}</TableCell>
                      <TableCell>
                        <Badge variant={item.role === "admin" ? "default" : "secondary"}>
                          {item.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusLabel === "Active" ? "secondary" : "destructive"}>
                          {statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>{expiresLabel}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isActionLoading(item.uid, "role")}
                            onClick={() => void handleRoleToggle(item)}
                          >
                            {item.role === "admin" ? "Set User" : "Set Admin"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isActionLoading(item.uid, "disabled")}
                            onClick={() => void handleDisabledToggle(item)}
                          >
                            {item.disabled ? "Enable" : "Disable"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isActionLoading(item.uid, "expire")}
                            onClick={() => void handleExpireToggle(item)}
                          >
                            {expired ? "Clear Expiry" : "Expire"}
                          </Button>
                          <Button
                            size="sm"
                            disabled={isActionLoading(item.uid, "reset")}
                            onClick={() => void handlePasswordReset(item)}
                          >
                            Reset Password
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
