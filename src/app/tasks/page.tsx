"use client";

import { AppShell } from "@/components/app-shell";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { usePlatformData } from "@/hooks/use-platform-data";
import type { Task, TaskPriority, TaskStatus } from "@/types/platform";
import { CalendarDays, LayoutList, Plus, Search, Trash2, ClipboardCheck, GripVertical, MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";

const statusColumns: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

const priorityLabel: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const priorityStyle: Record<TaskPriority, string> = {
  low: "bg-sky-500/10 text-sky-500",
  medium: "bg-amber-500/10 text-amber-500",
  high: "bg-orange-500/10 text-orange-500",
  urgent: "bg-rose-500/10 text-rose-500",
};

export default function TasksPage() {
  const { data, save, createId } = usePlatformData();
  const { notify, Toast } = useToast();
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [detail, setDetail] = useState<Task | null>(null);
  const [comment, setComment] = useState("");

  const filtered = useMemo(() => {
    const priorityRank: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    return data.tasks
      .filter((task) => task.title.toLowerCase().includes(search.toLowerCase()) || task.description.toLowerCase().includes(search.toLowerCase()))
      .filter((task) => !departmentFilter || task.departmentId === departmentFilter)
      .filter((task) => !priorityFilter || task.priority === priorityFilter)
      .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || a.dueDate.localeCompare(b.dueDate));
  }, [data.tasks, search, departmentFilter, priorityFilter]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setModalOpen(true);
  }

  function submitTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const departmentId = String(form.get("departmentId") ?? "");
    const startDate = String(form.get("startDate") ?? "");
    const dueDate = String(form.get("dueDate") ?? "");
    if (!title || !description || !departmentId || !startDate || !dueDate) return;
    if (dueDate < startDate) {
      notify("Teslim tarihi başlangıç tarihinden önce olamaz");
      return;
    }
    const assigneeIds = form.getAll("assignees").map(String);
    const now = new Date().toISOString();
    save((draft) => {
      if (editing) {
        const task = draft.tasks.find((item) => item.id === editing.id);
        if (!task) return;
        Object.assign(task, {
          title,
          description,
          departmentId,
          assigneeIds,
          priority: String(form.get("priority")) as TaskPriority,
          status: String(form.get("status")) as TaskStatus,
          startDate,
          dueDate,
          attachmentName: String(form.get("attachmentName") ?? "") || undefined,
          updatedAt: now,
        });
        draft.activities.unshift({ id: createId("activity"), action: `${title} görevini güncelledi`, entityType: "task", entityId: task.id, createdAt: now });
      } else {
        const task: Task = {
          id: createId("task"),
          title,
          description,
          departmentId,
          assigneeIds,
          priority: String(form.get("priority")) as TaskPriority,
          status: String(form.get("status")) as TaskStatus,
          startDate,
          dueDate,
          attachmentName: String(form.get("attachmentName") ?? "") || undefined,
          comments: [],
          createdAt: now,
          updatedAt: now,
        };
        draft.tasks.unshift(task);
        draft.activities.unshift({ id: createId("activity"), action: `${title} görevini oluşturdu`, entityType: "task", entityId: task.id, createdAt: now });
      }
    });
    setModalOpen(false);
    notify(editing ? "Görev güncellendi" : "Görev oluşturuldu");
  }

  function deleteTask(task: Task) {
    if (!window.confirm(`"${task.title}" görevi silinsin mi?`)) return;
    save((draft) => {
      draft.tasks = draft.tasks.filter((item) => item.id !== task.id);
      draft.activities.unshift({ id: createId("activity"), action: `${task.title} görevini sildi`, entityType: "task", entityId: task.id, createdAt: new Date().toISOString() });
    });
    setDetail(null);
    notify("Görev silindi");
  }

  function moveTask(taskId: string, status: TaskStatus) {
    save((draft) => {
      const task = draft.tasks.find((item) => item.id === taskId);
      if (task) {
        task.status = status;
        task.updatedAt = new Date().toISOString();
      }
    });
    notify("Görev durumu değiştirildi");
  }

  function addComment(task: Task) {
    const body = comment.trim();
    if (!body) return;
    save((draft) => {
      const item = draft.tasks.find((candidate) => candidate.id === task.id);
      item?.comments.push({ id: createId("comment"), authorId: "member-1", body, createdAt: new Date().toISOString() });
    });
    setComment("");
    notify("Yorum eklendi");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Work management</p>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          </div>
          <button onClick={openCreate} className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white">
            <Plus size={17} /> Yeni görev
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 md:max-w-sm">
            <Search size={16} className="text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Görev ara..." className="w-full bg-transparent text-sm outline-none" />
          </div>
          <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm">
            <option value="">Tüm departmanlar</option>
            {data.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
          </select>
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm">
            <option value="">Tüm öncelikler</option>
            {(["low", "medium", "high", "urgent"] as TaskPriority[]).map((priority) => <option key={priority} value={priority}>{priorityLabel[priority]}</option>)}
          </select>
          <div className="ml-auto flex rounded-lg border border-border bg-surface p-1">
            <button onClick={() => setView("board")} className={`rounded-md px-3 py-1.5 text-sm ${view === "board" ? "bg-surface-muted" : "text-muted"}`}><ClipboardCheck size={15} className="inline mr-1" />Board</button>
            <button onClick={() => setView("list")} className={`rounded-md px-3 py-1.5 text-sm ${view === "list" ? "bg-surface-muted" : "text-muted"}`}><LayoutList size={15} className="inline mr-1" />Liste</button>
          </div>
        </div>

        {view === "board" ? (
          <div className="grid gap-3 overflow-x-auto pb-4 md:grid-cols-2 xl:grid-cols-4">
            {statusColumns.map((column) => {
              const tasks = filtered.filter((task) => task.status === column.id);
              return (
                <div
                  key={column.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => moveTask(event.dataTransfer.getData("text/task-id"), column.id)}
                  className="min-h-[420px] min-w-[240px] rounded-xl border border-border bg-surface-muted/50"
                >
                  <div className="flex items-center justify-between px-3 py-3">
                    <p className="text-sm font-semibold">{column.label}</p>
                    <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">{tasks.length}</span>
                  </div>
                  <div className="space-y-2 px-2 pb-2">
                    {tasks.map((task) => (
                      <article
                        key={task.id}
                        draggable
                        onDragStart={(event) => event.dataTransfer.setData("text/task-id", task.id)}
                        className="cursor-pointer rounded-lg border border-border bg-surface p-3 shadow-sm"
                        onClick={() => setDetail(task)}
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical size={14} className="mt-0.5 shrink-0 text-muted" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{task.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{task.description}</p>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                              <span className={`rounded px-2 py-1 text-[10px] font-semibold ${priorityStyle[task.priority]}`}>{priorityLabel[task.priority]}</span>
                              <span className="flex items-center gap-1 text-[11px] text-muted"><CalendarDays size={12} />{task.dueDate}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-border text-left text-xs text-muted">
                <tr><th className="px-4 py-3">Görev</th><th className="px-4 py-3">Departman</th><th className="px-4 py-3">Öncelik</th><th className="px-4 py-3">Durum</th><th className="px-4 py-3">Teslim</th></tr>
              </thead>
              <tbody>
                {filtered.map((task) => (
                  <tr key={task.id} onClick={() => setDetail(task)} className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-muted/50">
                    <td className="px-4 py-3 font-medium">{task.title}</td>
                    <td className="px-4 py-3 text-muted">{data.departments.find((department) => department.id === task.departmentId)?.name ?? "-"}</td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-1 text-xs ${priorityStyle[task.priority]}`}>{priorityLabel[task.priority]}</span></td>
                    <td className="px-4 py-3">{statusColumns.find((status) => status.id === task.status)?.label}</td>
                    <td className="px-4 py-3 text-muted">{task.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Görevi düzenle" : "Yeni görev"}>
          <form onSubmit={submitTask} className="space-y-4 p-5">
            <label className="block text-sm font-medium">Başlık<input name="title" defaultValue={editing?.title} required className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label>
            <label className="block text-sm font-medium">Açıklama<textarea name="description" defaultValue={editing?.description} required rows={4} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">Departman<select name="departmentId" defaultValue={editing?.departmentId} required className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3"><option value="">Seçin</option>{data.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label>
              <label className="text-sm font-medium">Öncelik<select name="priority" defaultValue={editing?.priority ?? "medium"} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3">{(["low", "medium", "high", "urgent"] as TaskPriority[]).map((priority) => <option key={priority} value={priority}>{priorityLabel[priority]}</option>)}</select></label>
              <label className="text-sm font-medium">Başlangıç tarihi<input type="date" name="startDate" defaultValue={editing?.startDate} required className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label>
              <label className="text-sm font-medium">Son teslim tarihi<input type="date" name="dueDate" defaultValue={editing?.dueDate} required className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label>
              <label className="text-sm font-medium">Durum<select name="status" defaultValue={editing?.status ?? "todo"} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3">{statusColumns.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}</select></label>
              <label className="text-sm font-medium">Ek dosya adı<input name="attachmentName" defaultValue={editing?.attachmentName} placeholder="örnek: analiz.pdf" className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Atanan kişiler</legend>
              <div className="grid max-h-32 gap-2 overflow-y-auto rounded-lg border border-border p-3 sm:grid-cols-2">
                {data.members.map((member) => (
                  <label key={member.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="assignees" value={member.id} defaultChecked={editing?.assigneeIds.includes(member.id)} />{member.name}</label>
                ))}
              </div>
            </fieldset>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button type="button" onClick={() => setModalOpen(false)} className="h-10 rounded-lg border border-border px-4 text-sm">İptal</button>
              <button type="submit" className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-white">{editing ? "Değişiklikleri kaydet" : "Görev oluştur"}</button>
            </div>
          </form>
        </Modal>

        <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.title ?? "Görev detayı"} width="max-w-3xl">
          {detail && (
            <div className="p-5">
              <p className="text-sm leading-6 text-muted">{detail.description}</p>
              <div className="mt-4 grid gap-3 rounded-lg border border-border p-4 text-sm sm:grid-cols-2">
                <p><span className="text-muted">Departman:</span> {data.departments.find((department) => department.id === detail.departmentId)?.name}</p>
                <p><span className="text-muted">Öncelik:</span> {priorityLabel[detail.priority]}</p>
                <p><span className="text-muted">Başlangıç:</span> {detail.startDate}</p>
                <p><span className="text-muted">Teslim:</span> {detail.dueDate}</p>
                <p><span className="text-muted">Atananlar:</span> {detail.assigneeIds.map((id) => data.members.find((member) => member.id === id)?.name).filter(Boolean).join(", ") || "-"}</p>
                <p><span className="text-muted">Ek:</span> {detail.attachmentName || "-"}</p>
              </div>
              <div className="mt-5">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><MessageSquare size={16} />Yorumlar</h3>
                <div className="space-y-2">
                  {detail.comments.map((item) => (
                    <div key={item.id} className="rounded-lg bg-surface-muted p-3 text-sm">
                      <p>{item.body}</p>
                      <p className="mt-1 text-xs text-muted">{data.members.find((member) => member.id === item.authorId)?.name} · {new Date(item.createdAt).toLocaleDateString("tr-TR")}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Yorum yaz..." className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm" />
                  <button onClick={() => addComment(detail)} className="h-10 rounded-lg bg-accent px-3 text-sm font-semibold text-white">Ekle</button>
                </div>
              </div>
              <div className="mt-5 flex justify-between border-t border-border pt-4">
                <button onClick={() => deleteTask(detail)} className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-rose-500 hover:bg-rose-500/10"><Trash2 size={16} />Sil</button>
                <button onClick={() => { setDetail(null); openEdit(detail); }} className="h-10 rounded-lg border border-border px-4 text-sm">Düzenle</button>
              </div>
            </div>
          )}
        </Modal>
        {Toast}
      </div>
    </AppShell>
  );
}
