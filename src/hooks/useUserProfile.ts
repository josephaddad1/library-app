import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types/models";

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snapshot) => {
        if (!snapshot.exists()) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const data = snapshot.data() as Omit<UserProfile, "uid">;
        setProfile({ uid: user.uid, ...data });
        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsubscribe;
  }, [user]);

  return { profile, loading };
}
