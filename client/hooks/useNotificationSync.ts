import { useEffect, useState } from "react";
import { supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";

export function useNotificationSync(driverName: string | null) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!driverName || !SUPABASE_CONFIGURED) return;

    let isMounted = true;

    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("driver_notifications")
        .select("*")
        .eq("driver_name", driverName)
        .order("created_at", { ascending: false });

      if (!isMounted) return;
      if (error) {
        console.error("Failed to fetch notifications", error);
        setNotifications([]);
        setLoading(false);
        return;
      }
      setNotifications(data || []);
      setLoading(false);
    };

    fetchNotifications();

    const channel = supabase
      .channel(`public:driver_notifications:${driverName}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "driver_notifications",
          filter: `driver_name=eq.${driverName}`,
        },
        () => {
          fetchNotifications();
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [driverName]);

  return { notifications, loading };
}
