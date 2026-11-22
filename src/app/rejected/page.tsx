"use client";

import Link from "next/link";
import { CircleX } from "lucide-react";

export default function RejectedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <section className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-500/10 text-rose-500"><CircleX size={24} /></div>
        <h1 className="mt-5 text-2xl font-bold">Başvuru reddedildi</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Bu üyelik başvurusu şu anda onaylanmadı. Platformun özel sayfalarına erişemezsiniz.</p>
        <div className="mt-6 flex justify-center gap-2"><Link href="/" className="h-10 rounded-lg border border-border px-4 text-sm leading-10">Ana sayfa</Link><Link href="/login" className="h-10 rounded-lg bg-surface-muted px-4 text-sm leading-10">Giriş ekranı</Link></div>
      </section>
    </main>
  );
}
