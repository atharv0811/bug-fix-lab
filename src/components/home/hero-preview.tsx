import Link from "next/link";
import {
  ArrowRight,
  CircleCheck,
  CircleX,
  Microscope,
  Search,
  TriangleAlert,
  Wrench,
} from "lucide-react";

const steps = [
  { label: "Problem", icon: TriangleAlert, tone: "text-rose-600 bg-rose-50 border-rose-200" },
  { label: "Investigation", icon: Search, tone: "text-amber-700 bg-amber-50 border-amber-200" },
  { label: "Root cause", icon: Microscope, tone: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  { label: "Verified fix", icon: CircleCheck, tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
];

/**
 * A static, illustrative debugging session built from real components.
 * The content mirrors the React State Update case in this lab.
 */
export function HeroPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        </div>
        <span className="truncate font-mono text-xs text-slate-500">
          example session · react-state-update
        </span>
      </div>

      <ol className="grid grid-cols-2 gap-px border-b border-slate-200 bg-slate-200 sm:grid-cols-4">
        {steps.map(({ label, icon: Icon, tone }, index) => (
          <li key={label} className="flex items-center gap-2 bg-white px-3 py-2.5">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${tone}`}
            >
              <Icon size={13} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-[10px] text-slate-400">
                0{index + 1}
              </span>
              <span className="block truncate text-xs font-semibold text-slate-800">
                {label}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/70 p-3">
          <CircleX size={16} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="text-sm text-rose-900">
            Clicked <span className="font-semibold">Add 3</span> — expected{" "}
            <span className="font-mono font-semibold">3</span>, got{" "}
            <span className="font-mono font-semibold">1</span>.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg bg-slate-950 px-3 py-2.5 font-mono text-xs leading-6">
          <p className="whitespace-nowrap text-slate-500">{"// every call reads the same snapshot"}</p>
          <p className="whitespace-nowrap text-slate-400 line-through decoration-rose-400/70">
            setCount(<span className="text-slate-300">count</span> + 1);
          </p>
          <p className="whitespace-nowrap text-emerald-300">
            setCount((current) =&gt; current + 1);
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
          <Wrench size={16} className="mt-0.5 shrink-0 text-indigo-600" aria-hidden="true" />
          <p className="text-sm leading-6 text-slate-600">
            State is a snapshot per render. Updater functions chain from the
            previous queued value.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-900">
            <CircleCheck size={16} className="text-emerald-600" aria-hidden="true" />
            Verify: 0 → 3, then 3 → 6
          </p>
          <Link
            href="/bug-cases/react-state-update"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
          >
            Open this case
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
