"use client";

import { AppShell } from "@/components/app-shell";
import { useToast } from "@/components/toast";
import { usePlatformData } from "@/hooks/use-platform-data";
import { RotateCcw, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const { data, reset } = usePlatformData();
  const { notify, Toast } = useToast();

  function resetData() {
    if (!window.confirm("Tüm prototip verileri ilk örnek durumuna sıfırlansın mı?")) return;
    reset();
    notify("Prototip verileri sıfırlandı");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Platform configuration</p>
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-surface-muted"><ShieldCheck size={18} /></div><div><h2 className="font-semibold">Prototip rol sistemi</h2><p className="text-xs text-muted">Arayüz kontrolleri için örnek rol</p></div></div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {["Super Admin", "Team Captain", "Department Lead", "Member", "Mentor"].map((role) => <div key={role} className={`rounded-lg border p-3 text-sm ${role === "Super Admin" ? "border-accent text-accent" : "border-border text-muted"}`}>{role}</div>)}
            </div>
            <p className="mt-4 text-xs leading-5 text-muted">Rol kontrolleri yalnızca prototip arayüzüdür. Gerçek yetkilendirme ve güvenlik Supabase/RLS aşamasında uygulanmalıdır.</p>
          </section>
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-semibold">Yerel prototip verileri</h2>
            <p className="mt-1 text-sm text-muted">Veriler tarayıcıdaki localStorage alanında saklanır.</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border p-3"><dt className="text-xs text-muted">Görev</dt><dd className="mt-1 font-semibold">{data.tasks.length}</dd></div>
              <div className="rounded-lg border border-border p-3"><dt className="text-xs text-muted">Üye</dt><dd className="mt-1 font-semibold">{data.members.length}</dd></div>
              <div className="rounded-lg border border-border p-3"><dt className="text-xs text-muted">Wiki</dt><dd className="mt-1 font-semibold">{data.wikiPages.length}</dd></div>
              <div className="rounded-lg border border-border p-3"><dt className="text-xs text-muted">Dosya</dt><dd className="mt-1 font-semibold">{data.files.length}</dd></div>
            </dl>
            <button onClick={resetData} className="mt-5 flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm"><RotateCcw size={16} />Örnek verilere sıfırla</button>
          </section>
        </div>
        {Toast}
      </div>
    </AppShell>
  );
}
