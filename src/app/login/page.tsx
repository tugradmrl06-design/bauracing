"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginPrototype } from "@/services/auth-service";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const result = loginPrototype(String(form.get("email")), String(form.get("password")));
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    if (result.user?.status === "Pending") router.replace("/pending");
    else if (result.user?.status === "Rejected") router.replace("/rejected");
    else router.replace("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center gap-2 text-sm text-muted"><ArrowLeft size={16} />Ana sayfa</Link>
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-lg bg-accent text-sm font-black text-white">BR</div><div><h1 className="text-xl font-bold">Takım girişi</h1><p className="text-xs text-muted">BAU Racing Platform</p></div></div>
          {user?.status === "Approved" && <p className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-500">Bu oturum zaten açık</p>}
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-medium">E-posta<input name="email" type="email" required defaultValue="admin@bauracing.team" className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3" /></label>
            <label className="block text-sm font-medium">Şifre<input name="password" type="password" required defaultValue="admin123" className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3" /></label>
            {error && <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-500">{error}</p>}
            <button disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-white"><KeyRound size={16} />{loading ? "Kontrol ediliyor..." : "Giriş yap"}</button>
          </form>
          <div className="mt-5 flex items-center justify-between text-xs"><Link href="/register" className="text-accent">Üyelik başvurusu</Link><Link href="/forgot-password" className="text-muted hover:text-foreground">Şifremi unuttum</Link></div>
          <div className="mt-6 rounded-lg bg-surface-muted p-3 text-[11px] leading-5 text-muted"><p className="font-semibold text-foreground">Örnek hesaplar</p><p>Yönetici: admin@bauracing.team / admin123</p><p>Üye: member@bauracing.team / member123</p></div>
        </section>
      </div>
    </main>
  );
}
