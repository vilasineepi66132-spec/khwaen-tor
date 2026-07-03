"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load(session) {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        let { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (!data) {
          // ล็อกอินครั้งแรก ยังไม่มีโปรไฟล์ -> สร้างให้อัตโนมัติ
          const { data: created } = await supabase
            .from("profiles")
            .insert({ id: currentUser.id, display_name: currentUser.email })
            .select()
            .maybeSingle();
          data = created;
        }
        if (mounted) setProfile(data);
      } else {
        if (mounted) setProfile(null);
      }
      if (mounted) setLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => load(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      load(session);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading, isAdmin: profile?.role === "admin" };
}
