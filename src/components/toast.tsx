"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";

export function useToast() {
  const [message, setMessage] = useState("");

  function notify(nextMessage: string) {
    setMessage(nextMessage);
  }

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const Toast = message ? (
    <div className="fixed bottom-5 right-5 z-[90] flex items-center gap-3 rounded-lg border border-border bg-foreground px-4 py-3 text-sm text-background shadow-xl">
      <CheckCircle2 size={17} />
      <span>{message}</span>
      <button onClick={() => setMessage("")} aria-label="Close notification">
        <X size={15} />
      </button>
    </div>
  ) : null;

  return { notify, Toast };
}
