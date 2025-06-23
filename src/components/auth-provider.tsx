"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const ensureProfileExists = async (user: User) => {
      try {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!existingProfile) {
          // Create profile
          await supabase.from("profiles").insert({
            id: user.id,
            username:
              user.user_metadata?.username ||
              user.email?.split("@")[0] ||
              "user",
            display_name:
              user.user_metadata?.display_name ||
              user.user_metadata?.username ||
              "Anonymous User",
          });
        }
      } catch (error) {
        console.error("Error ensuring profile exists:", error);
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Create profile when user signs up or signs in
      if (event === "SIGNED_IN" && session?.user) {
        await ensureProfileExists(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, supabase]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
