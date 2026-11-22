"use client";

import Link from "next/link";
import { Clock3, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutPrototype } from "@/services/auth-service";

export default function PendingPage() {
  const router = useRouter();
  const email = typeof window !== "undefined" ? localStorage.getItem("bau-racing-pending-email") : null;
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <section className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-500/10 text-amber-500"><Clock3 size={24} /></div>
        <h1 className="mt-5 text-2xl font-bold">Başvurunuz inceleniyor</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{email ? `${email} adresli başvurunuz` : "Üyelik başvurunuz"} yönetici onayı bekliyor. Onaylandıktan sonra takım platformuna erişebilirsiniz.</p>
        <div className="mt-6 flex justify-center gap-2"><Link href="/" className="h-10 rounded-lg border border-border px-4 text-sm leading-10">Ana sayfa</Link><button onClick={() => { logoutPrototype(); router.replace("/login"); }} className="flex h-10 items-center gap-2 rounded-lg bg-surface-muted px-4 text-sm"><LogOut size={15} />Çıkış</button></div>
      </section>
    </main>
  );
}
