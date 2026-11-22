"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({
  open,
  title,
  onClose,
  children,
  width = "max-w-2xl",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/55" aria-label="Close modal" onClick={onClose} />
      <div className={`relative max-h-[90vh] w-full ${width} overflow-y-auto rounded-xl border border-border bg-surface shadow-2xl`}>
        <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-surface px-5">
          <h2 className="font-semibold">{title}</h2>
          <button className="rounded-md p-2 text-muted hover:bg-surface-muted" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
