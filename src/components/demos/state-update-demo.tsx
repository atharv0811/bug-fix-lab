"use client";

import { useState } from "react";
import { CircleCheck, CircleX, Plus, RotateCcw } from "lucide-react";
import { buttonClass, inlineCode } from "@/lib/ui";

type Variant = "buggy" | "fixed";

type LastRun = { before: number; expected: number };

function CounterPanel({ variant }: { variant: Variant }) {
  const [count, setCount] = useState(0);
  const [lastRun, setLastRun] = useState<LastRun | null>(null);
  const isBuggy = variant === "buggy";

  function addThree() {
    setLastRun({ before: count, expected: count + 3 });

    if (isBuggy) {
      // Every call reads `count` from this render's snapshot.
      setCount(count + 1);
      setCount(count + 1);
      setCount(count + 1);
    } else {
      // Each updater receives the result of the previous queued update.
      setCount((current) => current + 1);
      setCount((current) => current + 1);
      setCount((current) => current + 1);
    }
  }

  function reset() {
    setCount(0);
    setLastRun(null);
  }

  // Derived from real state after React has applied the queued updates.
  const actualChange = lastRun ? count - lastRun.before : null;
  const matches = lastRun ? count === lastRun.expected : null;

  const callLine = isBuggy ? "setCount(count + 1);" : "setCount((c) => c + 1);";

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border bg-surface shadow-card ${
        isBuggy ? "border-danger-line" : "border-success-line"
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className={`flex items-center gap-2 text-sm font-semibold ${isBuggy ? "text-danger" : "text-success"}`}>
          <span
            className={`h-2 w-2 rounded-full ${isBuggy ? "bg-danger-solid" : "bg-success-solid"}`}
            aria-hidden="true"
          />
          {isBuggy ? "Buggy handler" : "Fixed handler"}
        </p>
        <span className="text-xs text-muted">3 calls per click</span>
      </div>

      {/* The handler body, shown as code so the difference is visible at a glance */}
      <div className="border-b border-code-line bg-code px-4 py-2.5 font-mono text-[12px] leading-5" aria-hidden="true">
        {[0, 1, 2].map((line) => (
          <p key={line} className={`truncate ${isBuggy ? "text-code-danger" : "text-code-success"}`}>
            {callLine}
          </p>
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center px-4 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">Count</p>
        <p className="mt-1 font-mono text-5xl font-semibold tabular-nums text-fg" aria-live="polite">
          {count}
        </p>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={addThree} className={buttonClass()}>
            <Plus size={15} aria-hidden="true" />
            Add 3
          </button>
          <button type="button" onClick={reset} className={buttonClass({ variant: "secondary" })}>
            <RotateCcw size={14} aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      {/* Fixed-height result row so the panel does not shift after the first click */}
      <div
        className={`flex min-h-14 items-center gap-2 border-t px-4 py-3 text-sm ${
          matches === null
            ? "border-line bg-surface-2 text-muted"
            : matches
              ? "border-success-line bg-success-soft text-success"
              : "border-danger-line bg-danger-soft text-danger"
        }`}
      >
        {matches === null ? (
          <span>Click “Add 3” to run the handler.</span>
        ) : (
          <>
            {matches ? (
              <CircleCheck size={16} className="shrink-0" aria-hidden="true" />
            ) : (
              <CircleX size={16} className="shrink-0" aria-hidden="true" />
            )}
            <span>
              Expected <strong className="font-mono">+3</strong>, got{" "}
              <strong className="font-mono">+{actualChange}</strong>
              {matches ? "" : " — two updates were lost"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export function StateUpdateDemo() {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <CounterPanel variant="buggy" />
        <CounterPanel variant="fixed" />
      </div>
      <p className="mt-5 border-t border-line pt-4 text-sm leading-6 text-muted">
        Both handlers call the setter three times in one click. The buggy version
        passes a value computed from the current render&apos;s{" "}
        <code className={inlineCode}>count</code>, so all three calls ask for the
        same next value. The fixed version passes updater functions, which React
        applies in order.
      </p>
    </div>
  );
}
