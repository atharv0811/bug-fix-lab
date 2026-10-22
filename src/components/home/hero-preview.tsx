import Link from "next/link";
import {
  ArrowRight,
  CircleCheck,
  CircleX,
  Microscope,
  Search,
  TriangleAlert,
} from "lucide-react";
import { bugCases } from "@/lib/bug-cases";

const ACTIVE_SLUG = "react-state-update";

const steps = [
  { label: "Problem", icon: TriangleAlert },
  { label: "Inspect", icon: Search },
  { label: "Cause", icon: Microscope },
  { label: "Verify", icon: CircleCheck },
];

/**
 * An illustrative debugging workspace built from real components and the
 * lab's own case data. The content mirrors the React State Update case.
 */
export function HeroPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-elevated">
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        </div>
        <div className="flex min-w-0 flex-1 justify-center">
          <span className="truncate rounded-md border border-line bg-surface px-2.5 py-0.5 font-mono text-[11px] text-muted">
            bug-fix-lab / {ACTIVE_SLUG}
          </span>
        </div>
        <span className="hidden items-center gap-1.5 text-[11px] font-medium text-success sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success-solid" aria-hidden="true" />
          Live demo
        </span>
      </div>

      <div className="grid sm:grid-cols-[10.5rem_minmax(0,1fr)]">
        {/* Case list */}
        <div className="hidden border-r border-line bg-surface-2/60 p-2 sm:block">
          <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-subtle">
            Cases
          </p>
          <ul className="space-y-0.5">
            {bugCases.map((bugCase, index) => {
              const active = bugCase.slug === ACTIVE_SLUG;
              return (
                <li
                  key={bugCase.slug}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${
                    active ? "bg-surface text-fg shadow-card ring-1 ring-line" : "text-muted"
                  }`}
                >
                  <span className="font-mono text-[10px] text-subtle">0{index + 1}</span>
                  <span className="truncate">{bugCase.title}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Workspace */}
        <div className="min-w-0 space-y-3 p-4 sm:p-5">
          <ol className="grid grid-cols-4 gap-1" aria-label="Debugging workflow">
            {steps.map(({ label, icon: Icon }, index) => (
              <li
                key={label}
                className={`flex min-w-0 items-center justify-center gap-1 rounded-md border px-1 py-1 text-[11px] font-medium ${
                  index === steps.length - 1
                    ? "border-success-line bg-success-soft text-success"
                    : "border-line bg-surface-2 text-fg-2"
                }`}
              >
                <Icon size={12} className="shrink-0" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </li>
            ))}
          </ol>

          <div className="flex items-start gap-2.5 rounded-lg border border-danger-line bg-danger-soft px-3 py-2.5 text-[13px] text-danger">
            <CircleX size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>
              <span className="font-semibold">Add 3</span> clicked — expected{" "}
              <span className="font-mono font-semibold">3</span>, received{" "}
              <span className="font-mono font-semibold">1</span>
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-code-line bg-code font-mono text-[12px] leading-6">
            <div className="flex items-center justify-between border-b border-code-line bg-code-header px-3 py-1.5">
              <span className="text-[11px] text-code-dim">counter.tsx</span>
              <span className="text-[10px] text-code-muted">diff</span>
            </div>
            <div className="overflow-x-auto py-1.5">
              <p className="whitespace-nowrap px-3 text-code-muted">{"// every call reads the same snapshot"}</p>
              <p className="whitespace-nowrap bg-danger-solid/10 px-3 text-code-danger">
                <span className="mr-2 select-none opacity-70" aria-hidden="true">−</span>
                setCount(count + 1);
              </p>
              <p className="whitespace-nowrap bg-success-solid/10 px-3 text-code-success">
                <span className="mr-2 select-none opacity-70" aria-hidden="true">+</span>
                setCount((current) =&gt; current + 1);
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface-2 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-accent-text">
              <Microscope size={12} aria-hidden="true" />
              Root cause
            </p>
            <p className="mt-1 text-[13px] leading-5 text-fg-2">
              State is a snapshot per render; updater functions chain from the previous queued value.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-success-line bg-success-soft px-3 py-2">
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-success">
              <CircleCheck size={15} aria-hidden="true" />
              Verify: 0 → 3, then 3 → 6
            </p>
            <Link
              href={`/bug-cases/${ACTIVE_SLUG}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-success hover:underline"
            >
              Open this case
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
