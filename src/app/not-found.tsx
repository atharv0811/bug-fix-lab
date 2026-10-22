import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
        <SearchX size={22} aria-hidden="true" />
      </span>
      <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-widest text-indigo-600">
        404 · Not found
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        The case or page you requested could not be found. It may have been
        renamed, or the link may contain a typo.
      </p>
      <Link
        href="/#bug-cases"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Browse all cases
      </Link>
    </section>
  );
}
