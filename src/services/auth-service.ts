import { platformRepository } from "@/repositories/local-platform-repository";
import type { PlatformUser } from "@/types/platform";

const SESSION_KEY = "bau-racing-prototype-session";

export function getPrototypeSession(): PlatformUser | null {
  if (typeof window === "undefined") return null;
  const email = window.localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  return platformRepository.getData().users.find((user) => user.email === email) ?? null;
}

export function loginPrototype(email: string, password: string): { user?: PlatformUser; error?: string } {
  const normalized = email.trim().toLowerCase();
  const user = platformRepository.getData().users.find((item) => item.email.toLowerCase() === normalized);
  if (!user || user.password !== password) return { error: "E-posta veya şifre hatalı." };
  if (typeof window !== "undefined") window.localStorage.setItem(SESSION_KEY, user.email);
  window.dispatchEvent(new CustomEvent("bau-platform-auth"));
  return { user };
}

export function logoutPrototype() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent("bau-platform-auth"));
  }
}
