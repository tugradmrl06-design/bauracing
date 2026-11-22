"use client";

import { AppShell } from "@/components/app-shell";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { usePlatformData } from "@/hooks/use-platform-data";
import { deleteWikiBlob, getWikiBlob, saveWikiBlob } from "@/services/wiki-storage";
import { extractHeadings, formatWikiSize, wikiTextMatches } from "@/services/wiki-service";
import type { WikiAttachment, WikiCategory, WikiPage } from "@/types/platform";
import {
  ArrowDown, ArrowLeft, ArrowUp, Bold, BookOpen, BriefcaseBusiness, Code2, FileText,
  GraduationCap, Heart, ImageIcon, Italic, LinkIcon, List, ListOrdered, Paperclip,
  Plus, Quote, Search, Settings2, Trash2, Trophy, Wrench, Pencil,
  CircleGauge, Network, ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const categoryIcons = {
  code: Code2,
  mechanical: Wrench,
  electrical: CircleGauge,
  aero: Network,
  business: BriefcaseBusiness,
  book: BookOpen,
  competition: Trophy,
  research: GraduationCap,
};

function safeWikiHtml(html: string) {
  if (typeof document === "undefined") return html;
  const container = document.createElement("div");
  container.innerHTML = html;
  container.querySelectorAll("script,style,iframe,object,embed").forEach((element) => element.remove());
  container.querySelectorAll("h1,h2,h3").forEach((heading, index) => {
    if (!heading.id) heading.id = `section-${index}`;
  });
  return container.innerHTML;
}

export default function WikiPage() {
  const { data, save, createId } = usePlatformData();
  const { notify, Toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selected, setSelected] = useState<WikiPage | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<WikiPage | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<WikiCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<WikiCategory | null>(null);
  const [migrationCategoryId, setMigrationCategoryId] = useState("");
  const [editorHtml, setEditorHtml] = useState("");
  const [attachments, setAttachments] = useState<WikiAttachment[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const details = data.wikiCategoryDetails ?? [];
    if (details.length) return [...details].sort((a, b) => a.order - b.order);
    return data.wikiCategories.map((name, index) => ({
      id: `legacy-${index}`,
      name,
      description: "Teknik wiki kategorisi",
      icon: "book" as const,
      order: index,
    }));
  }, [data.wikiCategoryDetails, data.wikiCategories]);

  const filteredPages = useMemo(() => data.wikiPages.filter((page) => {
    const detail = categories.find((category) => category.name === page.category);
    if (categoryId && detail?.id !== categoryId) return false;
    if (search && !wikiTextMatches(page, search)) return false;
    if (authorFilter && page.authorId !== authorFilter) return false;
    if (favoritesOnly && !data.wikiFavorites?.includes(page.id) && !page.favorite) return false;
    if (dateFilter) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(dateFilter));
      if (new Date(page.updatedAt) < cutoff) return false;
    }
    return true;
  }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [data, categories, search, categoryId, authorFilter, favoritesOnly, dateFilter]);

  const headings = selected ? extractHeadings(safeWikiHtml(selected.content)) : [];
  const relatedPages = selected
    ? data.wikiPages.filter((page) => page.id !== selected.id && (page.category === selected.category || page.departmentId === selected.departmentId)).slice(0, 4)
    : [];

  function openEditor(page?: WikiPage) {
    setEditing(page ?? null);
    setEditorHtml(page?.content ?? "");
    setAttachments(page?.attachments ?? []);
    setEditorOpen(true);
  }

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  }

  async function addImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Lütfen bir görsel dosyası seçin");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      notify("Görsel 12 MB sınırını aşamaz");
      return;
    }
    const blobId = createId("wiki-image");
    await saveWikiBlob(blobId, file);
    const attachment: WikiAttachment = {
      id: createId("attachment"),
      name: file.name,
      size: file.size,
      mimeType: file.type,
      kind: "image",
      blobId,
      createdAt: new Date().toISOString(),
    };
    setAttachments((current) => [...current, attachment]);
    const caption = window.prompt("Görsel açıklaması", file.name) ?? file.name;
    const widthValue = window.prompt("Görsel genişliği (%)", "100");
    const width = Math.min(100, Math.max(10, Number.parseInt(widthValue ?? "100", 10) || 100));
    const html = `<figure style="width:${width}%"><img src="wiki-blob:${blobId}" alt="${caption.replace(/"/g, "&quot;")}" style="max-width:100%;height:auto;border-radius:8px" /><figcaption>${caption}</figcaption></figure>`;
    runCommand("insertHTML", html);
  }

  async function addFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      notify("Dosya 25 MB sınırını aşamaz");
      return;
    }
    const blobId = createId("wiki-file");
    await saveWikiBlob(blobId, file);
    const attachment: WikiAttachment = {
      id: createId("attachment"),
      name: file.name,
      size: file.size,
      mimeType: file.type,
      kind: "document",
      blobId,
      createdAt: new Date().toISOString(),
    };
    setAttachments((current) => [...current, attachment]);
    runCommand("insertHTML", `<p><a href="wiki-blob:${blobId}" data-wiki-attachment="${blobId}" download="${file.name}">📎 ${file.name} — ${formatWikiSize(file.size)}</a></p>`);
  }

  async function removeAttachment(attachment: WikiAttachment) {
    if (!window.confirm(`"${attachment.name}" ekini kaldırmak istiyor musunuz?`)) return;
    setAttachments((current) => current.filter((item) => item.id !== attachment.id));
    if (attachment.blobId) await deleteWikiBlob(attachment.blobId);
    setEditorHtml((current) => current.replace(new RegExp(`wiki-blob:${attachment.blobId}`, "g"), ""));
  }

  function submitWiki(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const categoryIdValue = String(form.get("categoryId") ?? "");
    const category = categories.find((item) => item.id === categoryIdValue);
    const description = String(form.get("description") ?? "").trim();
    const html = editorRef.current?.innerHTML || editorHtml;
    if (!title || !category || !html.trim()) {
      notify("Başlık, kategori ve içerik gereklidir");
      return;
    }
    const now = new Date().toISOString();
    save((draft) => {
      if (editing) {
        const page = draft.wikiPages.find((item) => item.id === editing.id);
        if (!page) return;
        Object.assign(page, {
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          description,
          summary: description,
          content: html,
          category: category.name,
          categoryId: category.id,
          departmentId: String(form.get("departmentId")) || undefined,
          isPublic: form.get("isPublic") === "on",
          attachments,
          updatedAt: now,
        });
        draft.activities.unshift({ id: createId("activity"), action: `${title} wiki sayfasını güncelledi`, entityType: "wiki", entityId: page.id, createdAt: now });
      } else {
        const page: WikiPage = {
          id: createId("wiki"),
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          description,
          summary: description,
          content: html,
          category: category.name,
          categoryId: category.id,
          departmentId: String(form.get("departmentId")) || undefined,
          isPublic: form.get("isPublic") === "on",
          attachments,
          favorite: false,
          createdAt: now,
          updatedAt: now,
          authorId: String(form.get("authorId") ?? "member-1"),
        };
        draft.wikiPages.unshift(page);
        draft.activities.unshift({ id: createId("activity"), action: `${title} wiki sayfasını oluşturdu`, entityType: "wiki", entityId: page.id, createdAt: now });
      }
    });
    setEditorOpen(false);
    setEditing(null);
    notify(editing ? "Wiki sayfası güncellendi" : "Wiki sayfası oluşturuldu");
  }

  function toggleFavorite(page: WikiPage) {
    save((draft) => {
      draft.wikiFavorites ??= [];
      const pageInDraft = draft.wikiPages.find((item) => item.id === page.id);
      if (draft.wikiFavorites.includes(page.id)) {
        draft.wikiFavorites = draft.wikiFavorites.filter((id) => id !== page.id);
        if (pageInDraft) pageInDraft.favorite = false;
      } else {
        draft.wikiFavorites.push(page.id);
        if (pageInDraft) pageInDraft.favorite = true;
      }
      if (selected?.id === page.id && pageInDraft) setSelected(structuredClone(pageInDraft));
    });
  }

  function deletePage(page: WikiPage) {
    if (!window.confirm(`"${page.title}" sayfası silinsin mi?`)) return;
    save((draft) => {
      draft.wikiPages = draft.wikiPages.filter((item) => item.id !== page.id);
      draft.wikiFavorites = (draft.wikiFavorites ?? []).filter((id) => id !== page.id);
    });
    setSelected(null);
    notify("Wiki sayfası silindi");
  }

  function submitCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    if (!name) return;
    save((draft) => {
      draft.wikiCategoryDetails ??= structuredClone(categories);
      if (editingCategory) {
        const category = draft.wikiCategoryDetails.find((item) => item.id === editingCategory.id);
        if (category) {
          const oldName = category.name;
          Object.assign(category, { name, description, icon: String(form.get("icon")) as WikiCategory["icon"], departmentId: String(form.get("departmentId")) || undefined });
          draft.wikiPages.forEach((page) => { if (page.category === oldName) page.category = name; });
          draft.wikiCategories = draft.wikiCategories.filter((item) => item !== oldName);
        }
      } else {
        draft.wikiCategoryDetails.push({
          id: createId("wiki-category"),
          name,
          description,
          icon: String(form.get("icon")) as WikiCategory["icon"],
          order: draft.wikiCategoryDetails.length,
          departmentId: String(form.get("departmentId")) || undefined,
        });
      }
      if (!draft.wikiCategories.includes(name)) draft.wikiCategories.push(name);
    });
    setCategoryModalOpen(false);
    setEditingCategory(null);
    notify(editingCategory ? "Kategori güncellendi" : "Kategori oluşturuldu");
  }

  function moveCategory(category: WikiCategory, direction: -1 | 1) {
    save((draft) => {
      draft.wikiCategoryDetails ??= structuredClone(categories);
      const ordered = [...draft.wikiCategoryDetails].sort((a, b) => a.order - b.order);
      const index = ordered.findIndex((item) => item.id === category.id);
      const target = index + direction;
      if (target < 0 || target >= ordered.length) return;
      [ordered[index].order, ordered[target].order] = [ordered[target].order, ordered[index].order];
    });
  }

  function confirmCategoryDelete() {
    if (!deleteCategory) return;
    if (!migrationCategoryId) {
      notify("Taşınacak kategoriyi seçin");
      return;
    }
    const migration = categories.find((category) => category.id === migrationCategoryId);
    if (!migration) return;
    save((draft) => {
      draft.wikiPages.forEach((page) => { if (page.category === deleteCategory.name) { page.category = migration.name; page.categoryId = migration.id; } });
      draft.wikiCategoryDetails = (draft.wikiCategoryDetails ?? []).filter((category) => category.id !== deleteCategory.id);
      draft.wikiCategories = draft.wikiCategories.filter((name) => name !== deleteCategory.name);
    });
    setDeleteCategory(null);
    setMigrationCategoryId("");
    notify(`Wiki sayfaları ${migration.name} kategorisine taşındı`);
  }

  async function downloadAttachment(attachment: WikiAttachment) {
    if (!attachment.blobId) return;
    const blob = await getWikiBlob(attachment.blobId);
    if (!blob) {
      notify("Dosyanın içeriği bu tarayıcıda bulunamadı");
      return;
    }
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = attachment.name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const favoritePages = data.wikiPages.filter((page) => data.wikiFavorites?.includes(page.id) || page.favorite).slice(0, 4);
  const recentAdded = [...data.wikiPages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const recentUpdated = [...data.wikiPages].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {selected ? (
          <div>
            <button onClick={() => setSelected(null)} className="mb-4 flex items-center gap-2 text-sm text-muted"><ArrowLeft size={16} />Wiki ana sayfasına dön</button>
            <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,760px)_220px]">
              <aside className="hidden xl:block">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">İçindekiler</p>
                <nav className="space-y-1 text-sm">
                  {headings.length ? headings.map((heading) => (
                    <a key={heading.id} href={`#${heading.id}`} className={`block py-1 text-muted hover:text-foreground ${heading.level === 3 ? "pl-4" : heading.level === 2 ? "pl-2" : ""}`}>{heading.text}</a>
                  )) : <p className="text-xs text-muted">Başlık bulunmuyor</p>}
                </nav>
              </aside>
              <article className="min-w-0 rounded-xl border border-border bg-surface">
                <header className="border-b border-border px-5 py-6 sm:px-8">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-accent">{selected.category}</span>
                    <button onClick={() => toggleFavorite(selected)} className={`grid h-9 w-9 place-items-center rounded-lg border border-border ${data.wikiFavorites?.includes(selected.id) || selected.favorite ? "text-rose-500" : "text-muted"}`} aria-label="Favori"><Heart size={17} fill={data.wikiFavorites?.includes(selected.id) || selected.favorite ? "currentColor" : "none"} /></button>
                  </div>
                  <h1 className="mt-3 text-3xl font-bold tracking-tight">{selected.title}</h1>
                  {selected.description && <p className="mt-3 text-sm text-muted">{selected.description}</p>}
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
                    <span>{data.members.find((member) => member.id === selected.authorId)?.name ?? "Takım üyesi"}</span>
                    <span>Oluşturuldu {new Date(selected.createdAt).toLocaleDateString("tr-TR")}</span>
                    <span>Güncellendi {new Date(selected.updatedAt).toLocaleDateString("tr-TR")}</span>
                  </div>
                </header>
                <WikiContent html={safeWikiHtml(selected.content)} />
                {(selected.attachments?.length ?? 0) > 0 && (
                  <section className="border-t border-border px-5 py-5 sm:px-8">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Paperclip size={16} />Ekli dosyalar</h2>
                    <div className="space-y-2">{selected.attachments?.map((attachment) => (
                      <button key={attachment.id} onClick={() => downloadAttachment(attachment)} className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left text-sm hover:bg-surface-muted">
                        <span className="flex items-center gap-2"><FileText size={16} className="text-muted" /><span>{attachment.name}<span className="ml-2 text-xs text-muted">{formatWikiSize(attachment.size)}</span></span></span>
                        <ChevronRight size={15} className="text-muted" />
                      </button>
                    ))}</div>
                  </section>
                )}
                <footer className="flex justify-end gap-2 border-t border-border px-5 py-4 sm:px-8">
                  <button onClick={() => deletePage(selected)} className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-rose-500"><Trash2 size={15} />Sil</button>
                  <button onClick={() => openEditor(selected)} className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm"><Pencil size={15} />Düzenle</button>
                </footer>
              </article>
              <aside className="hidden xl:block">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">İlgili sayfalar</p>
                <div className="space-y-2">{relatedPages.length ? relatedPages.map((page) => (
                  <button key={page.id} onClick={() => setSelected(page)} className="block w-full rounded-lg border border-border p-3 text-left text-sm hover:bg-surface-muted">{page.title}</button>
                )) : <p className="text-xs text-muted">İlgili sayfa bulunamadı</p>}</div>
              </aside>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Technical knowledge</p><h1 className="text-3xl font-bold tracking-tight">Wiki</h1><p className="mt-2 max-w-xl text-sm text-muted">Teknik belgeleri, takım standartlarını ve mühendislik bilgilerini tek bilgi kütüphanesinde yönetin.</p></div>
              <div className="flex gap-2"><button onClick={() => { setEditingCategory(null); setCategoryModalOpen(true); }} className="h-10 rounded-lg border border-border bg-surface px-4 text-sm">Yeni kategori</button><button onClick={() => openEditor()} className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white"><Plus size={17} />Yeni wiki</button></div>
            </div>

            <div className="mb-5 flex h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 shadow-sm"><Search size={18} className="text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Wiki başlığı, açıklama veya içerik ara..." className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none" /><kbd className="hidden rounded border border-border px-2 py-1 text-[10px] text-muted sm:block">Global: Ctrl K</kbd></div>

            <section className="mb-7">
              <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Kategoriler</h2><span className="text-xs text-muted">{categories.length} kategori</span></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map((category) => {
                  const Icon = categoryIcons[category.icon] ?? BookOpen;
                  const count = data.wikiPages.filter((page) => page.category === category.name).length;
                  return (
                    <div key={category.id} className="group relative rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent">
                      <button onClick={() => setCategoryId(category.id)} className="block w-full text-left">
                        <div className="flex items-start justify-between"><div className="grid h-9 w-9 place-items-center rounded-lg bg-surface-muted text-accent"><Icon size={18} /></div><span className="rounded-full bg-surface-muted px-2 py-1 text-[10px] text-muted">{count} sayfa</span></div>
                        <h3 className="mt-4 font-semibold">{category.name}</h3><p className="mt-1 min-h-10 text-xs leading-5 text-muted">{category.description}</p>
                      </button>
                      <div className="mt-3 flex justify-end gap-1 border-t border-border pt-2 opacity-70 group-hover:opacity-100">
                        <button onClick={() => moveCategory(category, -1)} className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-surface-muted" aria-label="Yukarı taşı"><ArrowUp size={13} /></button>
                        <button onClick={() => moveCategory(category, 1)} className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-surface-muted" aria-label="Aşağı taşı"><ArrowDown size={13} /></button>
                        <button onClick={() => { setEditingCategory(category); setCategoryModalOpen(true); }} className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-surface-muted" aria-label="Kategori düzenle"><Settings2 size={13} /></button>
                        <button onClick={() => setDeleteCategory(category)} className="grid h-7 w-7 place-items-center rounded-md text-rose-500 hover:bg-rose-500/10" aria-label="Kategori sil"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {categoryId && (
              <section className="mb-5 rounded-xl border border-border bg-surface p-4">
                <div className="mb-3 flex items-center justify-between"><div><p className="text-xs text-muted">Kategori görünümü</p><h2 className="mt-1 font-semibold">{categories.find((category) => category.id === categoryId)?.name}</h2></div><button onClick={() => setCategoryId("")} className="text-xs text-accent">Tüm kategorileri göster</button></div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <select value={authorFilter} onChange={(event) => setAuthorFilter(event.target.value)} className="h-9 rounded-lg border border-border bg-background px-3 text-xs"><option value="">Tüm oluşturucular</option>{data.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select>
                  <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-9 rounded-lg border border-border bg-background px-3 text-xs"><option value="">Tüm güncellemeler</option><option value="7">Son 7 gün</option><option value="30">Son 30 gün</option><option value="90">Son 90 gün</option></select>
                  <button onClick={() => setFavoritesOnly((value) => !value)} className={`h-9 rounded-lg border px-3 text-xs ${favoritesOnly ? "border-rose-500 text-rose-500" : "border-border"}`}>Favoriler</button>
                  <p className="flex h-9 items-center text-xs text-muted">{filteredPages.length} sonuç</p>
                </div>
              </section>
            )}

            <section className="grid gap-4 lg:grid-cols-3">
              <WikiList title="Son eklenen" pages={recentAdded} categories={categories} onOpen={setSelected} />
              <WikiList title="Son güncellenen" pages={recentUpdated} categories={categories} onOpen={setSelected} />
              <WikiList title="Favoriler" pages={favoritePages} categories={categories} onOpen={setSelected} />
            </section>

            {categoryId && (
              <section className="mt-5">
                <h2 className="mb-3 font-semibold">Kategori sayfaları</h2>
                {filteredPages.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filteredPages.map((page) => <WikiCard key={page.id} page={page} onOpen={setSelected} />)}</div> : <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">Bu kategoride sayfa bulunamadı</div>}
              </section>
            )}
          </>
        )}

        <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title={editing ? "Wiki sayfasını düzenle" : "Yeni wiki sayfası"} width="max-w-5xl">
          <form onSubmit={submitWiki} className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium sm:col-span-2">Başlık<input name="title" defaultValue={editing?.title} required className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-base" /></label>
              <label className="text-sm font-medium">Kategori<select name="categoryId" defaultValue={editing?.categoryId ?? categories.find((category) => category.name === editing?.category)?.id ?? ""} required className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3"><option value="">Kategori seçin</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label className="text-sm font-medium">Oluşturan<select name="authorId" defaultValue={editing?.authorId ?? "member-1"} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3">{data.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
              <label className="text-sm font-medium">Departman<select name="departmentId" defaultValue={editing?.departmentId ?? ""} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3"><option value="">Genel / tümü</option>{data.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label>
              <label className="text-sm font-medium">Açıklama<input name="description" defaultValue={editing?.description ?? editing?.summary} placeholder="Sayfanın kısa özeti" className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-border">
              <div className="flex flex-wrap gap-1 border-b border-border bg-surface-muted p-2">
                <EditorButton label="Başlık 1" onClick={() => runCommand("formatBlock", "h1")}><span className="text-xs font-bold">H1</span></EditorButton>
                <EditorButton label="Başlık 2" onClick={() => runCommand("formatBlock", "h2")}><span className="text-xs font-bold">H2</span></EditorButton>
                <EditorButton label="Normal metin" onClick={() => runCommand("formatBlock", "p")}><span className="text-xs">P</span></EditorButton>
                <EditorButton label="Kalın" onClick={() => runCommand("bold")}><Bold size={15} /></EditorButton>
                <EditorButton label="İtalik" onClick={() => runCommand("italic")}><Italic size={15} /></EditorButton>
                <EditorButton label="Bağlantı" onClick={() => { const url = window.prompt("Bağlantı adresi"); if (url) runCommand("createLink", url); }}><LinkIcon size={15} /></EditorButton>
                <EditorButton label="Madde listesi" onClick={() => runCommand("insertUnorderedList")}><List size={15} /></EditorButton>
                <EditorButton label="Numaralı liste" onClick={() => runCommand("insertOrderedList")}><ListOrdered size={15} /></EditorButton>
                <EditorButton label="Alıntı" onClick={() => runCommand("formatBlock", "blockquote")}><Quote size={15} /></EditorButton>
                <EditorButton label="Kod bloğu" onClick={() => runCommand("formatBlock", "pre")}><Code2 size={15} /></EditorButton>
                <EditorButton label="Kod bloğu C++" onClick={() => runCommand("insertHTML", '<pre><code class="language-cpp">// Kodu buraya yazın\n</code></pre><p><br></p>')}><span className="text-[10px] font-bold">C++</span></EditorButton>
                <EditorButton label="Tablo ekle" onClick={() => runCommand("insertHTML", '<table><thead><tr><th>Başlık 1</th><th>Başlık 2</th></tr></thead><tbody><tr><td>İçerik</td><td>İçerik</td></tr></tbody></table><p><br></p>')}><span className="text-xs font-bold">T</span></EditorButton>
                <EditorButton label="Ayraç" onClick={() => runCommand("insertHorizontalRule")}><span className="h-px w-4 bg-current" /></EditorButton>
                <label className="grid h-8 cursor-pointer place-items-center rounded-md px-2 text-muted hover:bg-surface" title="Görsel ekle"><ImageIcon size={15} /><input type="file" accept="image/*" onChange={addImage} className="hidden" /></label>
                <label className="grid h-8 cursor-pointer place-items-center rounded-md px-2 text-muted hover:bg-surface" title="Dosya ekle"><Paperclip size={15} /><input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.step,.stp,.iges,.igs,.txt,.csv" onChange={addFile} className="hidden" /></label>
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(event) => setEditorHtml(event.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: safeWikiHtml(editorHtml) }}
                className="wiki-editor min-h-[360px] bg-background px-5 py-4 text-sm leading-7 outline-none"
              />
            </div>
            {attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">{attachments.map((attachment) => (
                <div key={attachment.id} className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs"><Paperclip size={13} />{attachment.name}<button type="button" onClick={() => removeAttachment(attachment)} className="text-rose-500"><Trash2 size={13} /></button></div>
              ))}</div>
            )}
            <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" name="isPublic" defaultChecked={editing?.isPublic ?? true} />Genel erişime açık</label>
            <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4"><button type="button" onClick={() => setEditorOpen(false)} className="h-10 rounded-lg border border-border px-4 text-sm">İptal</button><button type="submit" className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-white">Kaydet</button></div>
          </form>
        </Modal>

        <Modal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} title={editingCategory ? "Kategori düzenle" : "Yeni kategori"}>
          <form onSubmit={submitCategory} className="space-y-4 p-5">
            <label className="block text-sm font-medium">Kategori adı<input name="name" defaultValue={editingCategory?.name} required className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3" /></label>
            <label className="block text-sm font-medium">Açıklama<textarea name="description" defaultValue={editingCategory?.description} required rows={3} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Simge<select name="icon" defaultValue={editingCategory?.icon ?? "book"} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3">{Object.keys(categoryIcons).map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select></label><label className="text-sm font-medium">Departman<select name="departmentId" defaultValue={editingCategory?.departmentId ?? ""} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3"><option value="">Genel</option>{data.departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label></div>
            <div className="flex justify-end gap-2 border-t border-border pt-4"><button type="button" onClick={() => setCategoryModalOpen(false)} className="h-10 rounded-lg border border-border px-4 text-sm">İptal</button><button className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-white">Kaydet</button></div>
          </form>
        </Modal>

        <Modal open={Boolean(deleteCategory)} onClose={() => setDeleteCategory(null)} title="Kategori silme">
          <div className="p-5"><p className="text-sm text-muted">“{deleteCategory?.name}” kategorisindeki wiki sayfaları silinmeden taşınmalıdır.</p><label className="mt-4 block text-sm font-medium">Sayfaları taşı<select value={migrationCategoryId} onChange={(event) => setMigrationCategoryId(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3"><option value="">Kategori seçin</option>{categories.filter((category) => category.id !== deleteCategory?.id).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><div className="mt-5 flex justify-end gap-2"><button onClick={() => setDeleteCategory(null)} className="h-10 rounded-lg border border-border px-4 text-sm">İptal</button><button onClick={confirmCategoryDelete} className="h-10 rounded-lg bg-rose-500 px-4 text-sm font-semibold text-white">Taşı ve sil</button></div></div>
        </Modal>
        {Toast}
      </div>
    </AppShell>
  );
}

function EditorButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" title={label} onClick={onClick} className="grid h-8 min-w-8 place-items-center rounded-md px-2 text-muted hover:bg-surface">{children}</button>;
}

function WikiCard({ page, onOpen }: { page: WikiPage; onOpen: (page: WikiPage) => void }) {
  return <button onClick={() => onOpen(page)} className="rounded-xl border border-border bg-surface p-5 text-left hover:border-accent"><p className="text-[10px] font-semibold uppercase tracking-widest text-accent">{page.category}</p><h3 className="mt-2 font-semibold">{page.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{page.description ?? page.summary ?? "Açıklama eklenmemiş"}</p><p className="mt-4 text-[11px] text-muted">{new Date(page.updatedAt).toLocaleDateString("tr-TR")}</p></button>;
}

function WikiList({ title, pages, categories, onOpen }: { title: string; pages: WikiPage[]; categories: WikiCategory[]; onOpen: (page: WikiPage) => void }) {
  return <section className="rounded-xl border border-border bg-surface"><div className="border-b border-border px-4 py-3"><h2 className="text-sm font-semibold">{title}</h2></div>{pages.length ? <div className="divide-y divide-border">{pages.map((page) => <button key={page.id} onClick={() => onOpen(page)} className="block w-full px-4 py-3 text-left hover:bg-surface-muted"><p className="truncate text-sm font-medium">{page.title}</p><p className="mt-1 text-[11px] text-muted">{categories.find((category) => category.name === page.category)?.name ?? page.category}</p></button>)}</div> : <p className="px-4 py-8 text-center text-xs text-muted">Kayıt bulunmuyor</p>}</section>;
}

function WikiContent({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const urls: string[] = [];
    const resolve = async () => {
      const elements = Array.from(container.querySelectorAll<HTMLElement>("img[src^='wiki-blob:'],a[href^='wiki-blob:']"));
      for (const element of elements) {
        const source = element.getAttribute("src") || element.getAttribute("href");
        const blobId = source?.replace("wiki-blob:", "");
        if (!blobId) continue;
        const blob = await getWikiBlob(blobId);
        if (!blob) continue;
        const url = URL.createObjectURL(blob);
        urls.push(url);
        if (element instanceof HTMLImageElement) element.src = url;
        if (element instanceof HTMLAnchorElement) element.href = url;
      }
      const PrismModule = await import("prismjs");
      await import("prismjs/components/prism-cpp");
      PrismModule.default.highlightAllUnder(container);
    };
    void resolve();
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [html]);
  return <div ref={containerRef} className="wiki-content px-5 py-6 sm:px-8" dangerouslySetInnerHTML={{ __html: html }} />;
}
