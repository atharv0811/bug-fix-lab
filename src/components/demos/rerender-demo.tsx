"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Activity, CircleCheck, CircleX, Info, RotateCcw } from "lucide-react";
import { ChoiceGroup, type Choice } from "@/components/ui/choice-group";
import { DemoToolbar } from "@/components/ui/demo-toolbar";
import { ControlLabel } from "@/components/ui/mode-switch";
import { StatusPanel } from "@/components/ui/status-panel";
import { buttonClass, input, inputState } from "@/lib/ui";

type Mode = "none" | "memo-inline" | "memo-callback";

type Item = { id: string; name: string };

const items: Item[] = [
  { id: "a", name: "Checkout redesign" },
  { id: "b", name: "Search indexing" },
  { id: "c", name: "Billing exports" },
  { id: "d", name: "Team permissions" },
  { id: "e", name: "Audit log" },
];

const modeChoices: Choice<Mode>[] = [
  { value: "none", title: "No memo", hint: "Plain row components", tone: "broken", icon: CircleX, code: true },
  { value: "memo-inline", title: "memo + inline callback", hint: "New onSelect each render", tone: "broken", icon: CircleX, code: true },
  { value: "memo-callback", title: "memo + useCallback", hint: "Stable onSelect identity", tone: "fixed", icon: CircleCheck, code: true },
];

const modeDescriptions: Record<Mode, { tone: "danger" | "success"; text: string }> = {
  none: {
    tone: "danger",
    text: "Rows are plain components. Every parent render re-renders every row.",
  },
  "memo-inline": {
    tone: "danger",
    text: "Rows are wrapped in memo(), but receive a new inline onSelect function on every render, so memo() never skips them.",
  },
  "memo-callback": {
    tone: "success",
    text: "Rows are wrapped in memo() and receive a stable onSelect from useCallback. Typing no longer re-renders them.",
  },
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
            ? "border-accent-line bg-accent-soft text-fg"
            : "border-line bg-surface text-fg-2 hover:bg-surface-2"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${selected ? "bg-accent" : "bg-line-strong"}`}
            aria-hidden="true"
          />
          <span className="truncate">{item.name}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
          renders
          <span
            ref={counterRef}
            className="min-w-7 rounded-md border border-code-line bg-code px-1.5 py-0.5 text-center font-mono font-semibold tabular-nums text-code-fg"
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
      <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
        <label htmlFor={`status-${mode}`} className="text-sm font-medium text-fg">
          Status message <span className="font-normal text-muted">(parent state)</span>
        </label>
        <input
          id={`status-${mode}`}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          placeholder="Type here to update the parent…"
          className={`mt-1.5 ${input} ${inputState.default}`}
        />
        <p className="mt-2 truncate text-xs text-muted">
          Status: {status ? <span className="text-fg">{status}</span> : "—"}
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
        <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
          <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">Parent renders</dt>
          <dd className="mt-1.5 font-mono text-3xl font-semibold tabular-nums text-fg">
            <span ref={parentCounterRef} />
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
          <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">Row renders</dt>
          <dd className="mt-1.5 font-mono text-3xl font-semibold tabular-nums text-fg">
            <span ref={rowTotalRef} />
          </dd>
          <p className="mt-1 text-xs text-muted">Total across 5 rows</p>
        </div>
      </dl>
    </div>
  );
}

export function RerenderDemo() {
  const [mode, setMode] = useState<Mode>("none");
  const [run, setRun] = useState(0);
  const description = modeDescriptions[mode];

  return (
    <div>
      <DemoToolbar
        icon={Activity}
        context="Render counters · committed renders per component"
        status={
          <button
            type="button"
            onClick={() => setRun((current) => current + 1)}
            className={buttonClass({ variant: "ghost", size: "sm", className: "-my-1 h-7" })}
          >
            <RotateCcw size={13} aria-hidden="true" />
            Reset counters
          </button>
        }
      >
        <div className="w-full">
          <ControlLabel>Row strategy</ControlLabel>
          <ChoiceGroup label="Row strategy" choices={modeChoices} value={mode} onChange={setMode} />
        </div>
      </DemoToolbar>

      <StatusPanel tone={description.tone} className="mb-4">
        {description.text}
      </StatusPanel>

      {/* Remount on mode change or reset so every counter starts from its mount render */}
      <RenderList key={`${mode}-${run}`} mode={mode} />

      <p className="mt-5 flex items-start gap-2 border-t border-line pt-4 text-sm leading-6 text-muted">
        <Info size={15} className="mt-1 shrink-0" aria-hidden="true" />
        Counters show committed renders, including the initial mount. They
        illustrate render behaviour only — these rows are cheap, so skipping
        their renders is not a measurable speed-up here.
      </p>
    </div>
  );
}
