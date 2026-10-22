import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { buttonClass } from "@/lib/ui";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-8 sm:py-32">
      <div
        className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_50%_60%_at_50%_30%,black,transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-xl flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface text-muted shadow-card">
          <SearchX size={22} aria-hidden="true" />
        </span>
        <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-widest text-accent-text">
          404 · Not found
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          The case or page you requested could not be found. It may have been
          renamed, or the link may contain a typo.
        </p>
        <Link href="/#bug-cases" className={buttonClass({ size: "lg", className: "mt-8" })}>
          <ArrowLeft size={16} aria-hidden="true" />
          Browse all cases
        </Link>
      </div>
    </section>
  );
}
