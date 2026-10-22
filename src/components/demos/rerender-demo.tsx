"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { SegmentedControl } from "@/components/demos/segmented-control";

type Mode = "none" | "memo-inline" | "memo-callback";

type Item = { id: string; name: string };

const items: Item[] = [
  { id: "a", name: "Checkout redesign" },
  { id: "b", name: "Search indexing" },
  { id: "c", name: "Billing exports" },
  { id: "d", name: "Team permissions" },
  { id: "e", name: "Audit log" },
];

const modeDescriptions: Record<Mode, string> = {
  none: "Rows are plain components. Every parent render re-renders every row.",
  "memo-inline":
    "Rows are wrapped in memo(), but receive a new inline onSelect function on every render, so memo() never skips them.",
  "memo-callback":
    "Rows are wrapped in memo() and receive a stable onSelect from useCallback. Typing no longer re-renders them.",
};

/**
 * Counts how many times a component committed a render, and writes the count
 * straight to a DOM node so displaying it does not cause extra renders.
 * The per-render token stops StrictMode's development-only effect replay on
 * mount from being counted as a second commit.
 */
function useCommitCounter(onCommit?: () => void) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const commits = useRef(0);
  const lastToken = useRef<object | null>(null);
  const renderToken = {};

  useEffect(() => {
    if (lastToken.current === renderToken) return;
    lastToken.current = renderToken;
    commits.current += 1;
    if (elementRef.current) elementRef.current.textContent = String(commits.current);
    onCommit?.();
  });

  return elementRef;
}

type RowProps = {
  item: Item;
  selected: boolean;
  onSelect: (id: string) => void;
  onCommit: () => void;
};

function Row({ item, selected, onSelect, onCommit }: RowProps) {
  const counterRef = useCommitCounter(onCommit);

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        aria-pressed={selected}
        className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
          selected
            ? "border-indigo-300 bg-indigo-50 text-indigo-900"
            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
        }`}
      >
        <span className="truncate">{item.name}</span>
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
          renders
          <span
            ref={counterRef}
            className="min-w-6 rounded bg-slate-900 px-1.5 py-0.5 text-center font-mono font-semibold tabular-nums text-white"
          />
        </span>
      </button>
    </li>
  );
}

const MemoRow = memo(Row);

function RenderList({ mode }: { mode: Mode }) {
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rowCommits = useRef(0);
  const rowTotalRef = useRef<HTMLSpanElement>(null);

  const reportRowCommit = useCallback(() => {
    rowCommits.current += 1;
  }, []);

  // Child effects run before the parent's, so the total is current here.
  const parentCounterRef = useCommitCounter(() => {
    if (rowTotalRef.current) rowTotalRef.current.textContent = String(rowCommits.current);
  });

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem]">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <label htmlFor={`status-${mode}`} className="text-sm font-medium text-slate-800">
          Status message <span className="font-normal text-slate-500">(parent state)</span>
        </label>
        <input
          id={`status-${mode}`}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          placeholder="Type here to update the parent…"
          className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <p className="mt-2 truncate text-xs text-slate-500">
          Status: {status ? <span className="text-slate-800">{status}</span> : "—"}
        </p>

        <ul className="mt-4 space-y-2" aria-label="Projects">
          {items.map((item) => {
            const selected = item.id === selectedId;

            if (mode === "none") {
              return (
                <Row
                  key={item.id}
                  item={item}
                  selected={selected}
                  onSelect={(id) => setSelectedId(id)}
                  onCommit={reportRowCommit}
                />
              );
            }

            return (
              <MemoRow
                key={item.id}
                item={item}
                selected={selected}
                onSelect={mode === "memo-inline" ? (id) => setSelectedId(id) : handleSelect}
                onCommit={reportRowCommit}
              />
            );
          })}
        </ul>
      </div>

      <dl className="grid grid-cols-2 gap-3 self-start lg:grid-cols-1">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <dt className="text-xs font-medium text-slate-500">Parent renders</dt>
          <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-slate-950">
            <span ref={parentCounterRef} />
          </dd>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <dt className="text-xs font-medium text-slate-500">Row renders (total)</dt>
          <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-slate-950">
            <span ref={rowTotalRef} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function RerenderDemo() {
  const [mode, setMode] = useState<Mode>("none");
  const [run, setRun] = useState(0);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          label="Row optimisation"
          value={mode}
          onChange={setMode}
          options={[
            { value: "none", label: "No memo", tone: "broken" },
            { value: "memo-inline", label: "memo + inline callback", tone: "broken" },
            { value: "memo-callback", label: "memo + useCallback", tone: "fixed" },
          ]}
        />
        <button
          type="button"
          onClick={() => setRun((current) => current + 1)}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:self-auto"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Reset counters
        </button>
      </div>

      <p className="mb-4 min-h-12 text-sm leading-6 text-slate-600">{modeDescriptions[mode]}</p>

      {/* Remount on mode change or reset so every counter starts from its mount render */}
      <RenderList key={`${mode}-${run}`} mode={mode} />

      <p className="mt-5 text-sm leading-6 text-slate-600">
        Counters show committed renders, including the initial mount. They
        illustrate render behaviour only — these rows are cheap, so skipping
        their renders is not a measurable speed-up here.
      </p>
    </div>
  );
}
