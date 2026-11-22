"use client";

import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <section className="w-full max-w-md rounded-xl border border-border bg-surface p-6 sm:p-8">
        <Link href="/login" className="mb-6 flex items-center gap-2 text-sm text-muted"><ArrowLeft size={16} />Girişe dön</Link>
        <h1 className="text-xl font-bold">Şifre sıfırlama</h1>
        <p className="mt-2 text-sm text-muted">Prototipte gerçek e-posta gönderimi yapılmaz.</p>
        {sent ? <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-500">Sıfırlama talebi kaydedildi.</div> : <form onSubmit={(event) => { event.preventDefault(); setSent(true); }} className="mt-6 space-y-4"><label className="block text-sm font-medium">E-posta<input type="email" required className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3" /></label><button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-white"><Mail size={16} />Talep oluştur</button></form>}
      </section>
    </main>
  );
}
