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
        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
          status === "copied"
            ? "border-success-solid/30 bg-success-solid/10 text-code-success"
            : status === "error"
              ? "border-danger-solid/30 bg-danger-solid/10 text-code-danger"
              : "border-code-line text-code-dim hover:bg-white/5 hover:text-code-fg"
        }`}
      >
        <Icon size={13} aria-hidden="true" />
        <span className="w-18 text-left">{text}</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {status === "copied" ? `Copied ${label} to clipboard` : status === "error" ? "Copy failed" : ""}
      </span>
    </>
  );
}
