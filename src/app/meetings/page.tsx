"use client";

import { AppShell } from "@/components/app-shell";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { usePlatformData } from "@/hooks/use-platform-data";
import type { Meeting } from "@/types/platform";
import { CalendarDays, MapPin, Plus, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";

export default function MeetingsPage() {
  const { data, save, createId } = usePlatformData();
  const { notify, Toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const meetings = useMemo(() => selectedDate ? data.meetings.filter((meeting) => meeting.date === selectedDate) : [...data.meetings].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)), [data.meetings, selectedDate]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    if (!title) return;
    save((draft) => draft.meetings.push({
      id: createId("meeting"),
      title,
      date: String(form.get("date")),
      time: String(form.get("time")),
      location: String(form.get("location") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
      departmentId: String(form.get("departmentId")) || undefined,
      participantIds: form.getAll("participants").map(String),
      createdAt: new Date().toISOString(),
    }));
    setOpen(false);
    notify("Toplantı oluşturuldu");
  }

  function remove(meeting: Meeting) {
    if (!window.confirm(`"${meeting.title}" toplantısı silinsin mi?`)) return;
    save((draft) => { draft.meetings = draft.meetings.filter((item) => item.id !== meeting.id); });
    notify("Toplantı silindi");
  }

  const dates = [...new Set(data.meetings.map((meeting) => meeting.date))].sort();

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Coordination</p><h1 className="text-2xl font-bold">Meetings</h1></div><button onClick={() => setOpen(true)} className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white"><Plus size={17} />Toplantı oluştur</button></div>
        <div className="mb-4 flex flex-wrap gap-2"><button onClick={() => setSelectedDate("")} className={`h-9 rounded-lg border px-3 text-sm ${selectedDate ? "border-border" : "border-accent text-accent"}`}>Tümü</button>{dates.map((date) => <button key={date} onClick={() => setSelectedDate(date)} className={`h-9 rounded-lg border px-3 text-sm ${selectedDate === date ? "border-accent text-accent" : "border-border"}`}>{new Date(`${date}T12:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</button>)}</div>
        {meetings.length ? <div className="grid gap-3 lg:grid-cols-2">{meetings.map((meeting) => <article key={meeting.id} className="rounded-xl border border-border bg-surface p-5"><div className="flex items-start justify-between"><div className="flex gap-3"><div className="grid h-12 w-12 place-items-center rounded-lg bg-surface-muted text-accent"><CalendarDays size={20} /></div><div><p className="text-xs font-semibold text-accent">{meeting.time} · {new Date(`${meeting.date}T12:00`).toLocaleDateString("tr-TR")}</p><h2 className="mt-1 font-semibold">{meeting.title}</h2></div></div><button onClick={() => remove(meeting)} className="grid h-8 w-8 place-items-center rounded-md text-rose-500 hover:bg-rose-500/10"><Trash2 size={15} /></button></div><p className="mt-4 text-sm leading-6 text-muted">{meeting.description}</p><div className="mt-4 flex flex-wrap gap-4 text-xs text-muted"><span className="flex items-center gap-1"><MapPin size={14} />{meeting.location || "-"}</span><span className="flex items-center gap-1"><Users size={14} />{meeting.participantIds.length} katılımcı</span></div></article>)}</div> : <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">Bu tarihte toplantı bulunmuyor</div>}
        <Modal open={open} onClose={() => setOpen(false)} title="Yeni toplantı"><form onSubmit={submit} className="space-y-4 p-5"><label className="block text-sm font-medium">Toplantı başlığı<input name="title" required className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Tarih<input type="date" name="date" required className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label><label className="text-sm font-medium">Saat<input type="time" name="time" required className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label><label className="text-sm font-medium">Konum<input name="location" className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label><label className="text-sm font-medium">Departman<select name="departmentId" className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3"><option value="">Genel</option>{data.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label></div><label className="block text-sm font-medium">Açıklama<textarea name="description" rows={3} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2" /></label><fieldset><legend className="mb-2 text-sm font-medium">Katılımcılar</legend><div className="grid max-h-32 gap-2 overflow-y-auto rounded-lg border border-border p-3 sm:grid-cols-2">{data.members.map((member) => <label key={member.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="participants" value={member.id} />{member.name}</label>)}</div></fieldset><div className="flex justify-end gap-2 border-t border-border pt-4"><button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border border-border px-4 text-sm">İptal</button><button className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-white">Oluştur</button></div></form></Modal>
        {Toast}
      </div>
    </AppShell>
  );
}
