"use client";

import { useState } from "react";
import { CircleCheck, CircleX, Plus, RotateCcw } from "lucide-react";

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

  return (
    <div
      className={`flex flex-col rounded-xl border bg-white ${
        isBuggy ? "border-rose-200" : "border-emerald-200"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span
            className={`h-2 w-2 rounded-full ${isBuggy ? "bg-rose-500" : "bg-emerald-500"}`}
            aria-hidden="true"
          />
          {isBuggy ? "Buggy" : "Fixed"}
        </p>
        <code className="truncate pl-3 font-mono text-xs text-slate-500">
          {isBuggy ? "setCount(count + 1) ×3" : "setCount(c => c + 1) ×3"}
        </code>
      </div>

      <div className="flex flex-1 flex-col items-center px-4 py-6">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Count</p>
        <p
          className="mt-1 font-mono text-5xl font-semibold tabular-nums text-slate-950"
          aria-live="polite"
        >
          {count}
        </p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={addThree}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <Plus size={15} aria-hidden="true" />
            Add 3
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      {/* Fixed-height result row so the panel does not shift after the first click */}
      <div
        className={`flex min-h-14 items-center gap-2 border-t px-4 py-3 text-sm ${
          matches === null
            ? "border-slate-100 text-slate-500"
            : matches
              ? "border-emerald-100 bg-emerald-50/60 text-emerald-800"
              : "border-rose-100 bg-rose-50/60 text-rose-800"
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
      <p className="mt-5 text-sm leading-6 text-slate-600">
        Both handlers call the setter three times in one click. The buggy version
        passes a value computed from the current render&apos;s{" "}
        <code className="rounded bg-slate-100 px-1 font-mono text-[13px]">count</code>, so all
        three calls ask for the same next value. The fixed version passes updater
        functions, which React applies in order.
      </p>
    </div>
  );
}
