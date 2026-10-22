"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CircleCheck, CircleX, Columns2, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DemoToolbar } from "@/components/ui/demo-toolbar";
import { ModeSwitch } from "@/components/ui/mode-switch";
import { StatusPanel } from "@/components/ui/status-panel";
import { inlineCode } from "@/lib/ui";

type Mode = "broken" | "fixed" | "compare";
type Layout = "broken" | "fixed";

type Measurement = { scrollWidth: number; clientWidth: number };

function PhonePreview({
  isFixed,
  onMeasure,
}: {
  isFixed: boolean;
  onMeasure: (layout: Layout, measurement: Measurement) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);

  // Read real layout values from the simulated viewport whenever its size or
  // the card's size changes. The observer also fires once on observe().
  useEffect(() => {
    const viewport = viewportRef.current;
    const card = cardRef.current;
    if (!viewport || !card) return;

    const measure = () => {
      const next = { scrollWidth: viewport.scrollWidth, clientWidth: viewport.clientWidth };
      setMeasurement(next);
      onMeasure(isFixed ? "fixed" : "broken", next);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(card);
    return () => observer.disconnect();
  }, [isFixed, onMeasure]);

  const overflow = measurement ? measurement.scrollWidth - measurement.clientWidth : 0;
  const overflows = overflow > 0;

  return (
    <div className="flex w-full min-w-0 max-w-76 flex-col items-center">
      <p
        className={`mb-3 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${
          isFixed
            ? "border-success-line bg-success-soft text-success"
            : "border-danger-line bg-danger-soft text-danger"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${isFixed ? "bg-success-solid" : "bg-danger-solid"}`}
          aria-hidden="true"
        />
        {isFixed ? "Fixed" : "Broken"}
      </p>

      {/* Device frame: capped width, but never wider than the page column */}
      <div className="w-full rounded-4xl bg-code p-2 shadow-elevated ring-1 ring-line-strong">
        <div className="overflow-hidden rounded-3xl bg-canvas">
          <div className="flex items-center justify-between px-5 pb-1 pt-2.5 text-[10px] font-semibold text-muted">
            <span>9:41</span>
            <span className="h-1.5 w-12 rounded-full bg-code" aria-hidden="true" />
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
              className={`rounded-lg border bg-surface p-3 shadow-card ${
                isFixed ? "w-full max-w-110 border-success-line" : "w-110 border-danger-line"
              }`}
            >
              <p className="text-sm font-semibold text-fg">Analytics overview</p>
              <p className="mt-0.5 text-xs text-muted">Last 30 days · sample data</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  ["Sessions", "8,240"],
                  ["Sign-ups", "312"],
                  ["Bounce rate", "41%"],
                  ["Avg. time", "2m 14s"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-line bg-surface-2 p-2">
                    <p className="text-[11px] text-muted">{label}</p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-fg">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex h-12 items-end gap-1" aria-hidden="true">
                {[40, 65, 50, 80, 55, 90, 70, 60, 85, 75].map((height, index) => (
                  <span
                    key={index}
                    className="flex-1 rounded-sm bg-accent/30"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center pb-2 pt-1" aria-hidden="true">
            <span className="h-1 w-24 rounded-full bg-line-strong" />
          </div>
        </div>
      </div>

      {/* Overflow meter — fixed structure to avoid layout shift between states */}
      <StatusPanel
        tone={measurement === null ? "neutral" : overflows ? "danger" : "success"}
        className="mt-4 w-full"
        role="status"
        aria-live="polite"
        title={
          measurement === null
            ? "Measuring…"
            : overflows
              ? `Overflowing by ${overflow}px`
              : "No horizontal overflow"
        }
      >
        <span className="font-mono text-xs tabular-nums">
          scrollWidth {measurement?.scrollWidth ?? "—"}px · clientWidth{" "}
          {measurement?.clientWidth ?? "—"}px
        </span>
      </StatusPanel>
    </div>
  );
}

export default function ResponsiveOverflowDemo() {
  const [mode, setMode] = useState<Mode>("broken");
  const [measurements, setMeasurements] = useState<Partial<Record<Layout, Measurement>>>({});

  // Stable so the phones' ResizeObserver effects are not re-created on every render.
  const handleMeasure = useCallback((layout: Layout, measurement: Measurement) => {
    setMeasurements((current) => {
      const previous = current[layout];
      if (
        previous?.scrollWidth === measurement.scrollWidth &&
        previous.clientWidth === measurement.clientWidth
      ) {
        return current;
      }
      return { ...current, [layout]: measurement };
    });
  }, []);

  const visible: Layout[] = mode === "compare" ? ["broken", "fixed"] : [mode];

  // Status chips summarise the live readings of the phones currently shown.
  const status = visible.map((layout) => {
    const measurement = measurements[layout];
    if (!measurement) return null;
    const overflow = measurement.scrollWidth - measurement.clientWidth;
    const label = mode === "compare" ? `${layout === "broken" ? "Broken" : "Fixed"}: ` : "";
    return overflow > 0 ? (
      <Badge key={layout} tone="danger" icon={<CircleX size={12} aria-hidden="true" />}>
        {label}overflow +{overflow}px
      </Badge>
    ) : (
      <Badge key={layout} tone="success" icon={<CircleCheck size={12} aria-hidden="true" />}>
        {label}no overflow
      </Badge>
    );
  });

  const viewportWidth = measurements[visible[0]]?.clientWidth;

  return (
    <div>
      <DemoToolbar
        icon={Smartphone}
        context={
          <>
            Simulated phone viewport
            {viewportWidth !== undefined && (
              <span className="text-subtle"> · {viewportWidth}px content width</span>
            )}
          </>
        }
        status={status}
      >
        <ModeSwitch
          label="Layout version"
          value={mode}
          onChange={setMode}
          options={[
            { value: "broken", label: "Broken", tone: "broken", icon: CircleX },
            { value: "fixed", label: "Fixed", tone: "fixed", icon: CircleCheck },
            { value: "compare", label: "Compare", icon: Columns2 },
          ]}
        />
        <p className="flex flex-wrap items-center gap-1.5 px-1 text-xs text-muted">
          Card width
          <code className={inlineCode}>{mode === "fixed" ? "w-full max-w-110" : mode === "broken" ? "w-110" : "w-110 vs w-full max-w-110"}</code>
        </p>
      </DemoToolbar>

      <div className={`grid justify-items-center gap-8 ${mode === "compare" ? "sm:grid-cols-2" : ""}`}>
        {(mode === "broken" || mode === "compare") && (
          <PhonePreview key="broken" isFixed={false} onMeasure={handleMeasure} />
        )}
        {(mode === "fixed" || mode === "compare") && (
          <PhonePreview key="fixed" isFixed onMeasure={handleMeasure} />
        )}
      </div>

      <p className="mt-6 border-t border-line pt-4 text-sm leading-6 text-muted">
        {mode === "fixed"
          ? "The card now takes the full available width and is capped at 440px, so its scrollWidth matches the viewport's clientWidth."
          : mode === "compare"
            ? "Same content, same simulated viewport. Only the card's width rule differs."
            : "The card is a fixed 440px wide, but the simulated viewport is much narrower. Scroll inside the phone to see the clipped content."}
      </p>
    </div>
  );
}
