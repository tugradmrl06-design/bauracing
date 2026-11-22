"use client";

import { AppShell } from "@/components/app-shell";
import { usePlatformData } from "@/hooks/use-platform-data";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Clock3 } from "lucide-react";

export default function ReportsPage() {
  const { data } = usePlatformData();
  const now = new Date("2026-11-22T12:00:00.000Z");
  const total = data.tasks.length;
  const done = data.tasks.filter((task) => task.status === "done").length;
  const overdue = data.tasks.filter((task) => task.status !== "done" && new Date(task.dueDate) < now).length;
  const active = data.tasks.filter((task) => task.status !== "done").length;
  const completion = total ? Math.round((done / total) * 100) : 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5"><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Progress and insights</p><h1 className="text-2xl font-bold">Reports</h1></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[{ label:"Toplam görev", value:total, icon:ClipboardCheck },{ label:"Tamamlanan", value:done, icon:CheckCircle2 },{ label:"Geciken", value:overdue, icon:AlertTriangle },{ label:"Aktif", value:active, icon:Clock3 }].map((metric) => { const Icon=metric.icon; return <div key={metric.label} className="rounded-xl border border-border bg-surface p-5"><div className="flex justify-between"><div><p className="text-sm text-muted">{metric.label}</p><p className="mt-2 text-3xl font-bold">{metric.value}</p></div><Icon size={20} className="text-muted" /></div></div>; })}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-surface p-5"><div className="mb-5 flex items-end justify-between"><div><h2 className="font-semibold">Departman görev dağılımı</h2><p className="mt-1 text-xs text-muted">Görev sayıları</p></div><span className="text-2xl font-bold">{completion}%</span></div><div className="space-y-4">{data.departments.map((department) => { const tasks=data.tasks.filter((task)=>task.departmentId===department.id); const percentage=total?Math.round((tasks.length/total)*100):0; return <div key={department.id}><div className="mb-1.5 flex justify-between text-sm"><span>{department.name}</span><span className="text-muted">{tasks.length}</span></div><div className="h-2 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-accent" style={{width:`${percentage}%`}} /></div></div>; })}</div></section>
          <section className="rounded-xl border border-border bg-surface p-5"><h2 className="font-semibold">Üye görev özeti</h2><p className="mt-1 text-xs text-muted">Atanan görevler ve tamamlanan görevler</p><div className="mt-5 space-y-3">{data.members.map((member) => { const assigned=data.tasks.filter((task)=>task.assigneeIds.includes(member.id)); const completed=assigned.filter((task)=>task.status==="done").length; const percent=assigned.length?Math.round((completed/assigned.length)*100):0; return <div key={member.id} className="flex items-center gap-3"><div className="w-28 truncate text-sm">{member.name}</div><div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-emerald-500" style={{width:`${percent}%`}} /></div><div className="w-20 text-right text-xs text-muted">{completed}/{assigned.length}</div></div>; })}</div></section>
        </div>
        <section className="mt-4 rounded-xl border border-border bg-surface p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Genel tamamlanma</h2><p className="mt-1 text-xs text-muted">Toplam görevlerin tamamlanma yüzdesi</p></div><span className="text-3xl font-bold">{completion}%</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-accent" style={{width:`${completion}%`}} /></div></section>
      </div>
    </AppShell>
  );
}
