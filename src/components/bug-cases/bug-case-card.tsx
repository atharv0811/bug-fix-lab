import Link from "next/link";
import {
  ArrowRight,
  Bug,
  Code2,
  FlaskConical,
  Gauge,
  LayoutGrid,
  Network,
  Route,
  ShieldCheck,
} from "lucide-react";
import type { BugCase } from "@/lib/bug-cases";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";

export const categoryIcons: Record<string, typeof Bug> = {
  "CSS & Responsive Design": LayoutGrid,
  "React & State": Code2,
  "API & Data Fetching": Network,
  "Forms & Validation": ShieldCheck,
  "Next.js": Route,
  Performance: Gauge,
};

type BugCaseCardProps = {
  bugCase: BugCase;
  /** Case number shown on the card, e.g. 1 → "01". */
  index?: number;
};

export default function BugCaseCard({ bugCase, index }: BugCaseCardProps) {
  const CategoryIcon = categoryIcons[bugCase.category] ?? Bug;

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition-[border-color,box-shadow] duration-200 hover:border-indigo-200 hover:shadow-md hover:shadow-slate-200/70 has-[a:focus-visible]:border-indigo-300 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600">
          <CategoryIcon size={19} aria-hidden="true" />
        </span>
        <DifficultyBadge difficulty={bugCase.difficulty} />
      </div>

      <p className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
        {index !== undefined && (
          <span className="font-mono text-slate-400">
            {String(index).padStart(2, "0")}
          </span>
        )}
        {bugCase.category}
      </p>

      <h3 className="mb-2 text-base font-semibold tracking-tight text-slate-900">
        <Link
          href={`/bug-cases/${bugCase.slug}`}
          className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-indigo-500 focus-visible:after:ring-offset-2"
        >
          {bugCase.title}
        </Link>
      </h3>

      <p className="mb-6 flex-1 text-sm leading-6 text-slate-600">
        {bugCase.description}
      </p>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <FlaskConical size={14} aria-hidden="true" />
          {bugCase.demo.kind === "live" ? "Live demo" : "Simulated demo"}
        </span>
        <span
          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors group-hover:text-indigo-800"
          aria-hidden="true"
        >
          Investigate
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </article>
  );
}
