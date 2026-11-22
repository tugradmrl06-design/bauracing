"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlatformData } from "@/hooks/use-platform-data";
import { ArrowLeft, Send } from "lucide-react";
import { useState } from "react";

export default function RegisterPage() {
  const { data, save, createId } = usePlatformData();
  const router = useRouter();
  const [error, setError] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    if (data.membershipApplications.some((application) => application.email.toLowerCase() === email)) {
      setError("Bu e-posta ile zaten bir başvuru bulunuyor.");
      return;
    }
    if (data.users.some((user) => user.email.toLowerCase() === email)) {
      setError("Bu e-posta ile zaten bir hesap bulunuyor.");
      return;
    }
    save((draft) => {
      const applicationId = createId("application");
      draft.membershipApplications.unshift({
        id: applicationId,
        name: String(form.get("name") ?? "").trim(),
        email,
        password: String(form.get("password") ?? ""),
        departmentId: String(form.get("departmentId")),
        subTeam: String(form.get("subTeam") ?? "").trim(),
        experience: String(form.get("experience") ?? "").trim(),
        statement: String(form.get("statement") ?? "").trim(),
        status: "Pending",
        createdAt: new Date().toISOString(),
      });
      draft.users.push({
        id: createId("user"),
        name: String(form.get("name") ?? "").trim(),
        email,
        password: String(form.get("password") ?? ""),
        status: "Pending",
        role: "Member",
        departmentId: String(form.get("departmentId")),
        subTeam: String(form.get("subTeam") ?? "").trim(),
        createdAt: new Date().toISOString(),
      });
    });
    localStorage.setItem("bau-racing-pending-email", email);
    localStorage.setItem("bau-racing-prototype-session", email);
    router.push("/pending");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <section className="w-full max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <Link href="/" className="mb-6 flex items-center gap-2 text-sm text-muted"><ArrowLeft size={16} />Ana sayfa</Link>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Membership application</p>
        <h1 className="mt-2 text-2xl font-bold">Takıma başvur</h1>
        <p className="mt-2 text-sm text-muted">Başvurun yönetici onayından sonra hesabınız aktif olacak.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Ad soyad<input name="name" required className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3" /></label><label className="text-sm font-medium">E-posta<input name="email" type="email" required className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3" /></label></div>
          <label className="block text-sm font-medium">Şifre (prototip)<input name="password" type="password" minLength={6} required className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Başvurulan departman<select name="departmentId" required className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3"><option value="">Seçin</option>{data.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label><label className="text-sm font-medium">Alt ekip tercihi<input name="subTeam" className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3" /></label></div>
          <label className="block text-sm font-medium">Deneyim ve beceriler<textarea name="experience" required rows={3} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          <label className="block text-sm font-medium">Başvuru açıklaması<textarea name="statement" required rows={4} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
          {error && <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-500">{error}</p>}
          <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-white"><Send size={16} />Başvuruyu gönder</button>
        </form>
      </section>
    </main>
  );
}
