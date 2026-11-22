"use client";

import { AppShell } from "@/components/app-shell";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { usePlatformData } from "@/hooks/use-platform-data";
import type { Member, UserRole } from "@/types/platform";
import { ArrowLeft, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { useState } from "react";

const roles: UserRole[] = ["Super Admin", "Team Captain", "Department Lead", "Member", "Mentor"];

export default function MembersPage() {
  const { data, save, createId } = usePlatformData();
  const { notify, Toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [selected, setSelected] = useState<Member | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    if (!name || !email) return;
    save((draft) => {
      if (editing) {
        const member = draft.members.find((item) => item.id === editing.id);
        if (member) Object.assign(member, { name, email, role: String(form.get("role")) as UserRole, departmentId: String(form.get("departmentId")), subTeam: String(form.get("subTeam")) || undefined });
      } else {
        const member: Member = { id: createId("member"), name, email, role: String(form.get("role")) as UserRole, departmentId: String(form.get("departmentId")), subTeam: String(form.get("subTeam")) || undefined, createdAt: new Date().toISOString() };
        draft.members.push(member);
        const department = draft.departments.find((item) => item.id === member.departmentId);
        if (department) department.memberIds.push(member.id);
      }
    });
    setOpen(false);
    notify(editing ? "Üye güncellendi" : "Üye eklendi");
  }

  function remove(member: Member) {
    if (!window.confirm(`"${member.name}" silinsin mi?`)) return;
    save((draft) => {
      draft.members = draft.members.filter((item) => item.id !== member.id);
      draft.departments.forEach((department) => { department.memberIds = department.memberIds.filter((id) => id !== member.id); if (department.leadId === member.id) department.leadId = undefined; });
      draft.tasks.forEach((task) => { task.assigneeIds = task.assigneeIds.filter((id) => id !== member.id); });
    });
    setSelected(null);
    notify("Üye silindi");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {selected ? <div><button onClick={() => setSelected(null)} className="mb-4 flex items-center gap-2 text-sm text-muted"><ArrowLeft size={16} />Üyelere dön</button><div className="rounded-xl border border-border bg-surface p-5"><div className="flex items-start justify-between"><div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-full bg-surface-muted"><UserRound size={24} /></div><div><h1 className="text-xl font-bold">{selected.name}</h1><p className="text-sm text-muted">{selected.email}</p></div></div><div className="flex gap-2"><button onClick={() => remove(selected)} className="grid h-9 w-9 place-items-center rounded-lg text-rose-500"><Trash2 size={16} /></button><button onClick={() => { setEditing(selected); setOpen(true); }} className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm"><Pencil size={15} />Düzenle</button></div></div><div className="mt-6 grid gap-4 sm:grid-cols-3"><div className="rounded-lg border border-border p-4"><p className="text-xs text-muted">Rol</p><p className="mt-1 font-medium">{selected.role}</p></div><div className="rounded-lg border border-border p-4"><p className="text-xs text-muted">Departman</p><p className="mt-1 font-medium">{data.departments.find((department) => department.id === selected.departmentId)?.name}</p></div><div className="rounded-lg border border-border p-4"><p className="text-xs text-muted">Alt ekip</p><p className="mt-1 font-medium">{selected.subTeam ?? "-"}</p></div></div><div className="mt-5"><h2 className="mb-2 text-sm font-semibold">Atanan görevler</h2>{data.tasks.filter((task) => task.assigneeIds.includes(selected.id)).map((task) => <div key={task.id} className="border-t border-border py-3 text-sm">{task.title}</div>)}</div></div></div> :
        <><div className="mb-5 flex items-end justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Team roster</p><h1 className="text-2xl font-bold">Members</h1></div><button onClick={() => { setEditing(null); setOpen(true); }} className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white"><Plus size={17} />Üye ekle</button></div><div className="overflow-x-auto rounded-xl border border-border bg-surface"><table className="w-full min-w-[700px] text-sm"><thead className="border-b border-border text-left text-xs text-muted"><tr><th className="px-4 py-3">Üye</th><th className="px-4 py-3">Departman</th><th className="px-4 py-3">Alt ekip</th><th className="px-4 py-3">Rol</th></tr></thead><tbody>{data.members.map((member) => <tr key={member.id} onClick={() => setSelected(member)} className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-muted/50"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-surface-muted"><UserRound size={15} /></div><div><p className="font-medium">{member.name}</p><p className="text-xs text-muted">{member.email}</p></div></div></td><td className="px-4 py-3">{data.departments.find((department) => department.id === member.departmentId)?.name}</td><td className="px-4 py-3 text-muted">{member.subTeam ?? "-"}</td><td className="px-4 py-3">{member.role}</td></tr>)}</tbody></table></div></>}
        <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Üyeyi düzenle" : "Yeni üye"}><form onSubmit={submit} className="space-y-4 p-5"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Ad soyad<input name="name" defaultValue={editing?.name} required className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label><label className="text-sm font-medium">E-posta<input type="email" name="email" defaultValue={editing?.email} required className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label><label className="text-sm font-medium">Rol<select name="role" defaultValue={editing?.role ?? "Member"} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3">{roles.map((role) => <option key={role}>{role}</option>)}</select></label><label className="text-sm font-medium">Departman<select name="departmentId" defaultValue={editing?.departmentId} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3">{data.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label></div><label className="block text-sm font-medium">Alt ekip<input name="subTeam" defaultValue={editing?.subTeam} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label><div className="flex justify-end gap-2 border-t border-border pt-4"><button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border border-border px-4 text-sm">İptal</button><button className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-white">Kaydet</button></div></form></Modal>
        {Toast}
      </div>
    </AppShell>
  );
}
