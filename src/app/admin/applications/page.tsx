"use client";

import { AppShell } from "@/components/app-shell";
import { Modal } from "@/components/modal";
import { useAuth } from "@/hooks/use-auth";
import { usePlatformData } from "@/hooks/use-platform-data";
import type { MembershipApplication, UserRole } from "@/types/platform";
import { CheckCircle2, CircleX, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data, save, createId } = usePlatformData();
  const [selected, setSelected] = useState<MembershipApplication | null>(null);

  useEffect(() => {
    if (user && user.status === "Approved" && user.role !== "Super Admin" && user.role !== "Team Captain") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  function approve(application: MembershipApplication, event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const departmentId = String(form.get("departmentId"));
    const subTeam = String(form.get("subTeam") ?? "").trim();
    const role = String(form.get("role")) as UserRole;
    const now = new Date().toISOString();
    save((draft) => {
      const item = draft.membershipApplications.find((candidate) => candidate.id === application.id);
      if (item) Object.assign(item, {
        status: "Approved",
        assignedDepartmentId: departmentId,
        assignedSubTeam: subTeam,
        assignedRole: role,
        reviewedAt: now,
      });
      const existingUser = draft.users.find((candidate) => candidate.email.toLowerCase() === application.email.toLowerCase());
      if (existingUser) {
        Object.assign(existingUser, {
          name: application.name,
          status: "Approved",
          role,
          departmentId,
          subTeam,
        });
      }
      if (!existingUser || !existingUser.memberId) {
        const memberId = createId("member");
        if (!existingUser) {
          draft.users.push({
            id: createId("user"),
            name: application.name,
            email: application.email,
            password: application.password,
            status: "Approved",
            role,
            departmentId,
            subTeam,
            memberId,
            createdAt: now,
          });
        } else {
          existingUser.memberId = memberId;
        }
        draft.members.push({
          id: memberId,
          name: application.name,
          email: application.email,
          role,
          departmentId,
          subTeam,
          createdAt: now,
        });
        const department = draft.departments.find((candidate) => candidate.id === departmentId);
        if (department) department.memberIds.push(memberId);
      }
      draft.activities.unshift({
        id: createId("activity"),
        action: `${application.name} üyelik başvurusunu onayladı`,
        entityType: "member",
        entityId: application.id,
        createdAt: now,
      });
    });
    setSelected(null);
  }

  function reject(application: MembershipApplication) {
    if (!window.confirm(`${application.name} başvurusunu reddetmek istiyor musunuz?`)) return;
    save((draft) => {
      const item = draft.membershipApplications.find((candidate) => candidate.id === application.id);
      if (item) {
        item.status = "Rejected";
        item.reviewedAt = new Date().toISOString();
      }
      const existing = draft.users.find((candidate) => candidate.email.toLowerCase() === application.email.toLowerCase());
      if (existing) existing.status = "Rejected";
    });
    setSelected(null);
  }

  const pending = data.membershipApplications.filter((application) => application.status === "Pending");
  const others = data.membershipApplications.filter((application) => application.status !== "Pending");

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Membership management</p>
        <h1 className="text-2xl font-bold">Başvuru yönetimi</h1>
        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2"><Clock3 size={16} className="text-amber-500" /><h2 className="font-semibold">Bekleyen başvurular</h2><span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-muted">{pending.length}</span></div>
          {pending.length ? <div className="grid gap-3 lg:grid-cols-2">{pending.map((application) => <button key={application.id} onClick={() => setSelected(application)} className="rounded-xl border border-border bg-surface p-5 text-left hover:border-accent"><div className="flex items-start justify-between"><div><h3 className="font-semibold">{application.name}</h3><p className="mt-1 text-xs text-muted">{application.email}</p></div><span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-500">Pending</span></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">{application.statement}</p><p className="mt-3 text-xs text-muted">{data.departments.find((department) => department.id === application.departmentId)?.name ?? "Departman"} · {new Date(application.createdAt).toLocaleDateString("tr-TR")}</p></button>)}</div> : <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">Bekleyen başvuru bulunmuyor</div>}
        </section>
        {others.length > 0 && <section className="mt-6"><h2 className="mb-3 font-semibold">İşlenen başvurular</h2><div className="overflow-x-auto rounded-xl border border-border bg-surface"><table className="w-full min-w-[700px] text-sm"><thead className="border-b border-border text-left text-xs text-muted"><tr><th className="px-4 py-3">Başvuran</th><th className="px-4 py-3">Departman</th><th className="px-4 py-3">Durum</th><th className="px-4 py-3">İşlem tarihi</th></tr></thead><tbody>{others.map((application) => <tr key={application.id} className="border-b border-border last:border-0"><td className="px-4 py-3"><p className="font-medium">{application.name}</p><p className="text-xs text-muted">{application.email}</p></td><td className="px-4 py-3">{data.departments.find((department) => department.id === application.assignedDepartmentId)?.name ?? "-"}</td><td className="px-4 py-3"><span className={application.status === "Approved" ? "text-emerald-500" : "text-rose-500"}>{application.status}</span></td><td className="px-4 py-3 text-muted">{application.reviewedAt ? new Date(application.reviewedAt).toLocaleDateString("tr-TR") : "-"}</td></tr>)}</tbody></table></div></section>}

        <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name ?? "Başvuru detayı"} width="max-w-3xl">
          {selected && <form onSubmit={(event) => approve(selected, event)} className="p-5"><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-lg border border-border p-4"><p className="text-xs text-muted">E-posta</p><p className="mt-1 text-sm">{selected.email}</p></div><div className="rounded-lg border border-border p-4"><p className="text-xs text-muted">Başvurulan departman</p><p className="mt-1 text-sm">{data.departments.find((department) => department.id === selected.departmentId)?.name}</p></div></div><div className="mt-4 space-y-3 rounded-lg border border-border p-4"><div><p className="text-xs font-medium text-muted">Alt ekip tercihi</p><p className="mt-1 text-sm">{selected.subTeam || "-"}</p></div><div><p className="text-xs font-medium text-muted">Deneyim ve beceriler</p><p className="mt-1 text-sm leading-6">{selected.experience}</p></div><div><p className="text-xs font-medium text-muted">Başvuru açıklaması</p><p className="mt-1 text-sm leading-6">{selected.statement}</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><label className="text-sm font-medium">Departman<select name="departmentId" defaultValue={selected.assignedDepartmentId ?? selected.departmentId} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3">{data.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label><label className="text-sm font-medium">Alt ekip<input name="subTeam" defaultValue={selected.assignedSubTeam ?? selected.subTeam} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label><label className="text-sm font-medium">Rol<select name="role" defaultValue={selected.assignedRole ?? "Member"} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3">{(["Super Admin","Team Captain","Department Lead","Member","Mentor"] as UserRole[]).map((role) => <option key={role}>{role}</option>)}</select></label></div><div className="mt-5 flex justify-between border-t border-border pt-4"><button type="button" onClick={() => reject(selected)} className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-rose-500"><CircleX size={16} />Reddet</button><button type="submit" className="flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white"><CheckCircle2 size={16} />Başvuruyu kabul et</button></div></form>}
        </Modal>
      </div>
    </AppShell>
  );
}
