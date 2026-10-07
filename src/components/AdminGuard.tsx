import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAdminSession } from "@/lib/applicationService";
import { supabase } from "@/lib/supabaseClient";

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"checking" | "authorized" | "denied">("checking");

  useEffect(() => {
    let active = true;

    getAdminSession().then(({ session }) => {
      if (active) setStatus(session ? "authorized" : "denied");
    });

    // Re-evaluate on every auth change (sign-out, expiry, another tab, or the
    // session's user losing the admin claim); the claim gate lives in
    // getAdminSession.
    const { data } =
      supabase?.auth.onAuthStateChange(() => {
        getAdminSession().then(({ session: refreshed }) => {
          if (active) setStatus(refreshed ? "authorized" : "denied");
        });
      }) ?? { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground animate-pulse-soft">
          Verifying access
        </p>
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;