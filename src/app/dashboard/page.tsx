"use client";

import { AppShell } from "@/components/app-shell";
import { usePlatformData } from "@/hooks/use-platform-data";
import { AlertTriangle, CheckCircle2, Clock3, Inbox, Plus } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { data } = usePlatformData();
  const now = new Date("2026-11-22T12:00:00.000Z");
  const total = data.tasks.length;
  const completed = data.tasks.filter((task) => task.status === "done").length;
  const active = data.tasks.filter((task) => task.status === "in_progress" || task.status === "review").length;
  const overdue = data.tasks.filter((task) => task.status !== "done" && new Date(task.dueDate) < now).length;
  const myTasks = data.tasks.filter((task) => task.assigneeIds.includes("member-1") && task.status !== "done");
  const upcoming = data.tasks
    .filter((task) => task.status !== "done")
    .filter((task) => {
      const due = new Date(task.dueDate);
      const diff = (due.getTime() - now.getTime()) / 86400000;
      return diff >= 0 && diff <= 7;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const metrics = [
    { label: "Toplam görev", value: total, icon: Inbox, tone: "text-foreground" },
    { label: "Tamamlanan", value: completed, icon: CheckCircle2, tone: "text-emerald-500" },
    { label: "Devam eden", value: active, icon: Clock3, tone: "text-blue-500" },
    { label: "Geciken", value: overdue, icon: AlertTriangle, tone: "text-rose-500" },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Team workspace</p><h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">Dashboard</h1><p className="mt-1 text-sm text-muted">Takım çalışmalarının genel durumu</p></div>
          <Link href="/tasks" className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white"><Plus size={17} />Yeni görev</Link>
        </div>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return <div key={metric.label} className="rounded-xl border border-border bg-surface p-5"><div className="flex items-start justify-between"><div><p className="text-sm text-muted">{metric.label}</p><p className="mt-3 text-3xl font-bold">{metric.value}</p></div><div className="grid h-9 w-9 place-items-center rounded-lg bg-surface-muted"><Icon className={metric.tone} size={19} /></div></div></div>;
          })}
        </section>
        <section className="mt-4 grid gap-4 xl:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface xl:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="font-semibold">Yaklaşan teslimler</h2><p className="mt-0.5 text-xs text-muted">Sonraki 7 gün</p></div><Link href="/tasks" className="text-xs font-semibold text-accent">Tüm görevler</Link></div>
            {upcoming.length ? <div className="divide-y divide-border">{upcoming.map((task) => <Link href="/tasks" key={task.id} className="flex items-center justify-between px-5 py-4 text-sm"><div><p className="font-medium">{task.title}</p><p className="mt-1 text-xs text-muted">{data.departments.find((department) => department.id === task.departmentId)?.name}</p></div><span className="text-xs text-muted">{task.dueDate}</span></Link>)}</div> : <Empty title="Yaklaşan teslim tarihi yok" description="Yeni görevler oluşturulduğunda burada görünecek." />}
          </div>
          <div className="rounded-xl border border-border bg-surface"><div className="border-b border-border px-5 py-4"><h2 className="font-semibold">Bana atanan görevler</h2></div>{myTasks.length ? <div className="divide-y divide-border">{myTasks.slice(0, 5).map((task) => <Link href="/tasks" key={task.id} className="block px-5 py-4"><p className="text-sm font-medium">{task.title}</p><p className="mt-1 text-xs text-muted">{task.dueDate}</p></Link>)}</div> : <Empty title="Atanmış görev bulunmuyor" description="Yeni görev atandığında bu alanda görünecek." />}</div>
        </section>
        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface"><div className="flex items-center justify-between border-b border-border px-5 py-4"><h2 className="font-semibold">Son duyurular</h2><Link href="/announcements" className="text-xs font-semibold text-accent">Tümü</Link></div>{data.announcements.length ? <div className="divide-y divide-border">{[...data.announcements].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 4).map((item) => <Link href="/announcements" key={item.id} className="block px-5 py-4"><p className="text-sm font-medium">{item.title}</p><p className="mt-1 line-clamp-1 text-xs text-muted">{item.body}</p></Link>)}</div> : <Empty title="Henüz duyuru yok" description="Yayınlanan duyurular burada görünecek." />}</div>
          <div className="rounded-xl border border-border bg-surface"><div className="border-b border-border px-5 py-4"><h2 className="font-semibold">Son aktiviteler</h2></div>{data.activities.length ? <div className="divide-y divide-border">{[...data.activities].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((activity) => <div key={activity.id} className="px-5 py-3.5"><p className="text-sm">{activity.action}</p><p className="mt-1 text-xs text-muted">{new Date(activity.createdAt).toLocaleDateString("tr-TR")}</p></div>)}</div> : <Empty title="Aktivite kaydı yok" description="Takım hareketleri oluştukça burada görünür." />}</div>
        </section>
        <section className="mt-4 rounded-xl border border-border bg-surface"><div className="border-b border-border px-5 py-4"><h2 className="font-semibold">Departman ilerlemesi</h2></div><div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x lg:grid-cols-5 lg:divide-y-0">{data.departments.map((department) => {const tasks = data.tasks.filter((task) => task.departmentId === department.id); const done = tasks.filter((task) => task.status === "done").length; const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0; return <div key={department.id} className="px-5 py-5"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-medium">{department.name}</p><span className="text-xs text-muted">{percent}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} /></div></div>; })}</div></section>
      </div>
    </AppShell>
  );
}

function Empty({ title, description }: { title: string; description: string }) {
  return <div className="flex min-h-44 flex-col items-center justify-center px-6 py-8 text-center"><div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-surface-muted text-muted"><Inbox size={18} /></div><p className="text-sm font-semibold">{title}</p><p className="mt-1 max-w-sm text-xs leading-5 text-muted">{description}</p></div>;
}
