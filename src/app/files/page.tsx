"use client";

import { AppShell } from "@/components/app-shell";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { usePlatformData } from "@/hooks/use-platform-data";
import type { PlatformFile } from "@/types/platform";
import { Download, File as FileIcon, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export default function FilesPage() {
  const { data, save, createId } = usePlatformData();
  const { notify, Toast } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const files = useMemo(() => data.files.filter((file) =>
    (!department || file.departmentId === department) &&
    (!category || file.category === category) &&
    (!search || `${file.name} ${file.description}`.toLowerCase().includes(search.toLowerCase()))
  ), [data.files, department, category, search]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;
    save((draft) => draft.files.unshift({
      id: createId("file"),
      name,
      description: String(form.get("description") ?? "").trim(),
      category: String(form.get("category")) as PlatformFile["category"],
      departmentId: String(form.get("departmentId")) || undefined,
      size: "Metadata only",
      mimeType: "application/octet-stream",
      createdAt: new Date().toISOString(),
      uploadedBy: "member-1",
    }));
    setOpen(false);
    notify("Dosya bilgisi oluşturuldu");
  }

  function remove(file: PlatformFile) {
    if (!window.confirm(`"${file.name}" silinsin mi?`)) return;
    save((draft) => { draft.files = draft.files.filter((item) => item.id !== file.id); });
    notify("Dosya silindi");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Document center</p><h1 className="text-2xl font-bold">Files</h1></div><button onClick={() => setOpen(true)} className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white"><Plus size={17} />Dosya ekle</button></div>
        <div className="mb-4 flex flex-wrap gap-2"><div className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 md:max-w-md"><Search size={16} className="text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Dosya ara..." className="w-full bg-transparent text-sm outline-none" /></div><select value={department} onChange={(event) => setDepartment(event.target.value)} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm"><option value="">Tüm departmanlar</option>{data.departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm"><option value="">Tüm türler</option>{["PDF","Image","CAD","ZIP","Code","Document"].map((item) => <option key={item}>{item}</option>)}</select></div>
        {files.length ? <div className="overflow-x-auto rounded-xl border border-border bg-surface"><table className="w-full min-w-[700px] text-sm"><thead className="border-b border-border text-left text-xs text-muted"><tr><th className="px-4 py-3">Dosya</th><th className="px-4 py-3">Tür</th><th className="px-4 py-3">Departman</th><th className="px-4 py-3">Boyut</th><th className="px-4 py-3"></th></tr></thead><tbody>{files.map((file) => <tr key={file.id} className="border-b border-border last:border-0"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-surface-muted"><FileIcon size={16} /></div><div><p className="font-medium">{file.name}</p><p className="mt-0.5 text-xs text-muted">{file.description || "-"}</p></div></div></td><td className="px-4 py-3">{file.category}</td><td className="px-4 py-3 text-muted">{data.departments.find((item) => item.id === file.departmentId)?.name ?? "Genel"}</td><td className="px-4 py-3 text-muted">{file.size}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={() => notify("Prototip dosya indirme işlemi hazır değil")} className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-surface-muted" aria-label="Download"><Download size={15} /></button><button onClick={() => remove(file)} className="grid h-8 w-8 place-items-center rounded-md text-rose-500 hover:bg-rose-500/10" aria-label="Delete"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div> : <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">Dosya bulunamadı</div>}
        <Modal open={open} onClose={() => setOpen(false)} title="Dosya ekle"><form onSubmit={submit} className="space-y-4 p-5"><label className="block text-sm font-medium">Dosya adı<input name="name" required placeholder="örnek: suspension-report.pdf" className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label><label className="block text-sm font-medium">Açıklama<input name="description" className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Dosya türü<select name="category" className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3">{["PDF","Image","CAD","ZIP","Code","Document"].map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-medium">Departman<select name="departmentId" className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3"><option value="">Genel</option>{data.departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div><p className="text-xs text-muted">Bu prototipte dosya içeriği localStorage’a yazılmaz; yalnızca dosya bilgileri saklanır.</p><div className="flex justify-end gap-2 border-t border-border pt-4"><button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border border-border px-4 text-sm">İptal</button><button className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-white">Ekle</button></div></form></Modal>
        {Toast}
      </div>
    </AppShell>
  );
}
