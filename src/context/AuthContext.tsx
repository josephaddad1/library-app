import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type UserRole = "admin" | "user";

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  async function resolveUserRole(firebaseUser: User): Promise<UserRole> {
    const userRef = doc(db, "users", firebaseUser.uid);

    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        return role === "admin" ? "admin" : "user";
      }
    } catch (error) {
      console.error("Failed to read user role from Firestore:", error);
      return "user";
    }

    try {
      await setDoc(
        userRef,
        {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          name: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "User",
          role: "user" as UserRole,
          disabled: false,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Failed to backfill missing user profile:", error);
    }

    return "user";
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          const role = await resolveUserRole(firebaseUser);
          setUserRole(role);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Auth state initialization failed:", error);
        setUser(firebaseUser);
        setUserRole(firebaseUser ? "user" : null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function register(email: string, password: string, name: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    try {
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        email,
        name,
        role: "user" as UserRole,
        disabled: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("User auth created but profile write failed:", error);
    }

    setUserRole("user");
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setUserRole(null);
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
