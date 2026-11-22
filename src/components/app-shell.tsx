"use client";

import {
  Bell,
  CircleHelp,
  ClipboardCheck,
  CalendarDays,
  LayoutDashboard,
  Menu,
  Moon,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sun,
  X,
  FolderKanban,
  FileBarChart,
  UserRound,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePlatformData } from "@/hooks/use-platform-data";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tasks", href: "/tasks", icon: ClipboardCheck },
  { label: "Wiki", href: "/wiki", icon: CircleHelp },
  { label: "Departments", href: "/departments", icon: Network },
  { label: "Members", href: "/members", icon: UserRound },
  { label: "Files", href: "/files", icon: FolderKanban },
  { label: "Announcements", href: "/announcements", icon: Bell },
  { label: "Meetings", href: "/meetings", icon: CalendarDays },
  { label: "Reports", href: "/reports", icon: FileBarChart },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = usePlatformData();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", nextDark);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface transition-[width,transform] duration-200 ${
          collapsed ? "w-[76px]" : "w-[256px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className={`flex h-16 items-center border-b border-border ${collapsed ? "justify-center" : "px-5"}`}>
          <Link href="/dashboard" className="flex items-center gap-3" aria-label="BAU Racing">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-sm font-black text-white">
              BR
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <p className="text-sm font-bold tracking-wide">BAU RACING</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">Formula Team</p>
              </div>
            )}
          </Link>
          <button
            className="ml-auto hidden rounded-md p-2 text-muted hover:bg-surface-muted lg:block"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <button
            className="ml-auto rounded-md p-2 text-muted hover:bg-surface-muted lg:hidden"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {[...navigation, ...((user?.role === "Super Admin" || user?.role === "Team Captain") ? [{ label: "Applications", href: "/admin/applications", icon: ShieldCheck }] : [])].map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
                className={`flex h-10 items-center rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? "justify-center" : "gap-3 px-3"
                } ${
                  active
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div
            className={`flex h-12 items-center rounded-lg ${collapsed ? "justify-center" : "gap-2 px-2"} hover:bg-surface-muted`}
          >
            <Link href="/settings" className="flex min-w-0 flex-1 items-center gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-xs font-bold text-background">
              {(user?.name ?? "TA").split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()
              }
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-semibold">{user?.name ?? "Team Account"}</p>
                <p className="truncate text-xs text-muted">{user?.role ?? "Member"}</p>
              </div>
            )}
            </Link>
            {!collapsed && (
              <button
                onClick={() => { logout(); router.replace("/"); }}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted hover:bg-background hover:text-rose-500"
                aria-label="Çıkış yap"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className={`transition-[margin] duration-200 ${collapsed ? "lg:ml-[76px]" : "lg:ml-[256px]"}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-lg border border-border p-2 lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={19} />
          </button>

          <button onClick={() => setSearchOpen(true)} className="hidden h-9 w-full max-w-[420px] items-center gap-2 rounded-lg border border-border bg-background px-3 text-left text-sm text-muted md:flex">
            <Search size={16} />
            <span>Search platform</span>
            <kbd className="ml-auto rounded border border-border bg-surface px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-1">
            <button
              className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
              aria-label="Toggle theme"
              onClick={toggleTheme}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              href="/announcements"
              className="relative grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-muted hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </Link>
          </div>
        </header>
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
      </div>
      {searchOpen && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/55 p-4 pt-[12vh]">
          <button className="absolute inset-0" aria-label="Close global search" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
            <div className="flex h-14 items-center gap-3 border-b border-border px-4">
              <Search size={18} className="text-muted" />
              <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Görev, wiki, üye, departman veya dosya ara..." className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none" />
              <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">ESC</kbd>
            </div>
            <div className="max-h-[480px] overflow-y-auto p-2">
              {search.trim() ? (
                (() => {
                  const query = search.toLowerCase();
                  const results = [
                    ...data.tasks.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(query)).map((item) => ({ title: item.title, meta: "Görev", href: "/tasks" })),
                    ...data.wikiPages.filter((item) => `${item.title} ${item.content}`.toLowerCase().includes(query)).map((item) => ({ title: item.title, meta: "Wiki", href: "/wiki" })),
                    ...data.members.filter((item) => `${item.name} ${item.email}`.toLowerCase().includes(query)).map((item) => ({ title: item.name, meta: "Üye", href: "/members" })),
                    ...data.departments.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query)).map((item) => ({ title: item.name, meta: "Departman", href: "/departments" })),
                    ...data.announcements.filter((item) => `${item.title} ${item.body}`.toLowerCase().includes(query)).map((item) => ({ title: item.title, meta: "Duyuru", href: "/announcements" })),
                    ...data.files.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query)).map((item) => ({ title: item.name, meta: "Dosya", href: "/files" })),
                  ].slice(0, 30);
                  return results.length ? results.map((result, index) => (
                    <Link key={`${result.href}-${index}`} href={result.href} onClick={() => setSearchOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-surface-muted">
                      <span className="text-sm font-medium">{result.title}</span>
                      <span className="rounded-full bg-surface-muted px-2 py-1 text-[10px] text-muted">{result.meta}</span>
                    </Link>
                  )) : <p className="px-3 py-8 text-center text-sm text-muted">Sonuç bulunamadı</p>;
                })()
              ) : (
                <p className="px-3 py-8 text-center text-sm text-muted">Platformda aramak için bir kelime yazın</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
