"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";

type CopyStatus = "idle" | "copied" | "error";

function copyWithFallback(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const succeeded = document.execCommand("copy");
  document.body.removeChild(textarea);
  return succeeded;
}

export function CopyButton({ code, label }: { code: string; label: string }) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  async function handleCopy() {
    let nextStatus: CopyStatus;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        nextStatus = "copied";
      } else {
        nextStatus = copyWithFallback(code) ? "copied" : "error";
      }
    } catch {
      nextStatus = copyWithFallback(code) ? "copied" : "error";
    }

    setStatus(nextStatus);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setStatus("idle"), 2000);
  }

  const Icon = status === "copied" ? Check : status === "error" ? X : Copy;
  const text = status === "copied" ? "Copied" : status === "error" ? "Copy failed" : "Copy";

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${label}`}
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
          status === "copied"
            ? "text-emerald-300"
            : status === "error"
              ? "text-rose-300"
              : "text-slate-400 hover:bg-white/10 hover:text-slate-100"
        }`}
      >
        <Icon size={14} aria-hidden="true" />
        <span className="w-[4.5rem] text-left">{text}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {status === "copied" ? `Copied ${label} to clipboard` : status === "error" ? "Copy failed" : ""}
      </span>
    </>
  );
}
