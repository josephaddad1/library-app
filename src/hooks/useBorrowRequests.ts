import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import type { BorrowRequest, BorrowStatus } from "@/types/models";

export function useBorrowRequests(status?: BorrowStatus) {
  const { user, userRole } = useAuth();
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBorrowRequests([]);
      setLoading(false);
      return;
    }

    const requestsQuery =
      userRole === "admin"
        ? query(collection(db, "borrowRequests"), orderBy("requestedAt", "desc"))
        : query(collection(db, "borrowRequests"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const fetchedRequests = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() as Omit<BorrowRequest, "id">;
          return { id: docSnapshot.id, ...data } as BorrowRequest;
        });

        const filteredRequests = status
          ? fetchedRequests.filter((request) => request.status === status)
          : fetchedRequests;

        const nextRequests = [...filteredRequests].sort((a, b) => {
          const aMs = a.requestedAt?.toDate?.().getTime?.() ?? 0;
          const bMs = b.requestedAt?.toDate?.().getTime?.() ?? 0;
          return bMs - aMs;
        });

        setBorrowRequests(nextRequests);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to read borrow requests:", error);
        setBorrowRequests([]);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [status, user, userRole]);

  return { borrowRequests, loading };
}
