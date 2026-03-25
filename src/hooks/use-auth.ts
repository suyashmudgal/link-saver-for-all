import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useAuth = (redirectIfUnauthenticated = true) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && redirectIfUnauthenticated) {
        navigate("/auth");
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && redirectIfUnauthenticated) {
        navigate("/auth");
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectIfUnauthenticated]);

  return { user, loading };
};

export const useUserRole = (userId?: string) => {
  return useQuery({
    queryKey: ["user-role", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (error) throw error;
      return (data || []).map((r: any) => r.role as string);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  });
};

export const useIsAdmin = (userId?: string) => {
  const { data: roles = [] } = useUserRole(userId);
  return roles.includes("admin");
};
