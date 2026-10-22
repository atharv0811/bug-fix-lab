"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { SegmentedControl } from "@/components/demos/segmented-control";

type Mode = "broken" | "fixed" | "compare";

type Measurement = { scrollWidth: number; clientWidth: number };

function PhonePreview({ isFixed }: { isFixed: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);

  // Read real layout values from the simulated viewport whenever its size or
  // the card's size changes. The observer also fires once on observe().
  useEffect(() => {
    const viewport = viewportRef.current;
    const card = cardRef.current;
    if (!viewport || !card) return;

    const measure = () =>
      setMeasurement({
        scrollWidth: viewport.scrollWidth,
        clientWidth: viewport.clientWidth,
      });

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const overflow = measurement ? measurement.scrollWidth - measurement.clientWidth : 0;
  const overflows = overflow > 0;

  return (
    <div className="flex min-w-0 flex-col items-center">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <span
          className={`h-1.5 w-1.5 rounded-full ${isFixed ? "bg-emerald-500" : "bg-rose-500"}`}
          aria-hidden="true"
        />
        {isFixed ? "Fixed" : "Broken"}
      </p>

      {/* Phone frame: capped width, but never wider than the page column */}
      <div className="w-full max-w-[19rem] rounded-[1.75rem] border border-slate-300 bg-slate-900 p-2 shadow-lg shadow-slate-300/50">
        <div className="overflow-hidden rounded-[1.25rem] bg-slate-50">
          <div className="flex items-center justify-between px-4 pb-1 pt-2 text-[10px] font-semibold text-slate-500">
            <span>9:41</span>
            <span className="h-1 w-10 rounded-full bg-slate-300" aria-hidden="true" />
            <span>100%</span>
          </div>

          <div
            ref={viewportRef}
            tabIndex={0}
            role="region"
            aria-label={`Simulated mobile viewport, ${isFixed ? "fixed" : "broken"} layout`}
            className="h-64 overflow-x-auto overflow-y-hidden p-3"
          >
            <div
              ref={cardRef}
              className={`rounded-lg border bg-white p-3 ${
                isFixed ? "w-full max-w-110 border-emerald-300" : "w-110 border-rose-300"
              }`}
            >
              <p className="text-sm font-semibold text-slate-900">Analytics overview</p>
              <p className="mt-0.5 text-xs text-slate-500">Last 30 days · sample data</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  ["Sessions", "8,240"],
                  ["Sign-ups", "312"],
                  ["Bounce rate", "41%"],
                  ["Avg. time", "2m 14s"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-slate-100 bg-slate-50 p-2">
                    <p className="text-[11px] text-slate-500">{label}</p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex h-12 items-end gap-1" aria-hidden="true">
                {[40, 65, 50, 80, 55, 90, 70, 60, 85, 75].map((height, index) => (
                  <span
                    key={index}
                    className="flex-1 rounded-sm bg-indigo-200"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overflow meter — fixed height to avoid layout shift between states */}
      <div
        className={`mt-4 w-full max-w-[19rem] rounded-lg border px-3 py-2.5 text-xs ${
          overflows
            ? "border-rose-200 bg-rose-50 text-rose-800"
            : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }`}
        role="status"
        aria-live="polite"
      >
        <p className="flex items-center gap-1.5 font-semibold">
          {overflows ? (
            <TriangleAlert size={14} aria-hidden="true" />
          ) : (
            <CircleCheck size={14} aria-hidden="true" />
          )}
          {measurement === null
            ? "Measuring…"
            : overflows
              ? `Overflowing by ${overflow}px`
              : "No horizontal overflow"}
        </p>
        <p className="mt-1 font-mono tabular-nums">
          scrollWidth {measurement?.scrollWidth ?? "—"}px · clientWidth{" "}
          {measurement?.clientWidth ?? "—"}px
        </p>
      </div>
    </div>
  );
}

export default function ResponsiveOverflowDemo() {
  const [mode, setMode] = useState<Mode>("broken");

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          label="Layout version"
          value={mode}
          onChange={setMode}
          options={[
            { value: "broken", label: "Broken", tone: "broken" },
            { value: "fixed", label: "Fixed", tone: "fixed" },
            { value: "compare", label: "Compare" },
          ]}
        />
        <p className="text-xs text-slate-500">
          Card width: <code className="font-mono text-slate-700">440px</code> vs{" "}
          <code className="font-mono text-slate-700">100%, max 440px</code>
        </p>
      </div>

      <div
        className={`grid justify-items-center gap-8 ${mode === "compare" ? "sm:grid-cols-2" : ""}`}
      >
        {(mode === "broken" || mode === "compare") && <PhonePreview key="broken" isFixed={false} />}
        {(mode === "fixed" || mode === "compare") && <PhonePreview key="fixed" isFixed />}
      </div>

      <p className="mt-6 text-sm leading-6 text-slate-600">
        {mode === "fixed"
          ? "The card now takes the full available width and is capped at 440px, so its scrollWidth matches the viewport's clientWidth."
          : mode === "compare"
            ? "Same content, same simulated viewport. Only the card's width rule differs."
            : "The card is a fixed 440px wide, but the simulated viewport is much narrower. Scroll inside the phone to see the clipped content."}
      </p>
    </div>
  );
}
