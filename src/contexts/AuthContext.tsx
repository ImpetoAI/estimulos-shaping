import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase, db } from "@/lib/supabase";
import type { AuthUser } from "@/types/portal";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email).then(setUser).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setLoading(true);
        fetchUserProfile(session.user.id, session.user.email).then(setUser).finally(() => setLoading(false));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserProfile(userId: string, email?: string): Promise<AuthUser | null> {
    const { data, error } = await db
      .from("profiles")
      .select("id, full_name, role, avatar_url")
      .eq("id", userId)
      .single();

    if (error || !data) return null;
    return { ...data, email: email ?? "" } as AuthUser;
  }

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { error: error.message };

    const profile = await fetchUserProfile(data.user.id, data.user.email);

    if (!profile) return { error: "Perfil não encontrado. Contate o administrador." };

    setUser(profile);
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
