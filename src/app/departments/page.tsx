"use client";

import { AppShell } from "@/components/app-shell";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { usePlatformData } from "@/hooks/use-platform-data";
import type { Department } from "@/types/platform";
import { ArrowLeft, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";

export default function DepartmentsPage() {
  const { data, save, createId } = usePlatformData();
  const { notify, Toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [selected, setSelected] = useState<Department | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const leadId = String(form.get("leadId") ?? "") || undefined;
    const subTeams = String(form.get("subTeams") ?? "").split(",").map((item) => item.trim()).filter(Boolean);
    if (!name) return;
    save((draft) => {
      if (editing) {
        const department = draft.departments.find((item) => item.id === editing.id);
        if (department) Object.assign(department, { name, description, leadId, subTeams });
      } else {
        draft.departments.push({ id: createId("dept"), name, description, leadId, subTeams, memberIds: [], createdAt: new Date().toISOString() });
      }
    });
    setOpen(false);
    notify(editing ? "Departman güncellendi" : "Departman oluşturuldu");
  }

  function remove(department: Department) {
    if (!window.confirm(`"${department.name}" departmanı silinsin mi?`)) return;
    save((draft) => {
      draft.departments = draft.departments.filter((item) => item.id !== department.id);
      draft.tasks.forEach((task) => { if (task.departmentId === department.id) task.departmentId = ""; });
    });
    setSelected(null);
    notify("Departman silindi");
  }

  function toggleMember(departmentId: string, memberId: string) {
    save((draft) => {
      const department = draft.departments.find((item) => item.id === departmentId);
      const member = draft.members.find((item) => item.id === memberId);
      if (!department || !member) return;
      if (department.memberIds.includes(memberId)) department.memberIds = department.memberIds.filter((id) => id !== memberId);
      else department.memberIds.push(memberId);
      member.departmentId = departmentId;
    });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {selected ? (
          <div>
            <button onClick={() => setSelected(null)} className="mb-4 flex items-center gap-2 text-sm text-muted"><ArrowLeft size={16} />Departmanlara dön</button>
            <div className="rounded-xl border border-border bg-surface p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-accent">Department</p><h1 className="mt-2 text-2xl font-bold">{selected.name}</h1><p className="mt-2 text-sm text-muted">{selected.description}</p></div><div className="flex gap-2"><button onClick={() => remove(selected)} className="grid h-9 w-9 place-items-center rounded-lg text-rose-500 hover:bg-rose-500/10"><Trash2 size={16} /></button><button onClick={() => { setEditing(selected); setOpen(true); }} className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm"><Pencil size={15} />Düzenle</button></div></div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3"><section className="rounded-lg border border-border p-4"><h2 className="text-sm font-semibold">Alt ekipler</h2><div className="mt-3 flex flex-wrap gap-2">{selected.subTeams.length ? selected.subTeams.map((team) => <span key={team} className="rounded-full bg-surface-muted px-3 py-1 text-xs">{team}</span>) : <p className="text-xs text-muted">Alt ekip yok</p>}</div></section><section className="rounded-lg border border-border p-4"><h2 className="text-sm font-semibold">Üyeler</h2><div className="mt-3 space-y-2">{selected.memberIds.map((id) => { const member = data.members.find((item) => item.id === id); return member ? <div key={id} className="flex items-center justify-between text-sm"><span>{member.name}</span><button onClick={() => toggleMember(selected.id, id)} className="text-xs text-rose-500">Çıkar</button></div> : null; })}</div></section><section className="rounded-lg border border-border p-4"><h2 className="text-sm font-semibold">Görevler</h2><div className="mt-3 space-y-2">{data.tasks.filter((task) => task.departmentId === selected.id).map((task) => <p key={task.id} className="text-sm">{task.title}</p>)}</div></section></div>
            <div className="mt-4"><h2 className="mb-2 text-sm font-semibold">Üye ekle</h2><div className="flex flex-wrap gap-2">{data.members.filter((member) => !selected.memberIds.includes(member.id)).map((member) => <button key={member.id} onClick={() => toggleMember(selected.id, member.id)} className="rounded-lg border border-border px-3 py-2 text-xs hover:bg-surface-muted">+ {member.name}</button>)}</div></div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-end justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Team structure</p><h1 className="text-2xl font-bold">Departments</h1></div><button onClick={() => { setEditing(null); setOpen(true); }} className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white"><Plus size={17} />Departman ekle</button></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{data.departments.map((department) => { const tasks = data.tasks.filter((task) => task.departmentId === department.id); const done = tasks.filter((task) => task.status === "done").length; const lead = data.members.find((member) => member.id === department.leadId); return <button key={department.id} onClick={() => setSelected(department)} className="rounded-xl border border-border bg-surface p-5 text-left hover:border-accent"><div className="flex items-start justify-between"><div className="grid h-10 w-10 place-items-center rounded-lg bg-surface-muted"><Users size={18} /></div><span className="text-xs text-muted">{department.memberIds.length} üye</span></div><h2 className="mt-4 font-semibold">{department.name}</h2><p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-muted">{department.description}</p><div className="mt-4 flex items-center justify-between text-xs"><span className="text-muted">{lead?.name ?? "Lider atanmamış"}</span><span>{done}/{tasks.length} görev</span></div></button>; })}</div>
          </>
        )}
        <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Departmanı düzenle" : "Yeni departman"}><form onSubmit={submit} className="space-y-4 p-5"><label className="block text-sm font-medium">Departman adı<input name="name" defaultValue={editing?.name} required className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label><label className="block text-sm font-medium">Açıklama<textarea name="description" defaultValue={editing?.description} rows={3} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2" /></label><label className="block text-sm font-medium">Departman yöneticisi<select name="leadId" defaultValue={editing?.leadId ?? ""} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3"><option value="">Seçin</option>{data.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label><label className="block text-sm font-medium">Alt ekipler<input name="subTeams" defaultValue={editing?.subTeams.join(", ")} placeholder="Virgülle ayırın" className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label><div className="flex justify-end gap-2 border-t border-border pt-4"><button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border border-border px-4 text-sm">İptal</button><button className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-white">Kaydet</button></div></form></Modal>
        {Toast}
      </div>
    </AppShell>
  );
}
