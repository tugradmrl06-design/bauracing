"use client";

import { getPrototypeSession, logoutPrototype } from "@/services/auth-service";
import type { PlatformUser } from "@/types/platform";
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<PlatformUser | null>(() => getPrototypeSession());

  useEffect(() => {
    const refresh = () => setUser(getPrototypeSession());
    window.addEventListener("bau-platform-auth", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("bau-platform-auth", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return { user, logout: logoutPrototype };
}
