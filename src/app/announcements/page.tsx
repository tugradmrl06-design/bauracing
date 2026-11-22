"use client";

import { AppShell } from "@/components/app-shell";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { usePlatformData } from "@/hooks/use-platform-data";
import type { Announcement } from "@/types/platform";
import { ArrowLeft, Pin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AnnouncementsPage() {
  const { data, save, createId } = usePlatformData();
  const { notify, Toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [selected, setSelected] = useState<Announcement | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const body = String(form.get("body") ?? "").trim();
    if (!title || !body) return;
    save((draft) => {
      if (editing) {
        const item = draft.announcements.find((candidate) => candidate.id === editing.id);
        if (item) Object.assign(item, { title, body, departmentId: String(form.get("departmentId")) || undefined, pinned: form.get("pinned") === "on" });
      } else {
        const publishedAt = new Date().toISOString();
        const item: Announcement = { id: createId("announcement"), title, body, departmentId: String(form.get("departmentId")) || undefined, pinned: form.get("pinned") === "on", publishedAt, createdAt: publishedAt, createdBy: "member-1" };
        draft.announcements.unshift(item);
        draft.activities.unshift({ id: createId("activity"), action: `${title} duyurusunu yayınladı`, entityType: "announcement", entityId: item.id, createdAt: publishedAt });
      }
    });
    setOpen(false);
    notify(editing ? "Duyuru güncellendi" : "Duyuru yayınlandı");
  }

  function remove(item: Announcement) {
    if (!window.confirm(`"${item.title}" duyurusu silinsin mi?`)) return;
    save((draft) => { draft.announcements = draft.announcements.filter((candidate) => candidate.id !== item.id); });
    setSelected(null);
    notify("Duyuru silindi");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {selected ? <div><button onClick={() => setSelected(null)} className="mb-4 flex items-center gap-2 text-sm text-muted"><ArrowLeft size={16} />Duyurulara dön</button><article className="mx-auto max-w-3xl rounded-xl border border-border bg-surface"><header className="border-b border-border px-5 py-5"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-widest text-accent">{selected.departmentId ? data.departments.find((item) => item.id === selected.departmentId)?.name : "Genel duyuru"}</p>{selected.pinned && <Pin size={15} className="text-accent" />}</div><h1 className="mt-2 text-2xl font-bold">{selected.title}</h1><p className="mt-2 text-xs text-muted">{new Date(selected.publishedAt).toLocaleString("tr-TR")}</p></header><div className="px-5 py-6 text-sm leading-7">{selected.body}</div><footer className="flex justify-end gap-2 border-t border-border px-5 py-4"><button onClick={() => remove(selected)} className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-rose-500"><Trash2 size={15} />Sil</button><button onClick={() => { setEditing(selected); setOpen(true); }} className="h-9 rounded-lg border border-border px-3 text-sm">Düzenle</button></footer></article></div> :
        <><div className="mb-5 flex items-end justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Team communication</p><h1 className="text-2xl font-bold">Announcements</h1></div><button onClick={() => { setEditing(null); setOpen(true); }} className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white"><Plus size={17} />Yeni duyuru</button></div><div className="grid gap-3">{[...data.announcements].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.publishedAt.localeCompare(a.publishedAt)).map((item) => <button key={item.id} onClick={() => setSelected(item)} className="rounded-xl border border-border bg-surface p-5 text-left"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-accent">{item.departmentId ? data.departments.find((department) => department.id === item.departmentId)?.name : "Genel"}</p><h2 className="mt-2 font-semibold">{item.title}</h2><p className="mt-2 line-clamp-2 text-sm text-muted">{item.body}</p></div>{item.pinned && <Pin size={16} className="text-accent" />}</div><p className="mt-4 text-xs text-muted">{new Date(item.publishedAt).toLocaleDateString("tr-TR")}</p></button>)}</div></>}
        <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Duyuruyu düzenle" : "Yeni duyuru"}><form onSubmit={submit} className="space-y-4 p-5"><label className="block text-sm font-medium">Başlık<input name="title" defaultValue={editing?.title} required className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label><label className="block text-sm font-medium">Açıklama<textarea name="body" defaultValue={editing?.body} required rows={5} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2" /></label><label className="block text-sm font-medium">Departman<select name="departmentId" defaultValue={editing?.departmentId ?? ""} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3"><option value="">Genel duyuru</option>{data.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="pinned" defaultChecked={editing?.pinned} />Duyuruyu sabitle</label><div className="flex justify-end gap-2 border-t border-border pt-4"><button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border border-border px-4 text-sm">İptal</button><button className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-white">Yayınla</button></div></form></Modal>
        {Toast}
      </div>
    </AppShell>
  );
}
