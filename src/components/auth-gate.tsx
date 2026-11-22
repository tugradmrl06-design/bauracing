"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/login" || pathname === "/register" || pathname === "/pending" || pathname === "/rejected" || pathname === "/") return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.status !== "Approved") {
      router.replace(user.status === "Rejected" ? "/rejected" : "/pending");
      return;
    }
  }, [user, pathname, router]);

  if (pathname === "/login" || pathname === "/register" || pathname === "/pending" || pathname === "/rejected" || pathname === "/") return children;
  if (!user) return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted">Oturum doğrulanıyor...</div>;
  if (user.status !== "Approved") return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted">Yetki durumu kontrol ediliyor...</div>;
  return children;
}
