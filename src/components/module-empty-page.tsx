import { AppShell } from "@/components/app-shell";
import { Construction, type LucideIcon } from "lucide-react";

export function ModuleEmptyPage({
  title,
  eyebrow,
  description,
  icon: Icon = Construction,
}: {
  title: string;
  eyebrow: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <div className="mt-6 flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-border bg-surface">
          <div className="max-w-sm px-6 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-surface-muted text-muted">
              <Icon size={21} />
            </div>
            <p className="font-semibold">Bu modül için altyapı hazırlanıyor</p>
            <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
